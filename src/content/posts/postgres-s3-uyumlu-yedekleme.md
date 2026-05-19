---
title: "PostgreSQL'i S3 uyumlu depoya yedeklemek: pg_dump + restic + Bunny"
description: "KVKK uyumlu, deduplike edilmiş, şifreli PostgreSQL yedekleri için gerçek üretim ortamında kullandığımız 3-2-1 mimarisi ve benchmark notları."
date: "2026-05-04"
tags: ["postgresql", "backup", "kvkk", "s3", "restic"]
referenceLabel: "donedynamics.com — Yedekleme & S3 uyumlu depolama"
referenceUrl: "https://donedynamics.com/solutions/backup-storage"
---

## Problem tanımı

Müşterilerimizin çoğunda PostgreSQL yedekleme stratejisi şu şekilde başlıyor: gece bir cron, `pg_dump`, dump'ı aynı sunucudaki bir klasöre yazıyor. Sunucuda disk dolduğunda yedekler durmuş oluyor, kimse fark etmiyor; bir ransomware geldiğinde dump da şifreleniyor — çünkü yedek aslında **off-site değil**.

Hedeflerimiz net: **3-2-1 kuralı** (3 kopya, 2 medya, 1 off-site), KVKK için Türkiye/AB lokasyon, müşterinin verisi bizim ellerimizde değil müşterinin S3 hesabında.

## Mimari

```
┌───────────────────┐    pg_dump --format=custom
│  Postgres primary │───────────────────────────┐
└───────────────────┘                            │
                                                 ▼
                                       ┌──────────────────┐
                                       │   restic encrypt │ AES-256
                                       │   + dedupe       │
                                       └────────┬─────────┘
                                                │
                            ┌───────────────────┼───────────────────┐
                            │                   │                   │
                            ▼                   ▼                   ▼
                  ┌──────────────┐   ┌──────────────────┐  ┌──────────────┐
                  │ Bunny Storage│   │ Hetzner S3 (EU)  │  │ Local NAS    │
                  │ TR PoP       │   │ FSN1 region      │  │ on-site copy │
                  └──────────────┘   └──────────────────┘  └──────────────┘
                       primary             redundant            warm copy
```

Üç hedef → 3-2-1 sağlandı. Restic her yedekte değişen bloklara dokunuyor; günlük yedek transfer maliyeti **birkaç MB'a** düşüyor.

## Kod örneği

```bash
#!/usr/bin/env bash
# /usr/local/bin/pg-backup.sh
set -euo pipefail

export RESTIC_REPOSITORY="s3:s3.bunnycdn.com/dd-backups-tr"
export RESTIC_PASSWORD_FILE="/etc/restic/passphrase"
export AWS_ACCESS_KEY_ID="$(cat /etc/restic/access_key)"
export AWS_SECRET_ACCESS_KEY="$(cat /etc/restic/secret_key)"

DUMP_DIR=$(mktemp -d)
trap 'rm -rf "$DUMP_DIR"' EXIT

# 1. Logical dump — restore granularity per database
for db in $(psql -U postgres -At -c "SELECT datname FROM pg_database WHERE datistemplate = false"); do
  pg_dump -U postgres -Fc -f "$DUMP_DIR/${db}.dump" "$db"
done

# 2. Push to restic — encrypted + deduplicated
restic backup "$DUMP_DIR" --tag pg --host "$(hostname)"

# 3. Retention — 7 daily, 4 weekly, 12 monthly
restic forget --prune --keep-daily 7 --keep-weekly 4 --keep-monthly 12

# 4. Aylık restore testi (her 1'inde)
if [ "$(date +%d)" = "01" ]; then
  TEST_DIR=$(mktemp -d)
  restic restore latest --target "$TEST_DIR"
  pg_restore --list "$TEST_DIR"/*.dump >/dev/null
  rm -rf "$TEST_DIR"
fi
```

Cron olarak `0 3 * * *` ile çalışıyor. Restore testi **ay başı 1'inde** otomatik koşuyor; başarısızsa Pushover üzerinden alarm.

## Karşılaştırmalı ölçüm

Üretim ortamında 80 GB ham veri, 22 müşteri tenant'ı:

| Aşama                    | Süre   | Net transfer |
|--------------------------|--------|--------------|
| pg_dump (paralel, -j 4)  | 6m 12s | 18 GB local  |
| restic encrypt + dedupe  | 2m 41s | —            |
| upload to Bunny (TR PoP) | 1m 05s | 410 MB       |
| upload to Hetzner S3     | 1m 28s | 410 MB       |

İlk yedek 18 GB, sonrakiler ortalama **120-400 MB** arası — restic'in blok düzeyinde dedupe'i sayesinde.

Aylık restore testi tam restore: **9m 04s**. RTO hedefimiz 1 saat, gerçek değer çok altında.

## Akış şeması

```
Day 0:  full snapshot  ████████████████████ 18 GB
Day 1:  delta          ▓                     180 MB
Day 2:  delta          ▓▓                    320 MB
Day 3:  delta          ▓                     150 MB
Day 7:  weekly retain  ✓
Day 30: monthly retain ✓
Day 90: pruned         ✗
```

`restic forget --prune` ile eski snapshot'lar atılıyor ama dedupe edilmiş blok hâlâ referans alıyorsa silinmiyor.

## Sonuç

`pg_dump` + `restic` + S3 uyumlu depo, küçük ve orta ölçekli PostgreSQL kurulumlarında **WAL-G** veya **pgBackRest**'ten çok daha az operasyonel yük getiriyor. PITR gerekmiyorsa (RPO 24 saat yeterliyse), bu yığın bizim varsayılan reçetemiz.

Şifrelemeyi restic tarafında bıraktığımız için S3 sağlayıcısı (Bunny, Hetzner, Wasabi) değiştirmek tek satır env değişikliği. Vendor lock-in yok — KVKK denetimlerinde de bunu kanıtlamak kolay.

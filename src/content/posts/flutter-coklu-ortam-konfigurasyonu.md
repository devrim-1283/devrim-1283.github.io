---
title: "Flutter'da çoklu ortam konfigürasyonu: --dart-define vs flavors"
description: "dev / staging / production ortamları için Flutter'da kullandığımız gerçek konfigürasyon yapısı, build script'leri ve CI entegrasyonu."
date: "2026-04-22"
tags: ["flutter", "mobile", "ci-cd"]
referenceLabel: "donedynamics.com — Mobil uygulama geliştirme"
referenceUrl: "https://donedynamics.com/solutions/mobile-development"
---

## Problem tanımı

Yeni başlayan bir Flutter projesinde herkes aynı tuzağa düşüyor: `lib/config.dart` içinde `const apiUrl = 'https://api.dev.example.com';` satırı, ve QA'ya build verirken dosyayı elle değiştirmek. Sonuç: yanlış URL ile gönderilen TestFlight build'leri, prod API'a giden dev cihaz, müşteri ortamına sızan log mesajları.

Hedef: derleme zamanında ortam seçimi, runtime'da değişmez sabitler, iOS + Android tarafında ayrı bundle ID ve isim.

## Mimari

İki katmanlı bir yapıya yerleştik:

1. **`--dart-define-from-file`** — çalışma zamanı sabitleri için (API URL, Sentry DSN, feature flag default'ları).
2. **Flavors** (`--flavor`) — iOS scheme + Android product flavor; bundle ID, app name, ikon, Firebase config farklı.

```
┌─ env/dev.json ──┐  ┌─ env/staging.json ─┐  ┌─ env/prod.json ─┐
│ API_URL: ...    │  │ API_URL: ...        │  │ API_URL: ...    │
│ SENTRY_DSN: ... │  │ SENTRY_DSN: ...     │  │ SENTRY_DSN: ... │
└────────┬────────┘  └──────────┬──────────┘  └────────┬────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │
                       flutter build --flavor X
                       --dart-define-from-file env/X.json
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
          iOS Scheme       Android flavor   bundle ID
          (Runner-dev)     (productFlavors) (com.dd.app.dev)
```

## Kod örneği

`env/prod.json`:

```json
{
  "ENV": "prod",
  "API_URL": "https://api.donedynamics.com",
  "SENTRY_DSN": "https://abc@sentry.io/12345",
  "ENABLE_LOGS": "false"
}
```

`lib/app_config.dart`:

```dart
class AppConfig {
  static const env = String.fromEnvironment('ENV', defaultValue: 'dev');
  static const apiUrl = String.fromEnvironment('API_URL');
  static const sentryDsn = String.fromEnvironment('SENTRY_DSN');
  static const enableLogs =
      bool.fromEnvironment('ENABLE_LOGS', defaultValue: true);

  static bool get isProd => env == 'prod';
}
```

Build komutu:

```bash
flutter build ipa \
  --flavor prod \
  --dart-define-from-file=env/prod.json \
  --release
```

GitHub Actions tarafında matrix:

```yaml
strategy:
  matrix:
    env: [staging, prod]
steps:
  - run: flutter build apk --flavor ${{ matrix.env }} \
         --dart-define-from-file=env/${{ matrix.env }}.json
```

## Karşılaştırmalı ölçüm

Üç ortam, üç build (Apple Silicon M2, cold cache):

| Build                        | Süre    | IPA boyutu |
|------------------------------|---------|------------|
| dev (debug)                  | 38s     | 78 MB      |
| staging (release + obfuscate)| 4m 21s  | 22 MB      |
| prod (release + obfuscate)   | 4m 25s  | 22 MB      |

`--obfuscate --split-debug-info` her zaman açık — boyut farkı yok, reverse engineering eşiği yükseliyor.

## Akış şeması

```
git push origin main
        │
        ▼
┌─────────────────────────┐
│  GitHub Actions matrix  │
│  [staging] [prod]       │
└────────┬────────┬───────┘
         │        │
         ▼        ▼
   TestFlight  App Store
   (staging)   (review)
         │        │
         ▼        ▼
     QA testers  End users
```

Aynı pipeline her iki ortamı paralel çıkarıyor; her ortam farklı bundle ID, farklı Firebase config, farklı analytics property kullanıyor.

## Sonuç

`--dart-define-from-file` Flutter 3.7+ ile geldi ve `flutter_flavorizr` gibi paket bağımlılıklarına olan ihtiyacı çoğunlukla bitirdi. Flavor + dart-define ikilisi:

- Compile-time sabit ⇒ tree shaking,
- Yanlış ortamda yanlış build verme riskini azaltır,
- CI tarafında matrix ile paralel çalışır,
- iOS ve Android'de tek `flutter build` komutuyla yönetilir.

Yeni Flutter projelerimizde **sıfırıncı sprint** çalışmamız bu yapıyı kurmak — sonradan migrasyon her zaman daha pahalı.

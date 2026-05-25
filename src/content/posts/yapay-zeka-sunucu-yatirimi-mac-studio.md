---
title: "Yapay Zeka Sunucu Yatırımı: 1.000.000 TL'lik Mac Studio Filosu"
description: "Done Dynamics ve zsoftrade ortaklığında 1.000.000 TL'lik Mac Studio sunucu yatırımı — M3 Ultra 512 GB + M4 Max 36 GB — müşteri verisi güvenliği ve dışa bağımlı yapay zekayı sıfırlamak için."
date: "2026-05-25"
tags: ["yapay zeka", "mac studio", "m3 ultra", "m4 max", "on-premise", "veri güvenliği", "zsoftrade"]
referenceLabel: "donedynamics.com — Yapay Zeka Sunucu Yatırımı"
referenceUrl: "https://donedynamics.com/blog/yapay-zeka-sunucu-yatirimi-mac-studio"
---

![Done Dynamics Mac Studio yapay zeka sunucu filosu](https://view.donedynamics.com/done-dynamics/macstudioresim.jpeg)

Done Dynamics olarak, müşteri verilerinin güvenliği ve **dışa bağımlı yapay zeka** kullanımını sıfıra indirme hedefiyle hayata geçirdiğimiz en büyük altyapı yatırımını duyuruyoruz: **zsoftrade** iş ortaklığımız çerçevesinde toplam **1.000.000 TL** değerinde, iki adet Mac Studio sunucudan oluşan kendi yapay zeka filomuzu kurduk.

## Yatırımın özeti

| Sunucu | Çip | RAM | Birincil iş yükü |
| --- | --- | --- | --- |
| Sunucu #1 | Apple M3 Ultra | 512 GB unified memory | Büyük LLM çıkarımı, yerel ince ayar, çoklu model servisi |
| Sunucu #2 | Apple M4 Max | 36 GB unified memory | Düşük gecikmeli çıkarım, embedding, RAG pipeline, ön işleme |

Toplam yatırım: **1.000.000 TL**. Tedarik, kurulum ve devreye alma süreci **zsoftrade** iş birliği ile yürütüldü.

## Neden kendi sunucularımız?

Bulut tabanlı yapay zeka servisleri (OpenAI, Anthropic, Google) hızlı başlangıç için harikadır. Ancak müşteri verisi söz konusu olduğunda üç temel sorun ortaya çıkıyor:

1. **Veri egemenliği.** Müşteri verisi, yurtdışı veri merkezlerinden geçtiğinde KVKK ve sözleşme hükümleri devreye giriyor. Sunucuyu kendi ofisimizde tutmak bu zincirin tamamını ortadan kaldırıyor.
2. **Maliyet öngörülebilirliği.** Token başına faturalama, kullanım arttıkça lineer olmayan biçimde büyüyor. Sabit donanım yatırımı uzun vadede çok daha öngörülebilir bir maliyet eğrisi sunuyor.
3. **Dışa bağımlılık.** Yurt dışı bir sağlayıcının fiyat değişikliği, model kapatma kararı veya servis kesintisi müşterilerimizin işlerini doğrudan etkiliyor. Yerel altyapı bu riski sıfıra indiriyor.

## M3 Ultra 512 GB ne sağlıyor?

Mac Studio M3 Ultra'nın **512 GB unified memory** mimarisi, çok büyük açık ağırlıklı modelleri tek makinede çalıştırmamıza imkân tanıyor. Tipik bir 70B parametreli model FP16'da yaklaşık 140 GB, 405B parametreli model 4-bit quantized halde yaklaşık 200 GB bellek istiyor. Tek bir Mac Studio bu sınıftaki modelleri **GPU kümesi gerektirmeden** servis edebiliyor.

- Müşteri sözleşmeli RAG ve chatbot uygulamaları tamamen yerelde çalışıyor.
- İnce ayar (fine-tune) süreçleri hassas veri yurt dışına çıkmadan tamamlanıyor.
- Birden fazla modeli aynı anda barındırarak iş yüklerini ayrıştırabiliyoruz.

## M4 Max 36 GB ne sağlıyor?

İkinci sunucu **düşük gecikme** odaklı görevler için ayrıldı:

- Embedding üretimi ve vektör veritabanı sorguları
- Ön işleme, OCR, dil tespiti ve sınıflandırma
- Üretim trafiğinde 7B–13B sınıfı modellerin yüksek QPS ile servis edilmesi

## zsoftrade iş birliği

Bu yatırım **zsoftrade** ile yürüttüğümüz ortak bir altyapı projesidir. Donanım tedariki, ağ topolojisi, yedekleme ve fiziksel güvenlik adımları iki ekibin ortak çalışması ile tasarlandı. Hedef tek: müşterilerimizin verilerinin **bulundukları ülkenin dışına çıkmadan** işlenmesi.

## Sonuç

Done Dynamics için **yapay zeka artık dışa bağımlı bir servis değil, bina içinde duran bir sunucudur.** zsoftrade iş birliği ile yaptığımız bu 1.000.000 TL'lik yatırım, müşteri verilerinin güvenliği ve uzun vadeli maliyet öngörülebilirliği açısından attığımız en kritik adım.

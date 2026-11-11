# Başkan

Tarayıcıda oynanan, Türkçe bir belediye başkanlığı oyunu. Kurgusal bir şehrin başkanısın: gündemdeki sorunlara karar ver, proje başlat, afetleri yönet, seçmeni birebir ikna et ve sandıktan çık. Seçilemezsen muhalefete düşer, koltuğu geri almak için sahaya inersin.

**Oyna:** https://oknkeles.github.io/baskan/

## Yerelde çalıştırma

Kurulum yok. `index.html` dosyasını tarayıcıda açman yeterli.

## Geliştirme

- `js/core/` — oyun motoru ve modüller (seçim, muhalefet, afet, birebir görüşme)
- `js/data/` — içerik (olaylar, projeler, afetler, diyaloglar, görevler, rakipler, haberler)
- `js/ui/`, `css/` — arayüz ve şehir panoraması
- `tools/` — Node araçları

```bash
node tools/validate.js                        # içerik şemasını doğrular
node tools/sim.js --games=300 --policy=akilli # bot oyunlarıyla çökme ve denge ölçümü
```

Tüm şehir, kişi ve olaylar kurgudur.

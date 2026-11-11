/* BAŞKAN — gündem olayları B: ekonomi, güvenlik, sosyal, siyaset (28 olay). Şema: js/core/schema.js */
(function (root) {
  'use strict';
  var BG = root.BG;

  BG.add('events', [
    /* ───────────── EKONOMİ ───────────── */
    {
      id: 'ekonomi_pazar_kira_zammi', cat: 'ekonomi', district: 'rastgele',
      title: '{mahalle} Pazarında Kira Kavgası',
      text: 'Belediye pazar yerlerinin kirası enflasyonun gerisinde kalmış. Pazarcılar “domates bile bu kadar zamlanmadı” diyor; kasa ise iç çekiyor.',
      speaker: { name: 'Hatice Abla', role: 'Pazarcılar Birliği Sözcüsü', emoji: '🥬' },
      choices: [
        { text: 'Kirayı dondur', hint: 'Esnaf rahatlar, kasa nefes alamaz',
          effects: { esnaf: 5, mahalle: 4, butce: -6, ekonomi: 2 },
          result: 'Hatice Abla sana bir file mandalina yolladı. Muhasebe müdürü ise file içindeki faturayı bulamadı.' },
        { text: 'Kirayı kademeli artır', effects: { butce: 10, esnaf: -4, mahalle: -3, itibar: 1 },
          result: 'Zam üç aya yayıldı. Pazarcılar bağırdı ama tezgâhlar yerinde kaldı; kasada hafif bir bahar havası var.' },
        { text: 'Kapalı pazar sözü ver, kirayı sabitle', cost: { butce: 20 },
          hint: 'Pahalı ama pazarcı memnun',
          effects: { esnaf: 4, mahalle: 5, ekonomi: 3, itibar: -1 },
          result: 'Maket pazar yeri meclis salonunda sergilendi. Pazarcılar maketin çatısını bile sorguladı ama alkışladı.' }
      ]
    },
    {
      id: 'ekonomi_fabrika_vardiya', cat: 'ekonomi', district: 'sanayi',
      title: 'Fabrika Üçüncü Vardiya İstiyor',
      text: 'Sanayi bölgesindeki büyük bir üretici gece vardiyası için ruhsat saatlerinin esnetilmesini istiyor. Komşu apartmanlar “makine horlaması” şikâyetinde.',
      speaker: { name: 'Nevzat Bey', role: 'Sanayi Odası Yöneticisi', emoji: '🏭' },
      choices: [
        { text: 'Ruhsatı esnet', hint: 'İstihdam artar, uyku azalır',
          effects: { ekonomi: 6, isci: 4, isinsani: 4, cevre: -3, mahalle: -4 },
          result: 'Üçüncü vardiya başladı. Servis şoförleri sevinçli; komşu apartmanlar gece saat üçte kendi marşlarını yazdı.' },
        { text: 'Gürültü bariyeri şartıyla izin ver', cost: { butce: 18 },
          effects: { ekonomi: 4, isci: 3, cevre: 1, mahalle: 2, isinsani: -1 },
          result: 'Bariyerler dikildi, fabrika uğultusu bir fısıltıya indi. Nevzat Bey faturayı görünce üzüldü ama imzayı attı.' },
        { text: 'Reddet, mevcut düzen sürsün', effects: { cevre: 2, mahalle: 4, isci: -4, isinsani: -5, ekonomi: -2 },
          result: 'Fabrika başka şehirde vardiya aramaya başladı. Komşular sana sabah poğaçası getirdi; işçiler pek getirmedi.' }
      ]
    },
    {
      id: 'ekonomi_teknopark_yatirimci', cat: 'ekonomi',
      title: 'Girişimciler Kapıda',
      text: 'Genç bir girişim ekibi, {sehir}’de “kedi kamerası ile çay demleme” yazılımı geliştirmek istiyor. Yer ve destek bekliyorlar, karşılığında iş vaat ediyorlar.',
      speaker: { name: 'Ece ve Arkadaşları', role: 'Girişimci Ekip', emoji: '💻' },
      when: { min: { ekonomi: 45 }, notProject: 'teknopark' },
      choices: [
        { text: 'Belediye binasında ofis ver', cost: { butce: 15 },
          effects: { ekonomi: 4, genc: 5, isinsani: 2, itibar: 1 },
          result: 'Ekip eski arşiv odasına taşındı. Duvarda hâlâ 1994 takvimi var; onlar bunu “vintage” diye sevdi.' },
        { text: 'Yatırım fonunda ortak ol', cost: { butce: 35 }, hint: 'Yüksek risk, yüksek getiri',
          result: 'Kasadan sermayeyi aktardın.',
          outcomes: [
            { p: 0.55, effects: { butce: 55, ekonomi: 6, genc: 4, isinsani: 3 }, result: 'Uygulama indirildi, indirildi, indirildi. Belediye ilk kez bir teknoloji yatırımından kâr etti.' },
            { p: 0.45, effects: { ekonomi: -1, genc: -2, itibar: -2 }, result: 'Uygulama sunucuları bir kedi tarafından kapatılmış gibi duruyor. Fon eridi, basın kuyruğa girdi.' }
          ] },
        { text: 'Teşekkür et, çay ısmarla', effects: { genc: -3, ekonomi: -1 },
          result: 'Çay güzeldi ama ekip başka şehre gitti. Çay bardakları hâlâ masada.' }
      ]
    },
    {
      id: 'ekonomi_turist_gemisi', cat: 'ekonomi', district: 'sahil',
      title: 'Kruvaziyer {mahalle} Açıklarında',
      text: 'Dev bir gemi limana yanaşmak istiyor: 3.000 turist, üç aydır sabırla bekleyen martılar ve bir sürü hediyelik fiyonk. Liman henüz temiz değil.',
      when: { season: ['yaz', 'ilkbahar'] },
      choices: [
        { text: 'Karşıla, kırmızı halı ser', cost: { butce: 20 }, hint: 'Her şey sahaya bağlı',
          result: 'Bando, halı, simit tezgâhı. Turistler iniyor.',
          outcomes: [
            { p: 0.6, effects: { butce: 38, esnaf: 5, ekonomi: 5, mahalle: 4 }, result: 'Hediyelik fiyonklar tükendi, baklavacılar toplam ciroyu iki kat yazdı. Martılar da keyifliydi.' },
            { p: 0.4, effects: { cevre: -3, mahalle: -4, esnaf: 1, itibar: -1 }, result: 'Gemi motoru gün boyu çalıştı; duman sahile yayıldı. Gelen az, rahatsız olan çok.' }
          ] },
        { text: 'Sade bir hoş geldin yeterli', effects: { butce: 8, esnaf: 2, ekonomi: 1 },
          result: 'Küçük bir karşılama oldu. Turistler yorgun ama memnun; esnafın cebi azıcık doldu.' },
        { text: 'Limanı çevre için kapalı tut', effects: { cevre: 4, cevreci: 5, esnaf: -4, isinsani: -3, ekonomi: -2 },
          result: 'Gemi açıkta iki saat döndü, sonra gitti. Çevreciler baklava dağıttı; baklavacılar ağladı.' }
      ]
    },
    {
      id: 'ekonomi_vergi_affi', cat: 'ekonomi',
      title: 'Borçlu Esnaf, Boş Kasa',
      text: 'Belediyeye ödenmemiş harçlar tabloya sığmıyor. Defterdar “şimdi af, yarın borç” derken esnaf “biraz daha süre” diyor. Yüzler ekşi, çaylar şekersiz.',
      speaker: { name: 'Sabri Defterdar', role: 'Mali Hizmetler Müdürü', emoji: '📒' },
      when: { min: { donem: 2 } },
      choices: [
        { text: 'Faiz affı çıkar', hint: 'Esnaf rahatlar, kasa durulmaz',
          effects: { esnaf: 5, isci: 2, butce: -12, ekonomi: 3 },
          result: 'Meclisten oy birliğiyle geçti. Sabri Defterdar’ın gözlüğü buğulandı, esnafınki parladı.' },
        { text: 'Taksit yap', cost: { enerji: 1 },
          effects: { esnaf: 2, butce: 8, itibar: 1, isinsani: 2 },
          result: 'Tek tek masa başında oturdun, yirmi dosya konuştun. Yorucu ama adil bir uzlaşma çıktı.' },
        { text: 'Tahsilat ekipleri sahaya', effects: { butce: 16, esnaf: -6, isinsani: 2, itibar: -2 },
          result: 'Ekipler kapı kapı dolaştı. Kasa doldu ama bazı kepenkler bir hafta açılmadı.' }
      ]
    },
    {
      id: 'ekonomi_gece_pazari', cat: 'ekonomi', repeat: true, district: 'rastgele',
      title: '{mahalle}’de Gece Pazarı Önerisi',
      text: 'Bir grup girişimci, {mahalle} meydanında cumartesi gece pazarı kurmak istiyor: simit, el işi ve canlı müzik. Yerleşik esnaf ise “bizim müşteri nereye gidecek” diye soruyor.',
      speaker: { name: 'Cemre', role: 'El İşi Girişimcisi', emoji: '🧶' },
      choices: [
        { text: 'İzin ver', effects: { genc: 4, ekonomi: 3, esnaf: -3, mahalle: 3 },
          result: 'İlk pazar gecesi kuyruk meydandan taştı. Yerleşik esnaf kepenk açıp kendi tezgâhını kurdu; böylece herkes kazandı, ya da neredeyse.' },
        { text: 'Yerel esnafla ortak organize et', cost: { butce: 14 },
          effects: { esnaf: 4, ekonomi: 3, genc: 2, mahalle: 3 },
          result: 'Esnaf pazarın içinde yer aldı. İlk gece “gece pazarı” aslında akşam çayı pazarına dönüştü, ama sevildi.' },
        { text: 'Düzen bozulmasın, vazgeç', effects: { esnaf: 3, genc: -4, mahalle: -2 },
          result: 'Girişimciler iç çekti, esnaf rahatladı. Cumartesi geceleri meydanın tek hareketi güvercin sürüsü oldu.' }
      ]
    },

    {
      id: 'ekonomi_belediye_ihracat', cat: 'ekonomi',
      title: 'Zeytinyağı Ortak Markası',
      text: 'Bağlar’daki üreticiler ortak bir marka altında ihracata açılmak istiyor: etiket, ambalaj, sertifika. Belediyeden “ufak bir destek” bekliyorlar; ufağın hesabı pek ufak değil.',
      speaker: { name: 'Fikriye Hanım', role: 'Üretici Kooperatifi', emoji: '🫒' },
      when: { min: { ekonomi: 40 } },
      choices: [
        { text: 'Markalaşma ve ambalaj desteği ver', cost: { butce: 24 }, hint: 'Pazar şansa bağlı',
          effects: { esnaf: 3, cevreci: 2, ekonomi: 2 },
          result: 'Etiketler basıldı, kapak sıkıldı, ilk koli yola çıktı.',
          outcomes: [
            { p: 0.6, effects: { butce: 36, ekonomi: 5, esnaf: 4, itibar: 2 }, result: 'Yurt dışından ilk sipariş geldi. Kooperatif “Başkan yağı” adlı özel bir şişe bile çıkardı.' },
            { p: 0.4, effects: { ekonomi: -1, itibar: -1 }, result: 'Koliler gümrükte tatile girdi. Zeytinyağı hâlâ güzel ama kasa biraz buruk.' }
          ] },
        { text: 'Sadece pazar günü tanıtım standı aç', cost: { butce: 8 },
          effects: { esnaf: 2, ekonomi: 1, cevreci: 1, itibar: 2 },
          result: 'Meydandaki stantta tadım yapıldı. Herkes ekmeği banıp “güzelmiş” dedi, kimse koli almadı.' },
        { text: 'Kendi yağlarını kendileri pazarlasın', effects: { butce: 3, esnaf: -3, cevreci: -2 },
          result: 'Kooperatif “sağ olun” dedi. Teşekkür tonu hafif ağırdı.' }
      ]
    },

    /* ───────────── GÜVENLİK ───────────── */
    {
      id: 'guvenlik_kamera_tartismasi', cat: 'guvenlik', district: 'rastgele',
      title: '{mahalle}’ye Kamera Gelsin mi?',
      text: '{mahalle} sakinleri iki kampa bölündü: “Hırsızlar bitsin” diyenler ve “Komşunun çamaşırı bile kameraya girer” diyenler. Muhtar son oylamada çay bardağı fırlattı.',
      speaker: { name: 'Muhtar Cemil', role: 'Mahalle Muhtarı', emoji: '🎩' },
      when: { notProject: 'mobese' },
      choices: [
        { text: 'Kameraları kur', cost: { butce: 20 },
          effects: { guvenlik: 6, emekli: 3, genc: -3, mahalle: 3 },
          result: 'Kameralar takıldı, ilk hafta bir kedi tam yüz yirmi kez kayda geçti. Hırsızlar bu mahalleyi atladı.' },
        { text: 'Bekçi sayısını artır', cost: { butce: 14 },
          effects: { guvenlik: 4, emekli: 3, isci: 2, butce: -2, mahalle: 3 },
          result: 'Sokaklarda düdük sesi çoğaldı. Mahalleli bu sefer hem gözetildi hem de her akşam çaya çağrıldı.' },
        { text: 'Mahalle anketi düzenle', effects: { genc: 2, itibar: 2, guvenlik: -1, mahalle: 1 },
          result: 'Anket sonuçları yüzde 50 evet, yüzde 50 hayır, yüzde 3 “bilmem, ben burada oturmuyorum” çıktı.' }
      ]
    },
    {
      id: 'guvenlik_halisaha_kavga', cat: 'guvenlik', district: 'rastgele',
      title: 'Halı Saha Kavgası',
      text: '{mahalle} halı sahasında “penaltı mıydı değil miydi” kavgası büyüyüp sokağa taştı. Beş maç, iki forma ve tek bir kırık kapı gündemde.',
      choices: [
        { text: 'Zabıtayı tribüne yerleştir', effects: { guvenlik: 4, genc: -3, mahalle: -2, esnaf: 1 },
          result: 'Zabıtalar tribünde oturup maç izledi; kavgacılar ilk kez ellerini öne koyup yürüdü.' },
        { text: 'Hakem eğitimi ve mahalle ligi kur', cost: { butce: 16 }, hint: 'Yatırım, ama gençler sever',
          effects: { genc: 5, sosyal: 3, guvenlik: 2, mahalle: 4 },
          result: 'Lig kuruldu, hakemlere düdük ve reflektörlü yelek verildi. Kırmızı kart dağıtmak artık bir mahalle onuru.' },
        { text: 'Sahayı bir hafta kapat', effects: { guvenlik: 5, genc: -4, sosyal: -2, mahalle: -3 },
          result: 'Saha kapandı, çocuklar sokakta kafa topu oynadı. Kavga bitti ama kırık kapı hâlâ asılı.' }
      ]
    },
    {
      id: 'guvenlik_gece_bekcisi', cat: 'guvenlik',
      title: 'Gece Bekçisi Nöbet İstiyor',
      text: 'Yokuşbaşı’ndaki teyzeler “gece bir ses duyduk, kedi miydi hırsız mıydı” diye bekçi talep ediyor. Gece bekçisi ise ücret zammı bekliyor; düdüğü de eskisi kadar gür ötmüyor.',
      speaker: { name: 'Hasan Amca', role: 'Gece Bekçisi', emoji: '🔦' },
      choices: [
        { text: 'Bekçi kadrosunu genişlet', cost: { butce: 18 },
          effects: { guvenlik: 5, emekli: 4, isci: 2, butce: -3 },
          result: 'Yeni bekçiler fener ve düdükle göreve başladı. Teyzeler ilk gece onlara börek yolladı.' },
        { text: 'Gönüllü komşu nöbeti kur', effects: { guvenlik: 2, sosyal: 3, emekli: 2, itibar: 1 },
          result: 'Mahalle sakinleri sırayla nöbet tuttu. Bir hafta sonra nöbet bir çay sohbetine dönüştü; güvenlik biraz arttı.' },
        { text: 'Zam verme, ek kadro açma', effects: { butce: 6, guvenlik: -2, emekli: -3, itibar: -1 },
          result: 'Hasan Amca nöbete gitti ama düdüğü bu kez küstü. Teyzeler akşamları kapıyı iki kez kilitledi.' }
      ]
    },
    {
      id: 'guvenlik_kacak_yapi', cat: 'guvenlik', district: 'rastgele',
      title: '{mahalle}’de Seramik Teras',
      text: '{mahalle}’de bir apartmanın çatısına bir gecede iki kat çıkıldı. Alt komşular “ışığımız gitti”, bina sahibi ise “bu bir seramik teras” diyor.',
      choices: [
        { text: 'Yıkım kararı çıkar', effects: { guvenlik: 3, afet: 3, mahalle: -4, esnaf: -2, itibar: 2 },
          result: 'Yıkım ekibi kat kat indirdi. Bina sahibi arkasından pankart astı: “Bir şehir bir kat için yıkılmaz.”' },
        { text: 'Ceza kes ve ruhsat sürecini işlet', effects: { butce: 12, mahalle: -1, afet: -2, itibar: -1 },
          result: 'Kasaya para girdi, çatıdaki kat sakin sakin yerinde duruyor. Komşular hâlâ gün ışığını arıyor.' },
        { text: 'Ekiple tek tek komşuları ikna et', cost: { enerji: 1 }, hint: 'Zaman alır',
          result: 'Kapı kapı dolaştın, kahve içtin, planları anlattın.',
          outcomes: [
            { p: 0.55, effects: { guvenlik: 2, afet: 2, mahalle: 3, itibar: 3 }, result: 'Bina sahibi kendi isteğiyle katı indirdi. Komşular sana baklava gönderdi.' },
            { p: 0.45, effects: { mahalle: -2, itibar: -2 }, result: 'Kimse kimseyi ikna edemedi; müteahhit “biz mahkemede görüşürüz” dedi.' }
          ] }
      ]
    },
    {
      id: 'guvenlik_basibos_kopekler', cat: 'guvenlik', repeat: true, district: 'rastgele',
      title: '{mahalle}’de Başıboş Sürü',
      text: '{mahalle}’de başıboş köpek sürüsü okul servisini çevreledi. Veliler korkuyor, hayvanseverler “onlar da şehrin parçası” diyor; sürü ise simit bekliyor.',
      speaker: { name: 'Dr. Ayşegül', role: 'Veteriner', emoji: '🩺' },
      choices: [
        { text: 'Yakalayıp bakımevine yerleştir', cost: { butce: 16 },
          effects: { guvenlik: 3, sosyal: 2, cevreci: -2, mahalle: 3 },
          result: 'Köpekler kısırlaştırıldı, aşılandı ve çipli olarak bakımevine alındı. Veliler rahatladı, mama bağışları sürüyor.' },
        { text: 'Mama noktaları ve gönüllü ekip', cost: { butce: 6 }, effects: { sosyal: 3, cevreci: 4, guvenlik: -2, mahalle: 1 },
          result: 'Mama kapları kondu, gönüllüler nöbet tuttu. Sürü sakinleşti ama okul servisi hâlâ biraz sinirli.' },
        { text: 'Hiçbir şey yapma', effects: { guvenlik: -4, mahalle: -4, itibar: -2 },
          result: 'Sorun kendiliğinden çözülmedi. Okul servisi güzergâhı değiştirdi, veliler bir dilekçe daha yazdı.' }
      ]
    },
    {
      id: 'guvenlik_konser_izdiham', cat: 'guvenlik',
      title: 'Meydan Konserine Dev İzdiham Riski',
      text: 'Ünlü bir pop yıldızı {sehir} meydanında konser verecek; bilet yok, giriş serbest. Beklenen kalabalık meydanın üç katı, bariyer deposunun anahtarı ise kayıp.',
      speaker: { name: 'Emniyet Müdürü Kemal', role: 'Güvenlik Koordinatörü', emoji: '🚔' },
      when: { season: ['yaz', 'sonbahar'] },
      choices: [
        { text: 'Konseri bilete bağla, kapasiteyi sınırla', cost: { butce: 12 },
          effects: { guvenlik: 4, genc: -3, butce: 5, itibar: 1 },
          result: 'Bilet satıldı, güvenlik şeridi çekildi. Gençler biletten yakındı; Kemal Müdür ilk kez kahkaha attı.' },
        { text: 'Serbest bırak, kalabalık kendini idare etsin', hint: 'Kumar',
          result: 'Meydan dolup taştı, bariyer anahtarı hâlâ yok.',
          outcomes: [
            { p: 0.5, effects: { genc: 5, sosyal: 4, itibar: 2, guvenlik: -1 }, result: 'Şarkılar bir ağızdan söylendi, kimseye bir şey olmadı. Sosyal medya “efsane gece” dedi.' },
            { p: 0.5, effects: { guvenlik: -6, itibar: -5, genc: -2, afet: -2 }, result: 'Kapılarda izdiham yaşandı; ambulanslar nöbette. Neyse ki ağır yaralanma yok ama basın acımasız.' }
          ] },
        { text: 'Konseri iptal et', effects: { guvenlik: 3, genc: -6, sosyal: -4, itibar: -2 },
          result: 'Konser iptal edildi. Meydandaki dev ekran bir hafta boyunca “Anlayışınız için teşekkürler” yazdı.' }
      ]
    },

    {
      id: 'guvenlik_trafik_cezasi', cat: 'guvenlik', district: 'rastgele',
      title: '{mahalle}’de Hız Tutkunları',
      text: '{mahalle}’de okul yolunda araçlar “son virajı kimse görmedi” hızıyla geçiyor. Veliler yer işareti ve hız kamerası istiyor, taksiciler “kamera piyasayı bitirir” diyor.',
      speaker: { name: 'Sevgi Öğretmen', role: 'Okul Müdür Yardımcısı', emoji: '🏫' },
      when: { max: { guvenlik: 70 } },
      choices: [
        { text: 'Hız kamerası ve kasis kur', cost: { butce: 16 },
          effects: { guvenlik: 4, ulasim: -1, esnaf: -2, mahalle: 4 },
          result: 'Kasisler döküldü, kamera asıldı. İlk gün rekor ceza yazıldı; taksiciler rotayı değiştirdi.' },
        { text: 'Okul çıkış saatinde trafik görevlisi görevlendir', effects: { guvenlik: 3, mahalle: 3, butce: -3, ulasim: 1 },
          result: 'Görevli sarı yelekle düdük çaldı. Veliler alkışladı, taksiciler fısıldadı: “Biz de çocuğuz.”' },
        { text: 'Sürücülere uyarı kampanyası yap', hint: 'Ucuz ama etkisi tartışmalı',
          result: '“Çocuk var, ayağını çek” afişleri asıldı.',
          outcomes: [
            { p: 0.4, effects: { guvenlik: 3, mahalle: 2, itibar: 1 }, result: 'Afişler işe yaradı; sürücüler yavaşladı. Kimi şoför selam bile verdi.' },
            { p: 0.6, effects: { guvenlik: -1, mahalle: -2, itibar: -1 }, result: 'Afişlerin altına kalem ve çizgi film figürleri çizildi. Hız aynı kaldı.' }
          ] }
      ]
    },

    /* ───────────── SOSYAL ───────────── */
    {
      id: 'sosyal_festival_butcesi', cat: 'sosyal', repeat: true,
      title: 'Bahar Şenliği Mi, Kış Kurtarma Mı?',
      text: 'Kültür birimi “Sokak Lezzetleri Festivali” için bütçe istiyor. Aynı kalemden kış yardımı da çıkabilir. Kasadaki tek kuruş ikisine de “ben benim” diyor.',
      speaker: { name: 'Pınar', role: 'Kültür Müdürü', emoji: '🎪' },
      choices: [
        { text: 'Festivali tam kadro düzenle', cost: { butce: 28 },
          effects: { sosyal: 6, genc: 4, esnaf: 3, ekonomi: 2 },
          result: 'Üç gün boyunca sokaklar gözleme, mısır ve müzikle doldu. Zabıta bile bir dilim lahmacun yedi.' },
        { text: 'Sade bir mahalle şenliği yap', cost: { butce: 12 },
          effects: { sosyal: 3, emekli: 2, genc: 1, esnaf: 1 },
          result: 'Küçük şenlik küçük bir sevinç getirdi. Emekliler halay çekti, gençler halayı telefona çekti.' },
        { text: 'Bütçeyi sosyal yardıma ayır', effects: { sosyal: 2, isci: 3, emekli: 3, genc: -4, esnaf: -2, butce: -8 },
          result: 'Yardımlar dağıtıldı. Pınar iç çekti; kültür takvimine “bu yıl katlanılabilir” notu düşüldü.' }
      ]
    },
    {
      id: 'sosyal_emekli_lokali_cay', cat: 'sosyal',
      title: 'Emeklilerin Çay Sorunu',
      text: 'Emekli lokalinde çay fiyatı iki lira arttı, tavla zarları ise çalınmış sayılıyor. Hasan Dede “Başkan, bu bir kriz” diyor; arkasında kırk emekli başını sallıyor.',
      speaker: { name: 'Hasan Dede', role: 'Emekli Lokali Başkanı', emoji: '🍵' },
      when: { min: { emekli: 30 } },
      choices: [
        { text: 'Çay ve tavla desteği ver', cost: { butce: 10 },
          effects: { emekli: 5, sosyal: 3, butce: -2 },
          result: 'Çaylar eski fiyatta, zarlar yeni. Lokalde ilk hafta tavla turnuvası düzenlendi; kazanan çaya bir tane daha içti.' },
        { text: 'Gençlerle ortak aktivite kur', hint: 'İlginç bir deney',
          result: 'Lokal salonuna gençler davet edildi: “tavla ve oyun” gecesi.',
          outcomes: [
            { p: 0.6, effects: { emekli: 3, genc: 4, sosyal: 5, itibar: 1 }, result: 'Hasan Dede bir gençle tavla oynayıp yendi. İki kuşak aynı çaydanlıkta barıştı.' },
            { p: 0.4, effects: { emekli: -2, genc: -1, sosyal: 1 }, result: 'Gençler telefonlarla geldi, Hasan Dede “telefon olmadan oynayalım” dedi. İki taraf da yarım saat dayanabildi.' }
          ] },
        { text: 'Fiyat zammı serbest', effects: { emekli: -4, sosyal: -2, butce: 5, itibar: -1 },
          result: 'Lokal yönetimi çay fiyatını bir kez daha artırdı; Hasan Dede senin adını bu sefer “Başkan Bey” diye anmadı.' }
      ]
    },
    {
      id: 'sosyal_kampus_yurt', cat: 'sosyal', district: 'kampus',
      title: 'Öğrenci Yurdu Doldu Taştı',
      text: '{mahalle}’de yurt başvuruları kontenjanı üç katı aştı. Öğrenciler balkonlarda yatıyor, ev sahipleri “kira yüzde seksen artar” diyor. Rektörlük sana bakıyor.',
      speaker: { name: 'Doğukan', role: 'Öğrenci Temsilcisi', emoji: '🎓' },
      choices: [
        { text: 'Belediye lojmanlarını öğrenciye aç', cost: { butce: 18 },
          effects: { genc: 6, sosyal: 3, mahalle: 4, butce: -2 },
          result: 'Lojman odaları öğrenci evine dönüştü. Doğukan, ilk gece koridorda bir uyku tulumu bulduğunu söylüyor.' },
        { text: 'Kira üst sınırı için ev sahipleriyle görüş', cost: { enerji: 1 },
          effects: { genc: 3, esnaf: -3, ekonomi: -1, itibar: 2 },
          result: 'Ev sahipleriyle üç çay içtin. Kira bir miktar düştü; esnafın yarısı “sen de ev sahibi oldun mu” diye bakıyor.' },
        { text: 'Bu konu üniversitenin işi', effects: { genc: -5, mahalle: -3, itibar: -1 },
          result: 'Rektörlük sana mektup yazdı, öğrenciler sana video çekti. Karşılıklı mektuplaşma uzun sürecek.' }
      ]
    },
    {
      id: 'sosyal_martilar_sahil', cat: 'sosyal', district: 'sahil',
      title: 'Martılar Simit Çaldı',
      text: '{mahalle} kordonunda martılar bir simit tezgâhını birkaç kez soydu. Sahil esnafı “martı vergisi” diye imza topluyor; çevreciler ise “onlar da sakin” diyor.',
      speaker: { name: 'Simitçi Bekir', role: 'Sahil Esnafı', emoji: '🥯' },
      choices: [
        { text: 'Martı korkuluğu ve bekçi koy', cost: { butce: 10 },
          effects: { esnaf: 3, cevreci: -3, sosyal: 1, mahalle: 3 },
          result: 'Plastik şahinler dikildi. Martılar bir gün kaçtı, ikinci gün şahinlerin üstüne kondu.' },
        { text: 'Simit tezgâhlarına kafes zorunlu kıl', effects: { esnaf: -3, cevre: 2, cevreci: 2, mahalle: -1 },
          result: 'Kafesli tezgâhlar geldi. Simitler artık korumalı; martılar bir an tereddüt etti, sonra kafesi aşmayı öğrendi.' },
        { text: 'Martılara “ortak yaşam” kampanyası yap', hint: 'Esprili, ama sonuç belirsiz',
          result: 'Afişler dağıtıldı: “Martılar da şehirlidir.”',
          outcomes: [
            { p: 0.5, effects: { genc: 3, cevreci: 4, sosyal: 3, itibar: 2 }, result: 'Kampanya viral oldu, “Martı Dayanışma” tişörtü bile satılıyor. Simitçi Bekir bile gülümsedi.' },
            { p: 0.5, effects: { esnaf: -2, itibar: -2, mahalle: -2 }, result: 'Martılar kampanyayı umursamadı, simitçiler ise çok kızdı. “Ortak yaşam” esprisi şehirde dillere düştü.' }
          ] }
      ]
    },
    {
      id: 'sosyal_mahalle_kupasi', cat: 'sosyal', district: 'rastgele',
      title: '{mahalle} Halı Saha Kupası',
      text: '{mahalle} gençleri “Başkanlar Kupası” için seni forvet olarak davet etti. Sen son olarak ilkokulda gol atmıştın; ve o gol kendi kalendi.',
      choices: [
        { text: 'Sahaya çık, bir maç oyna', cost: { enerji: 1 }, hint: 'Maç yazgısı belirsiz',
          result: 'Forma giyildi, ısınma hareketleri yarım yapıldı.',
          outcomes: [
            { p: 0.5, effects: { genc: 5, sosyal: 3, mahalle: 5, itibar: 2 }, result: 'Bir golün ardından kutlama için çimlere kapaklandın. Gençler seni omuzlarda taşıdı.' },
            { p: 0.5, effects: { genc: 2, mahalle: 2, itibar: -1 }, result: 'Kendi kalene gol attın, topu geri aldın, gülerek devam ettin. Gençler kahkahayı kaçırmadı.' }
          ] },
        { text: 'Kupaya sponsor ol', cost: { butce: 12 },
          effects: { genc: 4, sosyal: 3, mahalle: 3, esnaf: 1 },
          result: 'Kupa, forma ve sudan oluşan paket sponsor edildi. Sponsor logosu bir tişörtte yarım kaldı ama olsun.' },
        { text: 'Ayrıl, program yoğun', effects: { genc: -3, mahalle: -3 },
          result: 'Teşekkür mesajı yolladın. Gençler kupanın adını “Başkansız Kupa” koydu.' }
      ]
    },
    {
      id: 'sosyal_kis_corbasi', cat: 'sosyal',
      title: 'Kış Sofrası: Çorba Mı, Yardım Kartı Mı?',
      text: 'Hava eksi beş. Sosyal yardım müdürlüğü sıcak çorba dağıtımını sürdürmek mi, yoksa yardım kartı çıkarmak mı istediğini soruyor. Tencere de kart da kasayı zorluyor.',
      speaker: { name: 'Nuray Hanım', role: 'Sosyal Yardım Müdürü', emoji: '🍲' },
      when: { season: 'kis' },
      choices: [
        { text: 'Sıcak çorba dağıtımını yaygınlaştır', cost: { butce: 20 },
          effects: { sosyal: 5, emekli: 4, isci: 3, itibar: 2 },
          result: 'Mahalle köşelerine çorba kazanları kuruldu. Kuyruktakiler “bir tas daha” diye şakalaşıyor.' },
        { text: 'Yardım kartı uygulaması başlat', cost: { butce: 28 },
          effects: { sosyal: 4, isci: 4, emekli: 2, ekonomi: 2, butce: -1 },
          result: 'Kartlar dağıtıldı; market kuyruğu çorba kuyruğundan daha kısaydı. Nuray Hanım ilk kez rahat bir nefes aldı.' },
        { text: 'Yardım bütçesini sabit tut', effects: { butce: 6, sosyal: -3, emekli: -3, itibar: -2 },
          result: 'Kasa rahatladı, çorba kazanları yarım doldu. Kuyruktakiler yine sıraya girdi, ama bu kez sessiz.' }
      ]
    },

    {
      id: 'sosyal_kitap_kafe', cat: 'sosyal', district: 'rastgele',
      title: '{mahalle}’ye Kitap Kafe',
      text: '{mahalle}’de eski bir tütüncü dükkânı boş duruyor. Bir grup gönüllü burayı kitap kafe yapmak istiyor: bol çay, az gürültü, bol fotokopi. Kira ise belediyeden.',
      speaker: { name: 'Zeynep', role: 'Gönüllü Kütüphaneci', emoji: '📚' },
      when: { min: { sosyal: 25 } },
      choices: [
        { text: 'Dükkânı bedelsiz tahsis et, rafları döşe', cost: { butce: 14 },
          effects: { sosyal: 5, genc: 4, emekli: 2, mahalle: 4 },
          result: 'Raflar kuruldu, ilk gün kuyruk ödünç kitap için değil çay için oluştu. Yine de herkes bir kitap aldı.' },
        { text: 'Kirayı sembolik yap, kitap bağış kampanyası başlat', effects: { sosyal: 3, genc: 2, butce: -3, mahalle: 3, itibar: 1 },
          result: 'Bağışlar geldi: kırk adet kapağı yırtık polisiye, yirmi tane ansiklopedi. Zeynep hepsini mutlulukla düzenledi.' },
        { text: 'Dükkânı ihaleyle kiraya ver', effects: { butce: 12, esnaf: 2, sosyal: -3, genc: -3 },
          result: 'Dükkân bir zincir kafenin oldu. Kitap kafe hayali bir hayal olarak kaldı.' }
      ]
    },

    /* ───────────── SİYASET ───────────── */
    {
      id: 'siyaset_akraba_ihale', cat: 'siyaset',
      title: 'Eniştenin Parke Taşı',
      text: 'Eniştenin şirketi, ihaleye “tesadüfen” tek başına girmiş. Parke taşları pırıl pırıl, fiyat ise biraz fazla pırıl pırıl. Kasadan kolayca para çıkacak.',
      speaker: { name: 'Eniştem Orhan', role: 'Müteahhit ve Akraba', emoji: '🧱' },
      choices: [
        { text: 'İhaleyi eniştene ver, kasayı rahatlat', hint: 'Kolay para, tehlikeli zemin',
          effects: { butce: 25, ekonomi: 2, itibar: -3, flag: 'akraba_ihale', sonra: { id: 'siyaset_akraba_ihale_sonu', tur: 3 } },
          result: 'İhale bir günde hallolundu. Parke taşları gerçekten güzel; fatura da gerçekten güzel.' },
        { text: 'İhaleyi açık teklife çıkar', cost: { enerji: 1 },
          effects: { itibar: 4, esnaf: 2, isinsani: -2, butce: 4 },
          result: 'Dört firma teklif verdi. Eniştem Orhan seninle iki hafta konuşmadı, aile yemeğinde çorba sessiz içildi.' },
        { text: 'Ne akraba ne rakip, ihaleyi iptal et', effects: { butce: -2, itibar: 2, isinsani: -3, altyapi: -2 },
          result: 'Parke işi rafa kalktı. Kimse darılmadı ama taşlar yollara hâlâ dökülmemiş durumda.' }
      ]
    },
    {
      id: 'siyaset_akraba_ihale_sonu', cat: 'siyaset', weight: 0,
      title: 'Parke Taşı Soruşturması',
      text: 'Parke taşı ihalesi meclis muhalefetinin eline geçti. “Aile Yadigârı İhale” manşeti ertesi sabah on iki gazetede. Müfettiş şimdiden kapıya dayandı.',
      speaker: { name: 'Müfettiş Selim', role: 'İç Denetim', emoji: '🕵️' },
      choices: [
        { text: 'Açık yüzle özür dile, ihaleyi iptal et', cost: { butce: 14 },
          effects: { itibar: -2, halk: -1, butce: -4 },
          result: 'Kamera karşısında özür diledin. Bu sefer manşet küçüldü, Müfettiş Selim bir notu işleyip çıktı.' },
        { text: 'Basını suçla, “kumpas” de', effects: { itibar: -8, halk: -3, esnaf: -2 },
          result: '“Kumpas var” dedin. Gazeteciler ellerindeki faturaları göstermeye başladı; kimse kumpası görmedi.' },
        { text: 'Eniştenin şirketinden iade iste', cost: { enerji: 1 },
          effects: { butce: 12, itibar: -4, esnaf: -1 },
          result: 'Eniştem Orhan parayı iade etti ama küstü. Aile bayramında en uzak koltuğa oturtuldun.' }
      ]
    },
    {
      id: 'siyaset_meclis_oy_pazarligi', cat: 'siyaset',
      title: 'Meclis Üyesi Pazarlık İstiyor',
      text: 'İmar meclis üyesi Behçet, bir kritik oylama öncesi “bir ufak arsa meselesi” için yan odaya çağırdı. Karşılığında oyunu garanti ediyor.',
      speaker: { name: 'Behçet Bey', role: 'Meclis İmar Üyesi', emoji: '🗳️' },
      when: { min: { tur: 2 } },
      choices: [
        { text: 'Arsa meselesine göz yum, oyunu al', hint: 'Bugün kazandırır, yarın faturayı keser',
          effects: { butce: 18, ekonomi: 2, itibar: -3, flag: 'imar_pazarligi', sonra: { id: 'siyaset_meclis_pazarlik_sonu', tur: 2 } },
          result: 'Oylama geçti. Behçet Bey seni asansörde cebinden çıkardığı bir lokumla kutladı.' },
        { text: 'Pazarlığı reddet, oylamayı kaybet', effects: { itibar: 5, butce: -3, esnaf: -2, isinsani: -3 },
          result: 'Oylamayı kaybettin ama sicilin pırıl pırıl. Behçet Bey sana bir daha lokum ikram etmeyecek.' },
        { text: 'Muhalefetle ortak bir formül ara', cost: { enerji: 1 },
          effects: { itibar: 3, butce: 6, halk: 1, rakip: 1 },
          result: 'Komisyon odasında uzun toplantılar yapıldı. Sonunda iki taraf da biraz kızgın, ama ortak bir uzlaşma metni çıktı.' }
      ]
    },
    {
      id: 'siyaset_meclis_pazarlik_sonu', cat: 'siyaset', weight: 0,
      title: 'Gizli Toplantı Sızdı',
      text: 'Yan oda görüşmesinin ses kaydı bir gazeteciye ulaştı. Behçet Bey “duymadım bile” diyor; ses kaydı ise gayet net: “bir ufak arsa meselesi”.',
      speaker: { name: 'Gazeteci Tuba', role: 'Yerel Haber Muhabiri', emoji: '🎙️' },
      choices: [
        { text: 'Meclis soruşturması başlat', cost: { enerji: 1 },
          effects: { itibar: -2, halk: 1, butce: -3 },
          result: 'Soruşturma komisyonu kuruldu. Seni sert ama dürüst bulanlar var; sorunu büyütmediğine sevinenler var.' },
        { text: 'Sızıntıyı inkâr et', effects: { itibar: -9, halk: -3, isinsani: -2 },
          result: '“Sesin benim olduğu belli değil” dedin. Tuba, ses analiz raporunu bir sonraki gün yayımladı.' },
        { text: 'Behçet Bey’i meclis görevinden uzaklaştır', effects: { itibar: 1, isinsani: -3, butce: -4, esnaf: -1 },
          result: 'Behçet Bey istifa etti ve çıkarken kapıyı çok yavaş kapattı. Meclis bir hafta boyunca sessiz kaldı.' }
      ]
    },
    {
      id: 'siyaset_sponsor_cep', cat: 'siyaset',
      title: 'Sponsorluk Zarfı',
      text: 'Bir inşaat firması, “bağış” olarak belediye kasasına dolgun bir zarf bırakmak istiyor. Karşılığında bir imar planı değişikliğine “anlayış” bekliyor.',
      speaker: { name: 'Kenan Bey', role: 'İnşaat Firması Sahibi', emoji: '💼' },
      when: { max: { butce: 220 } },
      choices: [
        { text: 'Zarfı al, imar planını değiştir', hint: 'Kasa doluyor ama iz bırakıyor',
          effects: { butce: 30, isinsani: 4, cevreci: -4, itibar: -4, flag: 'imar_bagis', sonra: { id: 'siyaset_sponsor_sonu', tur: 3 } },
          result: 'Zarf kasaya girdi, imar planı bir gecede güncellendi. Kenan Bey “her zaman açık kapı” dedi.' },
        { text: 'Bağışı şeffafça, imar şartı olmadan kabul et', cost: { enerji: 1 },
          effects: { butce: 14, isinsani: 2, itibar: 3, cevreci: 1 },
          result: 'Bağış kamuoyuna açıklandı; plan değişmedi. Kenan Bey biraz somurttu ama makbuzu aldı.' },
        { text: 'Zarfı kapıdan geri çevir', effects: { itibar: 4, cevreci: 2, isinsani: -4, butce: -2 },
          result: 'Zarf geri döndü. Kenan Bey’in yüzü bir domates gibi oldu; basın bu sahneyi tadına doyulmaz buldu.' }
      ]
    },
    {
      id: 'siyaset_sponsor_sonu', cat: 'siyaset', weight: 0,
      title: 'Zarfın Sahibi Konuşuyor',
      text: 'Kenan Bey, bir televizyon programında “Başkana verdiğimiz zarf” hikâyesini anlatıyor; program sunucusu her cümleden sonra “peki sonra?” diye soruyor.',
      speaker: { name: 'Kenan Bey', role: 'İnşaat Firması Sahibi', emoji: '📺' },
      choices: [
        { text: 'Parayı hemen sosyal projeye bağışla', cost: { butce: 18 },
          effects: { itibar: -2, sosyal: 3, cevreci: 1 },
          result: 'Parayı hemen sosyal projelere aktardığını kamuoyuna duyurdun. İzleyiciler hem şaşırdı hem biraz yumuşadı.' },
        { text: 'Konuyu görmezden gel', effects: { itibar: -6, cevreci: -3, halk: -2 },
          result: 'Sessizliğin sesi çok yüksek çıktı. Hashtag günün sonunda “#ZarfaBakan” oldu.' },
        { text: 'İmar planını geri çek', effects: { cevreci: 3, isinsani: -4, itibar: -3, butce: -5 },
          result: 'Plan değişikliğini geri çektin. Kenan Bey ağlamaklı bir mesajla “bu kadar mı” diye yazdı.' }
      ]
    },
    {
      id: 'siyaset_protokol_krizi', cat: 'siyaset',
      title: 'Protokolde Yanlış Koltuk',
      text: 'Bakanlık heyeti ziyarete geldi, protokol sırası şaştı. Muhtarlar, valilik görevlileri ve meclis üyeleri aynı koltuğu istiyor. Çaycı çoktan kaçtı.',
      speaker: { name: 'Protokol Müdürü Gülşen', role: 'Protokol Müdürlüğü', emoji: '🪑' },
      when: { min: { donem: 1, tur: 2 } },
      choices: [
        { text: 'Herkesi ayrı ayrı yatıştır', cost: { enerji: 1 },
          effects: { itibar: 3, halk: 1, butce: -2 },
          result: 'Herkese tek tek “siz en önemlisiniz” dedin. Yarı gece baş ağrısı, yarı gün başarı.' },
        { text: 'Sıra rastgele olsun, espriyle yönet', hint: 'Mizah silahı kullanıyorsun',
          result: 'Mikrofonu aldın, kura çekimi ilan ettin.',
          outcomes: [
            { p: 0.55, effects: { itibar: 4, genc: 3, halk: 1 }, result: 'Salon güldü. Kimse küsmedi, hatta birkaç kişi “bu usul kalsın” dedi.' },
            { p: 0.45, effects: { itibar: -4, isinsani: -2, halk: -1 }, result: 'Espri tutmadı. Bir bakan yardımcısı, kura koltuğu yerine ayakta kalmayı seçti.' }
          ] },
        { text: 'Protokolü görmezden gel, sahne senin', effects: { itibar: -3, isinsani: 1, butce: 2 },
          result: 'Hangi koltuk fark etmez dedin, ortadaki koltuğa oturdun. Bakanlık heyeti notlarını fısıldaşarak aldı.' }
      ]
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);

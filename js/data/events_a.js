/* BAŞKAN — gündem olayları A: ulaşım, altyapı, çevre, afet hazırlığı (28 olay). Şema: js/core/schema.js */
(function (root) {
  'use strict';
  var BG = root.BG;

  BG.add('events', [
    /* ================= ULAŞIM ================= */
    {
      id: 'ulasim_kar_kurekleme', cat: 'ulasim', when: { season: 'kis' },
      title: 'Kar Küreme Aracı Yok, Küreği Olan Var',
      text: 'Gece yarısı kar bastırdı. Küreme araçlarının yarısı bakımda; Yokuşbaşı’nda otobüsler geri geri iniyor. Şoförler "Biz yokuşu değil, yokuş bizi çıkarıyor" diyor.',
      speaker: { name: 'Hasan Şef', role: 'Fen İşleri Müdürü', emoji: '🚜' },
      choices: [
        { text: 'Özel firmadan acil küreme aracı kirala', cost: { butce: 28 }, hint: 'Pahalı ama yollar sabaha açılır',
          effects: { ulasim: 5, guvenlik: 3, emekli: 3, itibar: 1 },
          result: 'Kiralık araçlar sabaha kadar çalıştı. Yokuşbaşı’nda teyzeler camdan çay uzattı; fatura ise sana uzandı.' },
        { text: 'Mahalle muhtarlarından kürek gönüllüsü topla', hint: 'Bedava ama yorucu',
          effects: { gonullu: 3, sosyal: 3, ulasim: 1, emekli: -3, genc: 2 },
          result: 'Gençler kürek salladı, emekliler balkondan komuta etti. Yollar yarı açıldı, fotoğraflar tam doldu.' },
        { text: 'Yalnızca ana hatları aç, sokaklar bahara kalsın', hint: 'Hem ucuz hem riskli',
          effects: { ulasim: 2, emekli: -5, isinsani: 2 },
          result: 'Ana caddeler pırıl pırıl, ara sokaklar buz pateni pisti. Yokuşbaşı’nda ilk "belediye kayıp" ilanı asıldı.',
          outcomes: [
            { p: 0.5, effects: { itibar: 1 }, result: 'Kimse düşmedi, kimse şikâyet etmedi. Şans bu sefer senden yana.' },
            { p: 0.5, effects: { guvenlik: -4, itibar: -3, emekli: -2 }, result: 'Sokakta kayan bir fırın tezgâhı haber oldu. Manşet: "Simit de kaydı, belediye de."' }
          ] }
      ]
    },
    {
      id: 'ulasim_scooter_istilasi', cat: 'ulasim', repeat: true,
      title: 'Kaldırımlar Scooter Otoparkı Oldu',
      text: 'Kiralık scooterlar kaldırımlara, çiçek saksılarına, hatta bir kez heykelin kucağına park edilmiş durumda. Teyzeler yürüteçle slalom yapıyor.',
      choices: [
        { text: 'Park alanı zorunlu kıl, firmaya ceza kes', hint: 'Esnafa ve yayaya iyi gelir',
          effects: { emekli: 4, esnaf: 2, genc: -4, ulasim: 2 },
          result: 'Scooterlar çizgili kutulara dizildi. Gençler "yürümeyi özledik" diye alay etti; kaldırım yeniden yayanın oldu.' },
        { text: 'Firmaya dokunma, şehir modern görünsün', hint: 'Gençler mutlu, kaldırım mutsuz',
          effects: { genc: 4, emekli: -4, esnaf: -2, ulasim: -1 },
          result: 'Gençler rüzgârda saçlarıyla geçti. Heykelin kucağı artık resmî scooter durağı.' },
        { text: 'Belediye bütçesiyle ortak park noktaları kur', cost: { butce: 18 }, hint: 'Herkese yarar, kasaya yükler',
          effects: { ulasim: 4, genc: 2, emekli: 2, cevre: 1, itibar: 1 },
          result: 'Köşelere şık scooter durakları kuruldu. Bir tanesine martı yuva yaptı, o da şehir sakini sayıldı.' }
      ]
    },
    {
      id: 'ulasim_carsi_otopark_kavgasi', cat: 'ulasim', district: 'carsi',
      title: '{mahalle}’de Otopark Kavgası',
      text: 'Çarşı’da bir park yeri yüzünden iki esnaf mahkemelik oldu; üçüncü esnaf onların arabasını çifte park yapıp ikisini birden kızdırdı. Esnaf odası senden kesin çözüm bekliyor.',
      speaker: { name: 'Necla Hanım', role: 'Esnaf Odası Sekreteri', emoji: '🧾' },
      choices: [
        { text: 'Çarşıyı yaya trafiğine kapat', hint: 'Çevreciler alkışlar, dükkânlar temkinli',
          effects: { cevre: 4, ulasim: -3, esnaf: -4, mahalle: -4, emekli: 2 },
          result: 'Çarşı artık yürüyen turistlerle dolu. Dükkân sahipleri "araba yok, kalabalık var, kasa yok" diye söylendi.' },
        { text: 'Ücretli park saatleri getir', hint: 'Kasaya girer, esnaf hoşlanmaz',
          effects: { butce: 6, ulasim: 3, esnaf: -4, mahalle: -3, itibar: 1 },
          result: 'Park yerleri döndü, otopark cezası da cebe girdi. Necla Hanım "Biz müşteriyi değil, saati bekler olduk" dedi.' },
        { text: 'Esnafa 20 dakikalık serbest durma hakkı ver', hint: 'Ucuz çözüm, kural esnek',
          effects: { esnaf: 4, mahalle: 3, ulasim: -2, guvenlik: -1 },
          result: 'Herkes "20 dakika"ya sığdığını sandı. Çarşı’da zaman bir tek bu konuda esnedi.' }
      ]
    },
    {
      id: 'ulasim_isci_servisi', cat: 'ulasim', district: 'sanayi',
      title: '{mahalle} Vardiya Servisleri Tıkandı',
      text: 'Sabah 06.00 vardiyası için gelen yüz servis aynı kavşakta buluşuyor. İşçiler kapıda mahsur, fabrika müdürleri telefonda öfkeli, çay ocağı ise rekor kırıyor.',
      speaker: { name: 'Mehmet Usta', role: 'Sanayi Sitesi Temsilcisi', emoji: '🧰' },
      choices: [
        { text: 'Servislere özel şerit aç', cost: { butce: 30 }, hint: 'Pahalı ama kalıcı',
          effects: { ulasim: 5, isci: 4, isinsani: 3, mahalle: 5 },
          result: 'Servis şeridi açıldı; vardiya saatleri artık saat gibi tam vaktinde. Çay ocağı ciro kaybetti, şikâyet etmedi.' },
        { text: 'Fabrikaların vardiya saatini kademeli kaydır', hint: 'Ucuz ama sürtüşme çıkarır',
          effects: { ulasim: 3, isinsani: -3, isci: -2, mahalle: 2 },
          result: 'Saatler kaydı, trafik dağıldı. İşverenler "bize sormadan" diye mırıldandı, işçiler bir saat uyudu.' },
        { text: 'Trafik polisi görevlendir, gerisi sabır', hint: 'Şansa bağlı',
          effects: { guvenlik: 1, mahalle: -2 },
          result: 'Kavşağa üç polis dikildi, düdükler öttü.',
          outcomes: [
            { p: 0.5, effects: { ulasim: 3, isci: 2 }, result: 'Polisin düdüğü ritim tuttu; trafik akmaya başladı. Bir işçi alkış tuttu.' },
            { p: 0.5, effects: { ulasim: -3, isci: -3, itibar: -2 }, result: 'Düdükler birbirine karıştı, servisler daha da karıştı. İşçi bir saat geç kaldı, haber bir günde yayıldı.' }
          ] }
      ]
    },
    {
      id: 'ulasim_bisiklet_seridi', cat: 'ulasim', when: { notProject: 'bisiklet_yolu' },
      title: 'Bisikletliler Şerit İstiyor',
      text: 'Bisiklet topluluğu kordonda otomobillerin arasında yarış yapar gibi gidiyor. "Şerit yoksa biz de otobüs yolunda pedallarız" diye ultimatom verdiler.',
      speaker: { name: 'Pelin', role: 'Pedal Derneği Başkanı', emoji: '🚲' },
      choices: [
        { text: 'Hemen bisiklet şeridi çiz', cost: { butce: 22 }, hint: 'Şehir yeşillenir, şoförler sızlanır',
          effects: { cevre: 4, genc: 4, ulasim: 2, esnaf: -2, sonra: { id: 'ulasim_bisiklet_seridi_sonrasi', tur: 2 } },
          result: 'Kırmızı şerit çizildi. İlk günden bir motosikletli içine daldı, çizgiler "tatlı bir yanlış anlaşılma" diye açıklandı.' },
        { text: 'Pilot bölgede deneme yap, ilerisine bak', hint: 'Dengeli ve temkinli',
          effects: { genc: 2, cevre: 2, esnaf: 1, itibar: 1, sonra: { id: 'ulasim_bisiklet_seridi_sonrasi', tur: 2 } },
          result: 'Kısa bir hatta deneme başladı. Bisikletliler "bir adım" dedi, şoförler "bir adım fazla" dedi.' },
        { text: 'Şehir bu iş için hazır değil, ertele', hint: 'Esnaf rahat, gençler küser',
          effects: { genc: -4, cevre: -3, esnaf: 2, emekli: 1 },
          result: 'Rapor çekmeceye girdi. Pelin "Çekmece bile bisikletten fazla yol kat etti" diye tweet attı.' }
      ]
    },
    {
      id: 'ulasim_bisiklet_seridi_sonrasi', cat: 'ulasim', weight: 0,
      title: 'Şeritte İlk Kış Raporu',
      text: 'Bisiklet şeridinin ilk sezonu bitti. Kimi esnaf "müşteri kaçtı" diyor, kimi "müşteri ayağıma geldi". Pelin de elinde ölçüm tablosuyla kapıda.',
      speaker: { name: 'Pelin', role: 'Pedal Derneği Başkanı', emoji: '🚲' },
      choices: [
        { text: 'Şeridi bütün ana caddeye yay', cost: { butce: 26 }, hint: 'Cesur ama pahalı',
          effects: { ulasim: 4, cevre: 4, genc: 3, esnaf: -3, itibar: 1 },
          result: 'Bisiklet şeridi caddeyi baştan sona sardı. Şoförler selam vermeyi bıraktı; kuryeler bayram etti.' },
        { text: 'Şeridi olduğu gibi bırak, park yerlerini geri ver', hint: 'Esnaf rahatlar',
          effects: { esnaf: 3, genc: -3, cevre: -2, ulasim: 1 },
          result: 'Şerit yarım kaldı, park yerleri geri geldi. Pelin sadece "Pes etmeyeceğiz" diye yazdı.' }
      ]
    },
    {
      id: 'ulasim_otobus_soforleri', cat: 'ulasim', when: { min: { donem: 2 } },
      title: 'Otobüs Şoförleri Zam İstiyor',
      text: 'Belediye otobüs şoförleri "Hem direksiyon hem sabır" diyerek zam talep ediyor. Sendika temsilcisi dosya yerine börekle gelip masaya oturdu.',
      speaker: { name: 'Orhan Usta', role: 'Şoför Sendikası Temsilcisi', emoji: '🚌' },
      choices: [
        { text: 'Talep edilen zammı ver', cost: { butce: 32 }, hint: 'İşçi mutlu, kasa küser',
          effects: { isci: 6, ulasim: 3, itibar: 1, genc: -2 },
          result: 'Şoförler kornaya basarak teşekkür etti. Otobüsler yine ağır ağır, ama bu sefer neşeyle geldi.' },
        { text: 'Yarı yarıya anlaş, sefer saatlerini düzelt', hint: 'Orta yol',
          effects: { isci: 2, ulasim: 3, butce: -8, genc: 1 },
          result: 'Herkes yarım memnun, bir tek börekçi tam memnun. Sefer saatleri düzeldi; ya da sana öyle söylendi.' },
        { text: 'Reddet, özel şirketten şoför kirala', hint: 'Kasa sevinir, işçi öfkelenir',
          effects: { isci: -6, esnaf: 2, butce: 8, itibar: -3, ulasim: -3 },
          result: 'Kiralık şoförler yolları öğrenemedi, bir otobüs yanlışlıkla pazar yerine girdi. Sendika kornaları sessiz tutmadı.' }
      ]
    },

    /* ================= ALTYAPI ================= */
    {
      id: 'altyapi_yaz_su_kesintisi', cat: 'altyapi', when: { season: 'yaz', max: { altyapi: 55 } },
      title: 'Yaz Sıcağında Su Kesintisi',
      text: 'Eski şebeke yaz sıcağıyla çatladı; üç mahallede musluklar hıçkırıyor. Su tankeri satan amcalar bir gecede şehrin en zengin esnafı oldu.',
      speaker: { name: 'Gülizar Hanım', role: 'Su İdaresi Müdürü', emoji: '🚰' },
      choices: [
        { text: 'Acil boru değişimi başlat', cost: { butce: 40 }, hint: 'Kalıcı çözüm, büyük fatura',
          effects: { altyapi: 7, sosyal: 2, emekli: 3, itibar: 2 },
          result: 'Eski boru çıktı, yenisi girdi. Şebeke bu yaz ilk kez nefes aldı; musluklar da ilk kez konuşmadan açıldı.' },
        { text: 'Tanker dağıtımı organize et', cost: { butce: 14 }, hint: 'Geçici ama hızlı',
          effects: { altyapi: 2, emekli: 3, isci: 2, itibar: 1 },
          result: 'Tankerler mahalleleri dolaştı; çocuklar peşinden koştu. Sorun çözülmedi, ama susuzluk dindi.' },
        { text: 'Su tasarrufu çağrısı yap, kesintiyi sıraya koy', hint: 'Ücretsiz ama sabır ister',
          effects: { cevre: 3, altyapi: -2, emekli: -3, genc: -2, itibar: -1 },
          result: 'Mahalle mahalle sıralı kesinti başladı. Teyzeler saat listesine bakarak çamaşır yıkadı; sosyal medya sana su bile kaldırmadı.' }
      ]
    },
    {
      id: 'altyapi_kazi_cakismasi', cat: 'altyapi', repeat: true,
      title: 'Taze Asfalt Kazıldı',
      text: 'Doğalgaz firması, daha dün döşediğiniz asfaltı bir kez daha kazdı. Yollar şimdi "çok katmanlı kültür katmanı" gibi duruyor. Esnaf yeniden gazeteye mektup yazdı.',
      choices: [
        { text: 'Kazı izin sistemi kur', cost: { butce: 15 }, hint: 'Kurumlar koordine olur',
          effects: { altyapi: 4, esnaf: 2, itibar: 1, ekonomi: -1 },
          result: 'Artık kazı izni için bir belediye bir de gaz idaresi imza veriyor. Bir yol bu sefer tam bir ay boyunca bozulmadı.' },
        { text: 'Firmaya ceza yaz', hint: 'Kasa dolar, ilişkiler gerilir',
          effects: { butce: 8, itibar: 2, ekonomi: -3, esnaf: -2 },
          result: 'Ceza kesildi, firma ödeme sırasında yüzüne bile bakmadı. Yeni kazı planlarında "belediyeye pas verilsin" notu görüldü.' },
        { text: 'Boş ver, yamalı yol zaten şehrin kimliği', hint: 'Ucuz ama mahalleli kızar',
          effects: { altyapi: -3, itibar: -2, genc: 2 },
          result: 'Yamalı yollar sosyal medyada "sanat" diye paylaşıldı. Taksiciler ise başka bir isim koydu.' }
      ]
    },
    {
      id: 'altyapi_fiber_direk', cat: 'altyapi', district: 'rastgele', when: { notProject: 'fiber_internet' },
      title: '{mahalle}’de Kablo Kuşları',
      text: '{mahalle}’de internet kabloları direklerde kuş yuvası gibi dolaşıyor. Fatura hep yüksek, hız hep düşük; öğrenciler ödevi merdiven başında yüklüyor.',
      choices: [
        { text: 'Kabloları yer altına aldır', cost: { butce: 35 }, hint: 'Sağlam yatırım',
          effects: { altyapi: 6, genc: 4, ekonomi: 2, mahalle: 5 },
          result: 'Kablolar yer altına gitti, gökyüzü yeniden mavi. {mahalle}’de ilk kez video takılmadan açıldı.' },
        { text: 'Operatörleri bir araya getirip ortak hat kurdur', cost: { butce: 12 }, hint: 'Ucuz ama sonuç şüpheli',
          effects: { altyapi: 2, genc: 2, mahalle: 2 },
          result: 'Operatörler masaya oturdu. Anlaşmaya bir saat kaldı, çay iki saat sürdü.',
          outcomes: [
            { p: 0.55, effects: { altyapi: 3, ekonomi: 2, mahalle: 2 }, result: 'Ortak hat tuttu; hız bir anda iki katına çıktı. Öğrenciler sana kek yolladı.' },
            { p: 0.45, effects: { genc: -2, itibar: -2, mahalle: -2 }, result: 'Operatörler birbirini suçladı, hatlar yarım kaldı. Öğrenciler yine merdiven başına döndü.' }
          ] },
        { text: 'Şimdilik dokunma', hint: 'Bedava ama sızlanma olur',
          effects: { genc: -4, mahalle: -4, esnaf: -1 },
          result: 'Kablolar kuşlara, yuvalar kablolara kaldı. {mahalle} yine merdiven başı internet kültürünü sürdürdü.' }
      ]
    },
    {
      id: 'altyapi_asfalt_ihale', cat: 'altyapi', district: 'rastgele',
      title: '{mahalle}’de Asfalt İhalesi',
      text: 'İhaleye iki firma girdi: biri ucuz teklif verdi, diğeri "kalite"den bahsediyor ama yüzünde garip bir gülümseme var. Müteahhitlerden biri de gizlice sana tavuk dönerli davet yolluyor.',
      speaker: { name: 'Fikret Bey', role: 'İhale Komisyonu Üyesi', emoji: '📋' },
      choices: [
        { text: 'En ucuz teklifi seç', hint: 'Hızlı ve ucuz, ama asfalt ne kadar tutar?',
          effects: { altyapi: 3, butce: -8, mahalle: 3, esnaf: 1, sonra: { id: 'altyapi_asfalt_catladi', tur: 3 } },
          result: 'Asfalt döküldü, yol pırıl pırıl göründü. Fikret Bey çaktırmadan "bakalım ne kadar dayanacak" dedi.' },
        { text: 'Kaliteli firmayı seç', cost: { butce: 36 }, hint: 'Pahalı ama kalıcı',
          effects: { altyapi: 6, mahalle: 5, itibar: 1 },
          result: 'Yeni asfalt cilalı gibi parladı. Mahalleli yürümeyi bırakıp üstünde fotoğraf çektirmeye başladı.' },
        { text: 'Teklifleri yeniden aç, şeffaf yayın yap', cost: { butce: 20 }, hint: 'Halk güvenir, süreç uzar',
          effects: { itibar: 4, altyapi: 3, mahalle: 2, genc: 2, esnaf: -2 },
          result: 'Teklifler canlı yayında açıldı. Döner davetini yayında anlattın, salon alkışladı.' }
      ]
    },
    {
      id: 'altyapi_asfalt_catladi', cat: 'altyapi', district: 'rastgele', weight: 0,
      title: 'Ucuz Asfalt Çatladı',
      text: '{mahalle}’deki ucuz asfalt ilk yağmurda çatladı. Çatlaklardan ot bitmiş; bir mahalle bakkalı "yeni yeşil alan" diye tabela koydu.',
      choices: [
        { text: 'Firmayı geri çağır, onarımı ona yaptır', hint: 'Hukuki süreç ister',
          effects: { altyapi: 3, itibar: 2, esnaf: -2, mahalle: 2 },
          result: 'Firma önce itiraz etti, sonra bir gecede yamaya başladı. Yol olmadı ama en azından ot kaldırıldı.' },
        { text: 'Yeniden yap, bu sefer kaliteli firmayla', cost: { butce: 30 },
          effects: { altyapi: 5, mahalle: 4, itibar: 1 },
          result: 'Eski asfalt söküldü, yenisi yapıldı. Bakkal tabelasını yeni sezon için sakladı.' },
        { text: 'Çatlak yamama, görmezden gel', hint: 'Ucuz ve acı',
          effects: { altyapi: -3, mahalle: -5, itibar: -3 },
          result: 'Çatlaklar büyüdü, yamalar yetmedi. {mahalle} sakinleri "bizi unuttunuz" yazılı pankart açtı.' }
      ]
    },
    {
      id: 'altyapi_trafo_patladi', cat: 'altyapi', district: 'sanayi', when: { max: { altyapi: 45 } },
      title: '{mahalle} Trafosu Patladı',
      text: 'Sanayi bölgesinin eski trafosu "artık yeter" der gibi duman verdi. Atölyeler karanlıkta kaldı, çay ocağı ise mum ışığında rekor satış yaptı.',
      speaker: { name: 'Kâzım Usta', role: 'Sanayi Esnafı', emoji: '🔌' },
      choices: [
        { text: 'Yeni trafo yatırımı yap', cost: { butce: 38 }, hint: 'Sorunu kökten çözer',
          effects: { altyapi: 6, ekonomi: 4, isinsani: 3, mahalle: 5 },
          result: 'Yeni trafo bağlandı, atölyeler aydınlandı. Kâzım Usta tüm çaycılara bir tur çay ısmarladı.' },
        { text: 'Jeneratör kirala, sonra bakarız', cost: { butce: 15 }, hint: 'Geçici çözüm',
          effects: { altyapi: 1, ekonomi: 2, isci: 2, mahalle: 2, cevre: -2 },
          result: 'Jeneratörler gürledi, atölyeler çalıştı. Gürültüden komşu kafe müşterisini kaybetti.' },
        { text: 'Elektrik idaresine yaz, sorumluluğu devret', hint: 'Bedava ama sinir bozar',
          effects: { altyapi: -2, ekonomi: -3, isinsani: -3, mahalle: -4 },
          result: 'Yazı gönderildi, cevap beklenirken üç gün geçti. Atölyeler öfkeli, çay ocağı ise masrafsız mum işine devam etti.' }
      ]
    },
    {
      id: 'altyapi_yagmur_suyu', cat: 'altyapi', when: { season: 'sonbahar', notProject: 'yagmur_kanali' },
      title: 'Yağmur Suyu Cadde Oldu',
      text: 'Sonbahar yağmurları başladı; rögar kapakları nöbetleşe fışkırıyor. Sahil yolunda bir taksi yarı yarıya sular altında "dalış taksisi" olarak anıldı.',
      choices: [
        { text: 'Rögar temizliği ve kanal onarımı yap', cost: { butce: 24 }, hint: 'Hazırlıklı olmak güzel',
          effects: { altyapi: 4, afet: 3, cevre: 1, itibar: 1 },
          result: 'Rögarlar temizlendi, kanallar açıldı. Yağmur geldi, su yürüyüşe çıkmadı.' },
        { text: 'Şans eseri: bu yıl yağmurlar kısa sürer', hint: 'Ücretsiz kumar',
          effects: { itibar: -1 },
          result: 'Rögarlar olduğu gibi kaldı.',
          outcomes: [
            { p: 0.5, effects: { itibar: 2 }, result: 'Yağmur ince ince geçti. Sular çekildi, şansını kutladın.' },
            { p: 0.5, effects: { altyapi: -5, afet: -3, itibar: -3, esnaf: -3 }, result: 'Bir gecede yarım şehir göle döndü. Esnaf kepenk yerine yelken açtı.' }
          ] },
        { text: 'Vatandaşa "çöp atmayın" kampanyası yap', cost: { butce: 6 },
          effects: { cevre: 3, altyapi: 1, genc: -1, itibar: 1 },
          result: 'Afişler asıldı, spotlar yayınlandı. Rögarlardan ilk kez çöp değil dilekçe çıktı.' }
      ]
    },

    /* ================= ÇEVRE ================= */
    {
      id: 'cevre_martilar', cat: 'cevre', district: 'sahil', repeat: true,
      title: '{mahalle}’de Martı Saldırısı',
      text: '{mahalle}’de martılar simit satıcılarının sabrını denedi. Bir simit tezgâhı "Burası artık martı savunma bölgesi" diye tabela astı; turistler ise martı videosuyla şehri tanıtıyor.',
      choices: [
        { text: 'Martı caydırıcı sistem kur', cost: { butce: 16 }, hint: 'Esnafı memnun eder',
          effects: { esnaf: 4, mahalle: 4, cevre: -2, genc: -1 },
          result: 'Gürültü bandı çalıştı. Martılar bir gün yan sokağa taşındı, orada başka simitçiye saldırdı.' },
        { text: 'Çöp kapağı ve yem yasağı getir', hint: 'Doğa dostu, esnaf biraz üzgün',
          effects: { cevre: 4, mahalle: 3, esnaf: -2, itibar: 1 },
          result: 'Martılar mütevazı davranmayı öğrendi. Simitçiler "yarısı bizde, yarısı onlarda" diyerek ağır ağır uyum sağladı.' },
        { text: 'Martıları şehrin sembolü ilan et', hint: 'Absürt ama sevimli',
          effects: { genc: 4, cevre: 2, esnaf: -3, mahalle: 2 },
          result: 'Martı postası, martı formalı çay bardağı derken şehir güldü. Simitçiler ise başlarını elleriyle korudu.' }
      ]
    },
    {
      id: 'cevre_cop_konteyner', cat: 'cevre',
      title: 'Konteynerler Taşıyor',
      text: 'Çöp konteynerleri sabah toplanmadan akşama kadar taşıyor. Sokak kedileri bunu "açık büfe" olarak yorumlayıp mahalle toplantısına katıldı.',
      speaker: { name: 'Zekiye Hanım', role: 'Temizlik İşleri Müdürü', emoji: '🗑️' },
      choices: [
        { text: 'Yeni araç ve personel al', cost: { butce: 30 }, hint: 'Pahalı ama kalıcı',
          effects: { cevre: 5, sosyal: 2, isci: 3, itibar: 1 },
          result: 'Yeni araçlar şehri gezmeye başladı. Çöpçüler "ilk kez fotoğraf çektirdik" diye gülümsedi.' },
        { text: 'Mesai saatlerini yeniden düzenle', hint: 'Bedava ama işçi mızmızlanır',
          effects: { cevre: 3, isci: -4, butce: 4 },
          result: 'Çöpçüler sabahın 4’ünde çalışmaya başladı. Şehir temiz uyandı ama sendikaya mektup yazıldı.' },
        { text: 'Mahalleli çöp günü sistemi uygula', hint: 'Gönüllü gerektirir',
          effects: { cevre: 2, gonullu: 3, emekli: -2, genc: 2, sosyal: 2 },
          result: 'Her pazartesi mahalleli çöp topladı. Teyzeler bir köşede kontrol etti; kedi dahil herkes denetlendi.' }
      ]
    },
    {
      id: 'cevre_sokak_kedileri', cat: 'cevre',
      title: 'Kedi Evi Kavgası',
      text: 'Hayvanseverler "kedi evleri" kurulmasını, esnaf ise "kedi kapıda, müşteri dışarıda" diyerek tam tersini istiyor. Kediler de tartışmayı tüy dökerek izliyor.',
      speaker: { name: 'Sevda', role: 'Hayvan Dostları Derneği', emoji: '🐈' },
      choices: [
        { text: 'Her sokağa kedi evi ve mama kabı koy', cost: { butce: 14 }, hint: 'Gençler ve çevreciler sever',
          effects: { genc: 4, cevreci: 4, esnaf: -4, sosyal: 2 },
          result: 'Kedi evleri kuruldu, mama kapları dolduruldu. Balıkçı esnafı kendi pazar tezgâhından koruma ordusu kurdu.' },
        { text: 'Esnafla uzlaş: kedi evleri sadece belirli noktalarda', hint: 'Orta yol',
          effects: { esnaf: 1, cevreci: 2, genc: 1, itibar: 1 },
          result: 'Kedilere özel noktalar belirlendi. Kedilerin bu noktalara uyduğuna dair haber alınamadı.' },
        { text: 'Konuyu gündemden kaldır', hint: 'Bedava ama tepki gelir',
          effects: { cevreci: -4, genc: -3, esnaf: 2, itibar: -2 },
          result: 'Dosya raftan raf değiştirdi. Sosyal medyada "kedileri savunan başkan" adayları belirdi.' }
      ]
    },
    {
      id: 'cevre_fabrika_kokusu', cat: 'cevre', district: 'sanayi',
      title: '{mahalle}’de Ağır Koku',
      text: '{mahalle}’deki bir fabrikanın bacasından çıkan koku rüzgârla Kampüs’e kadar ulaştı. Öğrenciler "yeni kimya laboratuvarı mı açıldı?" diye şaşırdı; fabrika sahibi ise vergi ödediğini hatırlatıyor.',
      speaker: { name: 'Şükrü Bey', role: 'Fabrika Sahibi', emoji: '🏭' },
      choices: [
        { text: 'Filtre takmayı zorunlu kıl, cezayla destekle', hint: 'Çevreci memnun, sanayi mırıldanır',
          effects: { cevre: 5, cevreci: 4, isinsani: -4, ekonomi: -2, mahalle: 3 },
          result: 'Filtreler takıldı, koku azaldı. Şükrü Bey masrafa ağlayıp "ihracat için şart" dedi.' },
        { text: 'Fabrikayla görüşüp gönüllü iyileştirme planı yap', hint: 'Şansa bağlı',
          effects: { itibar: 1, isinsani: 1 },
          result: 'Fabrika sahibi çaylı toplantıda "söz" verdi.',
          outcomes: [
            { p: 0.55, effects: { cevre: 4, cevreci: 2, isinsani: 2, mahalle: 3 }, result: 'Şükrü Bey sözünü tuttu, filtreler iki ay içinde kuruldu. Koku bir anıya dönüştü.' },
            { p: 0.45, effects: { cevre: -3, cevreci: -3, itibar: -3, mahalle: -4 }, result: 'Söz uçtu, koku kaldı. Kampüs’te "burada ne kokuyor?" şiiri yazıldı.' }
          ] },
        { text: 'Görmezden gel, istihdam önce', hint: 'Ekonomiyi korur',
          effects: { isinsani: 3, isci: 2, ekonomi: 2, cevre: -4, cevreci: -4, mahalle: -4 },
          result: 'Fabrika çalışmaya devam etti, koku da. Kampüs’te protesto afişleri asıldı, fabrikada ise bayram.' }
      ]
    },
    {
      id: 'cevre_agac_kesimi', cat: 'cevre', district: 'rastgele',
      title: '{mahalle}’de Yaşlı Çınar',
      text: '{mahalle}’deki 200 yıllık çınarın kökleri kaldırımı kaldırdı. Kaldırım yeniden yapılmak isteniyor; mahalleli ise "ağaca dokunursan bize dokunursun" diyor.',
      choices: [
        { text: 'Ağacı koru, kaldırımı çevresinden dolandır', cost: { butce: 18 }, hint: 'Pahalı ama kalpler kazanılır',
          effects: { cevre: 4, cevreci: 5, emekli: 2, mahalle: 5, altyapi: -1 },
          result: 'Kaldırım çınarın etrafında kıvrıldı. Mahalleli ağacın altında bir çay masası kurdu.' },
        { text: 'Ağacı kes, yenisini dik', hint: 'Ucuz, ama tartışmalı',
          effects: { altyapi: 3, butce: 2, cevreci: -6, cevre: -3, mahalle: -5, itibar: -2 },
          result: 'Çınar kesildi. Mahalle sessizliğe gömüldü; sonra yeni fidanın başına nöbetçi çıkardı.' },
        { text: 'Uzman raporu iste, sonuca göre karar ver', cost: { butce: 6 }, hint: 'Zaman kazandırır',
          effects: { itibar: 1, cevre: 1, mahalle: 1 },
          result: 'Uzmanlar bir hafta çınarın dibinde dolaştı.',
          outcomes: [
            { p: 0.6, effects: { cevre: 3, cevreci: 3, mahalle: 3 }, result: 'Rapor "ağaç sağlam, kaldırım kalkmalı" dedi. Çınar kaldı, kaldırım uyum sağladı.' },
            { p: 0.4, effects: { cevre: -2, mahalle: -3, itibar: -2 }, result: 'Rapor kesim önerdi. Mahalleli üzüldü, ama raporun gerekçesini okuyan çıkmadı.' }
          ] }
      ]
    },
    {
      id: 'cevre_yaz_sicagi', cat: 'cevre', when: { season: 'yaz', notProject: 'kent_ormani' },
      title: 'Şehir Fırın Gibi',
      text: 'Betonlaşmış sokaklar yaz sıcağında tava gibi kızdı. Çarşı’da bir dondurmacı "dondurma değil, içecek satıyorum" diyerek tezgâhı ters çevirdi.',
      speaker: { name: 'Dr. Nermin', role: 'Şehir Plancısı', emoji: '🌡️' },
      choices: [
        { text: 'Gölge ağaçları ve serinleme noktaları kur', cost: { butce: 25 }, hint: 'Şehri serinletir',
          effects: { cevre: 5, cevreci: 3, emekli: 3, sosyal: 2 },
          result: 'Meydanlara ağaç ve sisleme sistemi kuruldu. Teyzeler ilk kez güneşe değil gölgeye teşekkür etti.' },
        { text: 'Havuzları ve parkları gece de açık tut', hint: 'Ucuz ama görevlilere yük',
          effects: { genc: 4, sosyal: 3, guvenlik: -2, butce: -6 },
          result: 'Havuzlar gece açıldı, gençler havuza akın etti. Bekçilerden biri havuzda uyuyakaldı.' },
        { text: 'Önlem alma, doğal yolla geçsin', hint: 'Bedava ama bedeli var',
          effects: { emekli: -4, cevre: -2, sosyal: -3, itibar: -2 },
          result: 'Sıcak devam etti. Klima satışları patladı, elektrik faturaları da öyle.' }
      ]
    },
    {
      id: 'cevre_geri_donusum_kampanyasi', cat: 'cevre', when: { notProject: 'geri_donusum' },
      title: 'Mavi Kutu Kampanyası',
      text: 'Çevre derneği, "Mavi Kutu" geri dönüşüm kampanyası başlatmak istiyor. Fikir güzel ama kutular nereye konacak, kim boşaltacak, kediler ne yapacak: soru çok.',
      speaker: { name: 'Gökçe', role: 'Çevre Derneği Gönüllüsü', emoji: '♻️' },
      choices: [
        { text: 'Tüm mahallelere mavi kutu dağıt', cost: { butce: 28 }, hint: 'Pahalı ama güçlü',
          effects: { cevre: 5, cevreci: 5, genc: 3, gonullu: 2, itibar: 1 },
          result: 'Mavi kutular sokağı doldurdu. Bir tanesi kedi evi olarak kullanıldı; kamuoyu bunu da "yaratıcı geri dönüşüm" saydı.' },
        { text: 'Yalnızca okullarda pilot uygulama yap', cost: { butce: 10 }, hint: 'Ucuz ve ölçülü',
          effects: { cevre: 2, genc: 3, cevreci: 2, sosyal: 1 },
          result: 'Öğrenciler kutuları süsledi, öğretmenler ders işledi. Çocuklar evde anne babayı denetlemeye başladı.' },
        { text: 'Gönüllülere bırak, belediye bütçe ayırmasın', hint: 'Bedava ama destek az',
          effects: { cevreci: -2, gonullu: 2, cevre: 1, itibar: -1 },
          result: 'Gönüllüler kendi imkânlarıyla kutu açtı. Bütçeye dokunulmadı, kutuya da kimse dokunmadı.' }
      ]
    },

    /* ================= AFET HAZIRLIĞI ================= */
    {
      id: 'afet_bina_denetimi', cat: 'afet', district: 'yokusbasi',
      title: '{mahalle}’de Riskli Bina Raporu',
      text: '{mahalle}’deki üç eski apartman için mühendisler "riskli" raporu verdi. Apartman yönetimleri bu raporu "tanıdık bir komşu" gibi sessizce karşılıyor; kimse taşınmak istemiyor.',
      speaker: { name: 'Müh. Sabriye', role: 'İnşaat Mühendisi', emoji: '🏗️' },
      choices: [
        { text: 'Binaları tahliye ettir, kira desteği ver', cost: { butce: 40 }, hint: 'Önlem sağlam, bedeli yüksek',
          effects: { afet: 7, guvenlik: 3, emekli: -3, mahalle: -3, sonra: { id: 'afet_riskli_bina_itirazi', tur: 2 } },
          result: 'Binalar boşaltıldı, kiracılara destek verildi. Sabriye rahat uyudu, teyzeler ise ilk geceyi komşu salonunda geçirdi.' },
        { text: 'Güçlendirme için ortak fon kur', cost: { butce: 22 }, hint: 'Orta yol, ama vakit alır',
          effects: { afet: 4, altyapi: 2, mahalle: 3, esnaf: 1, sonra: { id: 'afet_riskli_bina_itirazi', tur: 2 } },
          result: 'Apartman yönetimleri ortak fon topladı. Bir sakin “Ben fon vereyim, komşu bedavadan yararlansın mı?” diye sordu.' },
        { text: 'Raporu askıya al, "gelecek bahar bakarız" de', hint: 'Bedava ama riskli',
          effects: { afet: -5, itibar: -2, mahalle: 3, emekli: 2, sonra: { id: 'afet_riskli_bina_itirazi', tur: 3 } },
          result: 'Rapor çekmeceye girdi. Mahalleli "ne iyi başkan" dedi; Sabriye ise dosyayı ikinci kez fotokopiledi.' }
      ]
    },
    {
      id: 'afet_riskli_bina_itirazi', cat: 'afet', district: 'yokusbasi', weight: 0,
      title: 'Riskli Bina Sakinleri İtiraz Etti',
      text: '{mahalle}’deki riskli binaların sakinleri toplanıp bir dilekçe sundu: "Binamız yıllardır ayakta, sizi dinlemiyoruz!" Mühendis Sabriye ise elinde yeni ölçüm sonuçlarıyla bekliyor.',
      speaker: { name: 'Müh. Sabriye', role: 'İnşaat Mühendisi', emoji: '🏗️' },
      choices: [
        { text: 'İkinci bağımsız denetim yaptır', cost: { butce: 12 }, hint: 'Güveni kazanır, süreç uzar',
          effects: { afet: 3, itibar: 2, mahalle: 3, emekli: 2 },
          result: 'Yeni denetim yapıldı, sakinler sonucu bizzat gördü. Ortam yumuşadı; çaylar fazla demlendi.' },
        { text: 'Zorunlu tahliye kararı çıkar', hint: 'Güvenlik ağır basar',
          effects: { afet: 6, guvenlik: 3, mahalle: -5, emekli: -4, itibar: -1 },
          result: 'Karar uygulandı. Gözyaşları, valizler, halılar... Mahalle bir süre sana kızgın kalacak; binalar ise ayakta.' },
        { text: 'Sakinlerin istediği gibi bırak', hint: 'Bedava ama tehlike büyür',
          effects: { afet: -6, mahalle: 3, emekli: 3, itibar: -3 },
          result: 'Binalar bırakıldı. Mahalleli mutlu, ama Sabriye "kahveyi tuzlu içiyoruz" dedi.' }
      ]
    },
    {
      id: 'afet_tatbikat', cat: 'afet', when: { notProject: 'erken_uyari' },
      title: 'Deprem Tatbikatı Teklifi',
      text: 'Bir kurtarma ekibi şehir çapında deprem tatbikatı önerdi. Fikir iyi; ancak son tatbikatta bir teyze "ben evde otururum" diyerek toplanma alanına gelmek yerine kendi sedirini getirmişti.',
      speaker: { name: 'Kaan', role: 'Kurtarma Ekibi Şefi', emoji: '🚨' },
      choices: [
        { text: 'Şehir çapında tatbikat düzenle', cost: { butce: 20 }, hint: 'Hazırlık güçlenir',
          effects: { afet: 6, sosyal: 2, genc: 2, esnaf: -3, emekli: -1 },
          result: 'Sirenler çaldı, okullar boşaldı. Esnaf bir saatlik kepenk kaybına söylendi; Kaan "bu bir saat bir ömre bedel" dedi.' },
        { text: 'Okul ve kamu binalarında sınırlı tatbikat', cost: { butce: 8 }, hint: 'Ucuz, kısmi',
          effects: { afet: 3, genc: 2, itibar: 1 },
          result: 'Okullarda tatbikat yapıldı, öğrenciler kahkahayla yere uzandı. Bir müdür "ders arası bile daha ciddiydi" dedi.' },
        { text: 'Tatbikata gerek yok, deprem olursa görürüz', hint: 'Bedava ama riskli',
          effects: { afet: -4, esnaf: 2, itibar: -2 },
          result: 'Tatbikat iptal edildi. Esnaf rahat nefes aldı; Kaan ise dosyayı kapatırken içini çekti.' }
      ]
    },
    {
      id: 'afet_dere_yatagi', cat: 'afet', district: 'sahil', when: { season: 'ilkbahar' },
      title: '{mahalle}’de Dere Yatağı Dolu',
      text: '{mahalle}’de eski dere yatağı yıllardır çöple, bahçe duvarlarıyla ve gizli bir halı sahayla doldu. Bahar yağmuruyla dere "ben buradayım" demeye hazırlanıyor.',
      choices: [
        { text: 'Dere yatağını temizle, kaçak yapıları yık', cost: { butce: 35 }, hint: 'Kalıcı çözüm, yıkım gerilimi',
          effects: { afet: 7, cevre: 3, mahalle: -4, esnaf: -3, guvenlik: 2 },
          result: 'Ekskavatörler çalıştı; halı saha anısı çöpe karıştı. Mahalle sessiz sedasız kızdı ama dere rahat nefes aldı.' },
        { text: 'Sadece çöpü temizle, yapılara dokunma', cost: { butce: 12 }, hint: 'Ucuz, kısmi',
          effects: { afet: 3, cevre: 2, mahalle: 2, esnaf: 1 },
          result: 'Çöp çıkarıldı, dere biraz akıllandı. Halı saha dokunulmadı; kaleler hâlâ kıyıdaydı.' },
        { text: 'Dere yatağına dokunma, yağmuru bekle', hint: 'Bedava ama kumar',
          effects: { mahalle: 2, esnaf: 1 },
          result: 'Dere olduğu gibi bırakıldı.',
          outcomes: [
            { p: 0.55, effects: { itibar: 1 }, result: 'Yağmur çok yağmadı. Dere sakin kaldı; şansın yine tutmuş.' },
            { p: 0.45, effects: { afet: -6, mahalle: -5, itibar: -3, hasar: 8 }, result: 'Dere taştı, halı saha göle döndü. Kalecinin eldivenleri ancak ertesi gün bulundu.' }
          ] }
      ]
    },
    {
      id: 'afet_kacak_kat', cat: 'afet', district: 'rastgele',
      title: '{mahalle}’de Kaçak Kat',
      text: '{mahalle}’de bir apartmanın üstüne "kaçak bir kat" eklenmiş. Müteahhit "çatı katı" diyor, komşular ise "uçan balkon" diye bakıyor. Mühendisler tedirgin.',
      speaker: { name: 'Müh. Burcu', role: 'Yapı Denetim Uzmanı', emoji: '📐' },
      choices: [
        { text: 'Kaçak katı yıktır', cost: { butce: 18 }, hint: 'Kural koyar, sakinler küser',
          effects: { afet: 5, guvenlik: 2, mahalle: -4, esnaf: -3, itibar: 2 },
          result: 'Kat yıkıldı; gökyüzü yeniden eski haline döndü. Müteahhit ise yeni bir fikir peşinde, bu sefer yer altına.' },
        { text: 'Para cezası kes, katı bırak', hint: 'Kasa dolar, risk kalır',
          effects: { butce: 10, afet: -4, itibar: -3, mahalle: 2 },
          result: 'Ceza kesildi, kat kaldı. Burcu "bu kat kâğıt kadar sağlam" dedi, fotoğrafını arşive koydu.' },
        { text: 'Güçlendirme şartıyla yasallaştır', cost: { butce: 12 }, hint: 'Orta yol',
          effects: { afet: 2, mahalle: 2, esnaf: 1, itibar: -1 },
          result: 'Güçlendirme şartı kondu. Müteahhit "bu da kolay iş değil" diye söylendi ama imzayı attı.' }
      ]
    },
    {
      id: 'afet_yangin_muslugu', cat: 'afet', district: 'baglar', when: { season: 'yaz' },
      title: '{mahalle}’de Susuz Yangın Muslukları',
      text: '{mahalle}’deki yangın muslukları yıllardır bakıma girmemiş; birini açan itfaiyeci sadece öksürük sesi duydu. Orman kenarı sıcak, kuru ve kıvılcıma dosttur.',
      speaker: { name: 'Mümtaz Şef', role: 'İtfaiye Amiri', emoji: '🚒' },
      choices: [
        { text: 'Tüm muslukları onar, yedek tank kur', cost: { butce: 34 }, hint: 'Güvenli ama pahalı',
          effects: { afet: 7, altyapi: 3, mahalle: 4, cevreci: 2 },
          result: 'Musluklar çalıştı, tanklar doldu. Mümtaz Şef ilk kez kuru bir yangın tatbikatı yerine ıslak bir tatbikat yaptı.' },
        { text: 'Yalnızca kritik noktaları onar', cost: { butce: 14 }, hint: 'Ucuz, kısmi',
          effects: { afet: 3, altyapi: 1, mahalle: 2 },
          result: 'Beş musluk onarıldı, onu aşan kısım "bahara kalmış" kabul edildi. Mümtaz Şef "yarım önlem tam endişedir" dedi.' },
        { text: 'Kuru sezonu sabırla geçir', hint: 'Bedava ama kumar',
          effects: { mahalle: -2 },
          result: 'Yaz boyunca kimse muslukları kurcalamadı.',
          outcomes: [
            { p: 0.6, effects: { itibar: 1 }, result: 'Yaz sakin geçti, kıvılcım çıkmadı. Mümtaz Şef yine de gözünü ormandan ayırmadı.' },
            { p: 0.4, effects: { afet: -6, cevre: -4, mahalle: -5, itibar: -3 }, result: 'Bir mangal kıvılcımı otları tutuşturdu; musluklar yardım edemedi. Hasar küçük, ders büyük.' }
          ] }
      ]
    },
    {
      id: 'afet_toplanma_alani', cat: 'afet', when: { max: { afet: 40 } },
      title: 'Toplanma Alanı Otoparka Döndü',
      text: 'Şehirdeki toplanma alanlarının yarısı otopark olmuş; birinin üzerinde "Toplanma Alanı" tabelası altında "Günlük 20 TL" yazıyor. Acil durumda toplanacak yer, tutulacak yer.',
      choices: [
        { text: 'Otoparkları kapat, alanları geri kazan', cost: { butce: 22 }, hint: 'Güvenlik artar, esnaf kızar',
          effects: { afet: 6, guvenlik: 2, esnaf: -4, ulasim: -3, itibar: 1 },
          result: 'Otoparklar kapatıldı, toplanma alanları açıldı. Park yeri arayan sürücüler sana mektup yazmaya başladı.' },
        { text: 'Hafta sonu otopark, hafta içi toplanma alanı yap', hint: 'Çözüm hibrit',
          effects: { afet: 2, esnaf: 1, ulasim: 1, itibar: -1 },
          result: 'Esnek düzen kuruldu. Bir mahallede cumartesi toplanma tatbikatı park yeri savaşına dönüştü.' },
        { text: 'Dokunma, alanlar nasılsa orada', hint: 'Bedava ama anlamsız',
          effects: { afet: -4, esnaf: 2, ulasim: 2, itibar: -2 },
          result: 'Alanlar otopark olarak kaldı. Esnaf sevindi; Kaan "toplanacak yer yok" dedi ve tabelayı fotoğrafladı.' }
      ]
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);

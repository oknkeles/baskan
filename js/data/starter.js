/* BAŞKAN — başlangıç içeriği. Her türden örnek: diğer veri dosyaları bu kalıbı izler (şema: js/core/schema.js). */
(function (root) {
  'use strict';
  var BG = root.BG;

  BG.add('events', [
    {
      id: 'ulasim_minibus_kontak', cat: 'ulasim',
      title: 'Minibüsçüler Kontak Kapattı',
      text: 'Minibüs esnafı zam talebi kabul edilmeyince kontak kapattı. Duraklarda kuyruk Çarşı’dan sahile uzuyor; sosyal medyada #YürüyenŞehir etiketi gündemde.',
      speaker: { name: 'Rıza Usta', role: 'Minibüsçüler Odası Başkanı', emoji: '🚐' },
      choices: [
        { text: 'Zammı onayla', hint: 'Esnaf sevinir, cüzdanlar üzülür',
          effects: { esnaf: 6, isci: -5, genc: -4, ulasim: 3 },
          result: 'Minibüsler yeniden yollarda. Rıza Usta seni kahveye davet etti; öğrenciler ise kart bakiyesine bakıp iç çekti.' },
        { text: 'Belediye otobüslerini ücretsiz sefere çıkar', cost: { butce: 25 },
          effects: { isci: 5, genc: 5, esnaf: -6, ulasim: 2, itibar: 2 },
          result: 'Ücretsiz otobüsler alkışlarla karşılandı. Minibüsçüler üçüncü gün kontağı kendiliğinden açtı — ama Rıza Usta selamı kesti.' },
        { text: 'Pazarlık masası kur', hint: 'Sonuç, çayın demine bağlı',
          result: 'Tarafları meclis salonunda buluşturdun.',
          outcomes: [
            { p: 0.55, effects: { esnaf: 3, isci: 2, itibar: 3, ulasim: 2 }, result: 'Altıncı çayda orta yol bulundu: küçük zam, öğrenciye indirim. Herkes biraz memnun.' },
            { p: 0.45, effects: { esnaf: -3, isci: -3, ulasim: -4, itibar: -2 }, result: 'Masa dağıldı, grev bir hafta daha sürdü. Şehir yürümeyi öğrendi, seni affetmeyi değil.' }
          ] }
      ]
    },
    {
      id: 'altyapi_cukur_dogum_gunu', cat: 'altyapi', district: 'rastgele',
      title: '{mahalle}’nin Meşhur Çukuru',
      text: '{mahalle}’deki dev çukur üçüncü yaşını kutluyor. Mahalleli pasta kesti, mum üfledi; video bir günde bir milyon izlendi.',
      choices: [
        { text: 'Hemen asfaltla', cost: { butce: 15 }, effects: { altyapi: 3, mahalle: 5, itibar: 1 },
          result: 'Çukur bir gecede kapandı. Mahalleli bu kez asfalta hoş geldin töreni düzenledi.' },
        { text: 'Doğum gününe katıl, espriyle geçiştir', hint: 'Bugün güldürür, yarın…',
          effects: { genc: 3, itibar: -2, mahalle: -3, sonra: { id: 'altyapi_cukur_donusu', tur: 2 } },
          result: 'Pastadan bir dilim aldın, özçekim yaptın. Çukur hâlâ orada ama artık hayran kitlesi var.' },
        { text: 'Sokağı komple yenileme programına al', cost: { butce: 45 }, effects: { altyapi: 7, mahalle: 6, esnaf: -2 },
          result: 'Sokak kazıldı, borular değişti, asfalt döküldü. Esnaf iki hafta toz yuttu ama sonuç pırıl pırıl.' }
      ]
    },
    {
      id: 'altyapi_cukur_donusu', cat: 'altyapi', district: 'rastgele', weight: 0,
      title: 'Çukur Geri Döndü — Bu Sefer Büyümüş',
      text: 'Geçiştirdiğin çukur yağmurla gölete dönüştü. Bir minibüs içine yan yattı; {mahalle} sakinleri bu kez pasta değil pankart getirdi.',
      choices: [
        { text: 'Acil onarım yap, özür dile', cost: { butce: 30 }, effects: { altyapi: 4, mahalle: 3, itibar: 1 },
          result: 'Gece yarısı ekiplerle sahadaydın. Özür kabul edildi; pankartlar şimdilik katlandı.' },
        { text: 'Suçu önceki yönetime at', effects: { itibar: -4, mahalle: -5, halk: -1 },
          result: '“Biz devraldığımızda da oradaydı” dedin. Kimse gülmedi; çukur da kapanmadı.' }
      ]
    },
    {
      id: 'siyaset_canli_yayin_daveti', cat: 'siyaset', modes: ['opposition'],
      title: 'Canlı Yayına Davetlisin',
      text: 'Yerel kanal seni “Şehrin Nabzı” programına çağırıyor. Sunucu sert sorularıyla ünlü; Başkan {rakip} de telefonla bağlanabilirmiş.',
      choices: [
        { text: 'Çık, icraatı masaya yatır', cost: { enerji: 1 }, hint: 'Canlı yayın affetmez',
          result: 'Stüdyo ışıkları altında terledin.',
          outcomes: [
            { p: 0.6, effects: { halk: 2, itibar: 3, rakip: -2 }, result: 'Rakamlarla konuştun, sunucu bile başını salladı. Kesitler sosyal medyada dönüyor.' },
            { p: 0.4, effects: { itibar: -3, rakip: 1 }, result: 'Bir rakamı karıştırdın; {rakip} telefonda düzeltti. Kesitler sosyal medyada dönüyor — maalesef.' }
          ] },
        { text: 'Nazikçe reddet, sahada kal', effects: { gonullu: 1 },
          result: '“Benim stüdyom sokak” dedin. Bir gönüllü daha ekibe katıldı ama ekranlar rakibe kaldı.' }
      ]
    }
  ]);

  BG.add('projects', [
    { id: 'otobus_filosu', name: 'Yeni Otobüs Filosu', emoji: '🚌', cat: 'ulasim', yer: 'sehir',
      desc: 'Klimalı, alçak tabanlı 40 yeni otobüs.', cost: 90, turns: 2, upkeep: 3,
      effects: { ulasim: 9, isci: 3, emekli: 2 },
      doneText: 'Yeni otobüsler seferde. Klima çalışıyor; şoförler bile gülümsüyor.' },
    { id: 'mahalle_parki', name: 'Mahalle Parkı', emoji: '🌳', cat: 'cevre', yer: 'mahalle',
      desc: 'Seçtiğin mahalleye çocuk parkı, yürüyüş yolu ve kedi evleri.', cost: 45, turns: 1, upkeep: 1,
      effects: { cevre: 4, sosyal: 2, mahalle: 6 },
      doneText: '{mahalle} Parkı açıldı. İlk gün salıncak kuyruğu çıkışa kadar uzadı.' },
    { id: 'afet_toplanma', name: 'Afet Toplanma Alanları', emoji: '🧯', cat: 'afet', yer: 'sehir',
      desc: 'Her mahalleye konteyner depo, jeneratör ve toplanma alanı.', cost: 70, turns: 2, upkeep: 2,
      effects: { afet: 10, emekli: 2, cevreci: 1 },
      doneText: 'Toplanma alanları hazır. Umarız hiç gerekmez — ama gerekirse hazırız.' }
  ]);

  BG.add('disasters', [
    {
      id: 'deprem', name: 'Deprem', emoji: '🏚️', chance: 0.05, riskKey: 'deprem', prep: ['afet', 'altyapi'],
      intro: {
        1: 'Gece yarısı {sehir} hafifçe sallandı; merkez üssü {mahalle}. Birkaç baca devrildi, herkes pijamayla sokağa döküldü.',
        2: '{sehir} şiddetli bir depremle sarsıldı. {mahalle}’de eski binalarda ağır hasar var; elektrik ve su kesik.',
        3: 'Büyük deprem! {mahalle}’de binalar çöktü, yollar kapandı. {sehir} tarihinin en uzun gecesi başladı.'
      },
      impact: {
        1: { hasar: 10, altyapi: -2 },
        2: { hasar: 28, altyapi: -6, ekonomi: -3, halk: -1 },
        3: { hasar: 50, altyapi: -12, ekonomi: -7, ulasim: -5, halk: -2 }
      },
      stages: [
        { title: 'İlk Saatler', text: 'Telefonlar kilitlendi, kriz masası senden talimat bekliyor.',
          choices: [
            { text: 'Tüm ekipleri arama kurtarmaya yönlendir', effects: { kriz: 2, itibar: 3, hasar: -3 },
              result: 'Zabıtadan park-bahçeye herkes sahada. Enkazdan çıkan her alkış şehre nefes aldırıyor.' },
            { text: 'Çevre illerden ve gönüllülerden destek iste', hint: 'Koordinasyon riski',
              result: 'Çağrın dalga dalga yayıldı.',
              outcomes: [
                { p: 0.6, effects: { kriz: 2, halk: 1, hasar: -5 }, result: 'Yardım konvoyları sabaha karşı ulaştı; ekipler omuz omuza çalışıyor.' },
                { p: 0.4, effects: { kriz: -1, itibar: -2 }, result: 'Gelen araçlar yolları tıkadı; koordinasyon kurulana kadar kıymetli saatler geçti.' }
              ] },
            { text: 'Önce basın toplantısı yap', effects: { kriz: -2, itibar: -4, halk: 1 },
              result: 'Kameralara konuşurken sahadan “Başkan nerede?” sesleri yükseldi.' }
          ] },
        { title: 'Barınma', minSev: 2, text: 'Binlerce kişi evine giremiyor. Hava soğuk, parklar doldu.',
          choices: [
            { text: 'Çadır kent ve aşevi kur', cost: { butce: 40 }, effects: { kriz: 2, emekli: 3, isci: 3, mahalle: 4 },
              result: 'Stadyum bir gecede çadır kente döndü. Sıcak çorba kuyruğunda sen de vardın.' },
            { text: 'Otelleri ve düğün salonlarını aç', cost: { butce: 20 }, effects: { kriz: 1, isinsani: -3, mahalle: 3, itibar: 2 },
              result: 'Salon sahipleri homurdandı ama kapılar açıldı. Avizelerin altında yüzlerce aile uyudu.' },
            { text: '“Herkes yakınlarının yanına gitsin” de', effects: { kriz: -2, halk: -2, mahalle: -5 },
              result: 'Yakını olmayanlar arabalarda sabahladı. Bu cümle uzun süre unutulmayacak.' }
          ] },
        { title: 'Yeniden İmar', text: 'Toz yatıştı. Şimdi asıl soru: hasarlı binalar ne olacak?',
          choices: [
            { text: 'Hızlı hasar tespiti ve ücretsiz güçlendirme', cost: { butce: 60 }, effects: { kriz: 2, afet: 6, hasar: -10, mahalle: 4 },
              result: 'Mühendisler kapı kapı dolaştı. Pahalıya patladı ama insanlar evine güvenerek döndü.' },
            { text: 'İmar affı karşılığı müteahhitlere yaptır', effects: { kriz: -1, hasar: -8, isinsani: 4, cevreci: -5, itibar: -3 },
              result: 'İnşaatlar hızla yükseldi; kat sayıları da. Mühendisler odası sert bir bildiri yayımladı.' },
            { text: 'Merkezî yardımı bekle', effects: { kriz: -1, butce: 30, mahalle: -3 },
              result: 'Ödenek geldi ama aylar sonra. Mahalleli o arada kendi yarasını kendi sardı.' }
          ] }
      ],
      aftermath: {
        good: 'Kriz karnen pekiyi. “Zor günde başkan sahadaydı” cümlesi kahvehanelerde dolaşıyor.',
        bad: 'Kriz karnen zayıf. Deprem geçti ama şehirde bir güven artçısı sürüyor.'
      },
      opp: {
        text: 'Deprem {mahalle}’yi vurdu. Başkan {rakip} kriz masasında; senin makamın yok ama elin kolun da bağlı değil.',
        choices: [
          { text: 'Gönüllülerinle sahaya in', cost: { gonullu: 3, enerji: 1 }, effects: { halk: 2, itibar: 4, mahalle: 6 },
            result: 'Ekibinle enkaz başında çorba dağıttınız. Kimse rozet sormadı; herkes teşekkür etti.' },
          { text: 'Yönetimin hazırlıksızlığını eleştir', hint: 'Zamanlama her şeydir',
            result: 'Basın açıklaması yaptın.',
            outcomes: [
              { p: 0.5, effects: { rakip: -3, itibar: 1 }, result: 'Raporlarla konuştun; ihmal iddiaları gündeme oturdu.' },
              { p: 0.5, effects: { itibar: -4, halk: -1 }, result: '“Enkaz üstünde siyaset” manşetleriyle uyandın.' }
            ] },
          { text: 'Siyaseti bırak, sessizce yardım topla', cost: { fon: 15 }, effects: { itibar: 3, mahalle: 3 },
            result: 'Kampanya fonundan battaniye aldın, tır tır gönderdin. Reklamını yapmadın; yapanlar oldu.' }
        ]
      }
    }
  ]);

  BG.add('dialogues', [
    {
      id: 'emekli_fatma_teyze', modes: ['mayor', 'opposition'], district: 'yokusbasi', mizac: 'supheci',
      kisi: { name: 'Fatma Teyze', age: 68, job: 'Emekli terzi', emoji: '👵', group: 'emekli' },
      intro: 'Kapıyı aralıyor, gözlüğünün üstünden seni süzüyor.',
      start: 35, hedef: 65,
      rounds: [
        { line: 'Evladım, üç senedir durağa bank istiyorum. Dizlerim tutmuyor, otobüs de vaktinde gelmiyor.',
          options: [
            { text: 'Haklısınız Fatma Teyze. Yarın ekibimi gönderiyorum, takibini bizzat yapacağım.', tone: 'samimi', ikna: 9, reply: 'Hıh. Yarın görürüz bakalım.' },
            { text: 'Otobüs seferleri sıklaştı; bekleme süresi düştü.', tone: 'veri', ikna: 12, when: { min: { ulasim: 55 } },
              reply: 'Doğru, geçen gün beş dakikada geldi.', replyBlof: 'Hangi sefer evladım? Dün kırk dakika bekledim, üşüttüm!' },
            { text: 'Size yaldızlı, minderli, üstü kapalı bir bank yaptıracağım!', tone: 'vaat', ikna: 6, reply: 'Yaldızı sen kendine sakla, ben oturacak yer istiyorum.' }
          ] },
        { line: 'Peki ya bizim sokağın lambası? Akşam olunca göz gözü görmüyor.',
          options: [
            { text: 'Karanlıkta dedikodu daha tatlı olur derler ama…', tone: 'espri', ikna: 5, reply: 'Şaka yapma evladım, geçen hafta Hatice düştü.' },
            { text: 'Hatice Teyze’nin düştüğünü duydum, çok üzüldüm. Lambanın bu hafta değişmesi için peşindeyim.', tone: 'samimi', ikna: 10, reply: 'Demek haberin var… Aferin.' },
            { text: 'Lamba işi elektrik idaresinin, belediyenin değil.', tone: 'sert', ikna: -6, reply: 'Topu taca atma bana!' }
          ] },
        { line: 'Oğlum “bunların hepsi aynı” diyor. Ben niye sana güveneyim?',
          options: [
            { text: 'Emekliler lokali açıldı: haftada üç gün ücretsiz çorba ve sağlık taraması var.', tone: 'veri', ikna: 10, when: { min: { sosyal: 50 } },
              reply: 'Lokale gittim, çorbası fena değil.', replyBlof: 'Hangi lokal? Bizim mahallede kahveden başka bir şey yok!' },
            { text: 'Hepimiz aynı değiliz. Kapınıza geldim; numaram bu, arayın, açarım.', tone: 'samimi', ikna: 9, reply: 'Numarayı buzdolabına yapıştırıyorum. Ararım, bak!' },
            { text: 'Emeklilere her ay hediye paketi dağıtacağım!', tone: 'vaat', ikna: 8, reply: 'Paketle kandırılacak yaşı geçtim ben.' }
          ] }
      ],
      success: { text: 'Fatma Teyze kapıyı sonuna kadar açtı: “Gel bir çay iç bari.” Komşulara seni anlatacağından şüphen yok.', effects: { emekli: 4, mahalle: 3 } },
      fail: { text: '“Hadi evladım, ocakta yemeğim var” deyip kapıyı kapattı. Perde arkasından izlediğini biliyorsun.', effects: { emekli: -2, mahalle: -1 } }
    }
  ]);

  BG.add('missions', [
    { id: 'kapi_kapi', name: 'Kapı Kapı Dolaş', emoji: '🚪', yer: 'mahalle', kind: 'diyalog', cooldown: 0,
      desc: 'Bir mahallede zilleri çal, bir seçmenle yüz yüze konuş.', cost: { enerji: 1 } },
    { id: 'meydan_mitingi', name: 'Meydan Mitingi', emoji: '📣', yer: 'mahalle', kind: 'olay', cooldown: 2,
      desc: 'Seçtiğin mahallenin meydanında kürsü kur.', cost: { enerji: 2, fon: 20 },
      text: '{mahalle} meydanı dolmaya başladı. Ses sistemi cızırdıyor; kalabalık senden bir şey duymak istiyor.',
      choices: [
        { text: 'Somut bir kent planı anlat', effects: { mahalle: 6, itibar: 2, isinsani: 2 },
          result: 'Haritalar, rakamlar, takvim… Alkış azdı ama dikkatle dinlediler. Ertesi gün esnaf planı konuşuyordu.' },
        { text: 'Başkan {rakip}’e yüklen', hint: 'Kalabalık coşar ya da soğur',
          result: 'Sesini yükselttin.',
          outcomes: [
            { p: 0.55, effects: { mahalle: 8, rakip: -2 }, result: 'Meydan “İstifa!” diye inledi. Görüntüler akşam haberlerinde.' },
            { p: 0.45, effects: { mahalle: 2, itibar: -3 }, result: 'Fazla kaçırdın; ön sıradaki teyzeler başını iki yana salladı.' }
          ] },
        { text: 'Kürsüyü gönüllülere bırak', cost: { gonullu: 2 }, effects: { mahalle: 5, genc: 3 },
          result: 'Mikrofonu bir öğrenciye, bir pazarcıya, bir hemşireye verdin. En çok alkışı onlar aldı.' }
      ] }
  ]);

  BG.add('rivals', [
    { id: 'betoncu', name: 'Cemal Kule', title: 'Müteahhit', emoji: '🏗️', base: 49,
      slogan: 'Her mahalleye bir gökdelen!',
      bio: 'Otuz yıldır şehrin siluetini değiştiriyor. Parkı “atıl arsa”, ağacı “gölge yapan engel” olarak görür.',
      groups: { isinsani: 10, esnaf: 3, cevreci: -12, genc: -3 },
      govern: { ekonomi: 1, altyapi: 1, cevre: -2, sosyal: -1 },
      taunts: [
        'Sayın başkan park yapıyor, ben istihdam! Çocuk salıncakla karnını doyurmaz.',
        'Bu şehre vizyon lazım; vizyon dediğin en az kırk katlı olur.',
        'Başkan {baskan} çukur kapatmayı icraat sanıyor.'
      ],
      winQuote: 'Kazmayı vurma vakti geldi. İlk iş: belediye binasına on kat daha!',
      loseQuote: 'Halk henüz hazır değilmiş. Arsalarım sabırla bekler.' }
  ]);

  BG.add('rivalNews', [
    { id: 'rn_cemal_sahil_avm', rival: 'betoncu',
      title: 'Sahil Parkına AVM İhalesi',
      text: 'Başkan Cemal Kule sahil parkını “atıl alan” ilan edip AVM ihalesine çıkardı. Çevreciler nöbette, müteahhitler kuyrukta.',
      effects: { cevre: -4, ekonomi: 2, cevreci: 5, genc: 2, isinsani: -2 } }
  ]);

  BG.add('promises', [
    { id: 'vaat_otobus', emoji: '🚌', text: '“Yeni otobüs filosunu ilk yılımda yollara çıkaracağım!”',
      when: { notProject: 'otobus_filosu' },
      boost: { isci: 4, emekli: 3 }, kosul: { project: 'otobus_filosu' }, sure: 5,
      tut: { itibar: 5, isci: 2 }, tutText: 'Söz verdiğin otobüsler yollarda. “Dediğini yapan başkan” manşetleri atıldı.',
      boz: { itibar: -8, isci: -5, emekli: -3 }, bozText: 'Otobüs sözü tutulmadı. Durakta bekleyenler eski seçim afişine bakıp söyleniyor.' }
  ]);

  BG.add('headlines', [
    { text: 'Başkan {baskan} güne erken başladı, {sehir} geç uyandı' },
    { text: 'Kasa alarm veriyor: Belediye borç batağında mı?', when: { max: { butce: 0 }, mode: 'mayor' } },
    { text: 'Anketlerde {rakip} rüzgârı: Başkan {baskan} zor günler geçiriyor', when: { max: { anket: 42 }, mode: 'mayor' } }
  ]);

  BG.add('tweets', [
    { user: '@simitci_hasan', text: 'Sabah 6’da tezgâhı açtım, belediye hâlâ uyuyor. Bu şehri asıl kim yönetiyor belli 🥯' },
    { user: '@kampuslu_ece', text: 'Otobüs yine gelmedi. Yürüyerek gidiyorum; adım sayarım rekor kırdı 🚶‍♀️', when: { max: { ulasim: 45 } } },
    { user: '@yokusbasi_muhtar', text: 'Afet çantanızı hazırladınız mı komşular? Belediye hazırlanmış, darısı başımıza.', when: { min: { afet: 60 } } }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);

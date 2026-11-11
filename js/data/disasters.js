/* BAŞKAN — afetler: sel, orman yangını, kar fırtınası, kuraklık, salgın. */
(function (root) {
  'use strict';
  var BG = root.BG;

  BG.add('disasters', [
    {
      id: 'sel', name: 'Sel', emoji: '🌊', seasons: ['ilkbahar', 'sonbahar'], chance: 0.09, riskKey: 'sel', prep: ['altyapi', 'afet'],
      intro: {
        1: 'Sağanak bir türlü dinmiyor. {mahalle}’de rögarlar taştı, çay ocağının önündeki sandalyeler yüzmeye başladı.',
        2: '{sehir}’de dere taştı. {mahalle}’de alt katlar su altında, minibüsler yolda mahsur kaldı.',
        3: 'Sel felaketi! {mahalle}’yi azgın sular bastı, arabalar sokakta kâğıt tekne gibi sürükleniyor.'
      },
      impact: {
        1: { hasar: 10, altyapi: -2 },
        2: { hasar: 28, altyapi: -6, ekonomi: -3, halk: -1 },
        3: { hasar: 48, altyapi: -11, ekonomi: -6, ulasim: -6, halk: -2 }
      },
      stages: [
        { title: 'Su Yükseliyor', text: 'Dere seviyesi saatte yarım metre artıyor. Kriz masasında herkes sana bakıyor.',
          choices: [
            { text: 'Pompa ve vidanjör ekiplerini seferber et', cost: { butce: 30 }, effects: { kriz: 2, altyapi: 2, hasar: -5, itibar: 2 },
              result: 'Tüm pompalar sahada. Ekip başı gece boyunca terlik ve yağmurlukla koştu; su yavaş yavaş çekilmeye başladı.' },
            { text: 'Yağmur kanallarını açık tut, hepsi çalışsın', when: { project: 'yagmur_kanali' }, whyNot: 'Yağmur kanalı projesi gerekli',
              effects: { kriz: 3, hasar: -10, altyapi: 3, itibar: 3 },
              result: 'Yıllardır konuşulan kanallar işini yaptı. Su dereye aktı; mahalle yalnızca “yağmur” diye bahsetti.' },
            { text: 'Barajın kapaklarını aç, suyu aşağıya sal', hint: 'Aşağı mahalleler risk altında',
              result: 'Kapaklar gıcırdayarak açıldı.',
              outcomes: [
                { p: 0.55, effects: { kriz: 2, hasar: -8, altyapi: 1 }, result: 'Seviye düştü, şehir rahat nefes aldı. Mühendisler gözünü terazide tutmuştu.' },
                { p: 0.45, effects: { kriz: -1, hasar: 6, itibar: -3, mahalle: -4 }, result: 'Su aşağıdaki mahalleyi bastı; “önceden haber verseydiniz” diye bağıranlar vardı.' }
              ] },
            { text: 'Valilikten talimat bekle', effects: { kriz: -2, itibar: -3, mahalle: -3, butce: 8 },
              result: 'Telefon meşgul çaldı. Saatler geçti, su beklemedi; ödenek sözü ise sonunda geldi.' }
          ] },
        { title: 'Mahsur Kalanlar', minSev: 2, text: 'Çatılarda kedi, köpek ve insan var. Botlar yetmiyor.',
          choices: [
            { text: 'Bot ve helikopterle tahliye başlat', cost: { butce: 40 }, effects: { kriz: 2, emekli: 3, genc: 2, itibar: 3, mahalle: 4 },
              result: 'Herkes sağ çıkarıldı, kedilerin hepsi de. Fotoğraflar sosyal medyayı kapladı.' },
            { text: 'Esnaf ve gönüllülerin teknelerini topla', hint: 'Kontrolsüz olabilir',
              result: 'Balıkçılar ve halı saha ekibi sahaya indi.',
              outcomes: [
                { p: 0.6, effects: { kriz: 2, esnaf: 3, genc: 2, hasar: -4 }, result: 'Mahalleli mahalleliyi kurtardı. Kimse kimseden rozet sormadı.' },
                { p: 0.4, effects: { kriz: -1, itibar: -2, halk: -1 }, result: 'Teknelerden biri devrildi; kimse can kaybı yaşamadı ama koordinasyon dağıldı.' }
              ] },
            { text: '“Üst katlara çıkın, bekleyin” duyurusu yap', effects: { kriz: -2, emekli: -3, mahalle: -4 },
              result: 'Üst katı olmayanlar, merdiveni olmayanlar ve kiracı teyzeler kendi başına kaldı.' }
          ] },
        { title: 'Temizlik ve Yara Sarma', text: 'Su çekildi, geriye çamur, batmış dükkânlar ve kırık halı saha kalesi kaldı.',
          choices: [
            { text: 'Çamur temizliği ve esnafa hasar desteği', cost: { butce: 50 }, effects: { kriz: 2, esnaf: 4, hasar: -10, ekonomi: 2, mahalle: 4 },
              result: 'Süpürge, kova, itfaiye hortumu… Dükkânlar üç günde yeniden açıldı; çay ikramı belediyeden.' },
            { text: 'Dere yatağına betonlu set yaptır, imarı genişlet', effects: { kriz: -1, hasar: -6, isinsani: 4, cevreci: -4, itibar: -2 },
              result: 'Set çıktı, kat sayısı da. Doğa derneği “dere yatağı bir yürüyüş yolu değil” diye yazdı.' },
            { text: 'Mahalleliye “kendiniz halledin” de', effects: { kriz: -2, halk: -2, mahalle: -5, butce: 15 },
              result: 'Bütçe tasarruf etti, mahalle tepkisini hatırlayacak.' }
          ] }
      ],
      aftermath: {
        good: 'Kriz karnen güzel. “Sel geldi ama şehir ayakta” diyorlar; çay ocağında Başkan’a yeni bir isim verildi: “Su Perisi”.',
        bad: 'Kriz karnen zayıf. Su çekildi ama güven çekilmedi; esnaf “yine mi aynı kanal” diyerek duvara yazı yazdırdı.'
      },
      opp: {
        text: 'Sel {mahalle}’yi vurdu. Başkan {rakip} “önlem aldık” diyor; ama çatılardaki kediler başka bir şey söylüyor.',
        choices: [
          { text: 'Gönüllü çamur temizleme ekibi kur', cost: { gonullu: 3, enerji: 1 }, effects: { halk: 2, itibar: 4, mahalle: 6 },
            result: 'Çamurlu botlar, çay termosları ve ortak şarkılar. Mahalle seni “bizden biri” olarak not etti.' },
          { text: 'Yönetimin kanal ihmalini açıkla', hint: 'Zamanlama hassas',
            result: 'Eski kanal raporlarını çıkardın.',
            outcomes: [
              { p: 0.5, effects: { rakip: -3, itibar: 1 }, result: 'Belgeler ortada; “bile bile ihmal” başlığı gazetede göründü.' },
              { p: 0.5, effects: { itibar: -4, halk: -1 }, result: '“Suyun üstünde siyaset” diye sana yüklendiler.' }
            ] },
          { text: 'Sessizce kuru gıda ve battaniye gönder', cost: { fon: 15 }, effects: { itibar: 3, mahalle: 3 },
            result: 'Kamyonları gece gönderdin. Reklamını yapan çıktı, sen yapmadın.' }
        ]
      }
    },

    {
      id: 'orman_yangini', name: 'Orman Yangını', emoji: '🔥', seasons: ['yaz'], chance: 0.10, riskKey: 'yangin', prep: ['afet', 'cevre'],
      intro: {
        1: 'Dağ eteğinden duman yükseliyor. {mahalle}’nin üstündeki çamlıkta küçük bir yangın var; martılar bile kaçıyor.',
        2: 'Rüzgâr çıktı, yangın büyüdü. {mahalle}’de evlere kızıl ışık düşüyor, kül yağıyor.',
        3: 'Orman yangını büyük! Alevler {mahalle}’ye dayandı. Gökyüzü turuncu, {sehir} nefes alamıyor.'
      },
      impact: {
        1: { hasar: 10, cevre: -3 },
        2: { hasar: 26, cevre: -7, ekonomi: -2, halk: -1 },
        3: { hasar: 48, cevre: -13, ekonomi: -6, altyapi: -4, halk: -2 }
      },
      stages: [
        { title: 'İlk Müdahale', text: 'Alevler çamlığı yalıyor. Köylüler tulumbayla, itfaiye hortumla bekliyor.',
          choices: [
            { text: 'Tüm itfaiye ve arazözleri bölgeye gönder', cost: { butce: 35 }, effects: { kriz: 2, afet: 2, hasar: -5, itibar: 2 },
              result: 'Arazözler dağ yoluna dizildi. Ekip başı yüzü kurum içinde en önde ilerledi; yangın ilk gün sınırlandı.' },
            { text: 'İtfaiye istasyonundan hızlı müdahale ekibi çıkar', when: { project: 'itfaiye_istasyonu' }, whyNot: 'İtfaiye istasyonu gerekli',
              effects: { kriz: 3, hasar: -10, afet: 3, itibar: 3 },
              result: 'Yeni istasyon beş dakika içinde sahadaydı. Alevler kasabanın kapısına gelmeden durdu.' },
            { text: 'Karşı ateş yakarak yayılmayı kes', hint: 'Kontrol dışı çıkabilir',
              result: 'Rüzgâra bakıp riskli kararı verdin.',
              outcomes: [
                { p: 0.55, effects: { kriz: 2, hasar: -9, cevre: 1 }, result: 'Ateş ateşi kesti. Ormancılar eski bir yöntemi doğru zamanda kullandı.' },
                { p: 0.45, effects: { kriz: -1, hasar: 6, cevre: -4, itibar: -3 }, result: 'Rüzgâr yön değiştirdi, karşı ateş tarafı da yakıp geçti.' }
              ] },
            { text: '“Panik yapmayın, çok bir şey yok” açıklaması yap', effects: { kriz: -2, itibar: -3, mahalle: -3 },
              result: 'Açıklama yayında iken arkada alevler büyüyordu. Fotoğraf mizah sayfalarına düştü.' }
          ] },
        { title: 'Tahliye', minSev: 2, text: 'Kasaba yoluna yaklaşan alevlerle birlikte tahliye gerekiyor. Bazı yaşlılar evden çıkmak istemiyor.',
          choices: [
            { text: 'Otobüs ve minibüslerle zorunlu tahliye', cost: { butce: 30 }, effects: { kriz: 2, emekli: 3, halk: 1, mahalle: 3 },
              result: 'Minibüsçüler ücret almadan çalıştı. Teyzeler kedileriyle birlikte geldi, kimse geride kalmadı.' },
            { text: 'Gönüllü gençlerle ev ev dolaşıp ikna et', hint: 'Zaman daralıyor',
              result: 'Gençler kapı kapı dolaştı.',
              outcomes: [
                { p: 0.6, effects: { kriz: 2, genc: 3, emekli: 2 }, result: 'Çoğu ikna oldu; gençler tatlı dille yaşlıları ikna edip arabalara bindirdi.' },
                { p: 0.4, effects: { kriz: -1, emekli: -2, itibar: -2 }, result: 'Bazı evler zamanında boşaltılamadı; son dakika koşturması yaşandı.' }
              ] },
            { text: 'Yalnızca anons yap, kararı vatandaşa bırak', effects: { kriz: -2, emekli: -4, mahalle: -4 },
              result: 'Anonsu duyan kalktı, duymayan kaldı. Sorumluluk birbirine atıldı.' }
          ] },
        { title: 'Yeniden Yeşillendirme', text: 'Duman dindi. Geriye kararmış tepeler ve soru işaretleri kaldı.',
          choices: [
            { text: 'Fidan seferberliği ve yangın yolları açma', cost: { butce: 45 }, effects: { kriz: 2, cevre: 6, hasar: -8, cevreci: 4, mahalle: 3 },
              result: 'Okul çocukları bir milyon fidan dikmeye söz verdi. İlki sen diktin; fotoğrafta elinde kürek var.' },
            { text: 'Yanan araziyi imara açıp konut yaptır', effects: { kriz: -1, isinsani: 5, cevreci: -6, itibar: -3 },
              result: 'Müteahhitler gülümsedi. Çevreciler “bu kadar da olmaz” dedi, sosyal medya sana “Kül Başkan” lakabını taktı.' },
            { text: 'Doğanın kendini yenilemesini bekle', effects: { kriz: -1, butce: 15, cevre: -2 },
              result: 'Bütçeye dokunmadın, ama tepeler yıllarca kararmış kaldı.' }
          ] }
      ],
      aftermath: {
        good: 'Kriz karnen güçlü. “Yangında Başkan hortumun ucundaydı” sözü dillerde; çam kokulu bir güven geri döndü.',
        bad: 'Kriz karnen zayıf. Yangın söndü ama sorular sönmedi: önlem neredeydi, arazöz neredeydi?'
      },
      opp: {
        text: 'Yangın {mahalle}’ye yaklaşıyor. Başkan {rakip} basın toplantısı yapıyor; sen ise yanan ormana en yakın yerdesin.',
        choices: [
          { text: 'Gönüllü itfaiye ve su ekipleri kur', cost: { gonullu: 3, enerji: 1 }, effects: { halk: 2, itibar: 4, mahalle: 6 },
            result: 'Su tankerleri, çay termosları ve kurum lekeli yüzler. Kimse sana rozetini sormadı.' },
          { text: 'Yönetimin hazırlıksız olduğunu açıkla', hint: 'Zamanlama riskli',
            result: 'Basın açıklaman geceyi böldü.',
            outcomes: [
              { p: 0.5, effects: { rakip: -3, itibar: 1 }, result: 'Eksik arazöz raporu gündeme düştü; halk soruyu sormaya başladı.' },
              { p: 0.5, effects: { itibar: -4, halk: -1 }, result: '“Alevler üstünden siyaset” başlığıyla sana yüklendiler.' }
            ] },
          { text: 'Siyaseti bırak, sessizce yardım topla', cost: { fon: 15 }, effects: { itibar: 3, mahalle: 3 },
            result: 'Fondan gıda ve battaniye aldın, gece kamyonla gönderdin. Reklamını yapan olmadı; yine de herkes öğrendi.' }
        ]
      }
    },

    {
      id: 'kar_firtinasi', name: 'Kar Fırtınası', emoji: '❄️', seasons: ['kis'], chance: 0.10, riskKey: 'kar', prep: ['ulasim', 'afet'],
      intro: {
        1: 'Gece başlayan kar sabaha kadar yağdı. {mahalle}’de yollar beyaz, simit arabaları donmuş vaziyette bekliyor.',
        2: 'Fırtına sürüyor. {sehir}’de yollar kapandı; {mahalle}’de elektrikler gidip geliyor, çay ocağı mum ışığında çalışıyor.',
        3: 'Kar fırtınası şehri kilitledi! {mahalle}’de kar çatılara dayandı. Minibüsler, otobüsler, ambulanslar mahsur.'
      },
      impact: {
        1: { hasar: 8, ulasim: -4 },
        2: { hasar: 24, ulasim: -9, ekonomi: -3, halk: -1 },
        3: { hasar: 42, ulasim: -15, altyapi: -6, ekonomi: -6, halk: -2 }
      },
      stages: [
        { title: 'Yollar Kapanıyor', text: 'Kar küreme araçları hazır ama yol sayısı çok, tuz stoğu az.',
          choices: [
            { text: 'Tüm araçlarla gece boyu yol aç', cost: { butce: 30 }, effects: { kriz: 2, ulasim: 3, itibar: 2, mahalle: 3 },
              result: 'Gece boyu kar küreme araçları yollarda. Sabah çocuklar okula, işçiler işe sorunsuz gitti.' },
            { text: 'Gençlerle küreme timi oluştur', hint: 'Her yeri kapsamaz',
              result: 'Gönüllüler kürekle çıktı.',
              outcomes: [
                { p: 0.6, effects: { kriz: 2, genc: 3, ulasim: 1 }, result: 'Küçük sokaklar bile açıldı; kürek ve termos fotoğrafı sosyal medyada viral oldu.' },
                { p: 0.4, effects: { kriz: -1, itibar: -2, genc: -1 }, result: 'Ana yollar açıldı ama yan yollarda mahsur kalanlar tepki gösterdi.' }
              ] },
            { text: 'Ana caddeleri aç, mahalle sokaklarını beklet', effects: { kriz: -1, ulasim: 2, mahalle: -4, emekli: -2 },
              result: 'Ana caddeler açıldı, yan sokaklarda yaşlılar kapıdan çıkamadı.' }
          ] },
        { title: 'Evde Mahsur Kalanlar', minSev: 2, text: 'Kömür biten, ilaç bulamayan, elektriği kesilen aileler arıyor. Telefonlar susmuyor.',
          choices: [
            { text: 'Sıcak yemek, battaniye ve kömür dağıt', cost: { butce: 35 }, effects: { kriz: 2, emekli: 3, isci: 2, mahalle: 4 },
              result: 'Belediye araçlarının arkasında termoslar ve kömür çuvalları. Kapı çalındı, yemek geldi.' },
            { text: 'Okulları ve spor salonlarını geçici barınak yap', cost: { butce: 20 }, effects: { kriz: 1, halk: 1, mahalle: 3, itibar: 2 },
              result: 'Salon sedyelerle doldu, bir tarafta dedikodu, bir tarafta çorba. Çocuklar tam anlamıyla keyif aldı.' },
            { text: '“Evde kalın, kimse çıkmasın” de ve telefonları kapat', effects: { kriz: -2, emekli: -3, mahalle: -4 },
              result: 'Evde kalanlar gerçekten evde kaldı. Telefonu açan olmadığını sosyal medya hemen yakaladı.' }
          ] },
        { title: 'Çözülme ve Toparlanma', text: 'Kar eriyor; çatılar çöktü, borular patladı, esnaf kepenk açmak istiyor.',
          choices: [
            { text: 'Tuz, asfalt ve boru onarımına öncelik ver', cost: { butce: 40 }, effects: { kriz: 2, ulasim: 4, altyapi: 3, hasar: -8, esnaf: 3 },
              result: 'Çukurlar kapandı, borular sızdırmaz oldu. Minibüsçüler “yol hiç bu kadar düzgün olmamıştı” dedi.' },
            { text: 'Esnafa vergi muafiyeti tanı', cost: { butce: 20 }, effects: { kriz: 1, esnaf: 5, ekonomi: 2, mahalle: 3 },
              result: 'Dükkânlar tekrar açıldı, simitçi sırayla çay dağıtıyor. Bütçe iç çekti.' },
            { text: 'Fatura ve vergileri geciktirme, tahsilat sürsün', effects: { kriz: -2, butce: 15, esnaf: -4, halk: -2 },
              result: 'Bütçeye bir nefes aldırdın; esnaf “kar yağdı, vergi eridi mi” diye sordu.' }
          ] }
      ],
      aftermath: {
        good: 'Kriz karnen güçlü. “Kar yağdı ama yollar açıktı” sözü çay ocağında yankılanıyor. Simitçiler sana özel susamlı simit çıkardı.',
        bad: 'Kriz karnen zayıf. Kar eridi ama sorular kaldı: tuz nerede, kürek nerede, Başkan nerede?'
      },
      opp: {
        text: 'Kar {mahalle}’yi gömdü. Başkan {rakip} makamda sıcak çay içerken şehir buz tutmuş.',
        choices: [
          { text: 'Gönüllülerle kürek ve çorba seferi başlat', cost: { gonullu: 3, enerji: 1 }, effects: { halk: 2, itibar: 4, mahalle: 6 },
            result: 'Kürekler, çorba kazanları ve bol kahkaha. Kapılar açıldı, çaylar ikram edildi.' },
          { text: 'Yönetimin tuz ve küreme ihmalini açıkla', hint: 'Zamanlama önemli',
            result: 'Eksik ekipman raporlarını gösterdin.',
            outcomes: [
              { p: 0.5, effects: { rakip: -3, itibar: 1 }, result: 'Boş tuz depolarının fotoğrafı gazeteye düştü.' },
              { p: 0.5, effects: { itibar: -4, halk: -1 }, result: '“Karın üstünde siyaset” diye eleştirildin.' }
            ] },
          { text: 'Sessizce yaşlılara kömür ve ilaç götür', cost: { fon: 15 }, effects: { itibar: 3, mahalle: 3 },
            result: 'Fondan kömür aldın, gece teslim ettin. Kimseye söylemedin, herkes duydu.' }
        ]
      }
    },

    {
      id: 'kuraklik', name: 'Kuraklık', emoji: '🏜️', seasons: ['yaz'], chance: 0.07, riskKey: 'kuraklik', prep: ['altyapi', 'cevre'],
      intro: {
        1: 'Barajda su azalıyor. {mahalle}’de musluklardan gelen su incecik, çay demliklerine bile yetmiyor.',
        2: 'Kuraklık derinleşiyor. {sehir}’de su kısıtlaması başladı; {mahalle}’de sular akşam kesiliyor.',
        3: 'Su krizi! Baraj dibi gördü. {mahalle}’de musluklar kuru, mahallelinin elinde bidon, komşular nöbet tutuyor.'
      },
      impact: {
        1: { hasar: 6, altyapi: -3, cevre: -2 },
        2: { hasar: 14, altyapi: -6, cevre: -5, ekonomi: -3, halk: -2 },
        3: { hasar: 24, altyapi: -9, cevre: -8, ekonomi: -6, halk: -4, sosyal: -4 }
      },
      stages: [
        { title: 'Su Kısıtlaması', text: 'Barajda su azalıyor. Kısıtlama mı, şikâyet mi? Önce hangisini yaşayacaksın?',
          choices: [
            { text: 'Kademeli su kesintisi ve tasarruf kampanyası başlat', cost: { butce: 25 }, effects: { kriz: 2, altyapi: 2, cevreci: 3, halk: -1 },
              result: 'Kesintiler adil dağıtıldı. Mahalle ilk gün söylendi, ikinci gün alıştı.' },
            { text: 'Şebeke kaçaklarını ara ve kapat', when: { project: 'su_sebekesi' }, whyNot: 'Su şebekesi projesi gerekli',
              effects: { kriz: 3, altyapi: 4, hasar: -4, itibar: 3 },
              result: 'Yenilenen şebeke sayesinde kaçaklar hemen bulundu. Su tasarrufu kampanyasız bile arttı.' },
            { text: 'Bulut tohumlama dene', hint: 'Sonuç şansa bağlı',
              result: 'Uçaklar bulut peşinde gitti.',
              outcomes: [
                { p: 0.4, effects: { kriz: 2, cevre: 2, halk: 2 }, result: 'Bir iki gün sağanak yağdı. Mahalleli bidonları balkona dizdi, simitçi bile şapkasını çıkardı.' },
                { p: 0.6, effects: { kriz: -1, itibar: -3, butce: -10 }, result: 'Bulutlar uçaklara bakıp yoluna devam etti. Para suya gitti, su gelmedi.' }
              ] },
            { text: 'Sorun yokmuş gibi davran', effects: { kriz: -2, itibar: -3, halk: 1 },
              result: 'Bir hafta idare ettin; musluk susunca “başkan bilmiyor muydu” sorusu çıktı.' }
          ] },
        { title: 'Su Dağıtımı', minSev: 2, text: 'Musluklar kuruyor, tanker kuyrukları başladı. Esnaf hamamdan çay ocağına dertli.',
          choices: [
            { text: 'Tankerlerle mahallelere ücretsiz su dağıt', cost: { butce: 40 }, effects: { kriz: 2, emekli: 3, isci: 2, mahalle: 4 },
              result: 'Tanker kuyruğunda herkes eşit sırada. Bidonlar doldu, çay yeniden demlendi.' },
            { text: 'Sanayi ve havuzları kısıtla, evlere öncelik ver', effects: { kriz: 1, isinsani: -4, halk: 1, ekonomi: -3 },
              result: 'Fabrikalar kızdı, evler rahatladı. “Havuzlu villalar” gündem oldu.' },
            { text: 'Zam yap; tüketen çok ödesin', effects: { kriz: -1, butce: 25, halk: -3, esnaf: -3 },
              result: 'Fatura yükseldi, bütçe rahatladı; çarşıda “su da lüks oldu” dendi.' }
          ] },
        { title: 'Kalıcı Çözüm', text: 'Yağış dönene kadar kuraklık geçmiş sayılmaz. Şimdi uzun vadeli karar zamanı.',
          choices: [
            { text: 'Yeni kuyu, arıtma ve yağmur suyu hasadı', cost: { butce: 60 }, effects: { kriz: 2, altyapi: 6, cevre: 4, cevreci: 3, mahalle: 3 },
              result: 'Yeni arıtma devreye girdi. Çatılarda yağmur toplayıcılar, parklarda gri su sulaması başladı.' },
            { text: 'Komşu şehirden su çekme anlaşması yap', cost: { butce: 35 }, effects: { kriz: 1, altyapi: 3, ekonomi: 1 },
              result: 'Boru hattı döşendi; komşu şehir de “borç değil, hatır” dedi.' },
            { text: 'Yeni yapılaşmaya izin ver, su sorununu sonra çöz', effects: { kriz: -2, isinsani: 4, cevreci: -4, altyapi: -2 },
              result: 'Müteahhitler sevindi; musluklar daha fazla daireye bakıyor ama su aynı.' }
          ] }
      ],
      aftermath: {
        good: 'Kriz karnen güçlü. “Kuraklığa karşı belediye bilge çıktı” diyorlar; mahalleliler bidonlarını gururla taşıyor.',
        bad: 'Kriz karnen zayıf. Yağmur geldi ama güven gelmedi; mahalle “su yokken sen neredeydin” sorusunu unutmuyor.'
      },
      opp: {
        text: 'Kuraklık {mahalle}’yi sarmış. Başkan {rakip} “her şey kontrol altında” diyor; musluklar farklı bir hikâye anlatıyor.',
        choices: [
          { text: 'Gönüllülerle bidon ve su dağıtımı başlat', cost: { gonullu: 3, enerji: 1 }, effects: { halk: 2, itibar: 4, mahalle: 6 },
            result: 'Bidonlar, çay termosları ve komşu kahkahaları. Kuyruklar adil işledi.' },
          { text: 'Yönetimin kaçak ve israf raporunu aç', hint: 'Zamanlama önemli',
            result: 'Şebeke kayıplarını ortaya döktün.',
            outcomes: [
              { p: 0.5, effects: { rakip: -3, itibar: 1 }, result: 'Kayıp-kaçak oranı manşet oldu; “boru patladı” diyenler çoğaldı.' },
              { p: 0.5, effects: { itibar: -4, halk: -1 }, result: '“Susuzluğun üstünde siyaset” diye eleştirildin.' }
            ] },
          { text: 'Sessizce su ve gıda yardımı topla', cost: { fon: 15 }, effects: { itibar: 3, mahalle: 3 },
            result: 'Fondan su aldın, gece teslim ettin. Reklam yok; ama herkes duydu.' }
        ]
      }
    },

    {
      id: 'salgin', name: 'Kış Nezlesi', emoji: '🤧', seasons: ['sonbahar', 'kis'], chance: 0.06, riskKey: 'salgin', prep: ['sosyal', 'afet'],
      intro: {
        1: '{mahalle}’de “Hapşuru” denen mevsimlik hastalık yayılıyor. Çay ocağında herkes sürekli öksürüyor, bekleme salonu dolu.',
        2: 'Hapşuru yayılıyor. {sehir}’de okullar boş, {mahalle}’de eczanelerde kuyruk var; ıhlamur fiyatı uçtu.',
        3: 'Hapşuru salgın boyutunda! {mahalle}’de sağlık ocakları doldu, pazar kapandı, {sehir} maskeyle dolaşıyor.'
      },
      impact: {
        1: { hasar: 4, sosyal: -3 },
        2: { hasar: 10, sosyal: -6, ekonomi: -3, halk: -2 },
        3: { hasar: 18, sosyal: -10, ekonomi: -6, halk: -4, itibar: -2 }
      },
      stages: [
        { title: 'İlk Vakalar', text: 'Hasta sayısı artıyor, sağlık ocakları taşıyor. Herkes “önlem alın” diyor.',
          choices: [
            { text: 'Mobil sağlık ekipleri ve ücretsiz aşı kampanyası', cost: { butce: 35 }, effects: { kriz: 2, sosyal: 3, emekli: 3, hasar: -3 },
              result: 'Gezici sağlık araçları mahallelere girdi. Aşı sırasında çocuklara balon dağıtıldı, büyüklere çorba.' },
            { text: 'Erken uyarı sistemini devreye al', when: { project: 'erken_uyari' }, whyNot: 'Erken uyarı sistemi gerekli',
              effects: { kriz: 3, sosyal: 3, hasar: -6, itibar: 3 },
              result: 'Sistem vakaları günler önceden yakaladı. Aşı çağrısı hızla yayıldı; çay ocağı bile uyarı mesajı attı.' },
            { text: 'Halk ilaçlarını ve ıhlamur çayını destekle', hint: 'Samimi ama riskli',
              result: 'Sosyal medyada “ıhlamur seferberliği” başladı.',
              outcomes: [
                { p: 0.5, effects: { kriz: 1, halk: 2, sosyal: 1 }, result: 'Mahalleler birbirine ıhlamur gönderdi. Moral yükseldi, sağlık ocakları biraz rahatladı.' },
                { p: 0.5, effects: { kriz: -1, itibar: -3, sosyal: -2 }, result: 'Doktorlar “ıhlamur tedavi değildir” diye uyardı. Sen gülünç duruma düştün.' }
              ] },
            { text: '“Sıradan nezle, abartmayın” açıklaması yap', effects: { kriz: -2, itibar: -3, halk: 1 },
              result: 'Bir hafta idare ettin; sonra sağlık ocağı kuyrukları açıklamayı yalanladı.' }
          ] },
        { title: 'Okullar ve Pazar', minSev: 2, text: 'Okullarda yarı yarıya devamsızlık var. Pazar yerinde sağlıklı satıcı bile yok.',
          choices: [
            { text: 'Okul ve pazar yerlerini geçici kapat, dezenfekte et', cost: { butce: 30 }, effects: { kriz: 2, sosyal: 3, esnaf: -2, genc: -1 },
              result: 'Okullar bir hafta tatil, pazar yeri bir gün kapalı. Esnaf söylendi ama hasta sayısı düştü.' },
            { text: 'Maske ve el dezenfektanı dağıt, her şey açık kalsın', cost: { butce: 20 }, effects: { kriz: 1, esnaf: 2, halk: 1, sosyal: 1 },
              result: 'Pazarcılar maskeli satış yaptı. Maskeli karpuz fotoğrafı sosyal medyayı kaptı.' },
            { text: 'Esnafı memnun etmek için hiçbir kısıtlama getirme', effects: { kriz: -2, esnaf: 4, sosyal: -3, emekli: -3 },
              result: 'Ticaret sürdü, hasta sayısı da. Yaşlılar eczane kuyruğuna girdi.' }
          ] },
        { title: 'Toparlanma', text: 'Vakalar azalıyor. Sağlık ocakları yorgun, halk ise bir sonrakinden korkuyor.',
          choices: [
            { text: 'Sağlık ocağı ve bakım hizmetlerini güçlendir', cost: { butce: 45 }, effects: { kriz: 2, sosyal: 5, emekli: 3, afet: 2, mahalle: 3 },
              result: 'Yeni ekipman ve yedek personel geldi. Hemşireler yeni önlük aldı, kapı tabelası bile yenilendi.' },
            { text: 'Hijyen denetimlerini sıkılaştır', cost: { butce: 20 }, effects: { kriz: 1, sosyal: 2, esnaf: -2, cevreci: 1 },
              result: 'Zabıta pazar yerinde kulaklarını açtı. Esnaf mırıldandı ama pazar daha temiz.' },
            { text: 'Önlemleri hemen kaldır, normale dön', effects: { kriz: -2, esnaf: 3, sosyal: -3, halk: 1 },
              result: 'Hayat hızla normale döndü; öksürükler ise bir hafta daha sürdü.' }
          ] }
      ],
      aftermath: {
        good: 'Kriz karnen güçlü. “Hapşuru geldi ama şehir hazırdı” diyorlar; çay ocaklarında ıhlamur ve teşekkür paylaşılıyor.',
        bad: 'Kriz karnen zayıf. Hastalık gitti ama sağlık ocaklarındaki kuyrukların anısı kalıyor.'
      },
      opp: {
        text: 'Hapşuru {mahalle}’yi sardı. Başkan {rakip} “her şey yolunda” diyor ama bekleme salonları başka şey söylüyor.',
        choices: [
          { text: 'Gönüllü sağlık destek ekipleri kur', cost: { gonullu: 3, enerji: 1 }, effects: { halk: 2, itibar: 4, mahalle: 6 },
            result: 'Gönüllüler ıhlamur, maske ve çorba dağıttı. Yaşlılar telefonla arandı.' },
          { text: 'Yönetimin sağlık hazırlıksızlığını eleştir', hint: 'Zamanlama önemli',
            result: 'Eksik ekipman raporunu açıkladın.',
            outcomes: [
              { p: 0.5, effects: { rakip: -3, itibar: 1 }, result: 'Boş sağlık dolapları görüntüleri halkın gündemine düştü.' },
              { p: 0.5, effects: { itibar: -4, halk: -1 }, result: '“Hastalığın üstünde siyaset” diye sana yüklendiler.' }
            ] },
          { text: 'Sessizce ilaç ve maske yardımı topla', cost: { fon: 15 }, effects: { itibar: 3, mahalle: 3 },
            result: 'Fondan maske ve ıhlamur aldın, sessizce dağıttın. Kimse reklamını görmedi ama herkes duydu.' }
        ]
      }
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);

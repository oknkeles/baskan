/* BAŞKAN — muhalefet modu içeriği: görevler, olaylar, rakipler, başkanın icraat haberleri. */
(function (root) {
  'use strict';
  var BG = root.BG;

  /* ------------------------------------------------------------------ GÖREVLER */
  BG.add('missions', [
    { id: 'esnaf_ziyareti', name: 'Esnaf Ziyareti', emoji: '🛒', yer: 'mahalle', kind: 'diyalog', cooldown: 1,
      desc: 'Bir mahallede dükkân dükkân gez; kepenk kenarında bir esnafla dertleş.', cost: { enerji: 1 } },
    { id: 'kampus_sohbeti', name: 'Kampüs Sohbeti', emoji: '🎓', yer: 'mahalle', kind: 'diyalog', cooldown: 2,
      desc: 'Yurt önünde, tostçu kuyruğunda bir öğrenciyle muhabbet et.', cost: { enerji: 1 } },
    { id: 'emekli_kahvesi', name: 'Emekliler Kahvesi', emoji: '☕', yer: 'mahalle', kind: 'diyalog', cooldown: 2,
      desc: 'Okey masasına otur, bir amcayla ya da teyzeyle dertleş.', cost: { enerji: 1 } },

    { id: 'bagis_gecesi', name: 'Bağış Gecesi', emoji: '🍽️', yer: 'sehir', kind: 'olay', cooldown: 3,
      desc: 'Düğün salonunda yemekli gece; amaç kasayı doldurmak.', cost: { enerji: 2 },
      text: 'Düğün salonu kiralandı, masalara kırmızı örtüler serildi. Menüde mercimek çorbası ve “vizyon” var. Sponsor listesi kısa, kuvertler pahalı.',
      choices: [
        { text: 'Herkese açık, uygun fiyatlı gece', effects: { fon: 12, halk: 2, gonullu: 1 },
          result: 'Kalabalık, gürültülü, samimi. Kasaya az ama temiz para girdi; salonu çocuklar bile doldurdu.' },
        { text: 'İş insanlarına özel masa sat', cost: { fon: 10 },
          effects: { fon: 35, isinsani: 4, isci: -4, itibar: -1 },
          result: 'Kristal bardaklar, saklı kuvertler… Kasa doldu ama emekçiler “o masada biz yoktuk” diye not aldı.' },
        { text: 'Büyük bir ismi sahneye çıkar', hint: 'Ya tutar ya batar', cost: { fon: 15 },
          result: 'Ünlü bir sanatçıyı pazarlıkla ikna ettin.',
          outcomes: [
            { p: 0.55, effects: { fon: 40, genc: 3, itibar: 2 }, result: 'Salon taştı, bilet bitti, bağış kutusu elden ele döndü. Kasa şenlendi.' },
            { p: 0.45, effects: { fon: 5, itibar: -2 }, result: 'Sanatçı geç kaldı, ses sistemi küstü. Seyircinin yarısı bilet parasını geri istedi.' }
          ] }
      ] },

    { id: 'gonullu_kampi', name: 'Gönüllü Kampı', emoji: '⛺', yer: 'sehir', kind: 'olay', cooldown: 3,
      desc: 'Hafta sonu eğitim kampı: yeni gönüllüler kazan.', cost: { enerji: 2, fon: 10 },
      text: 'Bağlar’daki bir kamp alanını kiraladın. Pankartlar boyanacak, kapı kapı konuşma provası yapılacak. Gelenler arasında liseliler de var.',
      choices: [
        { text: 'Sıkı eğitim: rol yapma ve harita çalışması', effects: { gonullu: 3, itibar: 2 },
          result: 'Akşama kadar “ikna provası” yaptınız. Herkes yorgun ama kendine güvenle ayrıldı.' },
        { text: 'Mangal başı sohbet, herkes gelsin', cost: { fon: 8 }, effects: { gonullu: 5, genc: 2, esnaf: -2 },
          result: 'Eğitimden çok köfte konuşuldu ama ekip kaynaştı. Kasapla hesap uzun sürdü.' },
        { text: 'Sadece deneyimlilere özel kamp', effects: { gonullu: 2, itibar: 3, genc: -3 },
          result: 'Kıdemliler ince ayar yaptı. Dışarıda kalan gençler “bizi çağırmadılar” diye mırıldandı.' }
      ] },

    { id: 'sosyal_medya_kampanyasi', name: 'Sosyal Medya Kampanyası', emoji: '📱', yer: 'sehir', kind: 'olay', cooldown: 2,
      desc: 'Mizahi bir etiket, kısa videolar, bol kedi.', cost: { enerji: 1, fon: 8 },
      text: 'Ekibin dört etiket önerdi; biri #ÇukurluŞehir, biri #ÇayımıGeriVer. Reklam bütçesi dar, yaratıcılık geniş. Sokak kedisi Mırmır paylaşımlarda yıldız olabilir.',
      choices: [
        { text: 'Mizahi çukur serisi', hint: 'Güldürür ama yara deşer', effects: { genc: 4, rakip: -1 },
          result: 'Çukurlarla fotoğraf çektiniz; her biri bir ünlü gibi etiketlendi. Gençler paylaşım yarışına girdi.' },
        { text: 'Ciddi icraat karnesi paylaş', effects: { itibar: 3, emekli: 2, genc: -1 },
          result: 'Tablolar, yüzdeler, ince ince grafikler. Beğeni azdı ama gazeteciler kaydetti.' },
        { text: 'Sahte hesap ordusuyla yay', hint: 'Yakalanırsan rezalet', cost: { fon: 6 },
          result: 'Kırk hesap bir anda aynı cümleyi yazdı.',
          outcomes: [
            { p: 0.4, effects: { halk: 3, rakip: -2 }, result: 'Etiket gündemin ilk beşine girdi, kimse nereden çıktığını sormadı.' },
            { p: 0.6, effects: { itibar: -7, genc: -4 }, result: 'Hesapların aynı IP’den çıktığı ortaya düştü. “Troll ordusu” manşetini bu sefer sen yedin.' }
          ] }
      ] },

    { id: 'dosya_hazirla', name: 'İhale Dosyası Hazırla', emoji: '📂', yer: 'sehir', kind: 'olay', cooldown: 4,
      desc: 'Başkanın ihalelerini incele; belgesiz konuşma.', cost: { enerji: 2, gonullu: 1 },
      text: 'Bir gönüllü mühendis, kentsel dönüşüm ihalelerindeki tuhaf rakamlara dikkat çekti. Fotokopi makinesi fısıldıyor, çay soğuyor. Elindeki belgeler ya sağlam ya da sadece görüntü.',
      choices: [
        { text: 'Önce hukukçuya göster', cost: { fon: 10 }, effects: { itibar: 3, rakip: -2 },
          result: 'Avukat yarısını eledi, kalan yarısı çelik gibi. Küçük ama sağlam bir dosya hazırladın.' },
        { text: 'Hemen basına sızdır', hint: 'Yüksek risk, yüksek getiri',
          result: 'Gazeteciler kapıyı çaldı bile.',
          outcomes: [
            { p: 0.5, effects: { rakip: -8, halk: 3, itibar: 3 }, result: 'Belgeler ayakta kaldı. Başkan {rakip} bir hafta boyunca “iddialar asılsız” cümlesini tekrarladı.' },
            { p: 0.5, effects: { itibar: -8, rakip: 2, isinsani: -3 }, result: 'İki rakam yanlış çıktı; asıl iddia gölgede kaldı. “Karalama” kelimesi seni takip ediyor.' }
          ] },
        { text: 'Dosyayı rafa kaldır, kendi işine bak', effects: { gonullu: 1, rakip: 1 },
          result: 'Mühendis küstü ama gönüllü ekibe kaldı. Dosya dolapta, ihtiyaç anında işe yarar.' }
      ] },

    { id: 'mahalle_forumu', name: 'Mahalle Forumu', emoji: '🪑', yer: 'mahalle', kind: 'olay', cooldown: 2,
      desc: 'Halk bahçede plastik sandalyelere oturur, sen dinlersin.', cost: { enerji: 1, gonullu: 1 },
      text: '{mahalle} muhtarlığının bahçesinde yirmi sandalye dizildi, elli kişi geldi. İlk soru sokak lambasından, ikinci soru kedinin mama saatinden.',
      choices: [
        { text: 'Sadece dinle, not al', effects: { mahalle: 6, itibar: 2 },
          result: 'Defterin üç sayfa doldu. İnsanlar “ilk kez biri yazdı” diyerek dağıldı.' },
        { text: 'Anında çözüm sözü ver', hint: 'Alkış alır, söz borç olur', effects: { mahalle: 8, itibar: -3, halk: 1 },
          result: 'Havalara sözler uçurdun, alkış koptu. Muhtar not aldığın her şeyi kayda geçirdi, merak etme.' },
        { text: 'Belediye yetkililerini de davet et', cost: { fon: 8 },
          result: 'Sandalyeler arasına bir de belediye müdürü oturttun.',
          outcomes: [
            { p: 0.5, effects: { mahalle: 9, rakip: -2, itibar: 2 }, result: 'Müdür sorulara yanıt veremedi, salon kendi sonucunu çıkardı.' },
            { p: 0.5, effects: { mahalle: 3, itibar: -2 }, result: 'Müdür gelmedi, boş sandalyeye “yetkili” levhası koydular; gülünç duruma düştün.' }
          ] }
      ] },

    { id: 'ittifak_gorusmesi', name: 'İttifak Görüşmesi', emoji: '🤝', yer: 'sehir', kind: 'olay', cooldown: 4,
      desc: 'Küçük bir partiyle masaya otur; oy kazan, ilke kaybetme.', cost: { enerji: 2 },
      text: 'Küçük “Yeşil Yelken Partisi” lideri çay evinde buluşmak istiyor. Oy hacimleri küçük ama sadık. İstekleri: listeden iki isim ve bir parka söz.',
      choices: [
        { text: 'Programda ortaklaşa çalış', effects: { cevreci: 5, esnaf: -2, itibar: 2 },
          result: 'Ortak bildiri yayınladınız. Çevreciler memnun, esnaf “yine park” diye homurdandı.' },
        { text: 'Listeden iki isim ver', hint: 'Sadakat pahalıya gelir', cost: { gonullu: 2 },
          effects: { cevreci: 6, gonullu: 3, genc: 2, isinsani: -3 },
          result: 'Yeni isimler ekibe katıldı, afişler iki kat çoğaldı. Bazı eski dostlar bu işe bozuldu.' },
        { text: 'Nazikçe reddet', effects: { itibar: 1, cevreci: -2 },
          result: 'Çay bitti, el sıkıştınız. İttifak olmadı ama kapı aralık kaldı.' }
      ] },

    { id: 'esnaf_kahvaltisi', name: 'Esnaf Odası Kahvaltısı', emoji: '🥖', yer: 'sehir', kind: 'olay', cooldown: 3,
      desc: 'Sabah erken, simit-peynir arasında esnaf dertlerini dinle.', cost: { enerji: 1, fon: 10 },
      text: 'Esnaf odası salonunda masalar kurulmuş. Herkesin elinde ya bir fatura ya bir dilekçe var. Başkan sabah kahvaltısını kaçırmış; sandalyesi boş.',
      choices: [
        { text: 'Vergi ve kira desteği sözü ver', effects: { esnaf: 6, isinsani: -2, itibar: -1 },
          result: 'Alkış koptu. Maliye uzmanı köşede başını salladı; söz verirken hesabı unutma.' },
        { text: 'Otopark ve yaya yolları için plan sun', effects: { esnaf: 3, cevreci: 2, itibar: 2 },
          result: 'Plan karışık ama ciddi. “Hiç değilse hazırlıklı” dediler.' },
        { text: 'Kahvaltıda yalnızca dinle', hint: 'Sessizlik de bir mesaj',
          effects: { esnaf: 4, itibar: 2 },
          result: 'Konuşmadın, çay doldurdun. “Başkanlar çok konuşur, bu dinledi” fısıltısı yayıldı.' }
      ] },

    { id: 'sendika_ziyareti', name: 'Sendika Ziyareti', emoji: '🏭', yer: 'sehir', kind: 'olay', cooldown: 3,
      desc: 'Fabrika çıkışında vardiya servisini bekleyen işçilerle buluş.', cost: { enerji: 2 },
      text: 'Sanayi’de fabrika kapısında vardiya değişimi var. Sendika temsilcisi “Başkan uğramadı bile” diyor. Kızgın ve haklı.',
      choices: [
        { text: 'Toplu taşıma ve ek vardiya servisi öner', effects: { isci: 6, isinsani: -3 },
          result: 'Servis sözü işçilerin yüzünü güldürdü; işveren tarafı “maliyet” diye not aldı.' },
        { text: 'Dengeli konuş, iki tarafı da dinle', effects: { isci: 2, isinsani: 2, itibar: 2 },
          result: 'Kimseyi kırmadın, kimseyi de coşturmadın. “Hesaplı adam” olarak anıldın.' },
        { text: 'İşveren aleyhine sert ol', hint: 'Alkış ve yara birlikte', cost: { gonullu: 1 },
          result: 'Mikrofonu almadan önce alkışı hazırladın.',
          outcomes: [
            { p: 0.6, effects: { isci: 8, isinsani: -6, gonullu: 2 }, result: 'İşçiler sloganlarla eşlik etti; fabrika bahçesi “senin” oldu.' },
            { p: 0.4, effects: { isci: 2, isinsani: -8, itibar: -3 }, result: 'Sözlerin patrona ulaştı; “kışkırtıcı” başlığıyla manşet oldu.' }
          ] }
      ] },

    { id: 'cevre_nobeti', name: 'Çevre Nöbeti', emoji: '🌳', yer: 'mahalle', kind: 'olay', cooldown: 3,
      desc: 'Ağaç kesimine karşı yapılan nöbette yerini al.', cost: { enerji: 2, gonullu: 1 },
      text: '{mahalle}’de ağaçlar kesilecek, çevreciler nöbette. Gece soğuk, çaydanlık sıcak. Gazeteciler uzakta bekliyor.',
      choices: [
        { text: 'Geceyi nöbette geçir', effects: { cevreci: 6, mahalle: 5, genc: 2, isinsani: -3 },
          result: 'Battaniye, bir termos çay, bir gitar. Sabah ağaçlar yerinde; sen kamburlaştın ama kazandın.' },
        { text: 'Sadece akşam uğrayıp mesaj ver', effects: { cevreci: 3, mahalle: 3 },
          result: 'Kameraya iki cümle söyledin ve evine geçtin. Nöbetçiler “yine de geldi” diyerek idare etti.' },
        { text: 'Belediyeyle uzlaşma çağrısı yap', hint: 'Hem kızdırır hem yatıştırır',
          result: 'Resmî bir uzlaşma önerisi yazdın.',
          outcomes: [
            { p: 0.5, effects: { cevreci: 4, mahalle: 5, rakip: -2, itibar: 3 }, result: 'Belediye geri adım attı; yarısı kurtarıldı. Medya “aklıselim” başlığı attı.' },
            { p: 0.5, effects: { cevreci: -3, itibar: -2, mahalle: 1 }, result: 'Belediye öneriyi reddetti; nöbetçiler “fazla yumuşak” dedi.' }
          ] }
      ] },

    { id: 'yerel_roportaj', name: 'Yerel Gazeteye Röportaj', emoji: '🗞️', yer: 'sehir', kind: 'olay', cooldown: 2,
      desc: 'Şehrin eski gazetesinde bir sayfalık sohbet.', cost: { enerji: 1 },
      text: '“Çarşı Postası” seni mülakata davet etti. Muhabir, “hazırlıklıysan zor soruyu sona saklarım” diyor. Fotoğrafçı kedi desenli bir kravatını çok sevdi.',
      choices: [
        { text: 'Rakamlarla konuş', effects: { itibar: 3, isinsani: 2, emekli: 1 },
          result: 'Gazeteci not aldı, editör başlığı “Rakamlar Konuşuyor” attı. Kuru ama saygın.' },
        { text: 'Hikâyelerle anlat', effects: { halk: 2, genc: 2, emekli: 2 },
          result: 'Teyzenin lambası, bir minibüsçünün çilesi, simitçinin hesabı. Sayfa baştan sona okundu.' },
        { text: 'Başkan {rakip}’e bire bir meydan oku', hint: 'Sert manşet, sert tepki',
          result: 'Soruya cevap yerine meydan okudun.',
          outcomes: [
            { p: 0.5, effects: { rakip: -4, halk: 2, itibar: 1 }, result: 'Meydan okuma gündem oldu; başkan cevap veremedi.' },
            { p: 0.5, effects: { itibar: -4, halk: -1, rakip: 1 }, result: '“Kavga arayan aday” manşetini yedin. Şimdi o tırnak içinde yaşıyorsun.' }
          ] }
      ] },

    { id: 'golge_butce', name: 'Gölge Bütçe Açıklaması', emoji: '📊', yer: 'sehir', kind: 'olay', cooldown: 4,
      desc: 'Belediyeye alternatif bir bütçe sun; vaat yerine rakam.', cost: { enerji: 2, fon: 15 },
      text: 'Gönüllü bir muhasebeci ve iki ekonomi öğrencisi gece yarısı bütçe tablolarına gömüldü. Elinde “alternatif bütçe” var: pahalı bir proje bırak, ucuz üç tane yap.',
      choices: [
        { text: 'Sosyal harcamaları öne çıkar', effects: { emekli: 4, isci: 3, isinsani: -4, itibar: 1 },
          result: 'Kreş, lokal, sağlık ocağı… Hesap kitap tuttu; iş dünyası “verimsiz” dedi.' },
        { text: 'Yatırım ve istihdam odaklı sun', effects: { isinsani: 5, esnaf: 3, cevreci: -3, emekli: -2 },
          result: 'Rakamların cazibesi büyük; çevreciler asfalt kokusu aldı.' },
        { text: 'Ayrıntıları vermeden sloganla bas', hint: 'Basın seni sıkıştırabilir',
          result: 'Rakamları yarım bıraktın.',
          outcomes: [
            { p: 0.45, effects: { halk: 3, itibar: 2 }, result: 'Sade ve akılda kalıcıydı. “Bizim bütçe” etiketi hızla dolaştı.' },
            { p: 0.55, effects: { itibar: -5, rakip: 1 }, result: 'Gazeteci “ama hangi kalem?” diye sordu; cevap yoktu.' }
          ] }
      ] }
  ]);

  /* ------------------------------------------------------------------ OLAYLAR */
  BG.add('events', [
    {
      id: 'muhalefet_sizdirilan_kayit', cat: 'siyaset', modes: ['opposition'],
      title: 'Sızdırılan Ses Kaydı',
      text: 'Gece yarısı birisi sosyal medyaya ekibinden birinin sesini sızdırdı: “Başkan {rakip}’i gülünç duruma düşüreceğiz.” Kayıt kısa ama etkili; telefonlar susmuyor.',
      speaker: { name: 'Gökçe Ay', role: 'Kampanya sözcüsü', emoji: '📣' },
      choices: [
        { text: 'Hemen özür dile', effects: { itibar: -2, halk: 1 },
          result: 'Özürün samimi geldi; olay üç günde küçüldü. Ama ekipte “ya sen?” bakışları dolaşıyor.' },
        { text: '“Montaj” de', hint: 'Doğrulanırsa kriz büyür', cost: { fon: 8 },
          effects: { gonullu: 1, sonra: { id: 'muhalefet_kayit_sonrasi', tur: 2 } },
          result: 'Bir uzman raporu yayımladın; ekip şimdilik kenetlendi. Ama her şey ya kayıttaki ses ya da sen.' },
        { text: 'Sorumluyu kamuoyu önünde açıkla', effects: { itibar: 1, gonullu: -1 },
          result: 'Ekip üyesi istifa etti. Dürüstlüğün alkışlandı, ekibin kalbi biraz kırıldı.' }
      ]
    },
    {
      id: 'muhalefet_kayit_sonrasi', cat: 'siyaset', modes: ['opposition'], weight: 0,
      title: 'Kayıt Doğrulandı',
      text: 'Bağımsız bir laboratuvar kaydın gerçek olduğunu doğruladı. Başkan {rakip} hemen bir basın toplantısı düzenledi: “Şehir böyle muhalefet istemez.”',
      choices: [
        { text: 'Yanlışı kabul et, yeniden başla', effects: { itibar: -2, halk: 1 },
          result: 'Başın öne eğik açıklama yaptın. Bu kez affedilme şansın var.' },
        { text: 'İnatla savun', effects: { itibar: -7, gonullu: 1, rakip: 1 },
          result: 'İnat tutmadı. Çekirdek ekip seninle kaldı, kenardakiler afişlerini sessizce katlamaya başladı.' }
      ]
    },
    {
      id: 'muhalefet_muhbir', cat: 'siyaset', modes: ['opposition'],
      title: 'Kapıya Gelen Muhbir',
      text: 'Belediyenin eski bir müdürü gece yarısı ofise girdi: “İhale dosyalarında neler döndüğünü biliyorum, ama bedeli var.” Elinde kalın bir zarf, yüzünde yorgun bir gülümseme.',
      speaker: { name: 'Nadir Çelik', role: 'Eski daire müdürü', emoji: '🕶️' },
      choices: [
        { text: 'Dosyayı al, kaynağı koru', cost: { fon: 10 }, effects: { rakip: -4, itibar: 1, sonra: { id: 'muhalefet_muhbir_donus', tur: 2 } },
          result: 'Zarfın içinde ciddi rakamlar var. Ama muhbirin niyeti hâlâ bulanık.' },
        { text: 'Hukuki yoldan başvurmasını öner', effects: { itibar: 3, rakip: -1 },
          result: 'Adam omuz silkip gitti. Savcılığa dilekçe verdi mi bilinmez; sen temiz kaldın.' },
        { text: 'Teklifi geri çevir', effects: { itibar: 2, halk: 1 },
          result: '“Bilgi satın almam” dedin. Gazeteler nezaketini yazdı, ihale dosyası kaybolmadı.' }
      ]
    },
    {
      id: 'muhalefet_muhbir_donus', cat: 'siyaset', modes: ['opposition'], weight: 0,
      title: 'Muhbir Geri Döndü',
      text: 'Aynı muhbir bu kez kameralarla geldi: “Ben sadece belgeleri verdim, para almadım.” Başkan {rakip} ise onun “sahte” olduğunu iddia ediyor.',
      choices: [
        { text: 'Kameralara birlikte çık', cost: { enerji: 1 },
          outcomes: [
            { p: 0.5, effects: { rakip: -5, itibar: 3 }, result: 'Birlikte konuştunuz; belgeler yayıldı. “Sızıntı” kamuoyunda kabul gördü.' },
            { p: 0.5, effects: { itibar: -5, rakip: 1 }, result: 'Muhbirin geçmişi sorgulandı. Yanında durmak seni de gölgeye soktu.' }
          ], result: 'Kameralar çalışmaya başladı.' },
        { text: 'Uzak dur, kendi işine bak', effects: { itibar: 1 }, result: 'Dosya başkalarının eline geçti; sen sakin kaldın.' }
      ]
    },
    {
      id: 'muhalefet_troll_ordusu', cat: 'siyaset', modes: ['opposition'],
      title: 'Troll Ordusu Harekâtta',
      text: 'Başkan {rakip}’in ekibi sana karşı yüzlerce hesapla saldırıya geçti. Kedi videosu altına bile “yolsuz” yazıyorlar. Gönüllülerin yarısı ekranı kapatmak istiyor.',
      speaker: { name: 'Berk', role: 'Gönüllü sosyal medya sorumlusu', emoji: '💻' },
      choices: [
        { text: 'Aynı dille karşılık ver', cost: { gonullu: 2 }, effects: { genc: 3, itibar: -3 },
          result: 'Sosyal medya savaşa döndü. Gençler eğlendi, sen bir miktar küçüldün.' },
        { text: 'Sessizce raporla, sahaya dön', effects: { itibar: 2, gonullu: 1 },
          result: 'Telefonları kapattın, sokağa çıktın. Gerçek hayatta kimse seni trollememiş.' },
        { text: 'Mizahla alaya al', hint: 'İyi espriler bulaşıcıdır',
          result: 'Bir mizah paylaşımı hazırladın.',
          outcomes: [
            { p: 0.55, effects: { genc: 4, rakip: -2, halk: 1 }, result: 'Espri tuttu; trollerin yorumları bile paylaşımı büyüttü, herkes seninle gülüyordu.' },
            { p: 0.45, effects: { itibar: -3, genc: -1 }, result: 'Espri fazla sert geldi; “saygısız” etiketi trollerin eline geçti.' }
          ] }
      ]
    },
    {
      id: 'muhalefet_kurdele_daveti', cat: 'siyaset', modes: ['opposition'],
      title: 'Kurdele Kesme Daveti',
      text: 'Belediye yeni bir spor salonunun açılışına seni de çağırdı. Kamera sayısı bol, makas büyük. Davet nazik görünse de bir tuzak kokusu var.',
      choices: [
        { text: 'Git ve el sık', cost: { enerji: 1 }, effects: { halk: 2, itibar: 2, rakip: 1 },
          result: 'Kurdeleyi kesmedin, ama alkışlarken fotoğrafa girdin. Birkaçı “Hem muhalif hem kibar” dedi.' },
        { text: 'Gitme, eksikleri bildir', effects: { gonullu: 1, itibar: 1, rakip: -1 },
          result: 'Gitmediğin törenin eksiklerini basına yazdın. Salon güzel ama klima çalışmıyormuş.' },
        { text: 'Git, ama bir de karşı pankart aç', hint: 'Kalabalık coşar ya da soğur', cost: { gonullu: 1 },
          result: 'Kurdele merasiminde pankartı kaldırdın.',
          outcomes: [
            { p: 0.5, effects: { rakip: -3, genc: 2, halk: 1 }, result: 'Pankart kameralara girdi; tören gölgede kaldı.' },
            { p: 0.5, effects: { itibar: -4, halk: -1 }, result: 'Güvenlik pankartı aldı; “törene saygısızlık” başlığı çıktı.' }
          ] }
      ]
    },
    {
      id: 'muhalefet_gonullu_tukenmis', cat: 'sosyal', modes: ['opposition'],
      title: 'Gönüllüler Yorgun',
      text: 'Afiş gecelerinden sonra ekibin yüzünde çökmüş bir yorgunluk var. İkisi “bu hafta gelemem” dedi, biri “ben bıraktım” yazdı. Çay demliği bile bayat.',
      speaker: { name: 'Ece', role: 'Gönüllü koordinatör', emoji: '🙋' },
      choices: [
        { text: 'Bir hafta tatil ver', cost: { enerji: 1 }, effects: { gonullu: 2, itibar: 1 },
          result: 'Ekip dinlendi; geri döndüklerinde yeni afiş fikirleriyle geldiler.' },
        { text: 'Pizza ısmarla, motive et', cost: { fon: 8 }, effects: { gonullu: 1, genc: 1 },
          result: 'Bir saat sürmedi ama çok neşelendiler. Pizzacı seni destekleyeceğini söyledi.' },
        { text: 'Aynı tempoda devam et', effects: { gonullu: -3, itibar: -1 },
          result: 'Bir iki kişi ayrıldı; geri kalanlar daha da gergin.' }
      ]
    },
    {
      id: 'muhalefet_bagisci_sartlari', cat: 'ekonomi', modes: ['opposition'],
      title: 'Şartlı Bağış',
      text: 'Tanınmış bir inşaat firmasının temsilcisi kampanyana kocaman bir çek getirdi. Karşılığında tek istediği: “bazı imar planlarına dokunmaman.” Çek kalın, vicdan kalın.',
      speaker: { name: 'Vedat Altın', role: 'İnşaat firması temsilcisi', emoji: '💼' },
      choices: [
        { text: 'Çeki al, sözü ver', effects: { fon: 40, itibar: -4, cevreci: -5, isinsani: 3 },
          result: 'Kasa doldu; ama çevreciler seni “bedel” kelimesiyle andı.' },
        { text: 'Şartsız yüzde ellisini kabul et', hint: 'Orta yol, orta kazanç', effects: { fon: 15, itibar: 1, isinsani: 2 },
          result: 'Çek yarıya indi. Adam kaşlarını çattı ama çeki bıraktı.' },
        { text: 'Çeki reddet', effects: { itibar: 3, halk: 2, fon: -5 },
          result: 'Teklifini yüksek sesle reddettin. Gazeteler “Para değil ilke” başlığını attı.' }
      ]
    },
    {
      id: 'muhalefet_parti_hizbi', cat: 'siyaset', modes: ['opposition'],
      title: 'Parti İçinde Hizip',
      text: 'Parti il başkanlığında “genç kanat” ve “eski kadro” birbirine girdi. Biri çay bardaklarını yere attı. İkisi de “bizden yana ol” diyor.',
      choices: [
        { text: 'Genç kanadı destekle', effects: { genc: 4, emekli: -3, gonullu: 2 },
          result: 'Gençler enerji getirdi, kıdemliler arkadan konuşmaya başladı.' },
        { text: 'Eski kadroya güven', effects: { emekli: 4, genc: -3, itibar: 1 },
          result: 'Tecrübeli isimler masa başına geçti. Gençler sosyal medyada iç çekti.' },
        { text: 'Üçüncü bir toplantı ayarla', cost: { enerji: 1 },
          result: 'Dengeli bir çözüm aradın.',
          outcomes: [
            { p: 0.5, effects: { gonullu: 1, itibar: 3, halk: 1 }, result: 'Orta yol bulundu; herkes biraz mutsuz, biraz uzlaşmış.' },
            { p: 0.5, effects: { itibar: -3, gonullu: -2 }, result: 'Toplantı fiyaskoyla bitti; iki grup da seni suçladı.' }
          ] }
      ]
    },
    {
      id: 'muhalefet_viral_gaf', cat: 'absurt', modes: ['opposition'],
      title: 'Viral Gaf',
      text: 'Bir mitingde {sehir}’in adını yanlış söyledin. Kısa video bir gecede milyonlarca izlendi; altına “Neresi burası?” yazıyorlar. Mizahçılar çoktan montaj hazırladı.',
      choices: [
        { text: 'Kendin gül, kendini alaya al', cost: { enerji: 1 }, effects: { genc: 3, itibar: 1 },
          result: 'Kendi montajını paylaşıp “özür dilerim, ama şehrimi daha çok seviyorum” yazdın. Gülüşmeler sana değil, seninle oldu.' },
        { text: 'Hiç yanıt verme', effects: { itibar: -2 },
          result: 'Video üç gün sonra eskidi, ama “unutmadık” yorumları kaldı.' },
        { text: 'Gaf diye bir şey yok de', hint: 'Israr inada dönebilir', effects: { itibar: -4, halk: -1, gonullu: 1 },
          result: 'Videonun arkasından yeni bir video çıktı. Adın daha da çok anıldı; ne yazık ki yanlış.' }
      ]
    },
    {
      id: 'muhalefet_ihmal_edilen_mahalle', cat: 'sosyal', modes: ['opposition'], district: 'rastgele',
      title: '{mahalle} Sana Güveniyor',
      text: '{mahalle} muhtarı kapına geldi: “Başkana yazdık, telefon açmadı. Sen ne yapabilirsin?” Su borusu patlak, yol çukur dolu, komşular sabırsız.',
      choices: [
        { text: 'Gönüllülerle onarım yap', cost: { gonullu: 2, enerji: 1 }, effects: { mahalle: 8, halk: 1, itibar: 2 },
          result: 'Bir gün boyunca boruya su, yola çakıl taşıdınız. Mahalle, yaptığın işi unutmaz.' },
        { text: 'Belediyeye yazılı çağrı yap', cost: { enerji: 1 }, effects: { mahalle: 3, rakip: -1 },
          result: 'Dilekçeler gönderildi; cevap gelmedi. Mahalleli “hiç değilse deniyorsun” dedi.' },
        { text: 'Vaktin yok, yalnızca söz ver', effects: { mahalle: -3, itibar: -2 },
          result: 'Söz verdin ama yetişemedin. Muhtar “bir dahaki seçimde bakarız” diyerek uzaklaştı.' }
      ]
    },
    {
      id: 'muhalefet_tartisma_meydan_okuma', cat: 'siyaset', modes: ['opposition'],
      when: { max: { kalan: 5 } },
      title: 'Canlı Tartışma Daveti',
      text: 'Başkan {rakip} seni televizyonda canlı yayına çağırdı: “Hodri meydan, konuşalım.” Kamera ışıkları, el terleri, bir de masada sahte çiçekler.',
      choices: [
        { text: 'Hazırlık yap ve çık', cost: { enerji: 1, fon: 10 },
          result: 'Kartlarını sıraya koydun.',
          outcomes: [
            { p: 0.6, effects: { halk: 3, itibar: 4, rakip: -4 }, result: 'Sakin ve net konuştun. İzleyiciler seni “dengeli” buldu.' },
            { p: 0.4, effects: { itibar: -3, rakip: 2 }, result: 'Bir rakamı karıştırdın; rakip bunu uzun uzun kullandı.' }
          ] },
        { text: 'Gitme, sahada ol', effects: { gonullu: 1, rakip: 1, itibar: -1 },
          result: '“Ben sokakta konuşurum” dedin. Bir kısım hayran oldu, bir kısım “kaçtı” dedi.' },
        { text: 'Format şartı koy', effects: { itibar: 1 },
          result: 'Bazı şartlar koydun; tartışma ertelendi. Rakip “korkuyor” iddiasında bulundu.' }
      ]
    },
    {
      id: 'muhalefet_ucuncu_kez_sans', cat: 'siyaset', modes: ['opposition'],
      when: { min: { kayip: 2 } },
      title: 'Üçüncü Kez Şans mı?',
      text: 'Çarşıda biri bağırdı: “İki kez kaybettin, bir de bizi kandırma!” Çaycı Mehmet ise omzuna dokundu: “Ben seni seviyorum, ama bu kez farklı bir şey yap.”',
      speaker: { name: 'Mehmet Usta', role: 'Çaycı', emoji: '🍵' },
      choices: [
        { text: 'Yeni bir yüz getir', cost: { fon: 10 }, effects: { genc: 4, itibar: 2, emekli: -2 },
          result: 'Taze bir isim ekibe katıldı; gençler heyecanlandı, eskiler “hata yapıyorsun” dedi.' },
        { text: 'Hatalarını itiraf eden bir konuşma yap', cost: { enerji: 1 }, effects: { itibar: 4, halk: 2 },
          result: 'Samimi konuşma kayda alındı; insanlar “bu sefer dürüst” dedi.' },
        { text: 'Aynı yoldan devam et', effects: { gonullu: -2, itibar: -3 },
          result: 'Yönteminde değişiklik olmayınca gönüllüler sinirlendi.' }
      ]
    },
    {
      id: 'muhalefet_son_hafta_dedikodu', cat: 'siyaset', modes: ['opposition'],
      when: { max: { kalan: 3 } },
      title: 'Son Dakika Dedikodusu',
      text: 'Seçime az kaldı, mahalle kahvelerinde “aday çekilecekmiş” söylentisi yayıldı. Kaynağı belirsiz, ama birkaç kişi bile inandı.',
      choices: [
        { text: 'Kameraya çık ve yalanla', cost: { enerji: 1 }, effects: { itibar: 3, halk: 1 },
          result: 'Beş dakikalık video yeterli oldu. “Burada olduğunu” herkes gördü.' },
        { text: 'Gönüllülerle mahalle turu yap', cost: { gonullu: 2 }, effects: { halk: 2, gonullu: 1, itibar: 1 },
          result: 'Zil çala çala dolaştınız; dedikodu yerini sohbete bıraktı.' },
        { text: 'Yoksay', hint: 'Bazen en iyi cevap sessizlik',
          effects: { itibar: -2, halk: -1 },
          result: 'Dedikodu iki gün sürdü, üçüncü gün başka bir şeyle yer değişti. Ama birkaç oy kaybedildi.' }
      ]
    }
  ]);

  /* ------------------------------------------------------------------ RAKİPLER */
  BG.add('rivals', [
    { id: 'populist', name: 'Burak Işıltı', title: 'Televizyon Sunucusu', emoji: '🎤', base: 52,
      slogan: 'Şehir benimle konuşsun!',
      bio: 'Sabah programının sevilen yüzü. Yemek tarifinden şehir planına atlar; vaadi bol, dosyası ince. Her konuda fikri var, hiçbirinde ayrıntısı yok.',
      groups: { genc: 6, emekli: 5, isci: 3, isinsani: -6, cevreci: -4, esnaf: -4 },
      govern: { sosyal: 1, ekonomi: -1, altyapi: -1, afet: -1 },
      taunts: [
        'Sayın {baskan} kameraya bakmayı bilmiyor; şehir de ona bakmayı unuttu!',
        'Ben halkın içinden çıktım; stüdyodan çıktım yani, ama çok yakın!',
        'Vaatler benden, çözümler… yarın programda anlatırım!'
      ],
      winQuote: 'İlk icraat: belediye binasına dev ekran! Şehir artık canlı yayında.',
      loseQuote: 'Reyting düştü ama sevgi sürüyor. Programa devam!' },

    { id: 'teknokrat', name: 'Dr. Aylin Kuzey', title: 'Veri Mühendisi', emoji: '📈', base: 51,
      slogan: 'Şehir bir veri tablosudur.',
      bio: 'Soğuk, kesin ve ölçülü konuşur. Her sokağa sensör, her soruya grafik koyar. Sevgi göstergesi sıfıra yakın, doğruluk oranı yüksek.',
      groups: { isinsani: 8, genc: 4, cevreci: 3, emekli: -7, isci: -4, esnaf: -4 },
      govern: { ekonomi: 1, altyapi: 1, sosyal: -2 },
      taunts: [
        'Sayın {baskan}, kararlarınız yüzde kırk hata payıyla çalışıyor. Ölçmediğiniz şey düzelmez.',
        'Şehir duygusal değil, hesaplı yönetilmeli. Çay bile verimli demlenir.',
        'Ben “güzel” demem; “optimal” derim.'
      ],
      winQuote: 'İlk icraat: tüm şehre sensör. Çöp kovasına da ID numarası!',
      loseQuote: 'Veri bu sonucu öngörmüyordu. Model yeniden kalibre edilecek.' },

    { id: 'eski_baskan', name: 'Rahmi Eskici', title: 'Eski Belediye Başkanı', emoji: '🎩', base: 53,
      slogan: 'Eskiden böyle değildi!',
      bio: 'Yirmi yıl önce üç dönem şehri yönetti. Kravatı hâlâ aynı, hatıraları süslü. Her yeni projeye “biz de yapmıştık” der ve fotoğraf albümünü çıkarır.',
      groups: { emekli: 10, esnaf: 6, genc: -8, cevreci: -4, isinsani: -2, isci: -2 },
      govern: { sosyal: 1, ulasim: -1, altyapi: -1, ekonomi: -1 },
      taunts: [
        'Sayın {baskan}, bu şehir bana emanet edildiğinde çukur bile düzgündü!',
        'Biz zamanında bir çay ocağı bile açardık; siz sadece konuşuyorsunuz.',
        'Gençlerin ne dediği bana vız gelir; ben sokağı babamdan öğrendim.'
      ],
      winQuote: 'Geri döndük! Eski güzel günler yeniden… biraz daha eski.',
      loseQuote: 'Şehir hâlâ geçmişe hazır değil. Albümler sabırla bekler.' }
  ]);

  /* ------------------------------------------------------------------ RAKİP HABERLERİ */
  BG.add('rivalNews', [
    /* betoncu — Cemal Kule */
    { id: 'rn_kule_cukur_gokdelen', rival: 'betoncu',
      title: 'Çukur Kapatma Yerine Gökdelen Temeli',
      text: 'Başkan Cemal Kule, {sehir}’de çukurları bırakıp gökdelen temelini attı. “Önce vizyon, sonra asfalt” dedi. Esnaf yoldan geçemiyor.',
      effects: { altyapi: -4, ulasim: -2, esnaf: 4, isci: 3, isinsani: -2 } },
    { id: 'rn_kule_yesil_alan_kesildi', rival: 'betoncu',
      title: 'Yeşil Alan “Atıl” İlan Edildi',
      text: 'Kule, sahil kenarındaki ağaçlı alanı “atıl” ilan etti. Çevreciler sandalye getirip oturdu; gençler fotoğraf çekti.',
      effects: { cevre: -4, cevreci: 6, genc: 3, isinsani: -2 } },
    { id: 'rn_kule_istihdam_atagi', rival: 'betoncu',
      title: 'Şantiyelerde Yüzlerce Yeni İş',
      text: 'Cemal Kule’nin şantiyeleri yüzlerce kişiye iş verdi. Sanayi çay ocağında “bu sefer tuttu” fısıltıları duyuluyor.',
      effects: { ekonomi: 3, isci: -3, isinsani: -2 } },

    /* populist — Burak Işıltı */
    { id: 'rn_isilti_canli_yayin_ihale', rival: 'populist',
      title: 'İhale Canlı Yayında Verildi',
      text: 'Başkan Burak Işıltı ihaleyi televizyon stüdyosunda açıkladı; kazanan firma, programın reklam sponsoru çıktı. Mizahçılar iş başında.',
      effects: { ekonomi: -3, genc: 4, esnaf: 3, isinsani: 2 } },
    { id: 'rn_isilti_ucretsiz_konser', rival: 'populist',
      title: 'Meydanda Ücretsiz Konser',
      text: 'Işıltı, belediye bütçesinden büyük bir konser düzenledi. Gençler kuyruğa girdi, emekliler hoparlörden şikâyet etti.',
      effects: { sosyal: 3, ekonomi: -2, genc: -3, emekli: 2 } },
    { id: 'rn_isilti_cekilis_vaadi', rival: 'populist',
      title: 'Çekilişle Daire Veriyor',
      text: 'Başkan Işıltı “bir daire çekilişi” duyurdu; şartlar belli değil. Binlerce kişi başvurdu, kaçı kazanacak bilinmiyor.',
      effects: { sosyal: -3, emekli: 4, isci: 3, genc: 2 } },

    /* teknokrat — Dr. Aylin Kuzey */
    { id: 'rn_kuzey_sensor_cop', rival: 'teknokrat',
      title: 'Çöp Kovalarına Sensör Takıldı',
      text: 'Dr. Aylin Kuzey, çöp kovalarına sensör taktırdı; ama çöpü toplama saatleri gecikti. Teyzeler “kutuya değil yere atıyoruz” diyor.',
      effects: { altyapi: -3, cevre: -2, emekli: 5, esnaf: 2 } },
    { id: 'rn_kuzey_trafik_modeli', rival: 'teknokrat',
      title: 'Trafik Yapay Zekâya Emanet',
      text: 'Kuzey, akıllı kavşakları devreye aldı. Beklemeler azaldı ama sürücüler “hesap makinesi bize trafik ışığı mı kuracak?” diye sordu.',
      effects: { ulasim: 3, isinsani: -3, esnaf: -2 } },
    { id: 'rn_kuzey_veri_acigi', rival: 'teknokrat',
      title: 'Vatandaş Verileri Sızdı',
      text: 'Kuzey’in veri sistemi sızdırıldı; şehrin tüm sakinleri ev adreslerini haberlerde okudu.',
      effects: { guvenlik: -4, genc: 5, emekli: 4, isinsani: 2 } },

    /* eski_baskan — Rahmi Eskici */
    { id: 'rn_eskici_hatira_heykeli', rival: 'eski_baskan',
      title: 'Meydana Kendi Heykeli',
      text: 'Rahmi Eskici, kendi heykelini meydana diktirdi. Altına “Şehrin Babası” yazdırdı. Gençler heykele güneş gözlüğü taktı.',
      effects: { sosyal: -2, ekonomi: -2, genc: 5, cevreci: 2, emekli: -2 } },
    { id: 'rn_eskici_eski_cikmaz', rival: 'eski_baskan',
      title: 'Eski Plan Raftan İndi',
      text: 'Eskici eski projelerin tozunu alıp yeniden açtı: “Bu projeyi biz çizmiştik.” İnşaat eski haritayla başladı, haritadaki sokak bugün yok.',
      effects: { altyapi: -3, ulasim: -3, isinsani: 3, genc: 3, emekli: -2 } },
    { id: 'rn_eskici_emekli_lokali', rival: 'eski_baskan',
      title: 'Emekli Lokali Yeniden Açıldı',
      text: 'Eskici, kapalı lokali tekrar açtı; haftada üç gün çorba ve okey turnuvası var. Emekliler çok memnun, mahalle kahveleri biraz kıskanç.',
      effects: { sosyal: 3, emekli: -4, esnaf: -2 } },

    /* genel */
    { id: 'rn_genel_zabita_celisik', title: 'Zabıta ile Pazarcı Kavgası',
      text: 'Başkan {rakip} pazar yeri tezgâh düzenini değiştirdi. Zabıta tezgâh ölçtü, pazarcılar domates fırlattı. Mahallede pazarın ortası boş kaldı.',
      effects: { ekonomi: -2, sosyal: -2, esnaf: 5, isci: 2 } },
    { id: 'rn_genel_su_kesintisi', title: 'Üç Gün Susuz Kaldık',
      text: 'Başkan {rakip}’in ekibi boru bakımını “sonra yaparız” diye ertelemiş; mahalleler üç gün susuz kaldı. Kova satan esnaf bile şaşırdı.',
      effects: { altyapi: -4, emekli: 5, isci: 3, esnaf: 2 } },
    { id: 'rn_genel_otopark_zammi', title: 'Otopark Ücretleri Uçtu',
      text: 'Başkan {rakip} otopark zammını “şehir hizmeti” diye duyurdu. Şoförler “şehir değil, cüzdan hizmeti” dedi.',
      effects: { ulasim: -2, ekonomi: -2, esnaf: 4, isci: 4, genc: 2 } },
    { id: 'rn_genel_kedi_evi_krizi', title: 'Kedi Evleri Kaldırıldı',
      text: 'Başkan {rakip}, parklardaki kedi evlerini “görsel kirlilik” diye kaldırdı. Sosyal medya bir günde seferber oldu.',
      effects: { sosyal: -3, cevre: -2, genc: 5, cevreci: 4, emekli: 2 } },
    { id: 'rn_genel_ihale_belirsiz', title: 'İhale Şartnamesi Kayıp',
      text: 'Başkan {rakip}’in imza yetkisiyle açılan ihale şartnamesi bir akşam ortadan kayboldu. “Fotokopide unutulmuş” dendi, fotokopiciler gülüştü.',
      effects: { ekonomi: -3, esnaf: 3, isci: 3, cevreci: 3, isinsani: -2 } },
    { id: 'rn_genel_park_acildi', title: 'Yeni Park Hizmete Girdi',
      text: 'Başkan {rakip} mahalle parkını açtı; çocuklar salıncağa koştu, anneler gölgelik aramaya başladı. Açılışta çay ikram edildi.',
      effects: { sosyal: 3, cevre: 2, emekli: -2, genc: -1, halk: -1 } },
    { id: 'rn_genel_ucretsiz_wifi', title: 'Meydanlara Ücretsiz Wi-Fi',
      text: 'Başkan {rakip} meydanlara ücretsiz internet kurdurdu. İlk gün şifre “belediye123” olduğu için herkes bağlandı.',
      effects: { sosyal: 2, ekonomi: 2, genc: -3, esnaf: -2 } },
    { id: 'rn_genel_otobus_seferleri', title: 'Otobüs Seferleri Sıklaştı',
      text: 'Başkan {rakip}, sabah ve akşam seferlerini artırdı. İlk kez durakta çay bitmeden otobüs geldi.',
      effects: { ulasim: 4, isci: -3, emekli: -2, genc: -1 } }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);

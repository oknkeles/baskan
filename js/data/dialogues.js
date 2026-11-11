/* Birebir ikna diyalogları (16). Şema: js/core/schema.js */
(function (root) {
  'use strict';
  var BG = root.BG;
  function o(text, tone, ikna, reply, when, blof) {
    var r = { text: text, tone: tone, ikna: ikna, reply: reply };
    if (when) { r.when = when; r.replyBlof = blof; }
    return r;
  }
  var M = ['mayor', 'opposition'];

  BG.add('dialogues', [
    /* 1 */ {
      id: 'simitci_recep_usta', modes: M, district: 'carsi', mizac: 'ofkeli',
      kisi: { name: 'Recep Usta', age: 57, job: 'Simit arabası sahibi', emoji: '🥨', group: 'esnaf' },
      intro: 'Çarşı girişinde simit tezgâhının arkasında, kaşları çatık, tablayı hırsla düzeltiyor.',
      start: 30, hedef: 64,
      rounds: [
        { line: 'Zabıta sabah beşte arabamı kaldırdı! Otuz yıllık yerimi bilmiyor musunuz?',
          options: [
            o('Haklısın kızmakta, Recep Usta. Bu çarşı senin simit kokunla uyanır.', 'samimi', 7, 'Hıh. Neyse, en azından dinliyorsun.'),
            o('Çarşıda esnafın cirosu bu yıl arttı; sizin tezgâh da bundan pay aldı.', 'veri', 12, 'Doğru, geçen hafta kuyruk köşeye kadar uzadı.', { min: { ekonomi: 52 } }, 'Ciro mu? Ben simit satamıyorum, sen bana rakam okuyorsun!'),
            o('Sana ömür boyu sabit tezgâh ruhsatı vereceğim!', 'vaat', 15, 'Geçen seçimde de dediler. Ruhsat hâlâ cebimde buruşuk.')
          ] },
        { line: 'Un zamlı, susam zamlı, kira zamlı. Müşteri “simit küçüldü” diyor, ben ne yapayım?',
          options: [
            o('Çarşıda kira artışı yüzde on iki; tavan için masaya oturuyoruz, rakam elimde.', 'veri', 13, 'Rakam dediğin böyle olur. Devam et.'),
            o('Gramajı küçültüp tablayı büyük göstermek de çare değil, Recep Usta.', 'sert', 6, 'Sen kimsin de gramaj sayıyorsun! Hem haklı mısın bilmem…'),
            o('Simitin deliği büyüdü, derdi de büyüdü: ikisi de boşluk.', 'espri', 7, 'Espriye bakacak halim mi var?')
          ] },
        { line: 'Ee, sen ne yapacaksın? Hep söz, hep söz!',
          options: [
            o('Net konuşayım: pazartesi seni zabıta amiriyle masaya oturtuyorum, ruhsat kâğıda dökülecek.', 'sert', 10, 'Pazartesi, tamam. Gelmezsen tezgâhı kapına kurarım.'),
            o('Sözümü tutan biriyim; kapına da bu yüzden geldim.', 'samimi', 8, 'İyi o zaman, bakalım tutacak mısın.', { min: { itibar: 55 } }, 'Tutmuşsun, ha! Bu kapıya gelen her aday aynı lafı söyler.'),
            o('Çarşıya ücretsiz çay günleri ve simit festivali yapacağım!', 'vaat', 14, 'Festival mi? Ben ruhsat istiyorum, festival değil!')
          ] }
      ],
      success: { text: 'Recep Usta sana sıcak bir simit uzattı: “Parasını sonra konuşuruz.” Tezgâhı yarın senin afişinle süslenecek.', effects: { esnaf: 4, mahalle: 3, itibar: 1 } },
      fail: { text: '“Hadi yürü, müşteri bekliyor” dedi ve sırtını döndü. Simit kokusu kadar sıcak bir veda olmadı.', effects: { esnaf: -3, mahalle: -1 } }
    },
    /* 2 */ {
      id: 'ogrenci_deniz_gece', modes: M, district: 'kampus', mizac: 'neseli',
      kisi: { name: 'Deniz', age: 21, job: 'Mühendislik öğrencisi', emoji: '🎒', group: 'genc' },
      intro: 'Yurt kapısının önünde, elinde soğumuş bir tostla seni baştan aşağı süzüyor.',
      start: 30, hedef: 63,
      rounds: [
        { line: 'Gece ikiden sonra yurda dönemiyoruz, yürüyoruz. Kampüsün kedileri bile bizden korkmuyor.',
          options: [
            o('Gece yürüyüşü bedava kardiyo ama tamam, bunu düzelteceğiz.', 'espri', 5, 'Kardiyo bizde bol, otobüs yok!'),
            o('Gece seferleri artık kampüse kadar geliyor.', 'veri', 14, 'Ha, ikiyi yirmi geçe bir tane gördüm!', { min: { ulasim: 55 } }, 'Hangi sefer? Dün dörde kadar durakta muhabbet ettim!'),
            o('Her gece, kapıya kadar otobüs. Söz!', 'vaat', 11, 'Söz mü? Biz sınav vaadine bile inanmıyoruz.')
          ] },
        { line: 'Kantinde tost yetmiş lira, burs beş ay sonra yatıyor. Kediye mama alamıyorum.',
          options: [
            o('Ben de öğrenciyken tostu ikiye bölerdim. Beraber çözeriz.', 'samimi', 10, 'Tostu ikiye bölme! O kadar da dibe vurmadık.'),
            o('Üç kantinin fiyat listesini inceledim; ikisi fahiş.', 'veri', 12, 'Üç liste mi? Amma çalışkansın.'),
            o('Zam yapan kantinciyi kapattırırım!', 'sert', 8, 'Ya tostu kim yapacak, sen mi?')
          ] },
        { line: 'Bizi dinleyen başkan görmedik. Senin farkın ne?',
          options: [
            o('Fark mı? Ben seninle çay bahçesinde oturuyorum, makam odasında değil.', 'espri', 5, 'Çay bahçesi iyi puan. Çayı kim ısmarlıyor?'),
            o('Şehirde konser ve gençlik etkinlikleri arttı; kampüse sıra geliyor.', 'veri', 15, 'Geçen konsere gittim, iyiydi!', { min: { sosyal: 55 } }, 'Konser mi? Meydanda bir tek kaval çalan amca vardı.'),
            o('Tek bir şey söyleyeyim: sizi biz dinlemiyorsak kim dinleyecek?', 'sert', 12, 'Hmm, sert girdin ama doğru.')
          ] }
      ],
      success: { text: 'Deniz tostunu ikiye bölüp yarısını sana verdi: “Oyum bende, kedinin de.” Yurtta mesaj grubu seni konuşuyor.', effects: { genc: 4, mahalle: 3, gonullu: 1 } },
      fail: { text: '“Düşüneceğim” dedi ve kulaklığını taktı. Kampüsün kedisi bile ilgisiz.', effects: { genc: -3, mahalle: -1 } }
    },
    /* 3 */ {
      id: 'kaptan_sabri_iskele', modes: M, district: 'sahil', mizac: 'duygusal',
      kisi: { name: 'Kaptan Sabri', age: 71, job: 'Emekli balıkçı', emoji: '⚓', group: 'emekli' },
      intro: 'Balıkçı barınağında ağlarını onarırken başını kaldırmadan konuşmaya başlıyor.',
      start: 30, hedef: 65,
      rounds: [
        { line: 'Oğlum, iskele çürüdü, geçen hafta ayağım takıldı. Gözümün önünde batan teknem gibi…',
          options: [
            o('Kaptan, o iskele benim de çocukluğum. Ustaları bu hafta ben getiriyorum.', 'samimi', 5, 'Eh, gözlerim doldu, ağlamıyorum tabii…'),
            o('Altyapı bütçesinden sahile pay ayrıldı; iskeleler sırada.', 'veri', 16, 'Rakamı bilmem ama bir şeyler yapıyorsun demek.', { min: { altyapi: 55 } }, 'Bütçe mütçe! İskelede tek bir çivi görmedim.'),
            o('İskeleyi kullananlar da bakıma katılsın, hepimiz el atalım.', 'sert', 6, 'Bu yaşta çivi mi çakayım?')
          ] },
        { line: 'Martılar balığımı kapıyor, torunum “dede balık nerede” diyor.',
          options: [
            o('Martılar sendikalaştı Kaptan, müzakere heyetiyim ben.', 'espri', 11, 'Ha ha! Bunu torunuma anlatacağım.'),
            o('Sana özel bir tezgâh yeri ayıracağım, martı yaklaşmasın.', 'vaat', 11, 'Martı bu, tezgâha da konar.'),
            o('Torununuzla bir gün birlikte balığa çıkalım, olta benden.', 'samimi', 3, 'Teknemde seni görmek isterim doğrusu.')
          ] },
        { line: 'Emekli maaşı ay sonunu getirmiyor. Bir de gelen faturalar…',
          options: [
            o('Fatura değil insan görüyorum karşımda. Dinliyorum, anlat.', 'samimi', 5, 'Böyle konuşan görmedim yıllardır.'),
            o('Emekli balıkçılara hal resminde indirim yapacağım.', 'vaat', 11, 'İndirim iyi, ama yazılı olsun.'),
            o('Sosyal destek kapsamı genişledi; başvurunuzu ben takip ederim.', 'veri', 16, 'Dilekçe verdim, geldi bile!', { min: { sosyal: 52 } }, 'Dilekçe verdim, cevap gelmedi be evladım!')
          ] }
      ],
      success: { text: 'Kaptan Sabri sana tuttuğu ilk palamudu sardı: “Evde pişirir, yersin.” Barınakta herkes duydu.', effects: { emekli: 4, mahalle: 3 } },
      fail: { text: '“Fırtına çıkacak, gitsen iyi olur” dedi, ağlarına döndü. İskele hâlâ gıcırdıyor.', effects: { emekli: -3, mahalle: -2 } }
    },
    /* 4 */ {
      id: 'tornaci_necla_atolye', modes: M, district: 'sanayi', mizac: 'pragmatik',
      kisi: { name: 'Necla Usta', age: 44, job: 'Torna atölyesi sahibi', emoji: '🔧', group: 'isci' },
      intro: 'Yağlı önlüğüyle atölye kapısında duruyor, elinde mastar, gözünde saat.',
      start: 30, hedef: 64,
      rounds: [
        { line: 'Üç vardiya çalışanım var, servisleri yok. Yarısı geç kalıyor, siparişler birikiyor.',
          options: [
            o('Vardiya saatlerine uygun servis hattını sanayiye ben açtırırım, tarih de vereyim.', 'vaat', 8, 'Tarih verirsen hesabını yaparım.'),
            o('Şehirde otobüs seferleri sıklaştı; sanayi hattı da bunun içinde.', 'veri', 10, 'Evet, bizim hat da sıklaştı.', { min: { ulasim: 55 } }, 'Bizim hat sıklaşmadı, sıkıştı sadece.'),
            o('Çalışanlarının yorgunluğunu anlıyorum; ben de sabah beşte kalkan bir aileden geliyorum.', 'samimi', 8, 'Güzel söz, fatura ödemiyor.')
          ] },
        { line: 'Elektrik kesintileri tezgâhı durduruyor. Bir saat kesinti, yarım gün kayıp.',
          options: [
            o('Hangi gün, kaç dakika kesildi, listeni ver. Elektrik idaresine ben çıkarım.', 'veri', 9, 'Liste hazır, bak bu defterde!'),
            o('Gerekirse jeneratör desteği için kaynak bulacağım.', 'vaat', 8, 'Jeneratör iyi, mazotu kim verecek?'),
            o('Biraz espri yapayım: kesinti olunca mola da bedava olur!', 'espri', 8, 'Mola bedava değil, siparişi kaybediyorum!')
          ] },
        { line: 'Peki bana ne kazandıracak bu iş? Zamanım değerli.',
          options: [
            o('Verimli çalışmanın şehre geri dönüşü var; sanayiyi öne alıyorum, rakam rakam.', 'veri', 10, 'Bu rakamlar ikna edici.'),
            o('Sanayi bölgesi ihtiyaç listeni yazılı alıp bir ay içinde cevaplayacağım.', 'vaat', 11, 'Bir ay iyidir. Yazılı alırım.'),
            o('Sözüne güvenilir biri olarak tanınırım; bu sokakta kimseye boş laf etmedim.', 'samimi', 9, 'Güvenilirlik güzel ama makine durmuyor.', { min: { itibar: 55 } }, 'Güvenilir mi? Bu sokakta böyle diyen çok geldi.')
          ] }
      ],
      success: { text: 'Necla Usta mastarı cebine koydu: “Listeyi yarın e-postayla yollarım. Oyumu da.” Atölyedeki çıraklar yarım yamalak alkışladı.', effects: { isci: 4, mahalle: 3, gonullu: 1 } },
      fail: { text: '“Vaktim yok, sipariş var” diyerek kapıyı çekti. Matkap sesi arkandan gürledi.', effects: { isci: -3, mahalle: -2 } }
    },
    /* 5 */ {
      id: 'ariici_yasar_baglar', modes: M, district: 'baglar', mizac: 'supheci',
      kisi: { name: 'Yaşar Amca', age: 62, job: 'Arıcı ve bağ sahibi', emoji: '🐝', group: 'cevreci' },
      intro: 'Peteklerin başında eldivensiz duruyor; arılar sana değil, şapkana ilgi gösteriyor.',
      start: 30, hedef: 64,
      rounds: [
        { line: 'Her seçimde bir adam gelir, “ağaç dikeceğiz” der. Dikilen ağaç nerede?',
          options: [
            o('Haklısın, sözle ağaç büyümez. Fidan sayısını tek tek buraya yazıyorum, ay sonunda birlikte sayarız.', 'veri', 7, 'Yazdıysan göreceğiz.'),
            o('Bağlara yeni bir orman, her çıplak tepeye fidan, söz!', 'vaat', 14, 'Söz, söz, söz… Arılar bile sıkıldı.'),
            o('Şehirde yeşil alan geçen yıla göre arttı.', 'veri', 11, 'Geçen hafta fidanları görmüştüm, doğru.', { min: { cevre: 55 } }, 'Arttıysa nerede? Peteklerim gölgesiz!')
          ] },
        { line: 'Yukarıdaki taş ocağı tozu bal tarlalarına yağıyor. Bal kararıyor.',
          options: [
            o('Ocaklarla ilgili denetim raporunu ben elden istedim; sonucunu sana da getiririm.', 'samimi', 11, 'Elden mi? İyi, dosyayı görürüm.'),
            o('Taş ocağını kapattırırım, bitti!', 'sert', 15, 'Kapattırır mıymışsın? Çok iddialısın.'),
            o('Bal kararırsa “kara bal” deriz, pazarlamayı da ben yaparım!', 'espri', 8, 'Ben ciddiyim, sen şaka yapıyorsun!')
          ] },
        { line: 'Bir şey söyle ki sana güvenebileyim.',
          options: [
            o('Ağaç envanteri ve hava ölçümlerini halka açacağım; takip senin elinde.', 'veri', 9, 'Takip ederim, hem de arılarla birlikte.'),
            o('Bu şehirde yeşil için emek verdim; şimdi daha da çalışacağım.', 'samimi', 11, 'Samimi duruyorsun. Yine de bakacağım.', { min: { itibar: 55 } }, 'Emek mi? Emeği arılarda gördüm, sende görmedim.'),
            o('Gönüllülerle bir hafta sonu fidan dikelim, arılar da yardımcı olur.', 'vaat', 10, 'Dikelim bakalım, sözün boşa çıkmasın.')
          ] }
      ],
      success: { text: 'Yaşar Amca sana bir kavanoz kara kovan balı uzattı: “Hemen yeme, sakla. Bir yıl sonra tadına bak.” Güven, bal gibi yavaş ama tatlı.', effects: { cevreci: 4, mahalle: 3, gonullu: 1 } },
      fail: { text: '“Arıları sinirlendirme, git hadi” dedi. Bir arı da sana veda etti.', effects: { cevreci: -3, mahalle: -1 } }
    },
    /* 6 */ {
      id: 'otelci_selin_hanim', modes: M, mizac: 'pragmatik',
      kisi: { name: 'Selin Hanım', age: 49, job: 'Butik otel sahibi', emoji: '🏨', group: 'isinsani' },
      intro: 'Otel lobisinde iki telefonu aynı anda dinleyerek sana “beş dakikan var” işareti yapıyor.',
      start: 30, hedef: 64,
      rounds: [
        { line: 'Turist sezonu kısa, tren istasyonunda taksi bile bulamıyorlar. Misafirler yorum yazıyor: bir yıldız.',
          options: [
            o('Taksi duraklarını ve karşılama noktalarını yeniden düzenleyeceğim, takvimi paylaşırım.', 'vaat', 8, 'Takvim iyi. Rakamlarla destekle.'),
            o('Şehirde turizm geliri arttı, bu işte doğru yoldayız.', 'veri', 10, 'Evet, bu sezon doluluk fena değil.', { min: { ekonomi: 55 } }, 'Doluluk mu? Yarım odam boş!'),
            o('Yorumları ben de okudum, canınız sıkılmasın.', 'samimi', 11, 'Sıkılmam, yorumlar sıkıyor.')
          ] },
        { line: 'Ruhsat işlemleri üç ayı buluyor. Bir kapı için üç kuruma gidiyorum.',
          options: [
            o('Tek pencere uygulamasını getiriyorum: tek dilekçe, tek takip numarası.', 'vaat', 8, 'Tek pencere mi? Hadi bakalım.'),
            o('Üç kurumun süreçlerini çıkardım; ikisi gereksiz. Belirli sürelerle kısaltacağım.', 'veri', 9, 'Bunu duymak güzel.'),
            o('Üç kapıyı bire indireceğim; boşalan iki kapıya çay ocağı koyarız!', 'espri', 10, 'Bu da çözüm sayılır mı?')
          ] },
        { line: 'Peki, yatırım yapsam yanımda olur musun?',
          options: [
            o('Yatırımcıya özel danışma masası açıyoruz; ilk randevu sizin.', 'vaat', 8, 'Randevuyu alayım, ama belge istiyorum.'),
            o('Şehrin ekonomi rakamları sağlam, yeni yatırımlar bu yüzden geliyor.', 'veri', 13, 'Hesabını biliyorsun, güzel.', { min: { ekonomi: 58 } }, 'Rakamlar sağlam ama bana pek yansımamış.'),
            o('Selin Hanım, bu şehrin başarısı sizin başarınız, içten söylüyorum.', 'samimi', 12, 'Duygusal değilim, ama dürüstlüğü severim.')
          ] }
      ],
      success: { text: 'Selin Hanım kartını uzattı: “Tek pencere kurulursa yorumlarda beş yıldız size.” İlk yorum çoktan yazılmış.', effects: { isinsani: 4, itibar: 1, gonullu: 1 } },
      fail: { text: '“Mail atın, asistanım dönüş yapar” dedi. Asistanı yok.', effects: { isinsani: -3 } }
    },
    /* 7 */ {
      id: 'yazilimci_burak_wifi', modes: M, mizac: 'supheci',
      kisi: { name: 'Burak', age: 29, job: 'Uzaktan çalışan yazılımcı', emoji: '💻', group: 'genc' },
      intro: 'Kafede dizüstünün başında; çay soğumuş, sinyal çubukları titriyor.',
      start: 30, hedef: 64,
      rounds: [
        { line: 'Üç toplantıda internet koptu, patron “şehrinizde sorun mu var” dedi. Var!',
          options: [
            o('Fiber hat haritasını çıkardım; kesintinin olduğu bölgeler belli, takvim yazılı.', 'veri', 7, 'Haritayı görürsem inanırım.'),
            o('Şehirde fiber altyapısı genişledi; kesintiler azaldı.', 'veri', 10, 'Evet, geçen hafta pek kopmadı.', { min: { altyapi: 55 } }, 'Azalmış mı? Dün bağlantı toplantıda zıpladı!'),
            o('Yarın herkese ücretsiz sınırsız internet!', 'vaat', 11, '“Ücretsiz, sınırsız” diyen akla yatmıyor.')
          ] },
        { line: 'Koşulum belli: sessiz çalışma alanı, hızlı internet, bir de uygun kahve. Bu şehir sunabiliyor mu?',
          options: [
            o('Kütüphane ve kafeleri ortak çalışma alanına çeviriyorum; belediye internetini bağlıyoruz.', 'veri', 8, 'Kütüphane iyi fikir, saatleri uzun olursa.'),
            o('Kahve konusunda söz vermem ama kapıdan çay çıkar.', 'espri', 10, 'Çay da kahve değil ama dürüstsün.'),
            o('Sizi buradan gitmeye bırakmayız, hepinizi çok seviyoruz.', 'samimi', 10, 'Sevgi bağlantı hızını artırmaz.')
          ] },
        { line: 'Peki bu şehirde neden kalayım?',
          options: [
            o('Çünkü gençlerin dediği şeyi dinleyen biri var: ben. Mesajlarına bile bakıyorum.', 'samimi', 10, 'Mesaja bakıyorsan işe yarar.', { min: { itibar: 52 } }, 'Mesaj mı? Hiçbir şeye dönüş yok!'),
            o('Şehri ölçülebilir hedeflerle yöneteceğim: çevrimiçi pano açacağım, kendin takip et.', 'veri', 12, 'Pano mu? Ben bakarım, hatta hata da raporlarım.'),
            o('Şehir ucuz, deniz güzel, kediler yumuşak.', 'espri', 9, 'Bu argümanı kabul ediyorum, aslında.')
          ] }
      ],
      success: { text: 'Burak dizüstünü kapattı: “Hata kaydı açmak istersem pano nerede?” Aylardır ilk kez şehir hakkında olumlu tweet atıyor.', effects: { genc: 4, gonullu: 1, itibar: 1 } },
      fail: { text: '“Ben de bir tweet atayım” dedi ve ekrana döndü. Cevabı seni pek ilgilendirmeyecek.', effects: { genc: -3 } }
    },
    /* 8 */ {
      id: 'nezihe_hanim_bingo', modes: M, district: 'yokusbasi', mizac: 'neseli',
      kisi: { name: 'Nezihe Hanım', age: 66, job: 'Emekli öğretmen', emoji: '🎲', group: 'emekli' },
      intro: 'Apartman girişinde komşularla bingo kartlarını dağıtıyor, sana da bir kart uzatıyor.',
      start: 30, hedef: 63,
      rounds: [
        { line: 'Yokuşu çıkarken her gün dinleniyorum, üç mola veriyorum. Biri bana merdiven yapsın!',
          options: [
            o('Üç mola mı, dört olsun! Yokuşa bank, çay ocağı ve kendi bingo salonunu kuralım.', 'espri', 5, 'Bingo salonu! İşte bu fikir!'),
            o('Yokuşbaşı’na yürüyen merdiven için fizibilite çalışması başlatıyorum.', 'veri', 11, 'Fizibilite mi? Bana “şimdi” de.'),
            o('Yürüyen merdiven yapacağım, haftaya temel atıyoruz!', 'vaat', 12, 'Haftaya mı? Bir de şaka söyleyin!')
          ] },
        { line: 'Gençler “teyze bu neden böyle” diye gülüyor. Ben bilgisayar öğrenmek istiyorum!',
          options: [
            o('Size ilk dersi ben veririm, ama bingo kartında hile yok!', 'espri', 5, 'Ha ha! Hile yaparım yaparım.'),
            o('Gençlik merkezinde emeklilere ücretsiz bilgisayar kursu açacağız.', 'vaat', 13, 'Kayıt defterini getir, ilk ben yazılayım.'),
            o('Şehirde sosyal etkinlikler arttı; kurs duyuruları panoda.', 'veri', 17, 'Bak, panoda gördüm!', { min: { sosyal: 52 } }, 'Panoda yalnızca kaybolan kedi ilanı var!')
          ] },
        { line: 'Oyumu verdim diye hatırımı soran yok. Sen ne diyorsun?',
          options: [
            o('Oy verdiyseniz söz sizin, bir çay da benden olsun. Ama bu kez bingo kazanırsam ödül yarı yarıya.', 'espri', 5, 'Anlaştık, ama kart bende.'),
            o('Mahallelerde sosyal etkinlikler arttı; bingo grubuna da bir köşe düşer.', 'samimi', 10, 'İyi, geçen hafta salon doluydu, alkışlarım.', { min: { sosyal: 52 } }, 'Salon mu? Bingoyu merdiven sahanlığında oynuyoruz!'),
            o('Bu hafta herkese bedava bingo çuvalı dağıtacağım!', 'vaat', 12, 'Çuval çuval gelsin, sonra bakarız.')
          ] }
      ],
      success: { text: 'Nezihe Hanım kartı cebine tıkıştırdı: “Seni bingo grubuna alıyorum.” Apartmanın tüm kapıları artık sana açık.', effects: { emekli: 4, mahalle: 3 } },
      fail: { text: '“Bu kadar yeter” deyip bingo torbasını yeniden karıştırdı. Kartın bende kaldı, oy bende değil.', effects: { emekli: -2, mahalle: -1 } }
    },
    /* 9 */ {
      id: 'servis_soforu_hasan', modes: ['mayor'], district: 'sanayi', mizac: 'ofkeli',
      kisi: { name: 'Hasan', age: 52, job: 'Servis şoförü', emoji: '🚐', group: 'isci' },
      intro: 'Servisinin kaputu açık, motordan çıkan duman ve söylenmesi aynı anda artıyor.',
      start: 30, hedef: 63,
      rounds: [
        { line: 'Sanayi yolu çukurdan geçilmiyor! Üç lastik patlattım bu ay!',
          options: [
            o('Hasan abi, lastik cebinden gitmesin. Yol benim sorumluluğum, bu hafta ekibi yolluyorum.', 'samimi', 7, 'Hıh. Yolluyorsun diyorsun…'),
            o('Şehirde ulaşım altyapısı iyileşti; sanayi yolu da sırada.', 'veri', 12, 'Doğru, geçen ay asfalt döküldü.', { min: { ulasim: 55 } }, 'İyileşmiş mi? Benim lastik şahidim!'),
            o('Sanayi yoluna çift şeritli, süslü, aydınlatmalı otoyol yapacağım!', 'vaat', 15, 'Süslüsünü sen yap, ben yürürüm.')
          ] },
        { line: 'Bir de bu trafik kontrolü… Her gün ceza! Esnaf mısın, şoför müsün sormuyorlar.',
          options: [
            o('Net söyleyeyim: yanlış ceza varsa itiraza ben bakarım, ama kurallar herkese.', 'sert', 10, 'Kurallar herkese… Ha, bu adil.'),
            o('Ceza yazan da yiyen de yorgun; keşke trafik lambasına da ceza kesebilsek!', 'espri', 5, 'Espri mi bu? Sinirimi bozdun!'),
            o('Servis şoförlerine özel durak planı hazırlatıyorum.', 'vaat', 7, 'Plan çok, durak yok.')
          ] },
        { line: 'Peki bunca sözün sonu ne olur? Yıllardır duyuyorum.',
          options: [
            o('Sözlerimin çoğunu tuttum; çukur sayımını da bu hafta birlikte yapıyoruz.', 'samimi', 7, 'Beraber saymak güzel, eksik kalırsa yanındayım.', { min: { itibar: 55 } }, 'Tutmuşsun, ha! Çukur sayıyorsun ama kapatmıyorsun!'),
            o('Net konuşayım: yazılı söz veriyorum, bir yıl içinde servislere ulaşım indirimi.', 'sert', 10, 'Yazılı söz hoşuma gitti.'),
            o('Servis şoförlerine ücretsiz otoyol geçiş kartı!', 'vaat', 13, 'Kart kart… Kart cüzdanı doldurmuyor.')
          ] }
      ],
      success: { text: 'Hasan kontak kapatıp elini uzattı: “Bu işin ucunda sen varsan geliyorum.” Servisinde yeni bir seçim afişi görünce şaşırmayacaksın.', effects: { isci: 4, mahalle: 3 } },
      fail: { text: '“Servis gidecek” dedi ve gaza bastı. Çukurdan sıçrayan çamur ayakkabına nişan aldı.', effects: { isci: -3, mahalle: -2 } }
    },
    /* 10 */ {
      id: 'pazarci_ayten_teyze', modes: ['mayor'], district: 'carsi', mizac: 'duygusal',
      kisi: { name: 'Ayten', age: 54, job: 'Pazarcı', emoji: '🥬', group: 'esnaf' },
      intro: 'Yağmurda branda altında domates dizerken seni görünce elindeki kasayı yere bırakıyor.',
      start: 30, hedef: 64,
      rounds: [
        { line: 'Her yağmurda tezgâhım su alıyor, domatesler yüzüyor! Çocuklarım okula bu kazançla gidiyor.',
          options: [
            o('Ayten Abla, emeğin göz önünde; bu pazarın çatısı senin yüzünden değerli.', 'samimi', 5, 'Başkan, böyle konuşunca nasıl kızayım…'),
            o('Kapalı pazar yerinde tezgâhlar kuru kalıyor; sana ilk yeri ben ayarlarım.', 'veri', 16, 'Ben de gördüm, tezgâhlar çok güzel olmuş!', { project: 'kapali_pazar' }, 'Kapalı pazar mı? Ben hâlâ branda altındayım!'),
            o('Biraz da yağmur gerekli, sebze susar.', 'sert', 6, 'Böyle mi konuşuluyor?')
          ] },
        { line: 'Bir de mal indirirken kamyonlara yer yok, zabıta da ceza kesiyor.',
          options: [
            o('Yarın sabah beşte pazar yerinde nöbet tutuyorum, birlikte çözüm bulalım.', 'samimi', 5, 'Beşte mi? Sen kalkabilir misin başkan!'),
            o('Pazar girişine yükleme-boşaltma alanı yapacağım, kesin!', 'vaat', 11, 'Yüreğime serin su serptin.'),
            o('Pazar kuralları bellidir; saati geçen ceza yer.', 'sert', 8, 'Kuralmış! Çocuk okula giderken kural dinleyecek!')
          ] },
        { line: 'Ben belediyeye hep güvendim ama… Ya yine dönüp unutursanız?',
          options: [
            o('Unutmam: sana telefonumu veriyorum, bir sorun olursa ben bizzat açarım.', 'samimi', 5, 'Ay, bu çok güzel!'),
            o('Sosyal destek ve pazar esnafı programı genişledi; sen de kapsamdasın.', 'veri', 15, 'Bak bunu bilmiyordum, sağ ol!', { min: { sosyal: 52 } }, 'Ben kapsamda değilim, duymadım bile!'),
            o('Tezgâh kirasını bir yıl boyunca sıfırlayacağım!', 'vaat', 11, 'Bedava mı? Bu kadarı fazla güzel.')
          ] }
      ],
      success: { text: 'Ayten elindeki en kırmızı domatesi uzattı: “Yıka da ye, başkan.” Pazarda kasaları tek tek komşulara göstererek seni anlatıyor.', effects: { esnaf: 4, mahalle: 3, itibar: 1 } },
      fail: { text: '“Biz kendi halimize bakalım” dedi, kasayı kaldırdı. Domatesler seni suçlu gibi izliyor.', effects: { esnaf: -3, mahalle: -2 } }
    },
    /* 11 */ {
      id: 'ece_kedi_kulubu', modes: ['mayor'], district: 'kampus', mizac: 'neseli',
      kisi: { name: 'Ece', age: 20, job: 'Öğrenci kulübü başkanı', emoji: '🐈', group: 'cevreci' },
      intro: 'Omzunda bir kedi, elinde imza listesi; sana da bir kalem uzatıyor.',
      start: 30, hedef: 62,
      rounds: [
        { line: 'Kampüsteki kedilerin barınağı yok, kışın nasıl donuyorlar biliyor musun?',
          options: [
            o('Kediler kış gelmeden hepsini üstü kapalı bir saraya alalım, kıvrılıp mırlasınlar.', 'espri', 5, 'Saray! Tamam, ama güvenlik kamerası olsun.'),
            o('Hayvan bakımevi açtık; kampüs kedileri için kontenjan ayırdık.', 'veri', 17, 'İyi ya, aşısını yaptırdım bile!', { project: 'hayvan_bakimevi' }, 'Bakımevi mi? Kedilerin kulübesini hâlâ ben yapıyorum!'),
            o('Her bina önüne mama ve su istasyonu, yarın dağıtıyorum!', 'vaat', 12, 'Yarın mı? Sözünü tutarsan seninle selfie çekerim.')
          ] },
        { line: 'Bir de atık yönetimi: kampüste geri dönüşüm kutusu yok, ben çöp dağını görüyorum.',
          options: [
            o('Geri dönüşüm kutuları dağıtıp kulübü sorumlu yapalım, ödüllü yarışma bile olur.', 'espri', 5, 'Yarışma mı? Çok iyi!'),
            o('Çöp ayırma gönüllüsü olarak bana kulüpten bir kişi ver; ben de katılırım.', 'samimi', 10, 'Gelirsen çuvalı sen taşırsın!'),
            o('Atık toplama ücretini kampüs kullanıcılarına yansıtırım.', 'sert', 7, 'Ceza gibi, hayır!')
          ] },
        { line: 'Sence bu şehir yeşil bir şehir olabilir mi?',
          options: [
            o('Olabilir, ama bir kedi gibi: gizlice değil, usulca, pati pati.', 'espri', 5, 'Bu cümleyi afişe yazarız!'),
            o('Şehirde çevre göstergeleri iyi; geri dönüşüm payımız yükseliyor.', 'veri', 16, 'Kulüpte konuştuk, doğru.', { min: { cevre: 55 } }, 'İyi mi? Dünkü çöp konteynırına bakmadın galiba.'),
            o('Yeşil vaatlerle dolu bir kitap yayımlayacağım!', 'vaat', 12, 'Kitap çok, ağaç az olmasın.')
          ] }
      ],
      success: { text: 'Ece imza listesine seni de yazdı, kedi de sana pati koydu. Kulüp grubunda yarım saatte kırk emoji.', effects: { cevreci: 4, mahalle: 3, genc: 1 } },
      fail: { text: '“Düşünürüz” dedi. Kedi o sırada ayakkabına bir şey bıraktı; yorum yok.', effects: { cevreci: -2, mahalle: -1 } }
    },
    /* 12 */ {
      id: 'otelci_hamdi_sahil', modes: ['mayor'], district: 'sahil', mizac: 'supheci',
      kisi: { name: 'Hamdi Bey', age: 58, job: 'Sahil lokantası sahibi', emoji: '🦞', group: 'isinsani' },
      intro: 'Lokantanın terasında gözlüğünü silerek “sezon nasıl biter bilmiyorum” diyor.',
      start: 30, hedef: 64,
      rounds: [
        { line: 'Her yıl “turizm gelişecek” derler. Ben on yıldır aynı beş müşteriyi görüyorum.',
          options: [
            o('Turizm ofisinin rakamlarını yazdım; sahile gelen turist sayısını önümüzdeki mevsim paylaşıyorum.', 'veri', 7, 'Rakamı görürsem konuşuruz.'),
            o('Turizm ofisi açıldı; sahile gelen tur sayısı arttı.', 'veri', 11, 'Evet, bu sene daha fazla turist var.', { project: 'turizm_ofisi' }, 'Ofis mi? Cam bile açık değil!'),
            o('Sahile yılda bir milyon turist getireceğim!', 'vaat', 14, 'Milyon mu? Yarısı yeter.')
          ] },
        { line: 'Çevre sorunu da var; deniz kokuyor diyorlar, müşteri yüzünü buruşturuyor.',
          options: [
            o('Atık su hatlarını kontrol ettirdim, rapor belediye sitesinde.', 'veri', 7, 'Rapor mu? Kokuyu da yazmış mı?'),
            o('Denizin kokusu mu? Bence tuz. Ama bakacağız.', 'espri', 10, 'Tuz değil, atık!'),
            o('Sahil temizliği için acil bütçe ayıracağım.', 'vaat', 9, 'Bütçe mi? Önce kokuya bak.')
          ] },
        { line: 'Bana somut bir şey söyle. Ben duygusal bir adam değilim.',
          options: [
            o('Somut: sahil için kısa-orta-uzun vadeli bir yol haritası, tarihli ve bütçeli.', 'veri', 7, 'Bu hoşuma gitti.'),
            o('Şehrin ekonomisi canlı; sahil esnafı da bundan payını alıyor.', 'veri', 9, 'Kabul, bu yıl sezon fena geçmiyor.', { min: { ekonomi: 55 } }, 'Bana pek yansımadı bu canlılık!'),
            o('Gel birlikte bir çay içelim, sıcak sohbet iyi gelir.', 'samimi', 9, 'Çay içeyim, ama sözleşme imzalatırım.')
          ] }
      ],
      success: { text: 'Hamdi Bey menü kartının arkasına “1 çorba, 1 oy” yazıp uzattı. Akşam yemeğinde ilk masa senin için.', effects: { isinsani: 4, mahalle: 3 } },
      fail: { text: '“Bu menüde öyle bir şey yok” deyip garsonu çağırdı. Sana boş bir bardak kaldı.', effects: { isinsani: -3, mahalle: -1 } }
    },
    /* 13 */ {
      id: 'mehmet_usta_hayal_kirikligi', modes: ['opposition'], district: 'yokusbasi', mizac: 'duygusal',
      kisi: { name: 'Mehmet Usta', age: 55, job: 'Kalıpçı, eski destekçin', emoji: '💔', group: 'isci' },
      intro: 'Eski afişinin hâlâ asılı olduğu kapıda duruyor; afişin köşesi kıvrılmış, yüzü de.',
      start: 30, hedef: 64,
      rounds: [
        { line: 'Başkan {baskan}’a oy verdim, “iş getirecek” dedi. İş değil dert getirdi.',
          options: [
            o('Mehmet Usta, bir yanlışı kabul etmek güç ister. Bu kapıya aşağılanmaya değil dinlemeye geldim.', 'samimi', 5, 'Bak, böyle konuşunca eriyorum.'),
            o('Ekonomi göstergeleri düştü; senin yaşadığın tablo da bunu gösteriyor.', 'veri', 17, 'Yine de bana tablo okuma, iş istiyorum.', { max: { ekonomi: 45 } }, 'Tablo mu? Önce kendi işini yap, sonra rakam okur.'),
            o('Sana sözüm olsun: ilk gün fabrikaya iş açarım!', 'vaat', 10, 'Bir gün sonra yine dert olur.')
          ] },
        { line: 'Mahallemizde yokuşun merdivenleri dökülüyor, kalıpçı olarak bakıyorum, kalitesiz iş.',
          options: [
            o('Sen kalıpçısın, gözün yanılmaz: yarın birlikte merdivenlere bakalım, neyi eksik yaptıklarını bana göster.', 'samimi', 5, 'Bu iş bir kalıpçıya yakışır, kabul.'),
            o('Altyapı kötüleşti, merdivenler de bunun işareti.', 'veri', 17, 'Kötüleşti, evet; yalan söylemiyorsun.', { max: { altyapi: 45 } }, 'Bu işi benden iyi mi biliyorsun, usta mısın?'),
            o('Kalitesiz işin hesabı hem yaptırana hem yapana sorulur!', 'sert', 7, 'Ne diyorsun sen!')
          ] },
        { line: 'Bir şey söyle, sana yeniden güvenmem için.',
          options: [
            o('Gönüllülerimizle bu sokakta bir hafta sonu onarım yapıyoruz; gel, kalıbı sen kurarsın.', 'samimi', 5, 'Kalıbı ben kurayım, sen karıştır.', { min: { gonullu: 10 } }, 'Gönüllü mü? Kimse yok ortada!'),
            o('Bu sefer iş garantisi: ilk yılın bütçesi yazılı, sana imzalı kopya.', 'vaat', 11, 'İmzalı kopya… İyi, bakalım.'),
            o('Kalıbın sağlam, işin sağlam; oy da öyle atılır.', 'espri', 8, 'Şaka yapma, bu işte ciddiyim.')
          ] }
      ],
      success: { text: 'Mehmet Usta afişi duvardan indirdi, yenisini istedi: “Sağlamını getir.” Kapı komşularına seni anlatmaya çoktan başladı.', effects: { isci: 4, mahalle: 3, gonullu: 1 } },
      fail: { text: '“Bir de sen mi kandıracaksın beni” deyip kapıyı yavaşça kapattı. Afiş yine yerinde, yüzü yine buruşuk.', effects: { isci: -3, mahalle: -2 } }
    },
    /* 14 */ {
      id: 'huseyin_amca_rakip_hayrani', modes: ['opposition'], district: 'baglar', mizac: 'ofkeli',
      kisi: { name: 'Hilmi Amca', age: 73, job: 'Emekli bağ sahibi', emoji: '🧓', group: 'emekli' },
      intro: 'Bahçe kapısında elinde çapa, “Başkan {rakip} yaptı!” diye daha seni görmeden bağırıyor.',
      start: 30, hedef: 65,
      rounds: [
        { line: 'Başkan {rakip} yol yaptı, bank koydu, çay verdi! Siz gelince hep eleştiri!',
          options: [
            o('Hilmi Amca, yol da bank da iyi, inkâr etmem. Ben yapılmayanı konuşmaya geldim.', 'samimi', 7, 'Dürüstsün. Ne yapılmadı?'),
            o('Şehrin havası kötüleşti, sağlığınız da bundan etkileniyor.', 'veri', 12, 'Ha, öksürüyorum bu aralar, doğru.', { max: { cevre: 45 } }, 'Havada ne var? Ben gayet iyiyim!'),
            o('Bu başkan tam bir sahtekâr!', 'sert', 4, 'Ağzından çıkanı kulağın duysun! Başkan benim dostum!')
          ] },
        { line: 'Bağlar’a hizmet getirdi. Sen kimsin de geliyorsun şimdi, oy mu avlıyorsun?',
          options: [
            o('Oy avlamıyorum, çapayı alıp yardım ediyorum. Bir sıra çapalamama izin verin.', 'samimi', 7, 'Ha, al şu çapayı da göreyim!'),
            o('Bu başkan insanın yüzüne gülüyor ama bütçeyi nereye harcadığını söylemiyor.', 'sert', 10, 'Doğru, bütçe konusunda ben de bir şeyler duydum.'),
            o('Hilmi Amca, bağ bozumu şakası: üzümü satan değil, yiyen kazanır.', 'espri', 5, 'Dalga mı geçiyorsun yaşlı adamla?')
          ] },
        { line: 'Peki sana neden inanayım? Yirmi yıldır aynı bahçedeyim.',
          options: [
            o('Çünkü sana verdiğim sözü yazılı bırakacağım; bozarsam bahçeye gelip kendim budarım.', 'sert', 10, 'Yazılı mı? Budarsan görürüz!'),
            o('Güvenilirliğim ortada, birçok semtte sözümü tuttum.', 'samimi', 7, 'Tuttuysan iyi.', { min: { itibar: 55 } }, 'Ağzından bal damlıyor ama elinde bal yok!'),
            o('Seçilirsem bağ yolunu ilk iş asfaltlarım!', 'vaat', 14, 'Asfalt asfalt… Geçen başkan da dedi.')
          ] }
      ],
      success: { text: 'Hilmi Amca çapayı sana verdi: “İki sıra çapala, bir sıra düşünürüm.” Çay semaveri tazelendi; kapı artık açık.', effects: { emekli: 4, mahalle: 4 } },
      fail: { text: '“Başkan {rakip} daha iyiydi!” diye bağırdı. Kapının önünde köpeği sana patiyle ‘git’ dedi.', effects: { emekli: -2, mahalle: -2 } }
    },
    /* 15 */ {
      id: 'kerem_siyaset_anlamsiz', modes: ['opposition'], mizac: 'supheci',
      kisi: { name: 'Kerem', age: 24, job: 'Kurye', emoji: '🛵', group: 'genc' },
      intro: 'Motosikletinin selesinde oturmuş, sana “siyaset boş” der gibi omuz silkiyor.',
      start: 30, hedef: 63,
      rounds: [
        { line: 'Hangi başkan gelse aynı. Ben seçimde bile oy kullanmıyorum, zaman kaybı.',
          options: [
            o('Haklı olabilirsin ama yine de gelmemin bir nedeni var: ben tek tek konuşarak başlıyorum.', 'samimi', 11, 'Konuşma bedava, ben de dinlerim.'),
            o('Şehirde gönüllülerimiz arttı, bu iş boş değil.', 'veri', 12, 'Gönüllü mü? Kaç kişi?', { min: { gonullu: 10 } }, 'Bu kadar mı? Sinema salonu bile dolmaz!'),
            o('Şehri tamamen değiştireceğim, mucize olacak!', 'vaat', 15, 'Mucize mi? Ben kurye, mucize teslim etmem.')
          ] },
        { line: 'Her gün yağmurda, çukurda, trafikte. Siyasetçi hiç motosiklete binmedi.',
          options: [
            o('Haklısın. Bir gün seninle bir sipariş taşıyayım, çukurları da sayalım.', 'samimi', 11, 'Ha! Gerçekten gelirsen etkilenirim.'),
            o('Kuryeler için güvenli şerit ve sigorta düzenlemesi taslağım var; sayıları çıkardım.', 'veri', 8, 'Taslak mı? Göster bakalım.'),
            o('Kasklı kuryeye dokunulmaz, çukur da korkar.', 'espri', 6, 'Espriye gülmem, sipariş gecikir.')
          ] },
        { line: 'Peki seçilirsen? Ne değişir?',
          options: [
            o('Kampanya fonumuzu açık hesapla yayınlıyorum; kuruşu kuruşuna takip et.', 'samimi', 11, 'Açık hesap! Bu hoşuma gitti.', { min: { fon: 15 } }, 'Fon mu? Para nerede, cüzdanda yok!'),
            o('İlk 100 gün planı yazılı; sen de bir madde öner, rakamıyla yazalım.', 'veri', 7, 'Bir madde ben yazarım, hem de hızlıca.'),
            o('Oy vermezsen kazananı sen seçmemiş olmazsın; ama şikâyet hakkın da kalmaz.', 'sert', 4, 'Şikâyet hakkı mı? Bu da tehdit gibi oldu.')
          ] }
      ],
      success: { text: 'Kerem kaskını çıkardı: “Oy vermem diyordum. Seni ilk teslimat adresime yazdım.” Bu bir ilk.', effects: { genc: 4, gonullu: 2 } },
      fail: { text: '“Sipariş geldi” deyip gaza bastı. Egzoz dumanında siyaset kokusu kaldı.', effects: { genc: -2 } }
    },
    /* 16 */ {
      id: 'esnaf_gulay_iki_tarafi', modes: ['opposition'], district: 'carsi', mizac: 'pragmatik',
      kisi: { name: 'Gülay Hanım', age: 47, job: 'Hırdavatçı', emoji: '🧰', group: 'esnaf' },
      intro: 'Dükkânın önüne iki sandalye koymuş: biri senin, biri başkanın için. İkisinde de çay soğuyor.',
      start: 30, hedef: 64,
      rounds: [
        { line: 'Başkan {rakip} geldi dün, kapı kolunu yeniledi. Sen ne getirdin?',
          options: [
            o('Ben iş getirmeye geldim: esnafın ihtiyaç listesini yazıp ilk yüz günde ele alacağım.', 'vaat', 8, 'İhtiyaç listesi iyi, benimkini de ekle.'),
            o('Ekonomi geriledi, çarşıda ciro düştü; siz de hissediyorsunuz.', 'veri', 10, 'Evet, bu yaz kasada hep boş kâğıt.', { max: { ekonomi: 45 } }, 'Ciro mu? Ben ay sonunu getiriyorum!'),
            o('Beni dinleyen herkesi dinlerim, çay benden.', 'samimi', 11, 'Çay kabul, vaat bekliyorum.')
          ] },
        { line: 'Çarşıda otopark yok, müşteri araba park edemiyor.',
          options: [
            o('Çarşı çevresinde katlı otopark için fizibilite hazırlattım; rakamları sana vereceğim.', 'veri', 9, 'Rakamları görürsem iyi.'),
            o('Çarşıyı yaya yapma planım var; esnafa ücretsiz teslimat hizmeti.', 'vaat', 9, 'Yaya mı? Müşteri nasıl taşıyacak?'),
            o('Herkes yürürse kalp de dinç olur.', 'espri', 5, 'Ben yürüyemem, dizlerim tutmuyor.')
          ] },
        { line: 'İki taraf da tatlı söz söylüyor. Neden sana güveneyim?',
          options: [
            o('Çünkü seçilince ilk iş esnafla aylık masa kuruyorum, kayıtlı ve yayımlanmış.', 'vaat', 8, 'Aylık masa… Güzel fikir.'),
            o('Güvenilirliğim bence belli: sözlerimi tutuyorum.', 'samimi', 10, 'Tutuyorsan seviyorum seni.', { min: { itibar: 55 } }, 'Kendi kendine tutuyorsun belli ki!'),
            o('Karşılaştır: bir yıl sonra kimin sözü tutulduysa ona oy ver; seni zorlamam da.', 'sert', 8, 'Adil. Defteri açıyorum.')
          ] }
      ],
      success: { text: 'Gülay Hanım defterini açıp senin adını yazdı: “Bir yıl sonra not vereceğim.” İlk not iyi.', effects: { esnaf: 4, mahalle: 3 } },
      fail: { text: '“Üzerine düşüneceğim” diyerek iki kapıyı da kapadı. Tabelada “Mola” yazıyor.', effects: { esnaf: -3, mahalle: -1 } }
    }

  ]);
})(typeof window !== 'undefined' ? window : globalThis);

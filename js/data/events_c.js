/* BAŞKAN — şehir halleri (absurt) olayları. Şema: js/core/schema.js. Örnek kalıp: js/data/starter.js */
(function (root) {
  'use strict';
  var BG = root.BG;

  BG.add('events', [
    {
      id: 'absurt_kedi_mama_savasi', cat: 'absurt', district: 'rastgele',
      title: '{mahalle}’de Kedi Mama Savaşı',
      text: '{mahalle}’de sokak kedileri mama kabı yüzünden ikiye bölündü. Bir balkonda “Kedilere mama verin” pankartı asılı, karşı balkonda “Pati korkuluğa çıkmasın” levhası. Muhtar iki tarafı aynı çay masasına oturtmaya çalışıyor; kediler davetli değil, ama masanın altında.',
      choices: [
        { text: 'Belediye mama noktası kursun', cost: { butce: 8 },
          effects: { cevre: 3, cevreci: 3, esnaf: -2 },
          result: 'Mama noktası açıldı. Kediler memnun; balkon sahipleri hâlâ söyleniyor, ama bu kez kedi gibi mırıldanmıyorlar.' },
        { text: 'Balkon sahipleriyle mahalle toplantısı yap', effects: { mahalle: 4, sosyal: 2 },
          result: 'Toplantıda iki taraf da söz aldı, kimse bitirmedi. Mama kabı artık ortak mal; kediler ise toplantı tutanağında hâlâ “misafir”.' },
        { text: 'Balkon sahiplerinin yanında dur', effects: { mahalle: 3, cevreci: -3, emekli: 3 },
          result: '“Sokak sokak olsun, kedi kedi” dedin. Balkonlar alkışladı; kedi sevenler ertesi sabah daha büyük bir pankart astı.' }
      ]
    },
    {
      id: 'absurt_martilar_simit', cat: 'absurt',
      title: 'Martılar Simit Çetesi Kurdu',
      text: 'Sahil yolunda martılar simitçinin tepsisinden simit kapıp uçuyor. Simitçiler “Biz de geçinmek zorundayız” diyor; martılar ise tezgâhın üstünde karar alıp gökyüzünden çekiliyor.',
      choices: [
        { text: 'Martı kovucu drone devriyesi kur', cost: { butce: 12 },
          effects: { esnaf: 4, cevreci: -4, guvenlik: 2 },
          result: 'Drone sahilde vızıldadı. Simitçiler alkışladı; martılar korkmadı, tek sıra dizilip drone’un pilini beklemeye başladı.' },
        { text: 'Martılara özel yem alanı aç', hint: 'Kuşlar kazanır, tezgâhlar kazanır mı?',
          effects: { cevre: 2, cevreci: 4, esnaf: -3 },
          result: 'Yem alanı açıldı. Martılar mutlu; simitçiler ise “martı lobisi” yazılı bir pankartla belediyenin önüne dizildi.' },
        { text: 'Simitçilere kapaklı tepsi ver', effects: { esnaf: 3, cevre: 2, isci: -2 },
          result: 'Kapaklı tepsiler dağıtıldı. Martılar kapağı açmayı bir öğleden sonrada öğrendi; açık tepsi hâlâ bizde diyen simitçi çıkmadı.' }
      ]
    },
    {
      id: 'absurt_dugun_konvoyu', cat: 'absurt',
      title: 'Düğün Konvoyu Anayolu Kapattı',
      text: 'Kırk araçlık düğün konvoyu ana caddenin ortasında durup halaya girdi. Gelin “Sadece beş dakika” dedi; o beş dakikanın üzerinden üç saat geçti, minibüsler korna çalmaktan sesini kaybetti.',
      choices: [
        { text: 'Trafik ekibini yollayıp konvoyu yönlendir', cost: { butce: 6 },
          effects: { ulasim: 3, guvenlik: 2, sosyal: -2 },
          result: 'Ekipler halayı yarım saatte dağıttı. Damat trafik polisine sarılıp teşekkür etti; polis ne diyeceğini bilemedi.' },
        { text: 'Düğünü kutla, kapıdan selam ver', effects: { sosyal: 3, genc: 3, ulasim: -3 },
          result: 'Gelinle damada selam verip bir de pasta yedin. Gençler selfie kuyruğuna girdi; minibüsler iki saat daha bekledi.' },
        { text: 'Yan sokaklardan trafiği akıt', effects: { ulasim: 2, esnaf: -3, emekli: -2 },
          result: 'Trafik yan sokaklara akıtıldı; esnaf kapısının önünden geçen kamyonlara bakıp kepenk indirdi, emekliler de bankta kulaklarını kapadı.' }
      ]
    },
    {
      id: 'absurt_halisaha_isiklari', cat: 'absurt', district: 'rastgele',
      title: '{mahalle} Halı Sahasında Gece Yarısı Maçı',
      text: '{mahalle} halı sahasının projektörleri gece üçte hâlâ yanıyor. Maç dokuzda bitti, ama bir grup “son penaltı” için geri döndü. Komşular pencereden terlik fırlatıyor; kaleci bu atışı kurtaramadı.',
      choices: [
        { text: 'Akıllı zamanlayıcı kurdur', cost: { butce: 6 },
          effects: { altyapi: 3, mahalle: 2, genc: -3 },
          result: 'Projektör artık gece yarısında kendi kendine sönüyor. Gençler “son penaltıyı” ertesi akşama bırakmayı öğrendi; komşular terliği yerine koydu.' },
        { text: 'Gece maçlarına resmî ruhsat ver', effects: { genc: 4, sosyal: 2, cevreci: -3 },
          result: 'Gece maçları resmileşti, ışıklar yanıyor. Çevreciler “Enerji tasarrufu lütfen” pankartını kale direğine astı.' },
        { text: 'Sorunu sakinlerle oylamaya aç', hint: 'Herkes oy verir, kimse kazanmaz',
          result: 'Mahalle sandığa gitti.',
          outcomes: [
            { p: 0.6, effects: { mahalle: 4, sosyal: 2 }, result: 'Oylamada “son penaltı” kabul edildi; projektörler gece yarısına kadar açık kalacak.' },
            { p: 0.4, effects: { mahalle: -4, genc: 2, halk: -1 }, result: 'Oylama iki saat sürdü, sonuç kimseyi memnun etmedi. Komşular bu kez dilekçeyi terlikle değil, noterle gönderdi.' }
          ] }
      ]
    },
    {
      id: 'absurt_simitci_kose_savasi', cat: 'absurt',
      title: 'İki Simitçinin Köşe Savaşı',
      text: 'Meydanın iki köşesinde iki simitçi var: Fındık Mehmet ile Sarı Osman. Biri tabelasına “Taze”, öbürü “Tazeden de taze” yazdı. Şehir ikiye bölündü; simit kuyruğu sahile kadar uzadı, simidin kendisi ise soğudu.',
      choices: [
        { text: 'Meydana üçüncü simit arabası kur', cost: { butce: 10 },
          effects: { esnaf: 3, ekonomi: 2, sosyal: 2 },
          result: 'Üçüncü araba da geldi. Simit çoğaldı, ama şimdi üç esnaf aynı müşterinin peşinde; müşteri bir köşeden öbürüne koşuyor.' },
        { text: 'İkisine de eşit kiralı ruhsat ver', effects: { esnaf: 2, isci: -2, ekonomi: 1 },
          result: 'Ruhsatlar çerçevelenip asıldı. Sarı Osman dört ay küs kaldı; Fındık Mehmet tabelasını bir boy büyüttü.' },
        { text: 'Köşe savaşını “simit festivali” yap', effects: { sosyal: 4, genc: 2, esnaf: -3 },
          result: 'Festival meydanı doldurdu. Simit yarışı yapıldı; kazananın simidi soğuk çıktı, ikinci olan itiraz etti, üçüncü simit sattı.' }
      ]
    },
    {
      id: 'absurt_cay_bahcesi_muzik', cat: 'absurt',
      title: 'Çay Ocağı Sabaha Kadar Türkü Çaldı',
      text: 'Çay ocağının hoparlörü gece ikide aynı türküyü beşinci kez çaldı. Karşı apartmanda bir teyze pencereden kepçeyle tempo tutuyor; bu bir tepki mi eşlik mi, kimse emin değil. Sokakta kimse uyuyamıyor.',
      choices: [
        { text: 'Ses ölçer kur, gece sınırını koy', cost: { butce: 7 },
          effects: { emekli: 3, guvenlik: 2, genc: -3 },
          result: 'Ses ölçer kuruldu. Emekliler rahatladı; çay ocağı sahibi ölçerin önüne tabure koyup “Sesim bu kadar” diye savunmaya geçti.' },
        { text: 'Gece konseri yap, ücretsiz bilet dağıt', effects: { genc: 4, sosyal: 3, emekli: -3 },
          result: 'Gece sahnesi kuruldu. Gençler sabaha kadar oynadı; komşular kulak tıkacı almak için eczaneye kuyruk oldu.' },
        { text: 'Tarafları çaya oturt', hint: 'Çay ikinci demlenince konuşulur',
          result: 'Masaya çaylar geldi.',
          outcomes: [
            { p: 0.6, effects: { sosyal: 3, emekli: 2, isinsani: 2 }, result: 'Çay ikinci demlendi, konuşma yumuşadı. Müzik kısıldı, sohbet yükseldi; türkü bu kez yalnızca bir kere çalındı.' },
            { p: 0.4, effects: { sosyal: -2, esnaf: -3 }, result: 'Çay bitti, tartışma kalmadı; üstüne bir de şeker kavgası çıktı. Kimse kimseyi dinlemedi, hoparlör açık kaldı.' }
          ] }
      ]
    },
    {
      id: 'absurt_pazar_yer_kavgasi', cat: 'absurt', district: 'rastgele',
      title: '{mahalle} Pazarında Yer Kavgası',
      text: '{mahalle} pazarında iki tezgâhçı aynı köşeyi istiyor. Biri kendi kasasını çekti, öbürü domates kasalarıyla barikat kurdu. Kovalamacada bir kavun yuvarlanıp kaçtı; kavunu yakalayana kadar kimse alışveriş yapamadı.',
      choices: [
        { text: 'Pazar yerlerini numaralandır', cost: { butce: 9 },
          effects: { esnaf: 4, ekonomi: 2, mahalle: 3 },
          result: 'Tezgâhlar numaralandı. Domates A-12’de, patlıcan B-7’de; artık herkes yalnızca kendi numarasının önünde kavga edebiliyor.' },
        { text: 'Yerleri kuraya bağla', effects: { esnaf: -2, isci: 2, mahalle: 2 },
          result: 'Kura çekildi. Kazanan köşesini öptü, kaybeden elindeki kavunla teselli buldu.' },
        { text: 'Sıraları haftalık döndür', hint: 'Adalet herkese aynı anda gelmez',
          result: 'Takvim asıldı.',
          outcomes: [
            { p: 0.6, effects: { esnaf: 3, mahalle: 3 }, result: 'Haftalık döngü tuttu; tezgâhçılar birbirinin köşesini sevmeye, hatta tavsiye etmeye başladı.' },
            { p: 0.4, effects: { esnaf: -4, isci: -2 }, result: 'Her hafta yeni yer, her hafta yeni tartışma. Bir tezgâhçı “Ben tezgâhçı mıyım, göçebe mi?” diye sızlandı.' }
          ] }
      ]
    },
    {
      id: 'absurt_hoparlor_yanlis_anons', cat: 'absurt',
      title: 'Belediye Hoparlörü Yanlış Anons Yaptı',
      text: 'Sabah 07.30’da belediye hoparlörü “Sayın hemşehrilerimiz, çöp günü değişti, lütfen martıları besleyiniz” diye anons etti. Kimse ne yapacağını bilmiyor; hoparlör bile kendi cümlesinden utanmış gibi cızırdıyor.',
      choices: [
        { text: 'Özür anonsu yayınla', cost: { butce: 5 },
          effects: { itibar: 3, halk: 2, cevre: 2 },
          result: 'Özür anonsu yapıldı. “Martıları besleyiniz” cümlesi ise şehrin en çok paylaşılan sloganı oldu; tişörte basan bile çıktı.' },
        { text: 'Düzeltme anonsunu kendin yap', effects: { itibar: 2, emekli: 2, isci: -2 },
          result: 'Doğru anons senin sesinle yapıldı. Emekliler memnun; sabah martıya ekmek ayıranlar “Programımız bozuldu” diye mırıldandı.' },
        { text: 'Hoparlörü bir gün tamamen kapat', effects: { sosyal: -2, emekli: 3, genc: -3 },
          result: 'Şehir bir gün sessiz kaldı. Emekliler ferahladı; gençler “Bu şehirde bir şey mi oluyor?” diye yazdı, kimse cevap veremedi.' }
      ]
    },
    {
      id: 'absurt_bilge_dede_heykeli', cat: 'absurt',
      title: 'Bilge Dede Heykeli Kayboldu',
      text: 'Meydandaki Bilge Dede heykeli sabaha karşı kaidesinden yok oldu. Geriye iki çift ayak izi ve yarım kalmış bir poğaça kaldı. Turizm ofisi yeni fotoğraf çekmek istiyor; zabıta ise “Poğaça delildir, dokunmayın” diyor.',
      choices: [
        { text: 'Özel arama ekibi yolla', cost: { butce: 8 },
          effects: { guvenlik: 3, sosyal: 2, itibar: 1 },
          result: 'Heykel üç gün sonra kahvehanede bulundu; masasında soğumuş bir çay ve “Ben dönerim” yazan bir kâğıt vardı.' },
        { text: 'Kayıp ilanı ver, ödül koy', effects: { sosyal: 3, genc: 3, guvenlik: -2 },
          result: 'İlan sosyal medyada yayıldı. Heykel dönmedi ama dört bin yorum geldi; bir kısmı heykele âşık olduğunu itiraf etti.' },
        { text: 'Yenisini yap, kimse fark etmesin', effects: { itibar: -3, isci: 2, sosyal: -2 },
          result: 'Yeni heykel dikildi. Dikkatli bakan iki kişi farkı anladı; biri Bilge Dede’nin kaşlarının eskisi kadar bilge durmadığını söyledi.' }
      ]
    },
    {
      id: 'absurt_mac_hakem_krizi', cat: 'absurt', district: 'rastgele',
      title: '{mahalle} Maçında Hakem Krizi',
      text: '{mahalle} halı saha ligi finali 0-0 bitmek üzere. Hakem koltuğuna kahvenin emekli müdavimi geçti; iki kez yanlış takıma kart gösterdi. Tribünde bir teyze de kendi düdüğünü çalmaya başladı.',
      choices: [
        { text: 'Profesyonel hakem tuttur', cost: { butce: 6 },
          effects: { genc: 3, guvenlik: 2, emekli: -2 },
          result: 'Düdük profesyonel birinin eline geçti. Maç kaldığı yerden devam etti; emekli hakem tribünde “Ben daha adil bakıyordum” diye söyleniyor.' },
        { text: 'Emekli hakemi kahveye davet et', effects: { emekli: 4, sosyal: 2, genc: -3 },
          result: 'Emekli hakem kahvede plaketle onurlandı. Gençler “Adalet nerede?” diye bağırdı; teyzeler alkışlamaya devam etti.' },
        { text: 'Hakem eğitimi kursu aç', effects: { sosyal: 3, mahalle: 3, guvenlik: -2 },
          result: 'Kurs açıldı; ilk derste teyze düdüğü kapıp sınıfı sınava aldı, bir de ödev verdi.' }
      ]
    },
    {
      id: 'absurt_apartman_gorevlileri', cat: 'absurt',
      title: 'Apartman Görevlileri Dernek Kurdu',
      text: 'Apartman görevlileri ilk kez dernek kurdu. Talepleri: kuryeler için ayrı asansör, “kapıda bekletme yasağı” ve dernek için bir tabela. İlk toplantıyı bahçede yaptılar; ortak mikrofon yoktu, ama sesleri ön sıradaki kediye kadar ulaştı.',
      choices: [
        { text: 'Dernek binası için yer ayır', cost: { butce: 10 },
          effects: { isci: 4, sosyal: 2, isinsani: -2 },
          result: 'Dernek binası açıldı. Görevliler ilk kez hep birlikte çay içti; sakinler apartman kapısından selam vermeye, bazıları da üye olmaya başladı.' },
        { text: 'Yönetmelik komisyonu kur', effects: { isci: 3, guvenlik: -2, sosyal: 1 },
          result: 'Komisyon kuruldu, toplantılar bitmiyor. Görevliler dosyayla geliyor, sakinler “Bu kadar kâğıt neden?” diye soruyor; cevap bir sonraki toplantıda.' },
        { text: 'Kurye yasağını yönetim kurullarıyla konuş', effects: { isinsani: -3, esnaf: -2, isci: -2 },
          result: 'Yönetim kurulları kurye yasağını sevdi. Kurye esnafı ise yasağı kapı kapı dolaşıp sessizce aşmanın yolunu buldu; sipariş sayısı düştü, söylenti arttı.' }
      ]
    },
    {
      id: 'absurt_bayram_sekeri_kuyrugu', cat: 'absurt',
      title: 'Bayram Şekeri Kuyruğu Sokağı Kapattı',
      text: 'Belediyenin bayram şekeri dağıtımı için oluşan kuyruk üç sokağı kapattı. Emekliler sandalyesiyle gelmiş, çocuklar sıraya tabur kurmuş. Kapıda “Lokum bitti” yazıyor, ama okuyan yok.',
      choices: [
        { text: 'Dağıtımı iki noktaya böl', cost: { butce: 6 },
          effects: { emekli: 4, ulasim: 2, genc: -2 },
          result: 'Kuyruk ikiye bölündü. Emekliler sandalyelerini yeni sıraya taşıdı; çocuklar ise gidip öbür kuyruğun daha kısa olduğunu kanıtladı.' },
        { text: 'Şekerleri eve servis et', effects: { emekli: 3, isinsani: 2, esnaf: -3 },
          result: 'Şekerler kapı kapı gitti. Bakkallar bayram siparişini kaybedince sokakta tatlı değil, ufak bir kriz vardı.' },
        { text: 'Kuyrukta şekerli çay ikram et', effects: { sosyal: 3, emekli: 2, itibar: -2 },
          result: 'Çaylar dolaştı, kuyruk sakinleşti. Bazıları “Şeker yerine çay mı?” diye söylense de çayın yanına kesme şeker istemeyen çıkmadı.' }
      ]
    },
    {
      id: 'absurt_park_satranc_turnuvasi', cat: 'absurt',
      title: 'Parkta Satranç Turnuvası Kriz Çıkardı',
      text: 'Park satranç masalarında turnuva başladı. İlk hamlede sakallı bir emekli, kendi vezirini şah sanıp oyunu durdurdu. Hakem kurulu ise önce kimin hakem olacağını tartışıyor; turnuva henüz başlamadı.',
      choices: [
        { text: 'Turnuvaya sponsor ol, kupa al', cost: { butce: 8 },
          effects: { genc: 3, emekli: 3, sosyal: 2 },
          result: 'Kupa ahşap, hafif yamuk ama gurur verici. Şampiyon seninle fotoğraf çektirdi; kupayı rafa sen yerleştirdin, düzeltmedi kimse.' },
        { text: 'Hakem kurulunu mahalleden seçtir', effects: { sosyal: 3, halk: 2, itibar: -2 },
          result: 'Hakemler seçildi. En çok oyu alan kişi satranç bilmiyormuş ama kimse onu yenemiyormuş; güven oyu da buna dâhil.' },
        { text: 'Turnuvayı kapat, masaları kaldır', effects: { sosyal: -4, genc: -3, guvenlik: 2 },
          result: 'Masalar kalktı, park sessizleşti. Satranççılar derneğe taşındı; hakem kurulu hâlâ kimin hakem olacağını tartışıyor.' }
      ]
    },
    {
      id: 'absurt_guvercin_yasagi', cat: 'absurt',
      title: 'Güvercin Besleme Yasağı Çıktı',
      text: 'Meydanda güvercinleri beslemek yasaklandı. Emekliler protesto olarak ekmek kırıntısını ceplerinde taşımaya başladı. Güvercinler yasa metnini bekliyor; metin hâlâ yazılıyor.',
      choices: [
        { text: 'Güvercin evi kur, yem noktası aç', cost: { butce: 9 },
          effects: { cevreci: 4, cevre: 2, emekli: -2 },
          result: 'Güvercin evi açıldı, yem noktası kuruldu. Çevreciler alkışladı; emekliler “Ekmek bizde kalsın” diyerek cepte tuttu.' },
        { text: 'Yasağı uygula, ceza kes', effects: { guvenlik: 3, esnaf: 2, cevreci: -4 },
          result: 'Ceza tutanakları yazıldı. Güvercinler tutanağı okumadı; kafeler ilk kez teraslarında sakin bir kahve içti.' },
        { text: 'Yasağı meclise bırak, bekle', effects: { emekli: 3, cevreci: 2, esnaf: -3 },
          result: 'Yasak bir sonraki meclise kaldı. Emekliler ve güvercinler kazandı; kafe sahipleri terasları süpürmeye devam ediyor.' }
      ]
    },
    {
      id: 'absurt_karpuzcu_megafonu', cat: 'absurt',
      title: 'Karpuzcunun Megafonu Sabah Beşte',
      text: 'Karpuzcu Recep’in kamyoneti her sabah beşte megafonla “Karpuuuz, kavun!” diye geçiyor. Mahalle yataktan fırladı; kamyonet ise hiçbir şey olmamış gibi yoluna devam ediyor.',
      choices: [
        { text: 'Megafona saat aralığı koy', cost: { butce: 5 },
          effects: { esnaf: 3, emekli: 3, genc: -2 },
          result: 'Megafon artık yediden sonra açılıyor. Emekliler rahat uyudu; karpuzcu sesini ertesi sabaha saklayıp biraz daha yüklendi.' },
        { text: 'Megafonu yasakla, kendi sesiyle seslensin', effects: { emekli: 3, esnaf: -4, sosyal: 1 },
          result: 'Karpuzcu megafonu bıraktı; yerine kasalara vurarak tak tak ilan verdi. Emekliler uyudu, karpuzcu küstü.' },
        { text: 'Karpuz-kavun festivali aç', effects: { sosyal: 4, genc: 3, emekli: -3 },
          result: 'Festival meydanda kuruldu. Karpuzcu sahnede şarkı söyledi; uykusu kaçan emekliler de bu kez sahnenin önüne yürüdü.' }
      ]
    },
    {
      id: 'absurt_ucurtma_kabloya_takildi', cat: 'absurt',
      title: 'Uçurtma Şenliği Kabloya Takıldı',
      text: 'Sahil uçurtma şenliğinde dev bir uçurtma elektrik hattına takıldı. Sahne karanlığa gömüldü; çocuklar uçurtmayı alkışlıyor, teknik ekip ise yetecek uzunlukta merdiven arıyor.',
      choices: [
        { text: 'Enerji ekibini sahaya çağır', cost: { butce: 12 },
          effects: { altyapi: 3, guvenlik: 2, sosyal: -2 },
          result: 'Ekip uçurtmayı kablodan söktü. Çocuklar “Biz kurtaracaktık” diye surat astı; uçurtma yırtık, ama enerji yerinde.' },
        { text: 'Şenliği erken kapat', effects: { genc: -3, sosyal: -2, guvenlik: 2 },
          result: 'Sahne kapandı, şenlik sessizce bitti. Gençler ertesi gün “Uçurtma Hakkı” adında bir grup kurdu, üye sayısı hızla uçtu.' },
        { text: 'Çocukları kurtarma ekibi olarak çağır', hint: 'En iyi ekip bazen küçüktür',
          result: 'Küçük eller sahneye koştu.',
          outcomes: [
            { p: 0.6, effects: { genc: 4, sosyal: 3 }, result: 'Uçurtma küçük ellerle çözüldü. Bir çocuk madalya istedi; sen de sahneye çıkıp kendi tişörtünü verdin.' },
            { p: 0.4, effects: { isinsani: -3, guvenlik: -3 }, result: 'Bir çocuk dengesini kaybetti, kolunu burktu. Acil kuyruğu şenlik kuyruğundan uzun çıktı.' }
          ] }
      ]
    }
  ]);
})(typeof window !== 'undefined' ? window : globalThis);

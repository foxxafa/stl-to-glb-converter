# Windows Defender Hakkında Önemli Bilgiler

## Neden Windows Defender Uyarı Verebilir?

STL2GLB güvenli bir uygulamadır, ancak Electron tabanlı uygulamalar bazen Windows Defender tarafından false positive (yanlış pozitif) olarak algılanabilir. Bu durum:

- Uygulamanın dijital imzasının olmaması
- Electron framework'ünün özelliklerinden kaynaklanır
- Yeni bir uygulama olması nedeniyle henüz Windows tarafından tanınmaması

## Çözüm Yöntemleri

### 1. Windows Defender İstisna Listesi
1. Windows Defender'ı açın
2. "Virüs ve tehdit koruması" → "Virüs ve tehdit koruması ayarları"
3. "İstisnalar" bölümüne gidin
4. "İstisna ekle" → "Klasör"
5. STL2GLB'nin kurulu olduğu klasörü seçin

### 2. Akıllı Ekran Uyarısı
Kurulum sırasında "Windows bu PC'yi korudu" uyarısı alırsanız:
1. "Daha fazla bilgi" linkine tıklayın
2. "Yine de çalıştır" butonuna basın

### 3. Güvenlik Onayı
- Bu uygulama zararlı yazılım içermez
- Kaynak kodu tamamen temizdir
- Sadece STL dosyalarını GLB formatına dönüştürür
- Sistem dosyalarına müdahale etmez
- Tamamen offline çalışır, hiç internet gerektirmez

## Teknik Bilgiler
- Uygulama ID: com.stl2glb.converter
- Publisher: STL2GLB
- Platform: Electron
- Açık kaynak: Evet 
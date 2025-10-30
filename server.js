// Gerekli modülleri içeri aktarıyoruz
const express = require('express');
const path = require('path');

// Express uygulamasını oluşturuyoruz
const app = express();

// Sunucunun hangi portta çalışacağını belirtiyoruz
const PORT = process.env.PORT || 5000;

// Express'e, web sitemizin dosyalarının 'public' klasöründe olduğunu söylüyoruz.
app.use(express.static(path.join(__dirname, 'public')));

// Sunucuyu başlatıyoruz ve dinlemeye başlıyoruz
app.listen(PORT, () => {
    console.log(`Sunucu başarıyla başlatıldı!`);
    console.log(`Web sitenizi görüntülemek için tarayıcınızda http://localhost:${PORT} adresini açın.`);
});
# Asker Kokoreç Menü (Tek sayfa, müşteri/admin modu)

## Çalıştırma
1) `.env` oluşturun (`.env.example`'ı kopyalayın) ve isterseniz şifreyi değiştirin.
2) MongoDB Community (localhost) çalışıyor olsun.
3) Terminal:
```bash
npm install
npm start
```
- Müşteri: http://localhost:5000
- Admin modu: http://localhost:5000?admin=true  (şifre: `.env`'deki `ADMIN_PASSWORD`)
- Alternatif: http://localhost:5000/admin

## Not
- İlk çalıştırmada menü ürünleri otomatik oluşturulur, fiyatlar **boş** gelir.
- Admin girişinden sonra her satırdaki fiyatı yazıp **Kaydet** ile güncelleyebilirsiniz.

# Platform Klien Ekspor — Web + API

Repo ini berisi frontend React, backend Express, dan database SQLite lokal. Repo mobile dan desktop juga memiliki backend/database sendiri; ketiga layanan dapat mereplikasi inquiry sebagai peer append-only.

## Jalankan backend web

Gunakan Node.js 22 atau lebih baru.

```bash
npm ci
cp .env.example .env
npm run dev
```

Frontend web tersedia di `http://localhost:5173`, backend web di `http://localhost:4000`. SQLite dibuat otomatis di `data/export-client.sqlite` dan tidak dimasukkan ke Git. API dan schema sinkronisasi: [`docs/openapi.yaml`](docs/openapi.yaml).

Default API mengikat ke loopback (`127.0.0.1`). Untuk pengujian dari perangkat lain di LAN tepercaya, atur `API_HOST=0.0.0.0` secara eksplisit dan batasi firewall; jangan ekspos API ke internet publik tanpa autentikasi, TLS, dan kontrol akses yang sesuai.

```bash
npm test
npm run typecheck
npm run build
```

## Verifikasi interoperabilitas tiga backend

Setelah repo mobile dan desktop tersedia pada folder sejajar (`../export-client-mobile-sync` dan `../export-client-desktop-sync`), jalankan:

```bash
npm run test:interop
```

Harness memverifikasi replikasi tepat satu kali, respons pelacakan publik, replay duplikat, konflik payload dan tracking-code tanpa overwrite, serta outbox yang terkuras. Ia hanya memakai inquiry sintetis dan database SQLite sementara yang dibersihkan setelah tes. Lihat [runbook pengujian](docs/interop-testing.md) untuk langkah lokal dan rincian cakupan. CI ketiga repo menjalankan tes ini saat push dan pull request; workflow Web juga mendukung pemicu manual dan jadwal harian terhadap `main` Mobile dan Desktop.

Untuk menjalankan build web melalui backend:

```bash
npm run build
NODE_ENV=production npm start
```

## Backend aplikasi lain

- Mobile: jalankan `npm run dev:api` pada repo mobile (default port `4001`), lalu Expo (`npm start`). Atur `EXPO_PUBLIC_API_URL` untuk emulator/perangkat.
- Desktop: aplikasi menjalankan backend lokalnya pada `127.0.0.1:4002`.
- Masing-masing backend menyimpan database SQLite yang berbeda. Inquiry dibuat pada backend yang dipilih oleh klien; kode pelacakan yang sama tersedia di peer setelah replikasi.

Lihat [README mobile](https://github.com/muchlisbstg/export-client-mobile-sync) dan [panduan integrasi desktop](https://github.com/muchlisbstg/export-client-desktop-sync/blob/main/docs/integration.md).

## Sinkronisasi peer-to-peer

Arsitektur tidak memiliki master atau last-write-wins. Inquiry bersifat append-only untuk MVP:

- Setiap record memiliki UUID, kode pelacakan, dan `originNodeId` yang stabil.
- Dengan `SYNC_SHARED_SECRET` (minimal 32 karakter) dan `SYNC_PEERS` yang terisi, backend mengantrikan replikasi pada outbox SQLite dan mencoba ulang bila peer tidak tersedia.
- Record identik yang datang lebih dari sekali diabaikan; ID/kode sama dengan isi berbeda dicatat sebagai konflik (hash dan peer), menghasilkan HTTP 409, dan **tidak** menimpa record tersimpan.
- Konflik tidak diselesaikan otomatis. Belum ada fitur edit status atau delete.
- Setiap server hanya meneruskan record baru ke peer lain selain asal. Ini membuat replikasi idempoten dan menghentikan echo loop.

Buat `.env` untuk tiap backend dari contoh env masing-masing. Contoh pengaturan web lokal:

```env
SYNC_NODE_ID=web-local
SYNC_SHARED_SECRET=<secret-random-minimal-32-karakter-yang-sama-pada-ketiga-backend>
SYNC_PEERS=mobile-local=http://127.0.0.1:4001,desktop-local=http://127.0.0.1:4002
```

Mobile dan desktop memakai ID unik (`mobile-local`, `desktop-local`) serta mendaftarkan peer lain dengan URL yang dapat dijangkau dari backend tersebut. Buat secret dengan `openssl rand -hex 32`; jangan commit secret, memasukkannya ke `EXPO_PUBLIC_*`, log, atau URL. Sync nonaktif secara default ketika secret kosong. Endpoint peer-to-peer tidak memakai autentikasi pengguna; bearer secret hanya untuk layanan-ke-layanan.

Untuk jaringan selain loopback, wajib gunakan HTTPS/TLS dan firewall. Contoh HTTP loopback hanya untuk pengujian lokal. API klien biasa tetap demo dan tanpa login.

## Cakupan, privasi, dan batas penggunaan

Produk dan inquiry hanya data contoh. Cakupan produk mengecualikan pertambangan/ekstraksi, alkohol dan wine, serta produk babi atau turunannya. Kode pelacakan adalah bearer secret; siapa pun yang memilikinya dapat membaca status dan nama produk, tetapi API tidak mengembalikan nama/email pemohon. Endpoint sinkronisasi antarlayanan mentransfer data kontak inquiry dan harus memakai jaringan tepercaya/TLS.

Autentikasi pengguna, kontrol admin, dan kebijakan retensi belum diputuskan dan tidak ditambahkan. Jangan gunakan untuk data klien atau transaksi nyata sebelum kontrol akses, retensi/penghapusan, TLS, backup, penyimpanan persisten, dan deployment ditinjau. Tidak ada deployment yang dibuat oleh perubahan ini.

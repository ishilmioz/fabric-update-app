## 🌐 Language / Dil

🇹🇷 [Türkçe](#-t%C3%BCrk%C3%A7e)<br>
🇺🇸 [English](#-english)

## 🇹🇷 Türkçe
#Kumaş Lot Güncelleme Uygulaması

Google Sheets’i depo gibi kullanan basit fakat iş akışı net bir **lot yönetim uygulaması**.  
Kullanıcı, **lot no** girer → Uygulama önce **B** sayfasını arar → varsa **güncelle**, yoksa **A** sayfasına bak → **A**'da varsa **ekle**, hiçbirinde yoksa uyarı verir.

- Google Sheets → veritabanı olarak çalışır  
- Next.js (App Router) + API Routes  
- Zod ile veri doğrulama  
- Basit, hızlı, kullanıcı odaklı UI

----------
## Özellikler

|Özellik  | Açıklama |
|--|--|
|A & B Sheets  |  Aynı sütun yapısı: `lot no, ürün kodu, raf, metraj`|
|Lot arama |  `GET /api/lot/[lotNo]` → A veya B'de arar|
|Ekleme  |  A’da bulunan bir lot, B’ye eklenebilir|
|JSON response |  Standart, anlaması kolay çıkışlar|
|Modern UI  |  Ortalanmış kart, placeholder, aktif/pasif butonlar|
|Hata bannerları  |  B’de bulunan lot üstüne yazılarak güncellenir|
|Güncelleme  |  success/info/warning/error durumları|


----------

##  Kullanılan Teknolojiler

-   Next.js 13+ (App Router)
-   React
-   TypeScript
-   Google Sheets API
-   Zod
-   Fetch API
   
-   Custom CSS (styled-jsx)

----------

## Google Service Account Hazırlığı

1.  Google Cloud Console → proje oluştur
    
2.  `Google Sheets API` → Enable
    
3.  Credentials → Service Account oluştur
    
4.  Service Account’a özel anahtar üret → JSON indir
    
5.  Kullandığın Sheets dosyasını şu e-posta ile paylaş:  
    **`<service-account-name>@<project>.iam.gserviceaccount.com`**  
    → _Edit_ yetkisi olmalı
    
----------

## `.env.local` Ayarları

Proje köküne `.env.local` oluştur:

`SHEET_ID="GOOGLE_SHEET_ID_BURAYA"
GOOGLE_CLIENT_EMAIL="service-account@project.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nABC...\n-----END PRIVATE KEY-----\n"

SHEET_NAME_A="A"
SHEET_NAME_B="B"` 

> NOT: Private key’de `\n` kaçışlarına dikkat ettik. Kod içinde otomatik düzeltiliyor (`replace(/\\n/g, "\n")`).

----------

## Kurulum & Çalıştırma

`npm install` <br>
`npm run dev` <br>
http://localhost:3000 

----------

## API Endpoints

### 1) Lot Sorgulama
`GET /api/lot/:lotNo` 

**Response örnekleri:**

`{  "foundIn":  "A",  "data":  {  "lot no":"9001","ürün kodu":"X1","raf":"R2","metraj":"100"  }  }` 

`{  "foundIn":  "B",  "data":  { ... }  }` 

`{  "foundIn":  null  }` 

----------

### 2) B'ye Ekleme

`POST /api/lot
Content-Type: application/json` 

`{  "lot no":  "9001",  "ürün kodu":  "X1",  "raf":  "R2",  "metraj":  "100"  }` 

Başarılı:

`{  "ok":  true,  "action":  "added",  "data":  {...}  }` 

----------

### 3) Güncelleme

`PUT /api/lot/:lotNo` 

`{  "ürün kodu":  "X1",  "raf":  "R8",  "metraj":  "120"  }` 

Başarılı:

`{  "ok":  true,  "action":  "updated",  "data":  {...}  }` 

----------

## Front-End Özellikleri

-   Ortalanmış card tasarımı
    
-   Belirgin input kenarlıkları
    
-   Placeholder & yazı rengi okunaklı
    
-   Enter ile işlem akışı:
    
    -   Lot kilitli değilken → **Sorgula**
        
    -   A’da bulunduysa → **Ekle**
        
    -   B’de bulunduysa → **Güncelle**
        
-   Renkli banner uyarıları:
    
    -   **success** (yeşil)
        
    -   **info** (mavi)
        
    -   **warning** (sarı)
        
    -   **error** (kırmızı)
        
-   Buton state’leri:
    
    -   Aktif → parlak renk + gölge
        
    -   Pasif → düşük opaklık + disable
        
-   Küçük spinner animasyonu
    

----------

## Özet İş Akışı

1.  Kullanıcı **Lot No** yazar → `Sorgula`
    
2.  Backend önce **B** sayfasını arar
    
    -   Bulursa → değerler formda görünür → **Güncelle** aktif
        
3.  B’de yoksa **A**'ya bakar
    
    -   Bulursa → değerler formda görünür → **Ekle** aktif
        
4.  A ve B’de yoksa → `Kayıt bulunamadı` uyarısı
    

----------

##  Veri Güvenliği

-   Mature veritabanı yerine Google Sheets kullanıldığı için
    
-   Tüm işlemler Service Account üzerinden
    
-   `.env.local` repoya eklenmez
    
-   Zod input doğrulaması yanlış girişleri engeller


<br>


## 🇺🇸 English

# Fabric Lot Update App

A simple but clearly-defined workflow **lot management application** that uses Google Sheets like a warehouse.  The user enters a **lot number** → The application first searches the **B** sheet → if it exists **update**, if not look at the **A** sheet → if it exists in **A** then **add**, if it exists in neither, it gives a warning.

- Google Sheets → works as a database
- Next.js (App Router) + API Routes
- Data validation with Zod
- Simple, fast, user-focused UI

----------
## Features

|Feature| Description |
|--|--|
|A & B Sheets  |  Same column structure: `lot no, ürün kodu, raf, metraj`|
|Lot search |  `GET /api/lot/[lotNo]` → searches in A or B|
|Add  |  A lot found in A can be added to B|
|JSON response |  Standard, easy-to-understand outputs|
|Modern UI  |  Centered card, placeholder, active/inactive buttons|
|Error banners|  A lot found in B is updated by overwriting|
|Update|  success/info/warning/error states|


----------

##  Tech Stack

-   Next.js 13+ (App Router)
-   React
-   TypeScript
-   Google Sheets API
-   Zod
-   Fetch API
   
-   Custom CSS (styled-jsx)

----------

## Google Service Account Hazırlığı

1. Create a project in Google Cloud Console
    
2. Enable `Google Sheets API`
    
3. Go to Credentials → create a Service Account
    
4. Generate a private key for the Service Account → download JSON
    
5. Share your Sheets file with this email:  
    **`<service-account-name>@<project>.iam.gserviceaccount.com`**  
    → must have _Edit_ permission
    
----------

## `.env.local` Settings


Create `.env.local` in the project root:

`SHEET_ID="GOOGLE_SHEET_ID_HERE"  
GOOGLE_CLIENT_EMAIL="service-account@project.iam.gserviceaccount.com"  
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nABC...\n-----END PRIVATE KEY-----\n"

SHEET_NAME_A="A"  
SHEET_NAME_B="B"`

> NOTE: Pay attention to `\n` escapes in the private key. It’s automatically fixed in code (`replace(/\\n/g, "\n")`).

----------

## Local Installation & Running

`npm install` <br>
`npm run dev` <br>
http://localhost:3000 

----------

## 🧩 API Endpoints

### 1) Lot Query
`GET /api/lot/:lotNo` 

**Response examples:**

`{  "foundIn":  "A",  "data":  {  "lot no":"9001","ürün kodu":"X1","raf":"R2","metraj":"100"  }  }` 

`{  "foundIn":  "B",  "data":  { ... }  }` 

`{  "foundIn":  null  }` 

----------

### 2) Add to B

`POST /api/lot
Content-Type: application/json` 

`{  "lot no":  "9001",  "ürün kodu":  "X1",  "raf":  "R2",  "metraj":  "100"  }` 

Başarılı:

`{  "ok":  true,  "action":  "added",  "data":  {...}  }` 

----------

### ✏ 3) Update

`PUT /api/lot/:lotNo` 

`{  "ürün kodu":  "X1",  "raf":  "R8",  "metraj":  "120"  }` 

Başarılı:

`{  "ok":  true,  "action":  "updated",  "data":  {...}  }` 

----------

## Front-End Features

-   Distinct input borders
    
-   Readable placeholder & text color
    
-   Flow with Enter:
    
    -   When lot is not locked → **Query**
        
    -   If found in A → **Add**
        
    -   If found in B → **Update**
        
-   Colored banner alerts:
    
    -   **success** (green)
        
    -   **info** (blue)
        
    -   **warning** (yellow)
        
    -   **error** (red)
        
-   Button states:
    
    -   Active → bright color + shadow
        
    -   Inactive → low opacity + disabled
        
-   Small spinner animation
    

----------

## Summary Workflow

1. User enters **Lot No** → `Query`
    
2. Backend first checks the **B** sheet
    
    -   If found → values appear in the form → **Update** becomes active
        
3.  If not in B, it checks **A**
    
    -   If found → values appear in the form → **Add** becomes active
        
4.  If not in A or B → `Record not found` warning
    

----------

##  Data Security

-   Since Google Sheets is used instead of a mature database
    
-   All operations are through the Service Account
    
-   `.env.local` is not added to the repo
    
-   Zod input validation prevents incorrect inputs

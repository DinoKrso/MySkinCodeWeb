# Lambda — admin analitika

## `get-users-count` (korisnici + proizvodi)

Jedna Lambda, dvije rute:

| Ruta | Odgovor |
|------|---------|
| `GET /admin/users/count` | `{ "count": 42, "table": "Users" }` |
| `GET /admin/products/count` | `{ "count": 128, "table": "Products", "filter": "PK begins_with PRODUCT# AND SK = META" }` |

Broj proizvoda broji samo zapise s `PK` prefiksom `PRODUCT#` i `SK = META` (isti oblik kao `create-product`).

### Environment varijable (Lambda)

| Varijabla | Obavezno | Opis |
|-----------|----------|------|
| `USERS_TABLE_NAME` | Ne (default: `Users`) | Tablica korisnika |
| `PRODUCTS_TABLE_NAME` | Ne (default: `Products`) | Tablica proizvoda |
| `ADMIN_API_KEY` | Preporučeno | Header `X-Admin-Key` ili `Authorization: Bearer <key>` |
| `CORS_ORIGIN` | Ne | Npr. `https://www.myskincodeapp.com` |

### IAM policy (minimalno)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["dynamodb:Scan"],
      "Resource": [
        "arn:aws:dynamodb:eu-central-1:ACCOUNT_ID:table/Users",
        "arn:aws:dynamodb:eu-central-1:ACCOUNT_ID:table/Products"
      ]
    }
  ]
}
```

### Deploy (ručno)

```bash
cd lambda/get-users-count
npm install
zip -r get-users-count.zip handler.mjs node_modules package.json
```

U AWS Console:

1. Lambda → upload `get-users-count.zip` (ili ažuriraj postojeću)
2. Handler: `handler.handler`
3. Env: `USERS_TABLE_NAME=Users`, `PRODUCTS_TABLE_NAME=Products`, `ADMIN_API_KEY=...`
4. API Gateway (npr. `rdwp2lazqa`) — **obje rute na istu Lambda**:
   - **GET** `/admin/users/count`
   - **GET** `/admin/products/count`
5. Web `.env`:
   - `ADMIN_USERS_COUNT_URL=https://rdwp2lazqa.../dev/admin/users/count`
   - `ADMIN_PRODUCTS_COUNT_URL=https://rdwp2lazqa.../dev/admin/products/count`

### Test u AWS konzoli

Event (prazan API Gateway proxy):

```json
{
  "httpMethod": "GET",
  "headers": {
    "X-Admin-Key": "tvoj-admin-api-key"
  }
}
```

### Napomena o performansama

`Scan` COUNT prolazi cijelu tablicu — OK za admin dashboard i desetke tisuća korisnika. Za veće volumene koristi brojač (Streams + Lambda) ili `DescribeTable` + periodični export — `ItemCount` u DescribeTable nije real-time točan.

---

## `create-product`

Dodaje jedan proizvod u DynamoDB (`PK`: `PRODUCT#BrandName…`, `SK`: `META`).

### Request

`POST /admin/products`

```json
{
  "brand": "CeraVe",
  "name": "Hidratantna Njega Za Lice SPF30",
  "line": "Hidracijske kreme za lice",
  "category": "moisturizer",
  "country": "USA",
  "description": "...",
  "image": "https://...",
  "step_type": "SPF",
  "price_range": "budget",
  "concerns": ["hydration", "sun protection"],
  "highlights": ["SPF30", "hydrating"],
  "ingredients": ["aqua", "glycerin"],
  "key_ingredients": ["niacinamide"],
  "skin_types": ["normal", "dry"],
  "isSponsored": false,
  "sponsorWeight": 0
}
```

`step_type` mora biti jedna od: Čistač, Hidratantna krema, Krema za područje oko očiju, Tretman, Tonik, SPF, Serum.

### Lambda env

| Varijabla | Default |
|-----------|---------|
| `PRODUCTS_TABLE_NAME` | `Products` |
| `ADMIN_API_KEY` | opcionalno |

### Deploy

```bash
cd lambda/create-product
npm install
zip -r create-product.zip handler.mjs node_modules package.json
```

API Gateway (`rdwp2lazqa`): **POST** `/admin/products` → Lambda.

Web admin forma: `/admin/proizvodi` → `POST /api/admin/products` (proxy).

---

## `product-image-upload`

Lambda **direktno** uploada sliku na S3 (`PutObject`) — browser ne zove S3 (nema CORS na PUT).

### Request

`POST /admin/product-image-upload`

```json
{
  "contentType": "image/jpeg",
  "fileName": "photo.jpg",
  "fileSize": 120000,
  "brand": "CeraVe",
  "name": "Hidratantna Njega SPF30",
  "fileBase64": "..."
}
```

### Response

```json
{
  "message": "Slika je uploadana.",
  "publicUrl": "https://products-images-skincode.s3.eu-central-1.amazonaws.com/cerave-hidratantna-njega-spf30.jpg",
  "key": "cerave-hidratantna-njega-spf30.jpg"
}
```

### Lambda env

| Varijabla | Default |
|-----------|---------|
| `PRODUCT_IMAGES_BUCKET` | `products-images-skincode` |
| `PRODUCT_IMAGES_PUBLIC_BASE` | `https://{bucket}.s3.{region}.amazonaws.com` |
| `PRODUCT_IMAGE_MAX_BYTES` | `4194304` (4 MB) |

### IAM (obavezno) — AccessDenied znači ovo nedostaje

Na **Lambda execution role** dodaj `s3:PutObject` na bucket proizvoda. Primjer (oba bucketa ako trebaš):

```json
{
  "Effect": "Allow",
  "Action": ["s3:PutObject", "s3:GetObject"],
  "Resource": [
    "arn:aws:s3:::skincode-image-uploads/*",
    "arn:aws:s3:::products-images-skincode/*"
  ]
}
```

Vidi `infra/iam-product-image-upload.json`.

AWS Console → Lambda → **product-image-upload** → **Configuration** → **Permissions** → klik na role → **Add permissions** → **Create inline policy** → JSON → zalijepi gore.

Ako bucket koristi KMS enkripciju, dodaj i `kms:GenerateDataKey` na taj ključ.

### S3 CORS

Za ovaj flow **nije potreban** CORS za PUT (upload ide preko Lambda). CORS i dalje može trebati za **GET** slika u appu ako bucket nije javan.

---

## `activate-subscription`

Poziva je web `/api/payments/monri/callback` nakon odobrene Monri uplate. Upisuje paket i datum isteka na korisnika.

| `billingInterval` | Istek |
|-------------------|--------|
| `monthly` | +1 mjesec |
| `yearly` | +1 godina |

Ako korisnik već ima **isti ili viši** paket koji još nije istekao, novo razdoblje se **nadovezuje** na postojeći istek (obnova). Upgrade (plus → premium) kreće od sada.

### Request

`POST /subscriptions/activate`

```json
{
  "userId": "abc-123",
  "planId": "plus",
  "billingInterval": "yearly",
  "orderNumber": "MSCxxxx",
  "amount": 11999,
  "currency": "BAM"
}
```

`planId`: `plus` | `premium`. Isti `orderNumber` se ne naplaćuje dvaput.

### Lambda env

| Varijabla | Default | Opis |
|-----------|---------|------|
| `USERS_TABLE_NAME` | `Users` | Tablica korisnika |
| `ADMIN_API_KEY` | — | Isti ključ kao ostale admin Lambda |
| `USERS_PK_ATTRIBUTE` | `userId` | Partition key (ako je `PK`, stavi `PK`) |
| `USERS_PK_PREFIX` | *(prazno)* | Npr. `USER#` ako je PK `USER#{id}` |
| `USERS_SK_ATTRIBUTE` | *(prazno)* | Ako tablica ima sort key, npr. `SK` |
| `USERS_SK_VALUE` | *(prazno)* | Npr. `PROFILE` |

Ako `GetItem` javlja da key ne odgovara shemi, u Dynamo konzoli otvori jednog korisnika i uskladi `USERS_PK_*` / `USERS_SK_*`.

### IAM

`dynamodb:GetItem` + `dynamodb:UpdateItem` na `Users`. Vidi `infra/iam-activate-subscription.json` (zamijeni `ACCOUNT_ID`).

### Deploy

```bash
cd lambda/activate-subscription
npm run zip
```

U AWS Console: Handler ostavi **`index.handler`** (default). Zip na rootu mora imati `index.mjs`.

API Gateway (ista `rdwp2lazqa` ili nova): **POST** `/subscriptions/activate` → ova Lambda.

Web env (Vercel + lokalni `.env`):

```
MONRI_ACTIVATE_SUBSCRIPTION_URL=https://rdwp2lazqa.execute-api.eu-central-1.amazonaws.com/dev/subscriptions/activate
MONRI_ACTIVATE_SUBSCRIPTION_KEY=<isti ADMIN_API_KEY>
```

---

## `expire-subscriptions`

Dnevni (ili ručni) prolaz kroz `Users`: ako je `subscriptionPlan` `plus`/`premium` i `subscriptionExpiresAt` je u prošlosti, upisuje `basic`. `subscriptionExpiresAt` ostaje (audit).

**Prava zaštita paketa nije ovaj cron.** Svaka Lambda koja gleda paket (profil, skeniranje, limite) mora računati:

`effectivePlan = subscriptionExpiresAt > now ? subscriptionPlan : "basic"`

Cron samo usklađuje Dynamo da admin i klijenti koji čitaju samo `subscriptionPlan` vide Basic.

### Deploy

```bash
cd lambda/expire-subscriptions
npm run zip
```

U AWS Console:

1. Nova Lambda, runtime Node.js 20/24, Handler **`index.handler`**
2. Upload `expire-subscriptions.zip`
3. Timeout 60 s, memorija 256 MB
4. Env: `USERS_TABLE_NAME=Users` (isti `USERS_PK_*` / `USERS_SK_*` kao activate-subscription ako tablica nije `userId`)
5. IAM: `infra/iam-expire-subscriptions.json` (`Scan` + `UpdateItem`)
6. EventBridge → **Schedule** `rate(1 day)` (npr. 03:00 UTC) → ova Lambda. Nije potreban API Gateway.

Test u konzoli: prazan event `{}`. Odgovor: `{ "ok": true, "scanned": N, "expired": M }`.


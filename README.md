# BackendBil

Backend-API (Express + Prisma + MySQL) och en CLI-klient (`bil-cli`) för att bevaka bilar man är intresserad av att köpa.

## Snabbstart (för test/rättning)

Kräver: [Docker Desktop](https://www.docker.com/products/docker-desktop/) och Node.js.

```bash
# 1. Starta databasen
docker compose up -d

# 2. Installera backend-beroenden och konfigurera miljövariabler
npm install
cp .env.example .env

# 3. Kör migreringar och fyll databasen med testdata
npx prisma migrate deploy
npm run db:seed

# 4. Starta backend (lyssnar på :3000)
npm run dev
```

Öppna en ny terminal för CLI:n:

```bash
cd cli
npm install
npm run dev
```

Logga in med testkontot:

- **E-post:** `test@test.com`
- **Lösenord:** `test123`

Kontot har tre exempelbilar förifyllda (olika statusar: bevakar/intresserad/kontaktad), så listvyn visar data direkt.

## Struktur

- `src/` — Express-backend (auth, bilar, notiser)
- `cli/` — CLI-klient (`bil-cli`), pratar med backend via HTTP
- `prisma/` — databasschema, migreringar och seed-script
- `docs/` — planerings-/designdokument

## Stack

- Backend: Node.js, Express, TypeScript, Prisma, MySQL
- CLI: TypeScript (ESM), `@clack/prompts`, `axios`, `vitest`
- Auth: JWT, lagras lokalt i `~/.config/bil-cli/auth.json`

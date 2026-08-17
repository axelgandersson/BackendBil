# Bil-CLI Design Spec
**Datum:** 2026-05-13

## Sammanfattning

Ett interaktivt CLI-verktyg för att bevaka bilar man är intresserad av att köpa. Verktyget kommunicerar via HTTP mot ett befintligt Express/Prisma/MySQL-backend som körs lokalt. Koden placeras i en `cli/`-mapp i samma repo som backend.

---

## Arkitektur

### Kommunikation
CLI:t är en ren HTTP-klient mot det befintliga Express-APIet på `http://localhost:3000`. Ingen direkt databaskoppling — all affärslogik stannar i backend.

### Placering
```
BackendBil/
├── src/          # befintlig backend
├── prisma/
└── cli/          # nytt CLI-paket
    ├── src/
    └── package.json
```

CLI:t är ett eget paket med egen `package.json` och `tsconfig.json`.

---

## Filstruktur

```
cli/
├── src/
│   ├── index.ts            # entry point, main menu loop
│   ├── api.ts              # axios-instans med auth-interceptors
│   ├── auth.ts             # spara/läsa/rensa token från disk
│   ├── mock-vehicle-api.ts # mock-fordonsdata för regnummer aaa001–aaa005
│   └── commands/
│       ├── login.ts        # Clack-prompts för inloggning
│       ├── cars.ts         # list, add, update status, delete
│       └── logout.ts       # rensar token och avslutar session
├── package.json
└── tsconfig.json
```

---

## Autentisering & Token-hantering

- Vid start kollar CLI:t om `~/.config/bil-cli/auth.json` innehåller en giltig token.
- Om token saknas → kör login-flödet direkt.
- Om token finns → visa huvudmenyn.
- Token sparas som `{ "token": "..." }` i JSON-filen.
- Axios-instansen i `api.ts` läser token från disk via en request interceptor och sätter `Authorization: Bearer <token>` på varje anrop.
- En response interceptor fångar 401 → rensar token från disk och informerar användaren om att de behöver logga in igen.

---

## Mock Fordons-API

Ersätter ett riktigt registreringsnummer-API tills access erhålls. Implementeras som ett enkelt objekt i `mock-vehicle-api.ts`:

```ts
const mockVehicles: Record<string, { make: string; model: string; year: number }> = {
  "aaa001": { make: "Volvo",      model: "V70",      year: 2015 },
  "aaa002": { make: "BMW",        model: "3-serie",  year: 2018 },
  "aaa003": { make: "Toyota",     model: "Corolla",  year: 2020 },
  "aaa004": { make: "Volkswagen", model: "Golf",     year: 2017 },
  "aaa005": { make: "Ford",       model: "Focus",    year: 2016 },
};
```

Lookup returnerar `undefined` om regnumret inte finns — då får användaren fylla i märke/modell/år manuellt.

---

## Flöde & Kommandon

### Huvudmeny (loop)
```
? Vad vill du göra?
  ❯ Visa sparade bilar
    Lägg till bil
    Logga ut
    Avsluta
```
Menyn loopar tills användaren väljer "Avsluta" eller "Logga ut".

### Logga in
Clack-prompts för email och lösenord. POST till `/auth/login`. Token sparas på disk vid lyckad inloggning.

### Lägg till bil
1. Fråga om regnummer (valfritt — tryck Enter för att hoppa över)
2. Om regnummer matchar mock → visa hämtad data, be användaren bekräfta
3. Om inget regnummer / ingen träff → fråga märke, modell, år manuellt
4. Fråga: pris (kr), miltal (km), annons-URL — alla valfria
5. POST till `/cars` → visa bekräftelse med bilens namn

### Visa sparade bilar
Tabellvy i terminalen:
```
  # Märke       Modell     År    Pris       Status
  1 Volvo       V70        2015  85 000 kr  WATCHING
  2 BMW         3-serie    2018  149 000 kr INTERESTED
```
Välj en bil ur listan för att komma till bilens undermeny.

### Undermeny för bil
```
? Volvo V70 (2015) — vad vill du göra?
  ❯ Ändra status
    Ta bort bil
    Tillbaka
```
- **Ändra status** → välj bland WATCHING / INTERESTED / CONTACTED / PASSED → PUT till `/cars/:id`
- **Ta bort** → bekräftelsefråga → DELETE till `/cars/:id`

---

## Felhantering

| Scenario | Beteende |
|---|---|
| Backend inte igång (nätverksfel) | *"Kunde inte nå servern — är backend igång?"* |
| 401 Unauthorized | Rensar token, *"Sessionen har gått ut, logga in igen"* |
| 404 / 400 från API | Visar serverns felmeddelande |
| Tomt bilregister | *"Du har inga sparade bilar än"* |

Alla fel skickar tillbaka till huvudmenyn — programmet kraschar inte.

---

## Teknikval

| Val | Bibliotek |
|---|---|
| Prompts & UI | `@clack/prompts` |
| HTTP-klient | `axios` |
| Språk | TypeScript (`"type": "module"`) |
| Kompilering | `tsc` med egen `tsconfig.json` |

---

## Avgränsningar (MVP)

- Inga noteringar i CLI:t (stöds av API men inte CLI ännu)
- Ingen statistikvy
- Ingen filtrering/sortering av billistan
- Ingen offline-mode

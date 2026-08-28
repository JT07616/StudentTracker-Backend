# StudentTracker

Poslužiteljski dio aplikacije StudentTracker.

Aplikacija je dostupna na: `https://studenttrackerfipu.netlify.app/login`

## Lokalno pokretanje

Potreban je Node.js i pristup MongoDB bazi.

```
npm install
```

U korijenu projekta napravi datoteku `.env`:

```
MONGO_URI=adresa baze
JWT_SECRET=tajni kljuc za tokene
PORT=3000
```

Pokretanje:

```
node index.js
```

Za razvoj, uz automatsko ponovno pokretanje pri promjeni koda:

```
npx nodemon index.js
```

Poslužitelj radi na `http://localhost:3000`.

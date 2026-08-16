# 90s Wala

A one-page nostalgic homepage with an SQLite song database and a working 90s radio.

## Run

```bash
cd 90s-wala
npm install
npm start
```

Open http://localhost:3000

Do not open `index.html` as a file — the radio needs the Node server.

Re-seed the database:

```bash
npm run seed
```

Songs play through the official YouTube IFrame Player API. The configured external playlist is:

`PLuRJywfkv_0ynoXKZEVJ5eBCfUzhMa5nt`

The site does not download, store, or serve MP3 files. The SQLite database stores song metadata and YouTube video IDs; YouTube remains the media host.

## API

- `GET /api/songs?genre=&q=`
- `GET /api/songs/:id`
- `POST /api/songs/:id/play`
- `GET /api/memories`
- `POST /api/memories`
- `POST /api/memories/:id/relate`
- `GET /api/stats`

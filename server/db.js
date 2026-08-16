const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const catalog = require("./catalog");

const dataDir = path.join(__dirname, "..", "data");
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, "wala.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT,
    year INTEGER,
    genres TEXT NOT NULL,
    youtube_id TEXT NOT NULL UNIQUE,
    plays INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY,
    body TEXT NOT NULL,
    author TEXT NOT NULL DEFAULT 'Anonymous',
    likes INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_songs_year ON songs(year);
  CREATE INDEX IF NOT EXISTS idx_memories_created ON memories(created_at);
`);

function seedSongs() {
  const insert = db.prepare(
    `INSERT INTO songs (title, artist, album, year, genres, youtube_id)
     VALUES (@title, @artist, @album, @year, @genres, @youtube_id)
     ON CONFLICT(youtube_id) DO UPDATE SET
       title = excluded.title,
       artist = excluded.artist,
       album = excluded.album,
       year = excluded.year,
       genres = excluded.genres`
  );
  const tx = db.transaction((rows) => {
    for (const row of rows) insert.run(row);
  });
  tx(catalog);
}

function seedMemories() {
  const count = db.prepare("SELECT COUNT(*) AS n FROM memories").get().n;
  if (count > 0) return;
  const insert = db.prepare("INSERT INTO memories (body, author, likes) VALUES (?, ?, ?)");
  insert.run(
    "Sunday ko subah jaldi uthkar TV par cartoons dekhna, phir Ramayan ka title music ghar mein ghoomna.",
    "Anonymous",
    128
  );
  insert.run(
    "Cassette dukan se naya album aaya hai, shopkeeper kehta — 'ek baar sun lo, lena hai to lena'.",
    "Ramesh, Kanpur",
    86
  );
  insert.run(
    "Pados wali auntie ke landline se STD, aur poori gali ko pata chal jaata tha ki kaun bola.",
    "Anonymous",
    64
  );
}

seedSongs();
seedMemories();

function mapSong(row) {
  return {
    ...row,
    genres: String(row.genres)
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean),
  };
}

module.exports = { db, mapSong };

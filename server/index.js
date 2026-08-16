const path = require("path");
const express = require("express");
const { db, mapSong } = require("./db");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "32kb" }));
app.use(express.static(path.join(__dirname, "..")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/songs", (req, res) => {
  const genre = String(req.query.genre || "").trim();
  const q = String(req.query.q || "")
    .trim()
    .toLowerCase();
  let rows = db.prepare("SELECT * FROM songs ORDER BY year ASC, title ASC").all();
  if (genre && genre !== "All") {
    rows = rows.filter((s) =>
      s.genres
        .split(",")
        .map((g) => g.trim())
        .includes(genre)
    );
  }
  if (q) {
    rows = rows.filter((s) => {
      const blob = `${s.title} ${s.artist} ${s.album || ""} ${s.year}`.toLowerCase();
      return blob.includes(q);
    });
  }
  res.json(rows.map(mapSong));
});

app.get("/api/songs/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM songs WHERE id = ?").get(Number(req.params.id));
  if (!row) return res.status(404).json({ error: "Song not found" });
  res.json(mapSong(row));
});

app.post("/api/songs/:id/play", (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare("UPDATE songs SET plays = plays + 1 WHERE id = ?").run(id);
  if (!info.changes) return res.status(404).json({ error: "Song not found" });
  const row = db.prepare("SELECT * FROM songs WHERE id = ?").get(id);
  res.json(mapSong(row));
});

app.get("/api/memories", (_req, res) => {
  const rows = db
    .prepare("SELECT * FROM memories ORDER BY datetime(created_at) DESC, id DESC")
    .all();
  res.json(rows);
});

app.post("/api/memories", (req, res) => {
  const body = String(req.body?.text || req.body?.body || "").trim();
  const author = String(req.body?.name || req.body?.author || "Anonymous").trim() || "Anonymous";
  if (body.length < 8) return res.status(400).json({ error: "Yaad thodi lambi likhiye." });
  if (body.length > 800) return res.status(400).json({ error: "Yaad bahut lambi ho gayi." });
  const info = db
    .prepare("INSERT INTO memories (body, author, likes) VALUES (?, ?, 1)")
    .run(body, author.slice(0, 80));
  const row = db.prepare("SELECT * FROM memories WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(row);
});

app.post("/api/memories/:id/relate", (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare("UPDATE memories SET likes = likes + 1 WHERE id = ?").run(id);
  if (!info.changes) return res.status(404).json({ error: "Not found" });
  const row = db.prepare("SELECT * FROM memories WHERE id = ?").get(id);
  res.json(row);
});

app.get("/api/stats", (_req, res) => {
  const songs = db.prepare("SELECT COUNT(*) AS n FROM songs").get().n;
  const plays = db.prepare("SELECT COALESCE(SUM(plays), 0) AS n FROM songs").get().n;
  const memories = db.prepare("SELECT COUNT(*) AS n FROM memories").get().n;
  res.json({ songs, plays, memories });
});

app.listen(PORT, () => {
  console.log(`90s Wala radio on http://localhost:${PORT}`);
});

const fs = require("fs");
const path = require("path");

const dbFile = path.join(__dirname, "..", "data", "wala.db");
if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);

require("./db");
console.log("Seeded data/wala.db");

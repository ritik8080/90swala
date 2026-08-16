const IMG = {
  hero: [
    "assets/hero-street.png",
    "../.cursor/projects/c-Users-HP-90s-wala/assets/hero-street.png",
    "C:/Users/HP/.cursor/projects/c-Users-HP-90s-wala/assets/hero-street.png",
  ],
  objects: [
    "assets/objects-still.png",
    "../.cursor/projects/c-Users-HP-90s-wala/assets/objects-still.png",
    "C:/Users/HP/.cursor/projects/c-Users-HP-90s-wala/assets/objects-still.png",
  ],
  bachpan: [
    "assets/bachpan.png",
    "../.cursor/projects/c-Users-HP-90s-wala/assets/bachpan.png",
    "C:/Users/HP/.cursor/projects/c-Users-HP-90s-wala/assets/bachpan.png",
  ],
  tv: [
    "assets/dd-tv.png",
    "../.cursor/projects/c-Users-HP-90s-wala/assets/dd-tv.png",
    "C:/Users/HP/.cursor/projects/c-Users-HP-90s-wala/assets/dd-tv.png",
  ],
};

function firstImage(paths, apply) {
  const tryAt = (i) => {
    if (i >= paths.length) return;
    const img = new Image();
    img.onload = () => apply(paths[i]);
    img.onerror = () => tryAt(i + 1);
    img.src = paths[i];
  };
  tryAt(0);
}

firstImage(IMG.hero, (src) => {
  document.querySelector(".hero").style.setProperty("--hero-image", `url("${src}")`);
});
firstImage(IMG.objects, (src) => {
  const el = document.getElementById("still-photo");
  if (el) el.src = src;
});
firstImage(IMG.bachpan, (src) => {
  document.querySelector(".story").style.setProperty("--bachpan-image", `url("${src}")`);
});
firstImage(IMG.tv, (src) => {
  document.querySelectorAll(".memory-card").forEach((card) => {
    if (!card.dataset.customBg) card.style.backgroundImage = `url("${src}")`;
  });
});

document.getElementById("enter").addEventListener("click", () => {
  document.getElementById("door").classList.add("is-open");
});

setTimeout(() => {
  document.getElementById("door").classList.add("is-open");
}, 4200);

window.initPlayer?.();

let online = 1284;
const onlineEl = document.getElementById("online-count");
setInterval(() => {
  online += Math.random() > 0.55 ? 1 : -1;
  online = Math.max(1200, Math.min(1800, online));
  onlineEl.textContent = online.toLocaleString("en-IN");
}, 2400);

/* TV memories */
const shows = [
  {
    name: "Shaktimaan",
    copy: "Sunday morning. Antenna adjust. Pandit Gangadhar Vidyadhar Mayanand Chaturvedi, and that feeling that good still wins.",
  },
  {
    name: "Shaka Laka Boom Boom",
    copy: "A magic pencil that could draw anything into life. Every child wanted one from the stationery shop.",
  },
  {
    name: "Malgudi Days",
    copy: "Swami, the railway station, and that title music. Quiet India, before everything became loud.",
  },
  {
    name: "Byomkesh Bakshi",
    copy: "Rajit Kapur, slow mysteries, and Doordarshan light. Detection without shouting.",
  },
  {
    name: "CID",
    copy: "ACP Pradyuman, Daya, and 'accha toh main chalta hoon'. Friday nights that belonged to crime and family tea.",
  },
  {
    name: "Alif Laila",
    copy: "The Arabian Nights on DD. Genies, palaces, and a title track that still sits in the throat.",
  },
];

const modal = document.getElementById("modal");
document.querySelectorAll(".memory-card").forEach((card, i) => {
  card.addEventListener("click", () => {
    const show = shows[i];
    document.getElementById("modal-title").textContent = show.name;
    document.getElementById("modal-copy").textContent = show.copy;
    firstImage(IMG.tv, (src) => {
      document.getElementById("modal-img").src = src;
    });
    modal.hidden = false;
  });
});
document.getElementById("close-modal").addEventListener("click", () => {
  modal.hidden = true;
});
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.hidden = true;
});

/* Bachpan */
const bachpan = {
  cricket:
    "Tennis ball, one broken wicket, neighbour's wall as boundary. 'Last ball six' was a constitutional right.",
  patang:
    "Rooftop, manjha, and the whole sky arguing. When your kite cut someone else's, the gali clapped.",
  lattu:
    "The string around the wooden top, the throw, the prayer that it would spin long enough to be king.",
  kancha:
    "Glass marbles in the dirt. One accurate shot and you were rich for the afternoon.",
  pakdam:
    "Ghar, duska, and running until the streetlights came on and Amma called from the balcony.",
  cycle:
    "Atlas or Hero, a friend on the rod, and the whole town feeling like it belonged to you.",
};

document.querySelectorAll(".game").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".game").forEach((b) => b.classList.toggle("is-on", b === btn));
    document.getElementById("story-title").textContent = btn.querySelector("strong").textContent;
    document.getElementById("story-copy").textContent = bachpan[btn.dataset.game];
  });
});

/* Quiz */
const quiz = [
  {
    q: "Cassette ko rewind karne ke liye sabse famous jugaad kya tha?",
    options: ["Pencil", "Remote", "Coin", "Scale"],
    a: 0,
  },
  {
    q: "Doordarshan par Sunday morning kaun sa superhero aata tha?",
    options: ["Shaktimaan", "Superman", "Hanuman (cartoon only)", "He-Man on DD daily"],
    a: 0,
  },
  {
    q: "Gully cricket mein last ball par sabse common maang kya thi?",
    options: ["Last ball six", "DRS lo", "Hawk-eye check", "Timeout"],
    a: 0,
  },
  {
    q: "Padosi se phone milane par pehle kya poochte the?",
    options: ["Aapke yahan se STD chala sakte hain?", "Wi-Fi password?", "Zoom link?", "AirDrop on hai?"],
    a: 0,
  },
  {
    q: "TV ki picture na aaye to pehla kaam?",
    options: ["Antenna ghumana", "Router restart", "App update", "HDMI cable"],
    a: 0,
  },
  {
    q: "School ke compass box mein zaroori cheez?",
    options: ["Divider aur ink eraser", "AirPods", "Smartwatch", "USB-C hub"],
    a: 0,
  },
  {
    q: "Video cassette shop par kaun si line sunai deti thi?",
    options: ["Kal tak wapas, fine lagenge", "Stream ho jayega", "4K HDR", "Skip intro"],
    a: 0,
  },
  {
    q: "Vividh Bharati ya radio raat ka feel kya tha?",
    options: ["Filmi geet aur presenter ki awaaz", "Playlist algorithm", "Live comments", "Spatial audio"],
    a: 0,
  },
  {
    q: "Kite flying ke season mein haath par kya nishaan hota tha?",
    options: ["Manjha ke cuts", "Screen-time rash", "Gym calluses", "Nothing"],
    a: 0,
  },
  {
    q: "90s Wala hone ka sabse bada proof?",
    options: ["DD, cassette, gali, aur patience", "Viral reel", "Same-day delivery", "OTP yaad rakhna"],
    a: 0,
  },
];

let qi = 0;
let score = 0;
let picked = null;

function renderQuiz() {
  const box = document.getElementById("quiz-play");
  const res = document.getElementById("quiz-result");
  if (qi >= quiz.length) {
    box.hidden = true;
    res.hidden = false;
    const pct = Math.round((score / quiz.length) * 100);
    document.getElementById("pct").textContent = `${pct}%`;
    document.getElementById("verdict").textContent =
      pct >= 80 ? "Aapne zamaana dekha hai!" : pct >= 50 ? "Yaad aa raha hai… thoda aur sochiye." : "Naya zamaana hai, par dil 90s ka rakh sakte ho.";
    return;
  }
  const item = quiz[qi];
  document.getElementById("q-num").textContent = `Question ${qi + 1}/${quiz.length}`;
  document.getElementById("q-text").textContent = item.q;
  document.getElementById("q-bar").style.width = `${((qi + 1) / quiz.length) * 100}%`;
  const opts = document.getElementById("q-opts");
  picked = null;
  opts.innerHTML = item.options
    .map((o, i) => `<button class="option" data-i="${i}">○ ${o}</button>`)
    .join("");
  opts.querySelectorAll(".option").forEach((btn) => {
    btn.addEventListener("click", () => {
      picked = Number(btn.dataset.i);
      opts.querySelectorAll(".option").forEach((b) => b.classList.remove("is-picked"));
      btn.classList.add("is-picked");
    });
  });
}

document.getElementById("q-next").addEventListener("click", () => {
  if (picked === null) return;
  const item = quiz[qi];
  const buttons = [...document.querySelectorAll("#q-opts .option")];
  buttons.forEach((b, i) => {
    if (i === item.a) b.classList.add("is-right");
    if (i === picked && picked !== item.a) b.classList.add("is-wrong");
  });
  if (picked === item.a) score += 1;
  setTimeout(() => {
    qi += 1;
    renderQuiz();
  }, 420);
});

document.getElementById("q-retry").addEventListener("click", () => {
  qi = 0;
  score = 0;
  document.getElementById("quiz-play").hidden = false;
  document.getElementById("quiz-result").hidden = true;
  renderQuiz();
});
renderQuiz();

/* Memories */
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

let yaadein = [];

function renderYaadein() {
  document.getElementById("feed").innerHTML = yaadein
    .map(
      (y) => `
      <article class="yaad">
        <blockquote>“${esc(y.body || y.text)}”</blockquote>
        <footer>
          <span>— ${esc(y.author || y.name || "Anonymous")}</span>
          <button class="relate" data-id="${y.id}">❤️ ${y.likes} people relate</button>
        </footer>
      </article>`
    )
    .join("");
  document.querySelectorAll(".relate").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const i = yaadein.findIndex((y) => y.id === Number(btn.dataset.id));
      if (i >= 0) {
        yaadein[i].likes = (yaadein[i].likes || 0) + 1;
        saveYaadein();
        renderYaadein();
      }
    });
  });
}

const defaultYaadein = [
  { id: 1, body: "Sunday ko subah jaldi uthkar TV par cartoons dekhna, phir Ramayan ka title music ghar mein ghoomna.", author: "Anonymous", likes: 128 },
  { id: 2, body: "Cassette dukan se naya album aaya hai, shopkeeper kehta — 'ek baar sun lo, lena hai to lena'.", author: "Ramesh, Kanpur", likes: 86 },
  { id: 3, body: "Pados wali auntie ke landline se STD, aur poori gali ko pata chal jaata tha ki kaun bola.", author: "Anonymous", likes: 64 }
];

function saveYaadein() {
  localStorage.setItem("90swala_yaadein", JSON.stringify(yaadein));
}

async function loadYaadein() {
  try {
    const stored = localStorage.getItem("90swala_yaadein");
    yaadein = stored ? JSON.parse(stored) : defaultYaadein;
  } catch {
    yaadein = defaultYaadein;
  }
  renderYaadein();
}

document.getElementById("yaad-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = document.getElementById("yaad-text").value.trim();
  if (!text) return;
  const name = document.getElementById("yaad-name").value.trim() || "Anonymous";
  const entry = {
    id: Date.now(),
    body: text,
    author: name,
    likes: 1
  };
  yaadein.unshift(entry);
  saveYaadein();
  e.target.reset();
  renderYaadein();
});
loadYaadein();

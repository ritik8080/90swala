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






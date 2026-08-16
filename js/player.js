const API = "/api";

// ------------------------------------------------------------
// External YouTube playlist source
// ------------------------------------------------------------
// The actual media is streamed by YouTube through the official
// IFrame Player API. 90s Wala does not store or serve MP3 files.
// ------------------------------------------------------------
const YOUTUBE_PLAYLIST_ID = "PLuRJywfkv_0ynoXKZEVJ5eBCfUzhMa5nt";
const USE_YOUTUBE_PLAYLIST = true;

const player = {
  songs: [],
  queue: [],
  index: 0,
  yt: null,
  ready: false,
  playing: false,
  shuffle: false,
  repeat: "off",
  filter: "All",
  query: "",
  timer: null,
  playlistIndex: -1,
};

function $(id) {
  return document.getElementById(id);
}

// API removed for static version

function loadYouTubeApi() {
  return new Promise((resolve) => {
    if (window.YT?.Player) return resolve();
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    if (!document.querySelector("script[src*='youtube.com/iframe_api']")) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
}

function current() {
  return player.queue[player.index] || null;
}

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function setPlayingUi(on) {
  player.playing = on;
  const playMain = $("play-main");
  if (playMain) playMain.textContent = on ? "❚❚" : "▶";
  const stickyPlay = $("sticky-play");
  if (stickyPlay) stickyPlay.textContent = on ? "❚❚" : "▶";
  
  const sticky = $("sticky-player");
  if (sticky) sticky.classList.toggle("is-show", Boolean(current()));

  document.querySelectorAll(".song").forEach((el) => {
    el.classList.toggle("is-playing", Number(el.dataset.id) === current()?.id);
  });
}

function paintNowPlaying(song) {
  if (!song) return;
  const npTitle = $("np-title");
  if (npTitle) npTitle.textContent = song.title;
  const npSub = $("np-sub");
  if (npSub) npSub.textContent = `${song.artist} · ${song.album} · ${song.year}`;
  $("sticky-title").textContent = song.title;
  $("sticky-sub").textContent = song.artist;
  $("thumb").src = `https://i.ytimg.com/vi/${song.youtube_id}/mqdefault.jpg`;
  $("thumb").alt = song.title;
}

function applyVolume() {
  const vol = $("vol");
  if (vol) {
    const v = Math.round(Number(vol.value) * 100);
    if (player.yt?.setVolume) player.yt.setVolume(v);
    const stickyVol = $("sticky-vol");
    if (stickyVol) stickyVol.value = vol.value;
  }
}

function tick() {
  if (!player.yt?.getDuration) return;
  const dur = player.yt.getDuration() || 0;
  const t = player.yt.getCurrentTime() || 0;
  
  const seek = $("seek");
  if (seek) {
    seek.max = String(dur);
    if (!seek.dataset.drag) seek.value = String(t);
  }
  const timeNow = $("time-now");
  if (timeNow) timeNow.textContent = formatTime(t);
  const timeEnd = $("time-end");
  if (timeEnd) timeEnd.textContent = formatTime(dur);
  
  const stickyProgressFill = $("sticky-progress-fill");
  if (stickyProgressFill && dur > 0) {
    stickyProgressFill.style.width = `${(t / dur) * 100}%`;
  }
  const stickyTimeNow = $("sticky-time-now");
  if (stickyTimeNow) stickyTimeNow.textContent = formatTime(t);
  const stickyTimeEnd = $("sticky-time-end");
  if (stickyTimeEnd) stickyTimeEnd.textContent = formatTime(dur);
}

async function recordPlay(id) {
  const i = player.songs.findIndex((s) => s.id === id);
  if (i >= 0) {
    player.songs[i].plays = (player.songs[i].plays || 0) + 1;
    const card = document.querySelector(`.song[data-id="${id}"] .plays`);
    if (card) card.textContent = `${player.songs[i].plays} plays`;
  }
}

function playIndex(i, { count = true } = {}) {
  if (!player.queue.length) return;
  player.index = (i + player.queue.length) % player.queue.length;
  const song = current();
  paintNowPlaying(song);
  setPlayingUi(true);
  if (USE_YOUTUBE_PLAYLIST && player.yt?.getPlaylist && player.yt?.playVideoAt) {
    const playlist = player.yt.getPlaylist?.() || [];
    const playlistIndex = playlist.indexOf(song.youtube_id);

    if (playlistIndex >= 0) {
      player.playlistIndex = playlistIndex;
      player.yt.playVideoAt(playlistIndex);
    } else if (player.yt?.loadVideoById) {
      // Fallback: the catalog video is not in the supplied playlist.
      player.yt.loadVideoById(song.youtube_id);
    }
  } else if (player.yt?.loadVideoById) {
    player.yt.loadVideoById(song.youtube_id);
  }
  if (count) recordPlay(song.id);
}

function nextTrack() {
  if (USE_YOUTUBE_PLAYLIST && player.ready) {
    if (player.repeat === "one") {
      player.yt?.seekTo?.(0, true);
      player.yt?.playVideo?.();
      return;
    }

    // YouTube advances inside the external playlist. The backend
    // never downloads, stores, or streams the song itself.
    player.yt?.nextVideo?.();
    return;
  }

  if (player.repeat === "one") {
    playIndex(player.index);
    return;
  }
  if (player.shuffle) {
    let n = player.index;
    if (player.queue.length > 1) {
      while (n === player.index) n = Math.floor(Math.random() * player.queue.length);
    }
    playIndex(n);
    return;
  }
  if (player.index + 1 >= player.queue.length) {
    if (player.repeat === "all") playIndex(0);
    else {
      player.yt?.stopVideo?.();
      setPlayingUi(false);
    }
    return;
  }
  playIndex(player.index + 1);
}

function prevTrack() {
  const t = player.yt?.getCurrentTime?.() || 0;
  if (t > 3) {
    player.yt.seekTo(0, true);
    return;
  }

  if (USE_YOUTUBE_PLAYLIST && player.ready) {
    player.yt?.previousVideo?.();
    return;
  }

  playIndex(player.index - 1);
}

function togglePlay() {
  if (!player.ready) return;
  if (!current()) {
    rebuildQueue();
    playIndex(0);
    return;
  }
  if (player.playing) {
    player.yt.pauseVideo();
    setPlayingUi(false);
  } else {
    player.yt.playVideo();
    setPlayingUi(true);
  }
}

function rebuildQueue() {
  const playingId = current()?.id;
  player.queue = player.songs.filter((s) => {
    const genreOk = player.filter === "All" || s.genres.includes(player.filter);
    const q = player.query.trim().toLowerCase();
    const textOk =
      !q ||
      `${s.title} ${s.artist} ${s.album} ${s.year}`.toLowerCase().includes(q);
    return genreOk && textOk;
  });
  const keep = player.queue.findIndex((s) => s.id === playingId);
  player.index = keep >= 0 ? keep : 0;
  renderSongs();
}

function renderSongs() {
  const root = $("songs");
  if (!player.queue.length) {
    root.innerHTML = `<p class="empty">Is filter mein cassette nahi mili. Koi aur dhun try kariye.</p>`;
    return;
  }
  root.innerHTML = player.queue
    .map(
      (s) => `
      <article class="song ${current()?.id === s.id ? "is-playing" : ""}" data-id="${s.id}">
        <button type="button" class="cassette-btn" data-play="${s.id}" aria-label="Play ${s.title}">
          <img src="https://i.ytimg.com/vi/${s.youtube_id}/mqdefault.jpg" alt="" />
          <span>SIDE A</span>
        </button>
        <h3>${s.title}</h3>
        <p>${s.artist}</p>
        <p class="meta">${s.album} · ${s.year}</p>
        <p class="plays">${s.plays || 0} plays</p>
        <button class="play-mini" data-play="${s.id}" type="button">▶ Suno</button>
      </article>`
    )
    .join("");
  root.querySelectorAll("[data-play]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.play);
      const i = player.queue.findIndex((s) => s.id === id);
      if (i >= 0) playIndex(i);
    });
  });
}

function syncPlaylistSong() {
  if (!USE_YOUTUBE_PLAYLIST || !player.yt?.getPlaylistIndex) return;

  const playlistIndex = player.yt.getPlaylistIndex();
  if (!Number.isInteger(playlistIndex) || playlistIndex < 0) return;

  player.playlistIndex = playlistIndex;

  const videoId = player.yt.getVideoData?.()?.video_id;
  const catalogSong = player.songs.find((s) => s.youtube_id === videoId);

  if (catalogSong) {
    const qIndex = player.queue.findIndex((s) => s.id === catalogSong.id);
    if (qIndex >= 0) player.index = qIndex;
    paintNowPlaying(catalogSong);
  } else {
    const data = player.yt.getVideoData?.() || {};
    if (data.title) {
      const npTitle = $("np-title");
      if (npTitle) npTitle.textContent = data.title;
      const npSub = $("np-sub");
      if (npSub) npSub.textContent = "YouTube playlist";
      $("sticky-title").textContent = data.title;
      $("sticky-sub").textContent = "YouTube playlist";
      $("thumb").src = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
      $("thumb").alt = data.title;
    }
  }
}

function onPlayerState(e) {
  const YT = window.YT;
  if (e.data === YT.PlayerState.PLAYING) {
    syncPlaylistSong();
    setPlayingUi(true);
    applyVolume();
  } else if (e.data === YT.PlayerState.PAUSED) {
    setPlayingUi(false);
  } else if (e.data === YT.PlayerState.ENDED) {
    nextTrack();
  }
}

function onPlayerError() {
  nextTrack();
}

async function initPlayer() {
  const status = $("radio-status");
  
  player.songs = window.CATALOG || [];
  status.hidden = false;
  status.textContent =
    "🎵 Audio source: YouTube playlist · Local static version.";
  setTimeout(() => {
    status.hidden = true;
  }, 3500);

  rebuildQueue();
  if (player.queue[0]) paintNowPlaying(player.queue[0]);

  await loadYouTubeApi();
  player.yt = new window.YT.Player("yt-player", {
    height: "180",
    width: "320",
    playerVars: {
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
      origin: location.origin,
      enablejsapi: 1,
      ...(USE_YOUTUBE_PLAYLIST
        ? {
            listType: "playlist",
            list: YOUTUBE_PLAYLIST_ID,
          }
        : {}),
    },
    events: {
      onReady: () => {
        player.ready = true;
        applyVolume();

        if (USE_YOUTUBE_PLAYLIST) {
          // Cue the playlist; do not autoplay when the page opens.
          player.yt.cuePlaylist({
            listType: "playlist",
            list: YOUTUBE_PLAYLIST_ID,
            index: 0,
            startSeconds: 0,
          });
        }

        player.timer = setInterval(tick, 400);
      },
      onStateChange: onPlayerState,
      onError: onPlayerError,
    },
  });

  $("play-main")?.addEventListener("click", togglePlay);
  $("sticky-play")?.addEventListener("click", togglePlay);
  $("pause-main")?.addEventListener("click", () => {
    player.yt?.pauseVideo?.();
    setPlayingUi(false);
  });
  $("prev")?.addEventListener("click", prevTrack);
  $("next")?.addEventListener("click", nextTrack);
  $("sticky-prev")?.addEventListener("click", prevTrack);
  $("sticky-next")?.addEventListener("click", nextTrack);
  $("suno")?.addEventListener("click", () => {
    $("music").scrollIntoView({ behavior: "smooth" });
    if (!player.playing) togglePlay();
  });
  $("vol")?.addEventListener("input", applyVolume);
  const stickyVol = $("sticky-vol");
  if (stickyVol) {
    stickyVol.addEventListener("input", () => {
      const vol = $("vol");
      if (vol) vol.value = stickyVol.value;
      applyVolume();
    });
  }
  $("seek")?.addEventListener("pointerdown", () => {
    const seek = $("seek");
    if (seek) seek.dataset.drag = "1";
  });
  $("seek")?.addEventListener("pointerup", () => {
    const seek = $("seek");
    if (seek) {
      player.yt?.seekTo(Number(seek.value), true);
      delete seek.dataset.drag;
    }
  });

  $("shuffle")?.addEventListener("click", () => {
    player.shuffle = !player.shuffle;
    const shuffleBtn = $("shuffle");
    if (shuffleBtn) shuffleBtn.classList.toggle("is-on", player.shuffle);
    if (USE_YOUTUBE_PLAYLIST) {
      player.yt?.setShuffle?.(player.shuffle);
    }
  });
  $("repeat")?.addEventListener("click", () => {
    player.repeat = player.repeat === "off" ? "all" : player.repeat === "all" ? "one" : "off";
    const repeatBtn = $("repeat");
    if (repeatBtn) {
      repeatBtn.textContent = player.repeat === "one" ? "🔂" : "🔁";
      repeatBtn.classList.toggle("is-on", player.repeat !== "off");
    }
    if (USE_YOUTUBE_PLAYLIST) {
      player.yt?.setLoop?.(player.repeat === "all");
    }
  });
  $("song-search").addEventListener("input", (e) => {
    player.query = e.target.value;
    rebuildQueue();
  });
  document.querySelectorAll(".filters .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      player.filter = chip.dataset.filter;
      document.querySelectorAll(".filters .chip").forEach((c) => c.classList.toggle("is-on", c === chip));
      rebuildQueue();
    });
  });

  const hero = document.querySelector(".hero");
  const sticky = $("sticky-player");
  const io = new IntersectionObserver(
    ([entry]) => {
      // We removed the main player, so the sticky player is the primary UI.
      // We still want it to pop up once a song starts playing.
      // But we can just use the play state to show it.
      if (sticky) sticky.classList.toggle("is-show", Boolean(current()));
    },
    { threshold: 0.15 }
  );
  io.observe(hero);
  
  // Also make sure it shows immediately when a song is selected, 
  // we can hook into paintNowPlaying or playIndex, but checking 
  // periodically or relying on state change is safer for now.
  // We'll just patch the setPlayingUi function to ensure it shows.
}

window.initPlayer = initPlayer;

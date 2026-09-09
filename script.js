// ===============================
// SUPABASE CONFIG
// ===============================

const SUPABASE_URL = "https://llswlksrjzccdsfohjvz.supabase.co";
const SUPABASE_KEY = "sb_publishable_Ry4sHb_5RbWtA1E6l01uBg_3QCkADsK";

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);


// ===============================
// MUSIC PLAYER
// ===============================

const audio = document.getElementById("audio");
const songList = document.getElementById("songList");

const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const currentTitle = document.getElementById("currentTitle");
const currentArtist = document.getElementById("currentArtist");

const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");
const progress = document.getElementById("progress");

const volume = document.getElementById("volume");
const searchInput = document.getElementById("searchInput");

let songs = [];
let currentIndex = -1;


// ===============================
// LOAD SONGS FROM SUPABASE
// ===============================

async function loadSongs() {

    const { data, error } = await db
        .storage
        .from("music")
        .list("", {
            limit: 100,
            sortBy: {
                column: "name",
                order: "asc"
            }
        });

    if (error) {
        console.error("Error loading songs:", error);
        songList.innerHTML = `
            <div class="empty">
                <div>⚠️</div>
                <p>Could not load music</p>
                <small>${error.message}</small>
            </div>
        `;
        return;
    }

    songs = data.filter(file =>
        file.name.toLowerCase().endsWith(".mp3")
    );

    displaySongs(songs);
}


// ===============================
// DISPLAY SONGS
// ===============================

function displaySongs(list) {

    if (list.length === 0) {
        songList.innerHTML = `
            <div class="empty">
                <div>🎧</div>
                <p>No music added yet</p>
                <small>Upload an MP3 to your Supabase bucket</small>
            </div>
        `;
        return;
    }

    songList.innerHTML = "";

    list.forEach((song, index) => {

        const item = document.createElement("div");

        item.className = "song";

        item.innerHTML = `
            <div class="song-cover">🎵</div>

            <div class="song-details">
                <strong>${song.name.replace(".mp3", "")}</strong>
                <span>My Music</span>
            </div>

            <button class="song-play">▶</button>
        `;

        item.querySelector(".song-play").addEventListener("click", () => {
            playSong(index);
        });

        songList.appendChild(item);
    });
}


// ===============================
// PLAY SONG
// ===============================

function playSong(index) {

    if (!songs[index]) return;

    currentIndex = index;

    const song = songs[index];

    const { data } = db
        .storage
        .from("music")
        .getPublicUrl(song.name);

    audio.src = data.publicUrl;
    console.log("MP3 URL:", data.publicUrl);

    currentTitle.textContent =
        song.name.replace(".mp3", "");

    currentArtist.textContent = "My Music";

    audio.play();

    playBtn.textContent = "⏸";
}


// ===============================
// PLAY / PAUSE
// ===============================

playBtn.addEventListener("click", () => {

    if (!audio.src) {
        if (songs.length > 0) {
            playSong(0);
        }
        return;
    }

    if (audio.paused) {
        audio.play();
        playBtn.textContent = "⏸";
    } else {
        audio.pause();
        playBtn.textContent = "▶";
    }
});


// ===============================
// NEXT
// ===============================

nextBtn.addEventListener("click", () => {

    if (songs.length === 0) return;

    currentIndex++;

    if (currentIndex >= songs.length) {
        currentIndex = 0;
    }

    playSong(currentIndex);
});


// ===============================
// PREVIOUS
// ===============================

prevBtn.addEventListener("click", () => {

    if (songs.length === 0) return;

    currentIndex--;

    if (currentIndex < 0) {
        currentIndex = songs.length - 1;
    }

    playSong(currentIndex);
});


// ===============================
// AUTO NEXT
// ===============================

audio.addEventListener("ended", () => {

    currentIndex++;

    if (currentIndex >= songs.length) {
        currentIndex = 0;
    }

    playSong(currentIndex);
});


// ===============================
// PROGRESS BAR
// ===============================

audio.addEventListener("timeupdate", () => {

    if (!audio.duration) return;

    progress.value =
        (audio.currentTime / audio.duration) * 100;

    currentTime.textContent =
        formatTime(audio.currentTime);

    duration.textContent =
        formatTime(audio.duration);
});


progress.addEventListener("input", () => {

    if (!audio.duration) return;

    audio.currentTime =
        (progress.value / 100) * audio.duration;
});


// ===============================
// VOLUME
// ===============================

volume.addEventListener("input", () => {
    audio.volume = volume.value;
});

audio.volume = 0.8;


// ===============================
// SEARCH
// ===============================

searchInput.addEventListener("input", () => {

    const search = searchInput.value.toLowerCase();

    const filtered = songs.filter(song =>
        song.name.toLowerCase().includes(search)
    );

    displaySongs(filtered);
});


// ===============================
// TIME FORMAT
// ===============================

function formatTime(seconds) {

    if (isNaN(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);

    const secs = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");

    return `${minutes}:${secs}`;
}


// ===============================
// START
// ===============================

loadSongs();

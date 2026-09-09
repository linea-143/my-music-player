// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL = "https://llswlksrjzccdsfohjvz.supabase.co";
const SUPABASE_KEY = "sb_publishable_Ry4sHb_5RbWtA1E6l01uBg_3QCkADsK";

const { createClient } = supabase;

const db = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==========================================
// ELEMENTS
// ==========================================

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


// ==========================================
// VARIABLES
// ==========================================

let songs = [];
let currentIndex = -1;


// ==========================================
// LOAD SONGS
// ==========================================

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

        console.error(error);

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


// ==========================================
// DISPLAY SONGS
// ==========================================

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

    list.forEach(song => {

        const index = songs.indexOf(song);

        const item = document.createElement("div");

        item.className = "song";

        item.innerHTML = `
            <div class="song-cover">🎵</div>

            <div class="song-details">
                <strong>
                    ${song.name.replace(/\.mp3$/i, "")}
                </strong>

                <span>My Music</span>
            </div>

            <button class="song-play">▶</button>
        `;

        item.querySelector(".song-play")
            .addEventListener("click", () => {
                playSong(index);
            });

        songList.appendChild(item);
    });
}


// ==========================================
// PLAY SONG
// ==========================================

async function playSong(index) {

    if (!songs[index]) return;

    currentIndex = index;

    const song = songs[index];

    currentTitle.textContent =
        song.name.replace(/\.mp3$/i, "");

    currentArtist.textContent =
        "Loading...";


    // EXACT PUBLIC SUPABASE URL
    const audioUrl =
        SUPABASE_URL +
        "/storage/v1/object/public/music/" +
        encodeURIComponent(song.name);


    console.log("Audio URL:", audioUrl);


    // Stop previous song
    audio.pause();

    // Set new source
    audio.src = audioUrl;

    // Reset player
    audio.currentTime = 0;

    // Load new MP3
    audio.load();


    try {

        await audio.play();

        playBtn.textContent = "⏸";

        currentArtist.textContent = "My Music";

    } catch (error) {

        console.error(
            "PLAY ERROR:",
            error
        );

        currentArtist.textContent =
            "Playback error";

    }
}


// ==========================================
// PLAY / PAUSE
// ==========================================

playBtn.addEventListener("click", async () => {

    if (!audio.src) {

        if (songs.length > 0) {
            await playSong(0);
        }

        return;
    }


    if (audio.paused) {

        try {

            await audio.play();

            playBtn.textContent = "⏸";

        } catch (error) {

            console.error(error);

        }

    } else {

        audio.pause();

        playBtn.textContent = "▶";
    }

});


// ==========================================
// NEXT
// ==========================================

nextBtn.addEventListener("click", () => {

    if (songs.length === 0) return;

    currentIndex++;

    if (currentIndex >= songs.length) {
        currentIndex = 0;
    }

    playSong(currentIndex);
});


// ==========================================
// PREVIOUS
// ==========================================

prevBtn.addEventListener("click", () => {

    if (songs.length === 0) return;

    currentIndex--;

    if (currentIndex < 0) {
        currentIndex = songs.length - 1;
    }

    playSong(currentIndex);
});


// ==========================================
// AUTO NEXT
// ==========================================

audio.addEventListener("ended", () => {

    if (songs.length === 0) return;

    currentIndex++;

    if (currentIndex >= songs.length) {
        currentIndex = 0;
    }

    playSong(currentIndex);
});


// ==========================================
// AUDIO LOADED
// ==========================================

audio.addEventListener("loadedmetadata", () => {

    console.log(
        "Duration:",
        audio.duration
    );

    duration.textContent =
        formatTime(audio.duration);
});


audio.addEventListener("canplay", () => {

    console.log("Audio can play!");

    currentArtist.textContent =
        "My Music";
});


audio.addEventListener("error", () => {

    console.error(
        "AUDIO ERROR:",
        audio.error
    );

    currentArtist.textContent =
        "Audio loading failed";

});


// ==========================================
// PROGRESS
// ==========================================

audio.addEventListener("timeupdate", () => {

    if (!isFinite(audio.duration)) return;

    progress.value =
        (audio.currentTime / audio.duration) * 100;

    currentTime.textContent =
        formatTime(audio.currentTime);

    duration.textContent =
        formatTime(audio.duration);
});


progress.addEventListener("input", () => {

    if (!isFinite(audio.duration)) return;

    audio.currentTime =
        (progress.value / 100) * audio.duration;
});


// ==========================================
// VOLUME
// ==========================================

audio.volume = 0.8;

volume.addEventListener("input", () => {

    audio.volume = volume.value;

});


// ==========================================
// SEARCH
// ==========================================

searchInput.addEventListener("input", () => {

    const search =
        searchInput.value.toLowerCase();

    const filtered = songs.filter(song =>
        song.name.toLowerCase().includes(search)
    );

    displaySongs(filtered);
});


// ==========================================
// TIME FORMAT
// ==========================================

function formatTime(seconds) {

    if (
        !isFinite(seconds) ||
        isNaN(seconds)
    ) {
        return "0:00";
    }

    const minutes =
        Math.floor(seconds / 60);

    const secondsPart =
        Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");

    return `${minutes}:${secondsPart}`;
}


// ==========================================
// START
// ==========================================

loadSongs();

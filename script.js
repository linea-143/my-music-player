const audio = document.getElementById("audio");

const musicInput = document.getElementById("musicInput");
const songList = document.getElementById("songList");

const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");

const progress = document.getElementById("progress");
const volume = document.getElementById("volume");

const currentTitle = document.getElementById("currentTitle");
const currentArtist = document.getElementById("currentArtist");

const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

const searchInput = document.getElementById("searchInput");

let songs = [];
let currentIndex = -1;

let shuffle = false;
let repeat = false;


/* ADD MUSIC */

musicInput.addEventListener("change", function () {

    const files = Array.from(this.files);

    files.forEach(file => {

        songs.push({
            name: file.name.replace(/\.[^/.]+$/, ""),
            artist: "My Music",
            file: file
        });

    });

    renderSongs();

    if (currentIndex === -1 && songs.length > 0) {
        loadSong(0);
    }

});


/* DISPLAY SONGS */

function renderSongs(filter = "") {

    songList.innerHTML = "";

    const filteredSongs = songs.filter(song =>
        song.name.toLowerCase().includes(filter.toLowerCase())
    );

    if (filteredSongs.length === 0) {

        songList.innerHTML = `
            <div class="empty">
                <div>🎧</div>
                <p>No songs found</p>
            </div>
        `;

        return;
    }

    filteredSongs.forEach(song => {

        const index = songs.indexOf(song);

        const div = document.createElement("div");

        div.className = "song";

        div.innerHTML = `
            <div class="song-number">${index + 1}</div>

            <div class="song-cover">
                🎵
            </div>

            <div class="song-details">
                <div class="song-title">${escapeHTML(song.name)}</div>
                <div class="song-artist">${song.artist}</div>
            </div>

            <button class="favorite">
                ♡
            </button>
        `;

        div.addEventListener("click", function (event) {

            if (event.target.classList.contains("favorite")) {
                return;
            }

            loadSong(index);
            playSong();

        });

        songList.appendChild(div);

    });

}


/* LOAD SONG */

function loadSong(index) {

    if (!songs[index]) return;

    currentIndex = index;

    const song = songs[index];

    audio.src = URL.createObjectURL(song.file);

    currentTitle.textContent = song.name;
    currentArtist.textContent = song.artist;

}


/* PLAY */

function playSong() {

    if (currentIndex === -1 && songs.length > 0) {
        loadSong(0);
    }

    if (audio.src) {
        audio.play();
    }

}


/* PAUSE */

function pauseSong() {

    audio.pause();

}


/* PLAY BUTTON */

playBtn.addEventListener("click", function () {

    if (audio.paused) {

        playSong();

        playBtn.textContent = "Ⅱ";

    } else {

        pauseSong();

        playBtn.textContent = "▶";

    }

});


/* WHEN SONG PLAYS */

audio.addEventListener("play", function () {

    playBtn.textContent = "Ⅱ";

});


/* WHEN SONG PAUSES */

audio.addEventListener("pause", function () {

    playBtn.textContent = "▶";

});


/* NEXT */

nextBtn.addEventListener("click", nextSong);

function nextSong() {

    if (songs.length === 0) return;

    let nextIndex;

    if (shuffle) {

        nextIndex = Math.floor(Math.random() * songs.length);

    } else {

        nextIndex = currentIndex + 1;

        if (nextIndex >= songs.length) {
            nextIndex = 0;
        }

    }

    loadSong(nextIndex);

    playSong();

}


/* PREVIOUS */

prevBtn.addEventListener("click", function () {

    if (songs.length === 0) return;

    let previousIndex = currentIndex - 1;

    if (previousIndex < 0) {
        previousIndex = songs.length - 1;
    }

    loadSong(previousIndex);

    playSong();

});


/* AUTO NEXT */

audio.addEventListener("ended", function () {

    if (repeat) {

        audio.currentTime = 0;

        playSong();

    } else {

        nextSong();

    }

});


/* SHUFFLE */

shuffleBtn.addEventListener("click", function () {

    shuffle = !shuffle;

    shuffleBtn.style.opacity = shuffle ? "1" : "0.5";

});


/* REPEAT */

repeatBtn.addEventListener("click", function () {

    repeat = !repeat;

    repeatBtn.style.opacity = repeat ? "1" : "0.5";

});


/* PROGRESS */

audio.addEventListener("timeupdate", function () {

    if (!audio.duration) return;

    const percentage =
        (audio.currentTime / audio.duration) * 100;

    progress.value = percentage;

    currentTime.textContent =
        formatTime(audio.currentTime);

    duration.textContent =
        formatTime(audio.duration);

});


/* SEEK */

progress.addEventListener("input", function () {

    if (!audio.duration) return;

    audio.currentTime =
        (progress.value / 100) * audio.duration;

});


/* VOLUME */

volume.addEventListener("input", function () {

    audio.volume = volume.value;

});


/* SEARCH */

searchInput.addEventListener("input", function () {

    renderSongs(this.value);

});


/* FORMAT TIME */

function formatTime(seconds) {

    if (isNaN(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);

    const secs = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");

    return `${minutes}:${secs}`;

}


/* SECURITY */

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* DEFAULT VOLUME */

audio.volume = 0.8;

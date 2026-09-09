// ==========================================
// SUPABASE CONFIGURATION
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

const currentTitle =
    document.getElementById("currentTitle");

const currentArtist =
    document.getElementById("currentArtist");

const currentTime =
    document.getElementById("currentTime");

const duration =
    document.getElementById("duration");

const progress =
    document.getElementById("progress");

const volume =
    document.getElementById("volume");

const searchInput =
    document.getElementById("searchInput");


// ==========================================
// VARIABLES
// ==========================================

let songs = [];

let currentIndex = -1;


// ==========================================
// LOAD SONGS FROM SUPABASE
// ==========================================

async function loadSongs() {

    console.log("Loading songs...");

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

        console.error(
            "Error loading songs:",
            error
        );

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
        file.name
            .toLowerCase()
            .endsWith(".mp3")
    );


    console.log("Songs found:", songs);


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
                <small>
                    Upload an MP3 to your Supabase bucket
                </small>
            </div>
        `;

        return;
    }


    songList.innerHTML = "";


    list.forEach((song) => {

        const originalIndex =
            songs.indexOf(song);


        const item =
            document.createElement("div");


        item.className = "song";


        item.innerHTML = `
            <div class="song-cover">
                🎵
            </div>

            <div class="song-details">

                <strong>
                    ${song.name.replace(/\.mp3$/i, "")}
                </strong>

                <span>
                    My Music
                </span>

            </div>

            <button class="song-play">
                ▶
            </button>
        `;


        const button =
            item.querySelector(".song-play");


        button.addEventListener(
            "click",
            () => {

                playSong(originalIndex);

            }
        );


        songList.appendChild(item);

    });
}


// ==========================================
// PLAY SONG
// ==========================================

async function playSong(index) {

    if (!songs[index]) {

        console.error("Song not found");

        return;
    }


    currentIndex = index;


    const song = songs[index];


    console.log(
        "Trying to play:",
        song.name
    );


    // --------------------------------------
    // CREATE SIGNED URL
    // --------------------------------------

    const { data, error } = await db
        .storage
        .from("music")
        .createSignedUrl(
            song.name,
            3600
        );


    if (error) {

        console.error(
            "Signed URL error:",
            error
        );

        alert(
            "Could not load song:\n" +
            error.message
        );

        return;
    }


    console.log(
        "Audio URL:",
        data.signedUrl
    );


    // --------------------------------------
    // SET AUDIO
    // --------------------------------------

    audio.src =
        data.signedUrl;


    audio.load();


    currentTitle.textContent =
        song.name.replace(/\.mp3$/i, "");


    currentArtist.textContent =
        "My Music";


    // --------------------------------------
    // PLAY
    // --------------------------------------

    try {

        await audio.play();

        playBtn.textContent = "⏸";

    }

    catch (error) {

        console.error(
            "Playback error:",
            error
        );

        alert(
            "Could not play the song."
        );

    }

}


// ==========================================
// PLAY / PAUSE
// ==========================================

playBtn.addEventListener(
    "click",
    async () => {

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

            }

            catch (error) {

                console.error(
                    "Play error:",
                    error
                );

            }

        }

        else {

            audio.pause();

            playBtn.textContent = "▶";

        }

    }
);


// ==========================================
// NEXT SONG
// ==========================================

nextBtn.addEventListener(
    "click",
    () => {

        if (songs.length === 0) return;


        currentIndex++;


        if (
            currentIndex >=
            songs.length
        ) {

            currentIndex = 0;

        }


        playSong(currentIndex);

    }
);


// ==========================================
// PREVIOUS SONG
// ==========================================

prevBtn.addEventListener(
    "click",
    () => {

        if (songs.length === 0) return;


        currentIndex--;


        if (currentIndex < 0) {

            currentIndex =
                songs.length - 1;

        }


        playSong(currentIndex);

    }
);


// ==========================================
// AUTOMATICALLY PLAY NEXT
// ==========================================

audio.addEventListener(
    "ended",
    () => {

        if (songs.length === 0) return;


        currentIndex++;


        if (
            currentIndex >=
            songs.length
        ) {

            currentIndex = 0;

        }


        playSong(currentIndex);

    }
);


// ==========================================
// AUDIO LOADING
// ==========================================

audio.addEventListener(
    "loadedmetadata",
    () => {

        console.log(
            "Audio duration:",
            audio.duration
        );


        duration.textContent =
            formatTime(audio.duration);

    }
);


// ==========================================
// AUDIO ERROR
// ==========================================

audio.addEventListener(
    "error",
    () => {

        console.error(
            "Audio element error:",
            audio.error
        );

    }
);


// ==========================================
// PROGRESS
// ==========================================

audio.addEventListener(
    "timeupdate",
    () => {

        if (!audio.duration) return;


        progress.value =
            (
                audio.currentTime /
                audio.duration
            ) * 100;


        currentTime.textContent =
            formatTime(
                audio.currentTime
            );


        duration.textContent =
            formatTime(
                audio.duration
            );

    }
);


// ==========================================
// SEEK
// ==========================================

progress.addEventListener(
    "input",
    () => {

        if (!audio.duration) return;


        audio.currentTime =
            (
                progress.value / 100
            ) * audio.duration;

    }
);


// ==========================================
// VOLUME
// ==========================================

volume.addEventListener(
    "input",
    () => {

        audio.volume =
            volume.value;

    }
);


audio.volume = 0.8;


// ==========================================
// SEARCH
// ==========================================

searchInput.addEventListener(
    "input",
    () => {

        const search =
            searchInput.value
                .toLowerCase();


        const filtered =
            songs.filter(song =>
                song.name
                    .toLowerCase()
                    .includes(search)
            );


        displaySongs(filtered);

    }
);


// ==========================================
// FORMAT TIME
// ==========================================

function formatTime(seconds) {

    if (
        isNaN(seconds) ||
        !isFinite(seconds)
    ) {

        return "0:00";

    }


    const minutes =
        Math.floor(seconds / 60);


    const secondsPart =
        Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");


    return (
        minutes +
        ":" +
        secondsPart
    );

}


// ==========================================
// START MUSIC PLAYER
// ==========================================

loadSongs();

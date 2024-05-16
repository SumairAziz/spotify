console.log('Lets write script');
let currentSong = new Audio();
let song;
let songs;
let currentFolder;
let currentSongIndex; // Declare currentSongIndex globally

let url;

//Fetching songs and doing some foundational work
async function getSong(folder) {
    currentFolder = folder;
    url = `http://127.0.0.1:5500/music/${folder}/`
    let x = await fetch(url);
    let response = await x.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = [];
    for (let i = 0; i < as.length; i++) {
        let element = as[i];
        if (element.href.endsWith(".mp3")) {
            let songName = element.href.split(`/${folder}/`)[1].replaceAll("%20", " ").replaceAll(".mp3", "");
            songs.push(songName);
        }
    }
    //Writing song names in the html using javascript
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li>
            <img class="invert" width="34" src="music.svg" alt="">
            <div class="info">
                <div>${song}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="hover playbtn"src="play.svg" alt="">
            </div></li>`;
    }
    //Adding event listener to play button in library and also providing audio track to playmusic function
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.querySelectorAll(".playbtn").forEach(playbtn => {
            playbtn.addEventListener("click", () => {
                playMusic(e.querySelector(".info").firstElementChild.innerHTML)
                // playbtn.src = "pause.svg";
            });
        })
    })

    return songs;
};



async function main() {
    //Fetching songs
    songs = await getSong("ncs");

    //Initializing currentSongIndex
    currentSongIndex = getNum();

    //Play the default song
    // playSongAtIndex(currentSongIndex);
    currentSong.src = url + songs[currentSongIndex] + ".mp3";
    document.querySelector(".songInfo").innerHTML = songs[currentSongIndex];
    document.querySelector(".songDuration").innerHTML = "00:00/00:00";
    console.log(songs[currentSongIndex]);

    //Play button characteristics in playbar
    play.addEventListener("click", () => {
        togglePlayPause();
    });

    // Add an event listener for next and previous song buttons
    previous.addEventListener("click", () => {
        playPreviousSong();
    });

    next.addEventListener("click", () => {
        playNextSong();
    });

    //Time conversion to min:sec
    function formatTime(timeInSeconds) {
        if (isNaN(timeInSeconds) || timeInSeconds < 0) {
            return "00:00"
        }
        let minutes = Math.floor(timeInSeconds / 60);
        let seconds = Math.floor(timeInSeconds % 60);
        seconds = seconds < 10 ? '0' + seconds : seconds;
        return minutes + ':' + seconds;
    }
    //Updating time function
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songDuration").innerHTML = formatTime(currentSong.currentTime) + "/" + formatTime(currentSong.duration);
        let a = currentSong.currentTime * 100 / currentSong.duration;
        let circle = document.querySelector(".circle");
        circle.style.left = a + "%";
    })
    document.querySelector(".seekbar").addEventListener("click", e => {
        // console.log(e.target.getBoundingClientRect().width,e.offsetX);
        let a = e.offsetX / e.target.getBoundingClientRect().width * 100;
        let circle = document.querySelector(".circle");
        circle.style.left = a + "%";
        currentSong.currentTime = a * currentSong.duration / 100;
    })

    const volumeControl = document.getElementById("volume-control");
    const volumeIcon = document.getElementById("Volume");
    const volumeup = document.getElementById("volumeup");
    // volumeControl.value = currentSong.volume;
    volumeControl.value = 0.2;
    currentSong.volume = parseFloat(volumeControl.value);

    volumeControl.addEventListener("input", () => {
        const volume = parseFloat(volumeControl.value);
        currentSong.volume = volume;
        updateIcon(currentSong.volume);
    })
    function updateIcon(audio) {
        if (audio == 0) {
            volumeIcon.src = "mute.svg";
        } else if (audio > 0 && audio < 0.55) {
            volumeIcon.src = "vollow.svg";
        } else if (audio > 0.55) {
            volumeIcon.src = "volhigh.svg";
        }
    }
    volumeup.addEventListener("click", () => {
        if (parseFloat(currentSong.volume) + 0.05 <= 1) {
            currentSong.volume = parseFloat(currentSong.volume) + 0.05;
            volumeControl.value = parseFloat(currentSong.volume);
            updateIcon(currentSong.volume);
        } else {
            currentSong.volume = 1;
            volumeControl.value = 1;
        }
    });
    volumeIcon.addEventListener("click", () => {
        if (volumeIcon.src.endsWith("volhigh.svg")) {
            volumeIcon.src = "mute.svg";
            currentSong.volume = 0;
            volumeControl.value = 0;
        } else if (volumeIcon.src.endsWith("mute.svg")) {
            volumeIcon.src = "volhigh.svg";
            currentSong.volume = 0.8;
            volumeControl.value = 0.8;
        }
    });
    //Getting songs from a particular folder
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        // console.log(e);
        e.addEventListener("click", async item => {
            //Fetching songs from folder specific
            songs = await getSong(`${item.currentTarget.dataset.folder}`);
        })
    })
};

//Playmusic function
async function playMusic(track) {
    console.log(track);
    currentSong.src = url + track + ".mp3";
    currentSong.play();
    play.src = "pause.svg"
    document.querySelector(".songInfo").innerHTML = track;
    document.querySelector(".songDuration").innerHTML = "00:00/00:00";
}
//Code to generate a random number between 0 and 12
function getNum() {
    let a = Math.floor(Math.random() * 8);
    if (a < 0) {
        a *= 10;
    } else if (a > 12) {
        a /= 10;
    }
    return a;
}

// Function to play a song at a given index
async function playSongAtIndex(index) {
    if (index >= 0 && index < songs.length) {
        currentSong.src = url + songs[index] + ".mp3";
        await currentSong.play();
        updateSongInfo(songs[index]);
        currentSongIndex = index;
    }
}

// Function to toggle play/pause
function togglePlayPause() {
    if (currentSong.paused) {
        currentSong.play();
        play.src = "pause.svg";
    } else {
        currentSong.pause();
        play.src = "play.svg";
    }
}

// Function to play the previous song
function playPreviousSong() {
    let previousIndex = currentSongIndex - 1;
    if (previousIndex < 0) {
        previousIndex = songs.length - 1; // Wrap around to the last song
    }
    playSongAtIndex(previousIndex);
}

// Function to play the next song
function playNextSong() {
    let nextIndex = currentSongIndex + 1;
    if (nextIndex >= songs.length) {
        nextIndex = 0; // Wrap around to the first song
    }
    playSongAtIndex(nextIndex);
}

// Function to update song info
function updateSongInfo(songName) {
    document.querySelector(".songInfo").innerHTML = songName;
    document.querySelector(".songDuration").innerHTML = "00:00/00:00";
}

// Call main function to start the application
main();

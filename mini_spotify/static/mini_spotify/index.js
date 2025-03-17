document.addEventListener("DOMContentLoaded", () => {
    const audio = document.getElementById("audio");
    const playButton = document.getElementById("play-button");
    const nextButton = document.getElementById("next-button");
    const prevButton = document.getElementById("prev-button");
    const seekSlider = document.getElementById("seek-slider");
    const volumeSlider = document.getElementById("volume-slider");
    const currentTimeDisplay = document.getElementById("current-time");
    const durationDisplay = document.getElementById("duration");
    const currentSongTitle = document.getElementById("current-song-title");
    const currentSongArtist = document.getElementById("current-song-artist");
    const currentSongAlbum = document.getElementById("current-song-album");
    const currentSongPlayCount = document.getElementById("current-song-playcount");
    const currentSongLikes = document.getElementById("current-song-likes");
    const playlistItems = document.querySelectorAll(".playlist-item");
    const searchSong = document.getElementById("search-song");
    const filterLiked = document.getElementById("filter-liked");

    audio.volume = 0.25;
    let currentIndex = 0;
    const songs = Array.from(playlistItems);
    
    // Filter favorite tracks
    filterLiked.addEventListener("change", () => {
        if (filterLiked.checked) {
            playlistItems.forEach((item) => {
                const likeButton = item.nextElementSibling;
                if (likeButton.textContent == "🤍") {
                    item.parentElement.style.display = "none";
                }
            });
        } else {
            playlistItems.forEach((item) => {
                item.parentElement.style.display = "block";
            });
        }
    });

    // Track search function
    searchSong.addEventListener("input", (event) => {
        const searchInput = event.target.value.toLowerCase();
        playlistItems.forEach((item) => {
            const itemText = item.textContent.toLowerCase();
            if (itemText.includes(searchInput)) {
                item.parentElement.style.display = "block";
            } else {
                item.parentElement.style.display = "none";
            }
        });
    });

    // Function to update current track info
    const updateCurrentSongInfo = (songElement) => {
        audio.src = songElement.dataset.songFile;
        currentSongTitle.textContent = songElement.dataset.songName;
        currentSongArtist.textContent = "Artist: " + songElement.dataset.songArtist;
        currentSongAlbum.textContent = "Album: " + (songElement.dataset.songAlbum || "Unknown");
        currentSongPlayCount.textContent = "Played: " + (songElement.dataset.songPlaycount);
        currentSongLikes.textContent = "Likes: " + (songElement.dataset.songLikes);

        // Navigate to artist information
        currentSongArtist.addEventListener("click", () => {
            const artistPhoto = songElement.dataset.songArtistPhoto;

            document.getElementById("current-song-info").style.display = "none";
            document.getElementById("artist-info").style.display = "grid";
            document.getElementById("artist-info").style.background = "linear-gradient( rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7) ), url(" + artistPhoto + ")";
            document.getElementById("artist-info").style.backgroundRepeat = "no-repeat";
            document.getElementById("artist-info").style.backgroundSize = "cover";
            document.getElementById("artist-info").style.backgroundPosition = "center";
            document.querySelector(".artist-name").textContent = songElement.dataset.songArtist;
            document.querySelector(".artist-desc").textContent = "Description: " + songElement.dataset.songArtistDesc;
        });

        document.querySelector(".back-to-info").firstChild.addEventListener("click", () => {
            document.getElementById("artist-info").style.display = "none";
            document.getElementById("current-song-info").style.display = "block";
        });

        // Remove selection from all and add active class to the current track
        songs.forEach(item => item.classList.remove("active"));
        songElement.classList.add("active");

        audio.play();
    };

    // Set the first track
    updateCurrentSongInfo(songs[currentIndex]);

    // Click handler for playlist to switch track
    songs.forEach((item, index) => {
        const likeButton = item.nextElementSibling;

        item.addEventListener("click", () => {
            currentIndex = index;
            updateCurrentSongInfo(item);
        });
        if (likeButton) {
            likeButton.addEventListener("click", () => {
                toggleLike(item.dataset.songId, likeButton);
            });
        }
    });

    // Play/Pause button handler
    playButton.addEventListener("click", () => {
        if (audio.paused) {
            audio.play();
            playButton.innerHTML = '<i class="material-icons">pause</i>';
            document.documentElement.style.setProperty("--thumb-opacity", "0");
        } else {
            audio.pause();
            playButton.innerHTML = '<i class="material-icons">play_circle_filled</i>';
            document.documentElement.style.setProperty("--thumb-opacity", "1");
        }
    });

    // Next track
    nextButton.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % songs.length;
        updateCurrentSongInfo(songs[currentIndex]);
    });

    // Previous track
    prevButton.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + songs.length) % songs.length;
        updateCurrentSongInfo(songs[currentIndex]);
    });

    // Auto-play next track when current one ends
    audio.addEventListener("ended", () => {
        currentIndex = (currentIndex + 1) % songs.length;
        updateCurrentSongInfo(songs[currentIndex]);
    });

    // Update slider and time display
    audio.addEventListener("timeupdate", () => {
        seekSlider.value = audio.currentTime;
        currentTimeDisplay.textContent = formatTime(audio.currentTime);
    });

    // Update track duration
    audio.addEventListener("loadedmetadata", () => {
        seekSlider.max = audio.duration;
        durationDisplay.textContent = formatTime(audio.duration);
    });

    // Change track position via slider
    seekSlider.addEventListener("input", () => {
        audio.currentTime = seekSlider.value;
    });

    // Change volume
    volumeSlider.addEventListener("input", (e) => {
        audio.volume = e.target.value / 100;
    });

    // Format time (minutes:seconds)
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    }

    // Update play count
    function updatePlaycount(songId) {
        fetch(`/mini_spotify/update_playcount/${songId}/`, {
            method: "POST",
            headers: {  
                "X-CSRFToken": getCSRFToken(),
            }
        })
        .then(response => response.json())
        .catch(error => console.error("Error updating playcount:", error));
    }

    // Toggle like
    function toggleLike(songId, button) {
        fetch(`/mini_spotify/toggle_like/${songId}/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": getCSRFToken(),
            }
        })
        .then(response => response.json())
        .then(data => {
            button.dataset.liked = data.liked;
            button.textContent = data.liked ? "❤️" : "🤍";
        })
        .catch(error => console.error("Error toggling like:", error));
    }

    // Function to get CSRF token
    function getCSRFToken() {
        return document.querySelector("[name=csrfmiddlewaretoken]").value;
    }
    
    // Attach an event listener to the "play" event
    let playTimeout = null;
    let isPlaycountUpdated = false;
    let playTime = 0; // Accumulated listening time (in seconds)
    let lastPlayTimestamp = null;

    audio.addEventListener("play", () => {
        // Store the playback start time
        lastPlayTimestamp = Date.now();

        // If the song is long enough (>=30 sec) and hasn't been counted yet,
        // start a 30-second timer
        if (!isPlaycountUpdated && audio.duration >= 30) {
            playTimeout = setTimeout(() => {
                updatePlaycount(currentIndex + 1);
                isPlaycountUpdated = true;
            }, 30000);
        }
    });

    audio.addEventListener("pause", () => {
        // When paused, calculate how long the song has played since the last start
        if (lastPlayTimestamp) {
            playTime += (Date.now() - lastPlayTimestamp) / 1000;
            lastPlayTimestamp = null;
        }
        clearTimeout(playTimeout);

        // If the song is long enough and total listening time >= 30 seconds,
        // update playcount
        if (audio.duration >= 30 && playTime >= 30 && !isPlaycountUpdated) {
            updatePlaycount(currentIndex + 1);
            isPlaycountUpdated = true;
        }
    });

    audio.addEventListener("ended", () => {
        // If the song duration is less than 30 seconds, count the play regardless of playTime
        if (audio.duration < 30) {
            if (!isPlaycountUpdated) {
                updatePlaycount(currentIndex + 1);
                isPlaycountUpdated = true;
            }
        }
        // If the song is long (>=30 sec) and total listening time is accumulated, count the play
        else if (playTime >= 30 && !isPlaycountUpdated) {
            updatePlaycount(currentIndex + 1);
            isPlaycountUpdated = true;
        }
        // Reset accumulated time and flag for the next song
        playTime = 0;
        isPlaycountUpdated = false;
    });

});

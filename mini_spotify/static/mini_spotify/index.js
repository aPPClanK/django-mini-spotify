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
    const searchSong = document.getElementById("search-song")
    const filterLiked = document.getElementById("filter-liked")

    audio.volume = 0.25;
    let currentIndex = 0;
    const songs = Array.from(playlistItems);
    
    // Фильтр любимых треков
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

    // Функция фильтра треков
    searchSong.addEventListener("input", (event) => {
        const searchInput = event.target.value.toLowerCase();
        playlistItems.forEach((item) => {
            const itemText = item.textContent.toLowerCase();
            if (itemText.includes(searchInput)){
                item.parentElement.style.display = "block";
            } else {
                item.parentElement.style.display = "none"
            }
        });
    });
    // Функция обновления информации о текущем треке
    const updateCurrentSongInfo = (songElement) => {
        audio.src = songElement.dataset.songFile;
        currentSongTitle.textContent = songElement.dataset.songName;
        currentSongArtist.textContent = "Исполнитель: " + songElement.dataset.songArtist;
        currentSongAlbum.textContent = "Альбом: " + (songElement.dataset.songAlbum || "Неизвестный");
        currentSongPlayCount.textContent = "Прослушивали: " + (songElement.dataset.songPlaycount);
        currentSongLikes.textContent = "Понравилось: " + (songElement.dataset.songLikes);

        // Переход на информацию об исполнителе 
        currentSongArtist.addEventListener("click", () => {
            const artistPhoto = songElement.dataset.songArtistPhoto;

            document.getElementById("current-song-info").style.display = "none";
            document.getElementById("artist-info").style.display = "grid";
            document.getElementById("artist-info").style.background = "linear-gradient( rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7) ), url(" + artistPhoto + ")";
            document.getElementById("artist-info").style.backgroundRepeat = "no-repeat";
            document.getElementById("artist-info").style.backgroundSize = "cover";
            document.getElementById("artist-info").style.backgroundPosition = "center";
            document.querySelector(".artist-name").textContent = songElement.dataset.songArtist;
            document.querySelector(".artist-desc").textContent = "Описание: " + songElement.dataset.songArtistDesc;
        })
    
        document.querySelector(".back-to-info").firstChild.addEventListener("click", () => {
            document.getElementById("artist-info").style.display = "none";
            document.getElementById("current-song-info").style.display = "block";
        })

        // Убираем выделение у всех и добавляем активный класс к текущему
        songs.forEach(item => item.classList.remove("active"));
        songElement.classList.add("active");

        audio.play();
    };

    // Устанавливаем первый трек
    updateCurrentSongInfo(songs[currentIndex]);

    // Обработчик клика по плейлисту для смены трека
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

    // Обработчик кнопки Play/Pause
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


    // Следующий трек
    nextButton.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % songs.length;
        updateCurrentSongInfo(songs[currentIndex]);
    });

    // Предыдущий трек
    prevButton.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + songs.length) % songs.length;
        updateCurrentSongInfo(songs[currentIndex]);
    });

    // Автоматическое переключение на следующий трек после завершения текущего
    audio.addEventListener("ended", () => {
        currentIndex = (currentIndex + 1) % songs.length;
        updateCurrentSongInfo(songs[currentIndex]);
    });

    // Обновление слайдера и отображение времени
    audio.addEventListener("timeupdate", () => {
        seekSlider.value = audio.currentTime;
        currentTimeDisplay.textContent = formatTime(audio.currentTime);
    });

    // Обновление продолжительности трека
    audio.addEventListener("loadedmetadata", () => {
        seekSlider.max = audio.duration;
        durationDisplay.textContent = formatTime(audio.duration);
    });

    // Изменение позиции трека через слайдер
    seekSlider.addEventListener("input", () => {
        audio.currentTime = seekSlider.value;
    });

    // Изменение громкости
    volumeSlider.addEventListener("input", (e) => {
        audio.volume = e.target.value / 100;
    });

    // Форматирование времени (минуты:секунды)
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    }

    // Обновление прослушиваний
    function updatePlaycount(songId) {
        fetch(`/mini_spotify/update_playcount/${songId}/`, {
            method: "POST",
            headers: {  
                "X-CSRFToken": getCSRFToken(),  // CSRF-токен
            }
        })
            .then(response => response.json())
            .then(data => console.log("Song updated: ", data, " for ", songId))
            .catch(error => console.error("Error updating playcount:", error));
    }

    // Смена лайка
    function toggleLike(songId, button) {
        fetch(`/mini_spotify/toggle_like/${songId}/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": getCSRFToken(),  // CSRF-токен
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log("Like toggled:", data, " for ", songId)
                button.dataset.liked = data.liked; // ОБНОВЛЯЕМ значение data-liked в DOM

                if (data.liked) {
                    button.textContent = "❤️"; // Если лайкнули, красное сердце
                } else {
                    button.textContent = "🤍"; // Если убрали лайк, белое сердце
                }
            })
            .catch(error => console.error("Error toggling like:", error));
    }

    // Функция для получения CSRF-токена (важно для POST-запросов в Django)
    function getCSRFToken() {
        return document.querySelector("[name=csrfmiddlewaretoken]").value;
    }

    // Вешаем обработчик на событие "play"
    let playTimeout = null;
    let isPlaycountUpdated = false;
    let playTime = 0; // Накопленное время прослушивания (в секундах)
    let lastPlayTimestamp = null;

    audio.addEventListener("play", () => {
        // Запоминаем время начала воспроизведения
        lastPlayTimestamp = Date.now();

        // Если песня достаточно длинная (>=30 сек) и еще не засчитана,
        // запускаем таймер на 30 секунд
        if (!isPlaycountUpdated && audio.duration >= 30) {
            playTimeout = setTimeout(() => {
                updatePlaycount(currentIndex + 1);
                isPlaycountUpdated = true;
            }, 30000);
        }
    });

    audio.addEventListener("pause", () => {
        // При паузе вычисляем, сколько времени проигрывалось с момента последнего старта
        if (lastPlayTimestamp) {
            playTime += (Date.now() - lastPlayTimestamp) / 1000;
            lastPlayTimestamp = null;
        }
        clearTimeout(playTimeout);

        // Если песня достаточно длинная и общее прослушанное время >= 30 секунд,
        // обновляем playcount
        if (audio.duration >= 30 && playTime >= 30 && !isPlaycountUpdated) {
            updatePlaycount(currentIndex + 1);
            isPlaycountUpdated = true;
        }
    });

    audio.addEventListener("ended", () => {
        // Если длительность песни меньше 30 секунд, засчитываем прослушивание независимо от playTime
        if (audio.duration < 30) {
            if (!isPlaycountUpdated) {
                updatePlaycount(currentIndex + 1);
                isPlaycountUpdated = true;
            }
        }
        // Если песня длинная (>=30 сек) и общее время прослушивания накопилось, засчитываем
        else if (playTime >= 30 && !isPlaycountUpdated) {
            updatePlaycount(currentIndex + 1);
            isPlaycountUpdated = true;
        }
        // Сбрасываем накопленное время и флаг для следующей песни
        playTime = 0;
        isPlaycountUpdated = false;
    });
});

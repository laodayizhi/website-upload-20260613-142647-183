(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var players = document.querySelectorAll(".js-player");

        players.forEach(function (player) {
            var video = player.querySelector("video");
            var source = video ? video.querySelector("source") : null;
            var playButton = player.querySelector("[data-player-play]");
            var toggleButton = player.querySelector("[data-player-toggle]");
            var muteButton = player.querySelector("[data-player-mute]");
            var fullscreenButton = player.querySelector("[data-player-fullscreen]");
            var message = player.querySelector("[data-player-message]");
            var mediaUrl = source ? source.getAttribute("src") : "";
            var prepared = false;
            var hls = null;

            if (!video || !mediaUrl) {
                return;
            }

            function setMessage(text) {
                if (!message) {
                    return;
                }

                message.textContent = text || "";
                message.classList.toggle("is-visible", Boolean(text));
            }

            function prepare(resolve) {
                if (prepared) {
                    resolve();
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = mediaUrl;
                    prepared = true;
                    resolve();
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });

                    hls.loadSource(mediaUrl);
                    hls.attachMedia(video);

                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        prepared = true;
                        setMessage("");
                        resolve();
                    });

                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }

                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                            return;
                        }

                        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                            return;
                        }

                        setMessage("视频暂时无法播放，请稍后再试");
                    });

                    return;
                }

                setMessage("视频暂时无法播放，请稍后再试");
            }

            function startPlayback() {
                new Promise(prepare).then(function () {
                    var playPromise = video.play();

                    if (playPromise && typeof playPromise.catch === "function") {
                        playPromise.catch(function () {
                            setMessage("请再次点击播放");
                        });
                    }
                });
            }

            function togglePlayback() {
                if (video.paused) {
                    startPlayback();
                } else {
                    video.pause();
                }
            }

            video.addEventListener("play", function () {
                player.classList.add("is-playing");
                if (toggleButton) {
                    toggleButton.textContent = "暂停";
                }
            });

            video.addEventListener("pause", function () {
                player.classList.remove("is-playing");
                if (toggleButton) {
                    toggleButton.textContent = "播放";
                }
            });

            video.addEventListener("click", togglePlayback);

            if (playButton) {
                playButton.addEventListener("click", startPlayback);
            }

            if (toggleButton) {
                toggleButton.addEventListener("click", togglePlayback);
            }

            if (muteButton) {
                muteButton.addEventListener("click", function () {
                    video.muted = !video.muted;
                    muteButton.textContent = video.muted ? "取消静音" : "静音";
                });
            }

            if (fullscreenButton) {
                fullscreenButton.addEventListener("click", function () {
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    } else if (player.requestFullscreen) {
                        player.requestFullscreen();
                    }
                });
            }

            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    });
}());

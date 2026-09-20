const video = document.getElementById("tv-player");

const streamURL =
    "https://stream.tokiopanic.com/hls/tokiopanic.m3u8";


// ======================================
// TOKIO PANIC TV - HLS
// ======================================

if (Hls.isSupported()) {

    const hls = new Hls({
        enableWorker: true
    });

    hls.loadSource(streamURL);

    hls.attachMedia(video);


    hls.on(Hls.Events.MANIFEST_PARSED, function () {

        console.log("TOKIO PANIC TV: stream conectado.");

        video.play().catch(() => {

            console.log(
                "Autoplay bloqueado. Haz clic en el reproductor."
            );

        });

    });


    hls.on(Hls.Events.ERROR, function (event, data) {

        console.error("HLS error:", data);

    });

}


// ======================================
// HLS NATIVO
// ======================================

else if (
    video.canPlayType("application/vnd.apple.mpegurl")
) {

    video.src = streamURL;

    video.addEventListener(
        "loadedmetadata",
        function () {

            video.play().catch(() => {

                console.log(
                    "Autoplay bloqueado. Haz clic en el reproductor."
                );

            });

        }
    );

}

// ======================================
// NOW PLAYING
// ======================================

const nowPlayingURL =
    "https://stream.tokiopanic.com/nowplaying.json";

const artistElement =
    document.getElementById("artist");

const songElement =
    document.getElementById("song");


async function actualizarNowPlaying() {

    try {

        const response = await fetch(
            nowPlayingURL + "?t=" + Date.now()
        );

        if (!response.ok) {
            throw new Error(
                "No se pudo obtener nowplaying.json"
            );
        }

        const data = await response.json();

        if (data.artist) {
            artistElement.textContent =
                data.artist;
        }

        if (data.title) {
            songElement.textContent =
                data.title;
        }

    } catch (error) {

        console.error(
            "Error obteniendo Now Playing:",
            error
        );

    }
}


// Actualizar inmediatamente
actualizarNowPlaying();


// Actualizar cada 5 segundos
setInterval(
    actualizarNowPlaying,
    5000
);
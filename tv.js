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
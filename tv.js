
const video = document.getElementById("tv-player");

const streamURL =
    "https://stream.tokiopanic.com/hls/tokiopanic.m3u8";


// ======================================
// TOKIO PANIC TV - HLS
// ======================================

if (Hls.isSupported()) {

    const hls = new Hls({

        enableWorker: true,

        // Reducir el búfer anterior disponible
        backBufferLength: 0,

        // Mantener la reproducción cerca del directo
        liveSyncDurationCount: 3,

        // Límite de retraso respecto al directo
        liveMaxLatencyDurationCount: 6

    });

    hls.loadSource(streamURL);

    hls.attachMedia(video);


    hls.on(
        Hls.Events.MANIFEST_PARSED,
        function () {

            console.log(
                "TOKIO PANIC TV: stream conectado."
            );

            video.play().catch(() => {

                console.log(
                    "Autoplay bloqueado. Haz clic en el reproductor."
                );

            });

        }
    );


    hls.on(
        Hls.Events.ERROR,
        function (event, data) {

            console.error(
                "HLS error:",
                data
            );

        }
    );

}


// ======================================
// HLS NATIVO
// ======================================

else if (
    video.canPlayType(
        "application/vnd.apple.mpegurl"
    )
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
// IMPEDIR REBOBINADO
// ======================================

function irAlDirecto() {

    if (
        !video.seekable ||
        video.seekable.length === 0
    ) {

        return;

    }

    const ultimaPosicion =
        video.seekable.end(
            video.seekable.length - 1
        );

    video.currentTime = ultimaPosicion;

}


// Detectar cuando el usuario intenta
// desplazarse hacia atrás en la transmisión

video.addEventListener(
    "seeking",
    function () {

        if (
            !video.seekable ||
            video.seekable.length === 0
        ) {

            return;

        }

        const ultimaPosicion =
            video.seekable.end(
                video.seekable.length - 1
            );

        const posicionActual =
            video.currentTime;


        /*
         * Si el usuario mueve la barra de tiempo,
         * lo enviamos nuevamente al punto actual
         * de la transmisión.
         */

        if (
            posicionActual < ultimaPosicion - 2
        ) {

            console.log(
                "Intento de rebobinado detectado."
            );

            console.log(
                "Regresando al directo..."
            );

            irAlDirecto();

        }

    }
);


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


        if (
            artistElement &&
            data.artist
        ) {

            artistElement.textContent =
                data.artist;

        }


        if (
            songElement &&
            data.title
        ) {

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


// ======================================
// ÚLTIMAS NOTICIAS
// ======================================

async function cargarUltimasNoticias() {

    const newsContainer =
        document.getElementById("tv-news-list");

    if (!newsContainer) {

        return;

    }


    try {

        const response =
            await fetch(
                "noticias.json?t=" + Date.now()
            );

        if (!response.ok) {

            throw new Error(
                "No se pudo cargar noticias.json"
            );

        }

        const noticias =
            await response.json();


        // Ordenar de más reciente a más antigua
        noticias.sort(
            (a, b) =>
                new Date(b.fecha) -
                new Date(a.fecha)
        );


        // Tomar solamente las 5 más recientes
        const ultimasNoticias =
            noticias.slice(0, 5);


        newsContainer.innerHTML =
            ultimasNoticias.map(
                noticia => {

                    return `

                        <article class="tv-news-card">

                            <a
                                href="noticia.html?id=${noticia.id}"
                                class="tv-news-image"
                            >

                                <img
                                    src="${noticia.imagen}"
                                    alt="${noticia.titulo}"
                                    loading="lazy"
                                >

                            </a>


                            <div class="tv-news-info">

                                <div class="tv-news-date">

                                    ${formatearFecha(
                                        noticia.fecha
                                    )}

                                </div>


                                <h3>
                                    ${noticia.titulo}
                                </h3>


                                <p>
                                    ${noticia.resumen}
                                </p>


                                <a
                                    href="noticia.html?id=${noticia.id}"
                                    class="tv-news-link"
                                >

                                    LEER NOTICIA →

                                </a>

                            </div>

                        </article>

                    `;

                }
            ).join("");


    } catch (error) {

        console.error(
            "Error cargando últimas noticias:",
            error
        );

    }

}


// ======================================
// FORMATO DE FECHA
// ======================================

function formatearFecha(fecha) {

    const partes =
        fecha.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


// ======================================
// CARGAR NOTICIAS
// ======================================

cargarUltimasNoticias();

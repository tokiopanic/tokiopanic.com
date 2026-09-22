
const video = document.getElementById("tv-player");



// ===============================
// NOW PLAYING - AZURACAST
// ===============================

const nowPlayingURL =
    "https://stream.tokiopanic.com/api/nowplaying_static/tokio_panic.json";

const artistElement = document.getElementById("artist");
const songElement = document.getElementById("song");

async function updateNowPlaying() {

    try {

        const response = await fetch(
            `${nowPlayingURL}?t=${Date.now()}`,
            {
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        console.log("Datos de AzuraCast:", data);

        // Obtener la canción actual
        const currentSong = data.now_playing?.song;

        const artist = currentSong?.artist || "TOKIO PANIC RADIO";
        const title = currentSong?.title || "TRANSMISIÓN EN VIVO";

        // Mostrar los datos en el HTML
        if (artistElement) {
            artistElement.textContent = artist;
        }

        if (songElement) {
            songElement.textContent = title;
        }

    } catch (error) {

        console.error(
            "Error al obtener la canción actual:",
            error
        );

        if (artistElement) {
            artistElement.textContent = "TOKIO PANIC RADIO";
        }

        if (songElement) {
            songElement.textContent = "TRANSMISIÓN EN VIVO";
        }

    }

}

// Ejecutar al cargar la página
updateNowPlaying();

// Actualizar cada 5 segundos
setInterval(updateNowPlaying, 5000);

// ======================================
// REPRODUCTOR - TOKIO PANIC RADIO
// ======================================

const radioAudio = document.getElementById("radio-audio");
const playPauseButton = document.getElementById("play-pause");
const muteToggleButton = document.getElementById("mute-toggle");
const volumeControl = document.getElementById("volume-control");

const radioStreamURL =
    "https://radio.tokiopanic.com/listen/tokio_panic/radio.mp3";

if (
    radioAudio &&
    playPauseButton &&
    muteToggleButton &&
    volumeControl
) {

    radioAudio.src = radioStreamURL;

    radioAudio.volume = Number(volumeControl.value);

    function actualizarBotonReproduccion() {

        if (radioAudio.paused) {

            playPauseButton.textContent = "▶";
            playPauseButton.setAttribute(
                "aria-label",
                "Reproducir radio"
            );

            playPauseButton.classList.remove("is-playing");

        } else {

            playPauseButton.textContent = "❚❚";
            playPauseButton.setAttribute(
                "aria-label",
                "Pausar radio"
            );

            playPauseButton.classList.add("is-playing");

        }

    }

    function actualizarBotonSilencio() {

        if (radioAudio.muted || radioAudio.volume === 0) {

            muteToggleButton.textContent = "🔇";
            muteToggleButton.setAttribute(
                "aria-label",
                "Activar sonido"
            );

        } else {

            muteToggleButton.textContent = "🔊";
            muteToggleButton.setAttribute(
                "aria-label",
                "Silenciar radio"
            );

        }

    }

    // REPRODUCIR / PAUSAR
    playPauseButton.addEventListener(
        "click",
        async function () {

            if (radioAudio.paused) {

                try {

                    await radioAudio.play();

                } catch (error) {

                    console.error(
                        "No se pudo iniciar la radio:",
                        error
                    );

                }

            } else {

                radioAudio.pause();

            }

            actualizarBotonReproduccion();

        }
    );

    // SILENCIAR / ACTIVAR SONIDO
    muteToggleButton.addEventListener(
        "click",
        function () {

            radioAudio.muted = !radioAudio.muted;

            actualizarBotonSilencio();

        }
    );

    // CONTROL DE VOLUMEN
    volumeControl.addEventListener(
        "input",
        function () {

            radioAudio.volume =
                Number(volumeControl.value);

            if (radioAudio.volume > 0) {
                radioAudio.muted = false;
            }

            actualizarBotonSilencio();

        }
    );

    // ACTUALIZAR ESTADO DEL BOTÓN
    radioAudio.addEventListener(
        "play",
        actualizarBotonReproduccion
    );

    radioAudio.addEventListener(
        "pause",
        actualizarBotonReproduccion
    );

    radioAudio.addEventListener(
        "volumechange",
        actualizarBotonSilencio
    );

    radioAudio.addEventListener(
        "error",
        function () {

            console.error(
                "Error al conectar con TOKIO PANIC RADIO."
            );

        }
    );

    actualizarBotonReproduccion();
    actualizarBotonSilencio();

}
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


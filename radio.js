
const video = document.getElementById("tv-player");




// ===============================
// NOW PLAYING - AZURACAST
// ===============================

const nowPlayingURL =
    "https://radio.tokiopanic.com/api/nowplaying/tokio_panic";

const artistElement = document.getElementById("artist");
const songElement = document.getElementById("song");

async function updateNowPlaying() {

    try {

        const response = await fetch(
            `${nowPlayingURL}?t=${Date.now()}`,
            {
                method: "GET",
                cache: "no-store",
                mode: "cors"
            }
        );

        console.log(
            "Estado de la API:",
            response.status,
            response.statusText
        );

        if (!response.ok) {
            throw new Error(
                `Error HTTP: ${response.status}`
            );
        }

        const data = await response.json();

        console.log(
            "Respuesta completa de AzuraCast:",
            data
        );

        // Verificar si existe la información
        if (!data.now_playing) {

            console.warn(
                "La API no contiene now_playing"
            );

            throw new Error(
                "Estructura de API inesperada"
            );

        }

        const currentSong = data.now_playing.song;

        if (!currentSong) {

            console.warn(
                "La API no contiene información de song"
            );

            throw new Error(
                "No se encontró la canción actual"
            );

        }

        const artist =
            currentSong.artist || "Artista desconocido";

        const title =
            currentSong.title || "Título desconocido";

        console.log(
            "ARTISTA:",
            artist
        );

        console.log(
            "CANCIÓN:",
            title
        );

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

        // Mostrar error temporal en la interfaz
        // para distinguirlo de los datos normales

        if (artistElement) {

            artistElement.textContent =
                "TOKIO PANIC RADIO";

        }

        if (songElement) {

            songElement.textContent =
                "ESPERANDO INFORMACIÓN...";

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
const volumeControl = document.getElementById("volume-control");

const radioStreamURL =
    "https://radio.tokiopanic.com/listen/tokio_panic/radio.mp3";

if (
    radioAudio &&
    playPauseButton &&
    volumeControl
) {

    radioAudio.src = radioStreamURL;
    radioAudio.volume = Number(volumeControl.value);

    // ======================================
    // ACTUALIZAR BOTÓN DE REPRODUCCIÓN
    // ======================================

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

    // ======================================
// REPRODUCIR / PAUSAR
// ======================================

playPauseButton.addEventListener(
    "click",
    async function () {

        if (radioAudio.paused) {

            try {

                // Crear una nueva conexión al stream en vivo
                const liveStreamURL =
                    `${radioStreamURL}?t=${Date.now()}`;

                radioAudio.src = liveStreamURL;

                // Recargar el reproductor con la nueva conexión
                radioAudio.load();

                // Iniciar la reproducción desde el momento actual
                await radioAudio.play();

                actualizarBotonReproduccion();

            } catch (error) {

                console.error(
                    "No se pudo iniciar la radio:",
                    error
                );

                actualizarBotonReproduccion();

            }

        } else {

            radioAudio.pause();

            actualizarBotonReproduccion();

        }

    }
);

    // ======================================
    // CONTROL DE VOLUMEN
    // ======================================

    volumeControl.addEventListener(
        "input",
        function () {

            radioAudio.volume =
                Number(volumeControl.value);

        }
    );

    // ======================================
    // ACTUALIZAR ESTADO DEL BOTÓN
    // ======================================

    radioAudio.addEventListener(
        "play",
        actualizarBotonReproduccion
    );

    radioAudio.addEventListener(
        "pause",
        actualizarBotonReproduccion
    );

    radioAudio.addEventListener(
        "error",
        function () {

            console.error(
                "Error al conectar con TOKIO PANIC RADIO.",
                radioAudio.error
            );

        }
    );

    actualizarBotonReproduccion();

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


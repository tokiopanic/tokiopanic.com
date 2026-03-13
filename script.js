// Obtener elementos del DOM
const playButton = document.getElementById('play-button');
let radioPlayer = document.getElementById('radio-player');
let isPlaying = false;
const STREAM_URL = 'https://stream.zeno.fm/fydx26uk9rhvv';

// Función para crear un nuevo elemento de audio
function crearNuevoAudio() {
    const nuevoAudio = document.createElement('audio');
    nuevoAudio.id = 'radio-player';
    nuevoAudio.preload = 'none';

    const source = document.createElement('source');
    source.src = STREAM_URL;
    source.type = 'audio/mpeg';
    nuevoAudio.appendChild(source);
    nuevoAudio.appendChild(document.createTextNode('Tu navegador no soporta la etiqueta de audio.'));

    // Reemplazar el elemento antiguo
    const oldAudio = document.getElementById('radio-player');
    if (oldAudio) {
        oldAudio.parentNode.replaceChild(nuevoAudio, oldAudio);
    } else {
        // Si no existe, lo añadimos al body (esto no debería pasar)
        document.body.appendChild(nuevoAudio);
    }

    return document.getElementById('radio-player');
}

// Función para reproducir/pausar la radio
function toggleRadio() {
    if (isPlaying) {
        // DETENER: Destruir el elemento de audio actual
        radioPlayer.pause();
        radioPlayer.src = ''; // Limpiar fuente
        radioPlayer.load();   // Forzar detención

        // Crear un nuevo elemento de audio (fresco) para el próximo play
        radioPlayer = crearNuevoAudio();

        playButton.textContent = 'En vivo';
        playButton.classList.remove('playing');
        isPlaying = false;
    } else {
        // REPRODUCIR: Usar el elemento actual (que está limpio)
        radioPlayer.play()
            .then(() => {
                playButton.textContent = 'Detener';
                playButton.classList.add('playing');
                isPlaying = true;
            })
            .catch(error => {
                console.error('Error al reproducir:', error);
                alert('No se pudo conectar con la radio. Intenta más tarde.');
            });
    }
}

// Manejar cuando el audio termina (por si acaso)
radioPlayer.addEventListener('ended', () => {
    isPlaying = false;
    playButton.textContent = 'EN VIVO';
    playButton.classList.remove('playing');
});

// Manejar errores de red/stream
radioPlayer.addEventListener('error', (e) => {
    console.error('Error en el stream:', e);
    isPlaying = false;
    playButton.textContent = 'EN VIVO';
    playButton.classList.remove('playing');
});

// Asignar evento al botón
playButton.addEventListener('click', toggleRadio);

// --- MOSTRAR CANCIÓN ACTUAL DE LA RADIO (Zeno.FM con SSE) ---
const METADATA_API_URL = 'https://api.zeno.fm/mounts/metadata/subscribe/6mrl8wn7sxntv';
const nowPlayingElement = document.getElementById('now-playing');

if (nowPlayingElement) {
    const eventSource = new EventSource(METADATA_API_URL);

    eventSource.addEventListener('message', (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.streamTitle) {
                nowPlayingElement.textContent = `Estás escuchando: ${data.streamTitle}`;
            }
        } catch (error) {
            console.error('Error parseando metadata:', error);
        }
    });

    eventSource.addEventListener('error', (error) => {
        console.error('Error en conexión SSE:', error);
        nowPlayingElement.textContent = 'Conectando...';
    });
}

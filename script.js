// Obtener elementos del DOM
const playButton = document.getElementById('play-button');
const radioPlayer = document.getElementById('radio-player');
let isPlaying = false;

// Función para reproducir/pausar la radio
function toggleRadio() {
    if (isPlaying) {
        radioPlayer.pause();
        playButton.textContent = 'Escuchar';
        playButton.classList.remove('playing');
    } else {
        // Intentar reproducir (requiere interacción del usuario)
        radioPlayer.play()
            .then(() => {
                playButton.textContent = 'Detener';
                playButton.classList.add('playing');
            })
            .catch(error => {
                console.error('Error al reproducir:', error);
                alert('No se pudo conectar con la radio. Intenta más tarde.');
            });
    }
    isPlaying = !isPlaying;
}

// Manejar cuando el audio termina (por si acaso)
radioPlayer.addEventListener('ended', () => {
    isPlaying = false;
    playButton.textContent = 'Escuchar';
    playButton.classList.remove('playing');
});

// Manejar errores de red/stream
radioPlayer.addEventListener('error', (e) => {
    console.error('Error en el stream:', e);
    isPlaying = false;
    playButton.textContent = 'Escuchar';
    playButton.classList.remove('playing');
    alert('Problemas con la transmisión. Verifica tu conexión.');
});

// Asignar evento al botón
playButton.addEventListener('click', toggleRadio);

// --- MOSTRAR CANCIÓN ACTUAL DE LA RADIO (Zeno.FM con SSE) ---

const METADATA_API_URL = 'https://api.zeno.fm/mounts/metadata/subscribe/6mrl8wn7sxntv';
const nowPlayingElement = document.getElementById('now-playing');

// Solo ejecutar si el elemento existe en la página
if (nowPlayingElement) {
    // Crear una conexión SSE
    const eventSource = new EventSource(METADATA_API_URL);

    // Escuchar mensajes de metadata (evento 'message')
    eventSource.addEventListener('message', (event) => {
        try {
            // Parsear el campo 'data' que viene como string JSON
            const data = JSON.parse(event.data);

            // Extraer el título de la canción (streamTitle)
            if (data.streamTitle) {
                // El formato suele ser "Artista - Título"
                nowPlayingElement.textContent = `Escuchando ahora: ${data.streamTitle}`;
            } else {
                nowPlayingElement.textContent = 'Escuchando ahora: Sin información de canción';
            }
        } catch (error) {
            console.error('Error parseando metadata:', error);
            nowPlayingElement.textContent = 'Escuchando ahora: Error en datos';
        }
    });

    // Manejar errores de conexión
    eventSource.addEventListener('error', (error) => {
        console.error('Error en conexión SSE:', error);
        nowPlayingElement.textContent = 'Escuchando ahora: Conexión perdida';

        // Opcional: intentar reconectar después de un tiempo
        setTimeout(() => {
            eventSource.close();
            location.reload(); // Recarga la página para reiniciar la conexión
        }, 5000);
    });

    // La conexión SSE se mantiene abierta automáticamente
    // No necesitas setInterval porque la API envía actualizaciones en tiempo real
}
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

/// ============================================
// TOKIO PANIC - JavaScript principal
// ============================================

// ============================================
// FONDO DINÁMICO - ROTACIÓN DE IMÁGENES
// ============================================

// Lista de imágenes de fondo - ACTUALIZA CON TUS IMÁGENES REALES
const fondos = [
    'images/fondotp9.jpg',
    'images/fondotp7.jpg',
    'images/fondotp3.jpg',
    'images/fondotp5.jpg',
    'images/fondotp6.png',
    'images/fondo2.png',   
    'images/fondotp8.jpg',
    'images/fondotp1.png',
    'images/fondotp10.jpg'
];

let indiceFondoActual = 0;
let intervaloFondo = null;

// Función para precargar todas las imágenes
function precargarImagenes() {
    fondos.forEach(url => {
        const img = new Image();
        img.onload = () => console.log(`✅ Precargada: ${url}`);
        img.onerror = () => console.error(`❌ Error: No se encuentra ${url}`);
        img.src = url;
    });
}

// Función para cambiar el fondo (secuencial)
function cambiarFondo() {
    const container = document.querySelector('.container');
    if (!container) {
        console.error('❌ No se encuentra .container');
        return;
    }
    
    // Avanzar al siguiente fondo
    indiceFondoActual = (indiceFondoActual + 1) % fondos.length;
    const nuevaImagen = fondos[indiceFondoActual];
    
    console.log(`🖼️ Cambiando a: ${nuevaImagen}`);
    
    // Crear imagen temporal para precargar y luego aplicar
    const img = new Image();
    img.onload = function() {
        container.style.backgroundImage = `url('${nuevaImagen}')`;
        console.log(`✅ Fondo cambiado a: ${nuevaImagen}`);
    };
    img.onerror = function() {
        console.error(`❌ No se pudo cargar: ${nuevaImagen}`);
        // Saltar esta imagen y probar la siguiente
        indiceFondoActual = (indiceFondoActual + 1) % fondos.length;
        cambiarFondo();
    };
    img.src = nuevaImagen;
}

// Función para iniciar la rotación de fondos
function iniciarRotacionFondos(intervaloMs = 10000) {
    const container = document.querySelector('.container');
    if (!container) {
        console.error('❌ No se encontró el elemento .container');
        return;
    }
    
    if (fondos.length === 0) {
        console.error('❌ No hay imágenes de fondo definidas');
        return;
    }
    
    // Verificar la primera imagen
    const primeraImagen = fondos[0];
    const img = new Image();
    img.onload = function() {
        container.style.backgroundImage = `url('${primeraImagen}')`;
        container.style.backgroundSize = 'cover';
        container.style.backgroundPosition = 'center';
        container.style.backgroundRepeat = 'no-repeat';
        container.style.backgroundAttachment = 'fixed';
        console.log(`✅ Fondo inicial: ${primeraImagen}`);
    };
    img.onerror = function() {
        console.error(`❌ ERROR: No se puede cargar ${primeraImagen}`);
        console.log('💡 Verifica que los archivos existan en la carpeta images/');
        // Intentar con una imagen de prueba de internet
        container.style.backgroundColor = '#000';
        container.style.backgroundImage = "url('https://picsum.photos/id/104/1920/1080')";
    };
    img.src = primeraImagen;
    
    // Iniciar el intervalo
    if (intervaloFondo) clearInterval(intervaloFondo);
    intervaloFondo = setInterval(cambiarFondo, intervaloMs);
    console.log(`🔄 Rotación de fondos iniciada (cada ${intervaloMs/1000} segundos)`);
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎵 TOKIO PANIC - Música Japonesa 24/7');
    
    // Iniciar rotación de fondos (10 segundos)
    iniciarRotacionFondos(10000);
    
    // Manejo de imágenes rotas en toda la página
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            if (!this.src.includes('placeholder.jpg') && !this.src.includes('logo')) {
                console.warn(`⚠️ Imagen no encontrada: ${this.src}`);
                this.src = 'images/placeholder.jpg';
            }
        });
    });
});

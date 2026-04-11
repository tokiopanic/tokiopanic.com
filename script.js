

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
// noticias-loader.js
let noticias = [];

async function cargarNoticias() {
    console.log('🚀 Iniciando carga de noticias...');

    try {
        // 1. Hacer fetch del JSON
        console.log('📡 Fetching noticias.json...');
        const respuesta = await fetch('noticias.json');
        console.log('📡 Respuesta recibida. Status:', respuesta.status);

        // 2. Verificar si la respuesta es correcta
        if (!respuesta.ok) {
            throw new Error(`HTTP error! status: ${respuesta.status} - ${respuesta.statusText}`);
        }

        // 3. Obtener el texto y mostrarlo (primeros 200 caracteres)
        const texto = await respuesta.text();
        console.log('📄 Texto recibido (primeros 200 caracteres):', texto.substring(0, 200));

        // 4. Parsear JSON
        noticias = JSON.parse(texto);
        console.log('✅ JSON parseado correctamente. Noticias encontradas:', noticias.length);

        // 5. Decidir qué renderizar según la página
        if (document.getElementById('lista-noticias')) {
            console.log('🎨 Renderizando lista de noticias...');
            renderizarListaNoticias();
        } else if (document.getElementById('noticia-detalle')) {
            console.log('🎨 Renderizando noticia individual...');
            renderizarNoticiaIndividual();
        } else {
            console.warn('⚠️ No se encontró ningún contenedor de noticias en esta página.');
        }

    } catch (error) {
        console.error('❌ Error en cargarNoticias:', error);
        mostrarError(error);
    }
}

function renderizarListaNoticias() {
    const contenedor = document.getElementById('lista-noticias');
    if (!contenedor) return;
    
    if (noticias.length === 0) {
        contenedor.innerHTML = '<p class="no-news">No hay noticias disponibles.</p>';
        return;
    }
    
    // Ordenar noticias por ID de mayor a menor (más reciente primero)
    const noticiasOrdenadas = [...noticias].sort((a, b) => b.id - a.id);
    
    const noticiasHTML = noticiasOrdenadas.map(noticia => `
        <article class="news-item with-image">
            <img src="${noticia.imagen}" alt="${noticia.titulo}" class="news-image" onerror="this.src='images/placeholder.jpg'">
            <div class="news-content">
                <h3 class="news-item-title">${noticia.titulo}</h3>
                <p class="news-date">${noticia.fecha} / ${noticia.autor}</p>
                <p class="news-summary">${noticia.resumen}</p>
                <a href="noticia.html?id=${noticia.id}" class="news-more">Leer más</a>
            </div>
        </article>
    `).join('');
    
    contenedor.innerHTML = noticiasHTML;
}

function renderizarNoticiaIndividual() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id'));
    const contenedor = document.getElementById('noticia-detalle');
    if (!contenedor) return;
    const noticia = noticias.find(n => n.id === id);
    if (noticia) {
        contenedor.innerHTML = `
            <h1>${noticia.titulo}</h1>
            <p class="news-date">${noticia.fecha} / ${noticia.autor}</p>
            <img src="${noticia.imagen}" alt="${noticia.titulo}" class="noticia-imagen">
            <div class="noticia-contenido">${noticia.contenidoCompleto}</div>
            <a href="noticias.html" class="back-link">← Ver todas las noticias</a>
        `;
    } else {
        contenedor.innerHTML = '<p class="error">Noticia no encontrada</p>';
    }
}

function mostrarError(error) {
    const contenedor = document.getElementById('lista-noticias') || document.getElementById('noticia-detalle');
    if (contenedor) {
        contenedor.innerHTML = `<p style="color:red;">Error al cargar las noticias: ${error.message}. Intenta más tarde.</p>`;
    }
}

// Iniciar cuando el DOM esté listo

document.addEventListener('DOMContentLoaded', cargarNoticias);


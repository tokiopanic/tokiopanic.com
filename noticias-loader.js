// noticias-loader.js - Versión unificada con buscador
let noticias = [];
let todasLasNoticias = [];
let contenedorNoticias = null;

async function cargarNoticias() {
    try {
        const respuesta = await fetch('noticias.json');
        if (!respuesta.ok) throw new Error('Error al cargar noticias');
        noticias = await respuesta.json();
        todasLasNoticias = [...noticias]; // copia para búsquedas
        
        // Guardar referencia al contenedor de noticias
        contenedorNoticias = document.getElementById('lista-noticias');
        
        // Detectar si estamos en la página principal (existe el botón "Más noticias" y NO hay buscador)
        const esPaginaPrincipal = document.querySelector('.more-news-btn') !== null && 
                                  !document.querySelector('.search-container');
        
        if (contenedorNoticias) {
            if (esPaginaPrincipal) {
                renderizarListaNoticias(5); // Solo 5 en inicio
            } else {
                renderizarListaNoticias(); // Todas en noticias.html
            }
        } else if (document.getElementById('noticia-detalle')) {
            renderizarNoticiaIndividual();
        }
        
        // Inicializar buscador SOLO en la página de noticias (donde existe .search-container)
        if (!esPaginaPrincipal && document.getElementById('buscador')) {
            inicializarBuscador();
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError();
    }
}

// Función principal para renderizar noticias (usa todasLasNoticias)
function renderizarListaNoticias(limite = null) {
    if (!contenedorNoticias) return;
    let noticiasAMostrar = [...todasLasNoticias].sort((a, b) => b.id - a.id);
    if (limite) noticiasAMostrar = noticiasAMostrar.slice(0, limite);
    renderizarListaNoticiasConArray(noticiasAMostrar);
}

// Renderiza un array específico de noticias (usado por el filtro)
function renderizarListaNoticiasConArray(noticiasArray) {
    if (!contenedorNoticias) return;
    
    if (noticiasArray.length === 0) {
        contenedorNoticias.innerHTML = '<p class="no-news">No hay noticias disponibles.</p>';
        return;
    }
    
    const noticiasOrdenadas = [...noticiasArray].sort((a, b) => b.id - a.id);
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
    
    contenedorNoticias.innerHTML = noticiasHTML;
}

function inicializarBuscador() {
    const inputBuscar = document.getElementById('buscador');
    const btnBuscar = document.getElementById('btn-buscar');
    
    function filtrarNoticias() {
        const termino = inputBuscar.value.trim().toLowerCase();
        if (termino === '') {
            renderizarListaNoticias(); // muestra todas
            return;
        }
        
        const noticiasFiltradas = todasLasNoticias.filter(noticia => {
            const tituloMatch = noticia.titulo.toLowerCase().includes(termino);
            const resumenMatch = noticia.resumen.toLowerCase().includes(termino);
            const contenidoPlano = noticia.contenidoCompleto.replace(/<[^>]*>/g, '').toLowerCase();
            const contenidoMatch = contenidoPlano.includes(termino);
            return tituloMatch || resumenMatch || contenidoMatch;
        });
        
        if (noticiasFiltradas.length === 0) {
            contenedorNoticias.innerHTML = `<p class="no-news">No se encontraron noticias que coincidan con "${termino}".</p>`;
        } else {
            renderizarListaNoticiasConArray(noticiasFiltradas);
        }
    }
    
    btnBuscar.addEventListener('click', filtrarNoticias);
    inputBuscar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') filtrarNoticias();
    });
}

function renderizarNoticiaIndividual() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id'));
    const contenedor = document.getElementById('noticia-detalle');
    if (!contenedor) return;
    
    const noticia = noticias.find(n => n.id === id);
    if (noticia) {
        document.title = `${noticia.titulo} | NOTICIAS | TOKIO PANIC`;
        
        let imagenSrc = 'images/placeholder.jpg';
        if (noticia.imagenes && noticia.imagenes.length > 0) {
            imagenSrc = noticia.imagenes[0];
        } else if (noticia.imagen) {
            imagenSrc = noticia.imagen;
        }
        
        const schemaData = {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": noticia.titulo,
            "image": noticia.imagenes || noticia.imagen,
            "datePublished": noticia.fecha + "T12:00:00-06:00",
            "dateModified": noticia.fecha + "T12:00:00-06:00",
            "author": [{
                "@type": "Person",
                "name": noticia.autor,
                "url": "https://www.instagram.com/tokiopanic/"
            }],
            "articleBody": noticia.contenidoCompleto.replace(/<[^>]*>/g, ''),
            "url": "https://tokiopanic.com/noticia.html?id=" + noticia.id
        };
        const schemaScript = `<script type="application/ld+json">${JSON.stringify(schemaData, null, 2)}<\/script>`;
        
        contenedor.innerHTML = schemaScript + `
            <h1>${noticia.titulo}</h1>
            <p class="news-date">${noticia.fecha} / ${noticia.autor}</p>
            <img src="${imagenSrc}" alt="${noticia.titulo}" class="noticia-imagen" onerror="this.src='images/placeholder.jpg'">
            <div class="noticia-contenido">${noticia.contenidoCompleto}</div>
            <a href="noticias.html" class="back-link">← Ver todas las noticias</a>
        `;
    } else {
        document.title = "Noticia no encontrada | TOKIO PANIC";
        contenedor.innerHTML = '<p class="error">Noticia no encontrada</p>';
    }
}

function mostrarError() {
    const contenedor = document.getElementById('lista-noticias') || document.getElementById('noticia-detalle');
    if (contenedor) {
        contenedor.innerHTML = '<p style="color:red;">Error al cargar las noticias. Intenta más tarde.</p>';
    }
}

// Iniciar todo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', cargarNoticias);
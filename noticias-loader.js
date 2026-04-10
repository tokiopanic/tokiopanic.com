// noticias-loader.js - Versión con carga por páginas (sin servidor)
let noticias = [];
let todasLasNoticias = [];
let contenedorNoticias = null;

// Variables de paginación
let paginaActual = 1;
let noticiasPorPagina = 10;
let totalPaginas = 1;
let cargando = false;

async function cargarNoticias() {
    try {
        contenedorNoticias = document.getElementById('lista-noticias');
        
        // Detectar si estamos en página principal o noticias
        const esPaginaPrincipal = document.querySelector('.more-news-btn') !== null && 
                                  !document.querySelector('.search-container');
        
        if (contenedorNoticias) {
            if (esPaginaPrincipal) {
                // Página principal: cargar solo primeras 5 noticias (desde pagina-1.json)
                await cargarPaginaEspecifica(1, 5);
            } else {
                // Página de noticias: cargar metadata y primera página
                await cargarMetadata();
                await cargarPaginaEspecifica(1);
                inicializarPaginacion();
            }
        } else if (document.getElementById('noticia-detalle')) {
            // Para noticia individual, cargar noticias.json completo (solo una vez)
            if (noticias.length === 0) {
                await cargarNoticiasCompleto();
            }
            renderizarNoticiaIndividual();
        }
        
        // Inicializar buscador SOLO en página de noticias
        if (!esPaginaPrincipal && document.getElementById('buscador')) {
            inicializarBuscador();
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError();
    }
}

// Cargar metadatos de paginación
async function cargarMetadata() {
    try {
        const respuesta = await fetch('noticias-paginas/metadata.json');
        if (!respuesta.ok) throw new Error('Error al cargar metadatos');
        const metadata = await respuesta.json();
        totalPaginas = metadata.totalPaginas;
        noticiasPorPagina = metadata.noticiasPorPagina;
    } catch (error) {
        console.warn('No se pudo cargar metadata, usando valores por defecto');
        totalPaginas = 2; // Estimado
    }
}

// Cargar una página específica desde el servidor (archivo JSON)
async function cargarPaginaEspecifica(pagina, limite = null) {
    if (cargando) return;
    cargando = true;
    
    try {
        // Mostrar indicador de carga
        if (contenedorNoticias) {
            contenedorNoticias.innerHTML = '<div class="loading-spinner">Cargando noticias...</div>';
        }
        
        // Cargar el archivo de la página solicitada
        const url = `noticias-paginas/pagina-${pagina}.json`;
        const respuesta = await fetch(url);
        
        if (!respuesta.ok) {
            throw new Error(`No se pudo cargar la página ${pagina}`);
        }
        
        const data = await respuesta.json();
        let noticiasPagina = data.noticias;
        
        // Si se especifica un límite (para página principal)
        if (limite && noticiasPagina.length > limite) {
            noticiasPagina = noticiasPagina.slice(0, limite);
        }
        
        if (contenedorNoticias) {
            renderizarListaNoticiasConArray(noticiasPagina);
        }
        
        // Actualizar controles de paginación
        if (pagina === paginaActual) {
            actualizarControlesPaginacion(totalPaginas);
        }
        
        return noticiasPagina;
    } catch (error) {
        console.error('Error cargando página:', error);
        if (contenedorNoticias) {
            contenedorNoticias.innerHTML = '<p class="no-news error">Error al cargar las noticias. Por favor, recarga la página.</p>';
        }
        return [];
    } finally {
        cargando = false;
    }
}

// Cargar todas las noticias (solo para búsqueda y detalle)
async function cargarNoticiasCompleto() {
    try {
        const respuesta = await fetch('noticias.json');
        if (!respuesta.ok) throw new Error('Error al cargar noticias');
        noticias = await respuesta.json();
        todasLasNoticias = [...noticias];
        return noticias;
    } catch (error) {
        console.error('Error cargando noticias completas:', error);
        return [];
    }
}

// Cambiar de página
async function irPagina(pagina) {
    if (pagina < 1 || pagina > totalPaginas || cargando) return;
    
    paginaActual = pagina;
    await cargarPaginaEspecifica(paginaActual);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Renderizar noticias en el contenedor
function renderizarListaNoticiasConArray(noticiasArray) {
    if (!contenedorNoticias) return;
    
    if (noticiasArray.length === 0) {
        contenedorNoticias.innerHTML = '<p class="no-news">No hay noticias disponibles.</p>';
        return;
    }
    
    const noticiasHTML = noticiasArray.map(noticia => `
        <article class="news-item with-image">
            <img src="${noticia.imagen}" alt="${noticia.titulo}" class="news-image" onerror="this.src='images/placeholder.jpg'">
            <div class="news-content">
                <h3 class="news-item-title">${escapeHtml(noticia.titulo)}</h3>
                <p class="news-date">${noticia.fecha} / ${noticia.autor}</p>
                <p class="news-summary">${escapeHtml(noticia.resumen)}</p>
                <a href="noticia.html?id=${noticia.id}" class="news-more">Leer más</a>
            </div>
        </article>
    `).join('');
    
    contenedorNoticias.innerHTML = noticiasHTML;
}

// Función auxiliar para escapar HTML (seguridad)
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Actualiza los botones y el indicador de página
function actualizarControlesPaginacion(totalPaginas) {
    const btnAnterior = document.getElementById('btn-pagina-anterior');
    const btnSiguiente = document.getElementById('btn-pagina-siguiente');
    const indicador = document.getElementById('indicador-pagina');
    
    if (!btnAnterior || !btnSiguiente || !indicador) return;
    
    btnAnterior.disabled = (paginaActual === 1);
    btnSiguiente.disabled = (paginaActual === totalPaginas || totalPaginas === 0);
    indicador.textContent = `Página ${paginaActual} de ${totalPaginas}`;
}

// Inicializa los eventos de los botones de paginación
function inicializarPaginacion() {
    const btnAnterior = document.getElementById('btn-pagina-anterior');
    const btnSiguiente = document.getElementById('btn-pagina-siguiente');
    
    if (!btnAnterior || !btnSiguiente) return;
    
    // Remover eventos anteriores
    const nuevoBtnAnterior = btnAnterior.cloneNode(true);
    const nuevoBtnSiguiente = btnSiguiente.cloneNode(true);
    
    if (btnAnterior.parentNode) {
        btnAnterior.parentNode.replaceChild(nuevoBtnAnterior, btnAnterior);
    }
    if (btnSiguiente.parentNode) {
        btnSiguiente.parentNode.replaceChild(nuevoBtnSiguiente, btnSiguiente);
    }
    
    nuevoBtnAnterior.addEventListener('click', () => irPagina(paginaActual - 1));
    nuevoBtnSiguiente.addEventListener('click', () => irPagina(paginaActual + 1));
}

// Buscador (usa noticias.json completo)
async function inicializarBuscador() {
    const inputBuscar = document.getElementById('buscador');
    const btnBuscar = document.getElementById('btn-buscar');
    
    if (!inputBuscar || !btnBuscar) return;
    
    // Cargar todas las noticias para búsqueda (solo una vez)
    if (todasLasNoticias.length === 0) {
        await cargarNoticiasCompleto();
    }
    
    function filtrarNoticias() {
        const termino = inputBuscar.value.trim().toLowerCase();
        
        if (termino === '') {
            // Recargar la página actual
            cargarPaginaEspecifica(paginaActual);
            actualizarControlesPaginacion(totalPaginas);
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
            contenedorNoticias.innerHTML = `<p class="no-news">No se encontraron noticias que coincidan con "${escapeHtml(termino)}".</p>`;
            // Deshabilitar paginación
            document.getElementById('btn-pagina-anterior').disabled = true;
            document.getElementById('btn-pagina-siguiente').disabled = true;
            document.getElementById('indicador-pagina').textContent = 'Resultados de búsqueda';
        } else {
            renderizarListaNoticiasConArray(noticiasFiltradas);
            // Ocultar paginación temporalmente
            const pagContainer = document.getElementById('pagination-container');
            if (pagContainer) pagContainer.style.display = 'none';
        }
    }
    
    btnBuscar.addEventListener('click', filtrarNoticias);
    inputBuscar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') filtrarNoticias();
    });
}

// Renderizar noticia individual (carga desde noticias.json)
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
        
        contenedor.innerHTML = `
            <h1>${escapeHtml(noticia.titulo)}</h1>
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

// Iniciar
document.addEventListener('DOMContentLoaded', cargarNoticias);
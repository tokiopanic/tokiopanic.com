// Función para crear slugs amigables para URLs
function crearSlug(titulo) {
    return titulo
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // eliminar acentos
        .replace(/[^a-z0-9]+/g, "-") // reemplazar espacios y caracteres especiales con -
        .replace(/^-|-$/g, ""); // eliminar guiones al inicio/final
}
// noticias-loader.js - Versión con carga por páginas y diseño de tarjetas en index
let noticias = [];
let todasLasNoticias = [];
let contenedorNoticias = null;
let contenedorNoticiasIndex = null;

// Variables de paginación
let paginaActual = 1;
let noticiasPorPagina = 10;
let totalPaginas = 1;
let cargando = false;

async function cargarNoticias() {
    try {
        // Detectar en qué página estamos
        contenedorNoticias = document.getElementById('lista-noticias');
        contenedorNoticiasIndex = document.getElementById('lista-noticias-index');
        
        if (contenedorNoticiasIndex) {
            // PÁGINA PRINCIPAL (index.html) - Diseño de tarjetas
            await cargarNoticiasCompleto();
            renderizarNoticiasIndex(8);
        } else if (contenedorNoticias) {
            // PÁGINA DE NOTICIAS (noticias.html) - Diseño de lista con paginación
            const esPaginaPrincipal = false;
            await cargarMetadata();
            await cargarPaginaEspecifica(1);
            inicializarPaginacion();
            
            // Inicializar buscador
            if (document.getElementById('buscador')) {
                inicializarBuscador();
            }
        } else if (document.getElementById('noticia-detalle')) {
            // PÁGINA DE DETALLE (noticia.html)
            if (noticias.length === 0) {
                await cargarNoticiasCompleto();
            }
            renderizarNoticiaIndividual();
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError();
    }
}

// Renderizar noticias en INDEX (diseño de tarjetas)
function renderizarNoticiasIndex(limite = 6) {
    if (!contenedorNoticiasIndex) return;

    // Ordenar por ID más reciente (mayor ID primero)
    const noticiasOrdenadas = [...noticias].sort((a, b) => b.id - a.id);
    const noticiasAMostrar = noticiasOrdenadas.slice(0, limite);

    if (noticiasAMostrar.length === 0) {
        contenedorNoticiasIndex.innerHTML = '<p class="no-news">No hay noticias disponibles.</p>';
        return;
    }

    const noticiasHTML = noticiasAMostrar.map(noticia => `
        <article class="news-card">
            <img src="${noticia.imagen}" alt="${noticia.titulo}" class="news-card-image" onerror="this.src='images/placeholder.jpg'">
            <div class="news-card-content">
                <h3 class="news-card-title">${escapeHtml(noticia.titulo)}</h3>
                <p class="news-card-date">${noticia.fecha} / ${noticia.autor}</p>
                <p class="news-card-summary">${escapeHtml(noticia.resumen.substring(0, 100))}${noticia.resumen.length > 100 ? '...' : ''}</p>
                <a href="noticia.html?id=${noticia.id}&titulo=${crearSlug(noticia.titulo)}" class="news-card-link">Leer más</a>
            </div>
        </article>
    `).join('');

    contenedorNoticiasIndex.innerHTML = noticiasHTML;
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
        totalPaginas = 2;
    }
}

// Cargar una página específica (para noticias.html)
async function cargarPaginaEspecifica(pagina, limite = null) {
    if (cargando) return;
    cargando = true;
    
    try {
        if (contenedorNoticias) {
            contenedorNoticias.innerHTML = '<div class="loading-spinner">Cargando noticias...</div>';
        }
        
        const url = `noticias-paginas/pagina-${pagina}.json`;
        const respuesta = await fetch(url);
        
        if (!respuesta.ok) {
            throw new Error(`No se pudo cargar la página ${pagina}`);
        }
        
        const data = await respuesta.json();
        let noticiasPagina = data.noticias;
        
        if (limite && noticiasPagina.length > limite) {
            noticiasPagina = noticiasPagina.slice(0, limite);
        }
        
        if (contenedorNoticias) {
            renderizarListaNoticiasConArray(noticiasPagina);
        }
        
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

// Cargar todas las noticias (para búsqueda, detalle e index)
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

// Renderizar lista de noticias (para noticias.html - diseño de lista)
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
                <a href="noticia.html?id=${noticia.id}&titulo=${crearSlug(noticia.titulo)}" class="news-more">Leer más</a>
            </div>
        </article>
    `).join('');
    
    contenedorNoticias.innerHTML = noticiasHTML;
}

// Cambiar de página
async function irPagina(pagina) {
    if (pagina < 1 || pagina > totalPaginas || cargando) return;
    paginaActual = pagina;
    await cargarPaginaEspecifica(paginaActual);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Actualizar controles de paginación
function actualizarControlesPaginacion(totalPaginas) {
    const btnAnterior = document.getElementById('btn-pagina-anterior');
    const btnSiguiente = document.getElementById('btn-pagina-siguiente');
    const indicador = document.getElementById('indicador-pagina');
    
    if (!btnAnterior || !btnSiguiente || !indicador) return;
    
    btnAnterior.disabled = (paginaActual === 1);
    btnSiguiente.disabled = (paginaActual === totalPaginas || totalPaginas === 0);
    indicador.textContent = `Página ${paginaActual} de ${totalPaginas}`;
}

// Inicializar botones de paginación
function inicializarPaginacion() {
    const btnAnterior = document.getElementById('btn-pagina-anterior');
    const btnSiguiente = document.getElementById('btn-pagina-siguiente');
    
    if (!btnAnterior || !btnSiguiente) return;
    
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

// Buscador
async function inicializarBuscador() {
    const inputBuscar = document.getElementById('buscador');
    const btnBuscar = document.getElementById('btn-buscar');
    
    if (!inputBuscar || !btnBuscar) return;
    
    if (todasLasNoticias.length === 0) {
        await cargarNoticiasCompleto();
    }
    
    function filtrarNoticias() {
        const termino = inputBuscar.value.trim().toLowerCase();
        
        if (termino === '') {
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
            document.getElementById('btn-pagina-anterior').disabled = true;
            document.getElementById('btn-pagina-siguiente').disabled = true;
            document.getElementById('indicador-pagina').textContent = 'Resultados de búsqueda';
        } else {
            renderizarListaNoticiasConArray(noticiasFiltradas);
            const pagContainer = document.getElementById('pagination-container');
            if (pagContainer) pagContainer.style.display = 'none';
        }
    }
    
    btnBuscar.addEventListener('click', filtrarNoticias);
    inputBuscar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') filtrarNoticias();
    });
}

// Renderizar noticia individual
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

// Mostrar error
function mostrarError() {
    const contenedor = document.getElementById('lista-noticias') || 
                       document.getElementById('lista-noticias-index') || 
                       document.getElementById('noticia-detalle');
    if (contenedor) {
        contenedor.innerHTML = '<p style="color:red;">Error al cargar las noticias. Intenta más tarde.</p>';
    }
}

// Escapar HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Iniciar
document.addEventListener('DOMContentLoaded', cargarNoticias);
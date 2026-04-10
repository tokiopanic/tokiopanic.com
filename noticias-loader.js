// noticias-loader.js - Con paginación y buscador (VERSIÓN CORREGIDA)
let noticias = [];
let todasLasNoticias = [];
let contenedorNoticias = null;

// Variables de paginación
let paginaActual = 1;
let noticiasPorPagina = 10;
let noticiasFiltradasActuales = [];

async function cargarNoticias() {
    try {
        const respuesta = await fetch('noticias.json');
        if (!respuesta.ok) throw new Error('Error al cargar noticias');
        noticias = await respuesta.json();
        todasLasNoticias = [...noticias];
        noticiasFiltradasActuales = [...todasLasNoticias];
        
        contenedorNoticias = document.getElementById('lista-noticias');
        
        // Verificar si estamos en página principal o noticias
        const esPaginaPrincipal = document.querySelector('.more-news-btn') !== null && 
                                  !document.querySelector('.search-container');
        
        if (contenedorNoticias) {
            if (esPaginaPrincipal) {
                // Página principal: solo 5 noticias SIN paginación
                renderizarListaNoticiasPrincipal(5);
            } else {
                // Página de noticias: renderizar y luego configurar paginación
                paginaActual = 1;
                renderizarPagina();
                // Esperar un momento para asegurar que los botones existan
                setTimeout(() => {
                    inicializarPaginacion();
                }, 100);
            }
        } else if (document.getElementById('noticia-detalle')) {
            renderizarNoticiaIndividual();
        }
        
        // Inicializar buscador SOLO en página de noticias
        if (!esPaginaPrincipal && document.getElementById('buscador')) {
            inicializarBuscador();
        }
    } catch (error) {
        console.error('Error:', error);
        if (contenedorNoticias) {
            contenedorNoticias.innerHTML = '<p class="no-news" style="color:red;">Error al cargar las noticias. Intenta más tarde.</p>';
        }
    }
}

// Renderizado para página principal (sin paginación, solo 5 noticias)
function renderizarListaNoticiasPrincipal(limite) {
    if (!contenedorNoticias) return;
    const noticiasOrdenadas = [...todasLasNoticias].sort((a, b) => b.id - a.id);
    const noticiasAMostrar = noticiasOrdenadas.slice(0, limite);
    renderizarListaNoticiasConArray(noticiasAMostrar);
}

// Renderiza la página actual
function renderizarPagina() {
    if (!contenedorNoticias) return;
    
    // Ordenar por ID más reciente (mayor ID primero)
    const noticiasOrdenadas = [...noticiasFiltradasActuales].sort((a, b) => b.id - a.id);
    
    // Calcular índices de la página actual
    const inicio = (paginaActual - 1) * noticiasPorPagina;
    const fin = inicio + noticiasPorPagina;
    const noticiasPagina = noticiasOrdenadas.slice(inicio, fin);
    
    // Calcular total de páginas
    const totalPaginas = Math.ceil(noticiasOrdenadas.length / noticiasPorPagina);
    
    // Renderizar noticias
    if (noticiasPagina.length === 0) {
        contenedorNoticias.innerHTML = '<p class="no-news">No hay noticias disponibles.</p>';
    } else {
        renderizarListaNoticiasConArray(noticiasPagina);
    }
    
    // Actualizar controles de paginación
    actualizarControlesPaginacion(totalPaginas);
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
    
    if (!btnAnterior || !btnSiguiente) {
        console.log('Botones de paginación no encontrados');
        return;
    }
    
    // Eliminar eventos previos (si los hay) creando nuevos botones
    const nuevoBtnAnterior = btnAnterior.cloneNode(true);
    const nuevoBtnSiguiente = btnSiguiente.cloneNode(true);
    
    // Reemplazar los botones originales con las copias
    if (btnAnterior.parentNode) {
        btnAnterior.parentNode.replaceChild(nuevoBtnAnterior, btnAnterior);
    }
    if (btnSiguiente.parentNode) {
        btnSiguiente.parentNode.replaceChild(nuevoBtnSiguiente, btnSiguiente);
    }
    
    // Agregar event listeners a los nuevos botones
    nuevoBtnAnterior.addEventListener('click', () => {
        if (paginaActual > 1) {
            paginaActual--;
            renderizarPagina();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    
    nuevoBtnSiguiente.addEventListener('click', () => {
        const totalPaginas = Math.ceil(noticiasFiltradasActuales.length / noticiasPorPagina);
        if (paginaActual < totalPaginas) {
            paginaActual++;
            renderizarPagina();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

// Renderiza un array específico de noticias
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
                <h3 class="news-item-title">${noticia.titulo}</h3>
                <p class="news-date">${noticia.fecha} / ${noticia.autor}</p>
                <p class="news-summary">${noticia.resumen}</p>
                <a href="noticia.html?id=${noticia.id}" class="news-more">Leer más</a>
            </div>
        </article>
    `).join('');
    
    contenedorNoticias.innerHTML = noticiasHTML;
}

// Buscador con paginación integrada
function inicializarBuscador() {
    const inputBuscar = document.getElementById('buscador');
    const btnBuscar = document.getElementById('btn-buscar');
    
    if (!inputBuscar || !btnBuscar) return;
    
    function filtrarNoticias() {
        const termino = inputBuscar.value.trim().toLowerCase();
        
        if (termino === '') {
            noticiasFiltradasActuales = [...todasLasNoticias];
        } else {
            noticiasFiltradasActuales = todasLasNoticias.filter(noticia => {
                const tituloMatch = noticia.titulo.toLowerCase().includes(termino);
                const resumenMatch = noticia.resumen.toLowerCase().includes(termino);
                const contenidoPlano = noticia.contenidoCompleto.replace(/<[^>]*>/g, '').toLowerCase();
                const contenidoMatch = contenidoPlano.includes(termino);
                return tituloMatch || resumenMatch || contenidoMatch;
            });
        }
        
        // Resetear a página 1 después de filtrar
        paginaActual = 1;
        
        // Mostrar resultados o mensaje de no encontrados
        if (noticiasFiltradasActuales.length === 0) {
            contenedorNoticias.innerHTML = `<p class="no-news">No se encontraron noticias que coincidan con "${termino}".</p>`;
            const btnAnterior = document.getElementById('btn-pagina-anterior');
            const btnSiguiente = document.getElementById('btn-pagina-siguiente');
            if (btnAnterior) btnAnterior.disabled = true;
            if (btnSiguiente) btnSiguiente.disabled = true;
            const indicador = document.getElementById('indicador-pagina');
            if (indicador) indicador.textContent = 'Página 0 de 0';
        } else {
            renderizarPagina();
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

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', cargarNoticias);
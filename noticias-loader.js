// noticias-loader.js
let noticias = [];

async function cargarNoticias() {
    try {
        const respuesta = await fetch('noticias.json');
        if (!respuesta.ok) throw new Error('Error al cargar noticias');
        noticias = await respuesta.json();
        
        // Detectar si estamos en la página principal (existe el botón "Más noticias")
        const esPaginaPrincipal = document.querySelector('.more-news-btn') !== null;
        
        if (document.getElementById('lista-noticias')) {
            if (esPaginaPrincipal) {
                renderizarListaNoticias(5); // Solo 5 en inicio
            } else {
                renderizarListaNoticias(); // Todas en noticias.html
            }
        } else if (document.getElementById('noticia-detalle')) {
            renderizarNoticiaIndividual();
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError();
    }
}

function renderizarListaNoticias(limite = null) {
    const contenedor = document.getElementById('lista-noticias');
    if (!contenedor) return;

    // Ordenar por ID más reciente primero (mayor ID)
    const noticiasOrdenadas = [...noticias].sort((a, b) => b.id - a.id);
    
    // Aplicar límite si se especifica
    const noticiasAMostrar = limite ? noticiasOrdenadas.slice(0, limite) : noticiasOrdenadas;

    if (noticiasAMostrar.length === 0) {
        contenedor.innerHTML = '<p class="no-news">No hay noticias disponibles.</p>';
        return;
    }

    const noticiasHTML = noticiasAMostrar.map(noticia => `
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
        // ✅ Cambiar el título de la página
        document.title = `${noticia.titulo} | NOTICIAS | TOKIO PANIC`;

        // ✅ Determinar la imagen principal (compatible con array o string)
        let imagenSrc = 'images/placeholder.jpg';
        if (noticia.imagenes && noticia.imagenes.length > 0) {
            imagenSrc = noticia.imagenes[0];
        } else if (noticia.imagen) {
            imagenSrc = noticia.imagen;
        }

        // ✅ Generar Schema.org en JSON-LD
        const schemaData = {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": noticia.titulo,
            "image": noticia.imagenes || noticia.imagen, // Schema acepta array o string
            "datePublished": noticia.fecha + "T12:00:00-06:00", // Ajusta zona horaria
            "dateModified": noticia.fecha + "T12:00:00-06:00",
            "author": [{
                "@type": "Person",
                "name": noticia.autor,
                "url": "https://www.instagram.com/tokiopanic/" // Cambia por el IG real si deseas
            }],
            "articleBody": noticia.contenidoCompleto.replace(/<[^>]*>/g, ''), // Texto plano
            "url": "https://tokiopanic.com/noticia.html?id=" + noticia.id
        };

        const schemaScript = `<script type="application/ld+json">${JSON.stringify(schemaData, null, 2)}<\/script>`;

        // ✅ Insertar el schema y el contenido en el contenedor
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

document.addEventListener('DOMContentLoaded', cargarNoticias);


// noticias-loader.js
// Carga noticias, paginación, buscador y enlaces amigables.

/* ==================================================
   CREAR SLUG
================================================== */

function crearSlug(titulo) {
    return String(titulo || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        )
        .replace(
            /-{2,}/g,
            "-"
        );
}

function obtenerSlug(noticia) {
    return (
        noticia.slug ||
        crearSlug(noticia.titulo)
    );
}

function obtenerUrlNoticia(noticia) {
    return `noticias/${obtenerSlug(noticia)}.html`;
}

/* ==================================================
   VARIABLES GENERALES
================================================== */

let noticias = [];
let todasLasNoticias = [];

let contenedorNoticias = null;
let contenedorNoticiasIndex = null;

let paginaActual = 1;
let noticiasPorPagina = 10;
let totalPaginas = 1;
let cargando = false;

/* ==================================================
   INICIAR CARGA
================================================== */

async function cargarNoticias() {
    try {
        contenedorNoticias =
            document.getElementById(
                "lista-noticias"
            );

        contenedorNoticiasIndex =
            document.getElementById(
                "lista-noticias-index"
            );

        if (contenedorNoticiasIndex) {
            await cargarNoticiasCompleto();
            renderizarNoticiasIndex(8);

        } else if (contenedorNoticias) {
            await cargarMetadata();
            await cargarPaginaEspecifica(1);
            inicializarPaginacion();

            if (
                document.getElementById(
                    "buscador"
                )
            ) {
                inicializarBuscador();
            }

        } else if (
            document.getElementById(
                "noticia-detalle"
            )
        ) {
            /*
             * Compatibilidad con las URL antiguas:
             * noticia.html?id=49
             */
            if (noticias.length === 0) {
                await cargarNoticiasCompleto();
            }

            renderizarNoticiaIndividual();
        }

    } catch (error) {
        console.error(
            "Error al cargar noticias:",
            error
        );

        mostrarError();
    }
}

/* ==================================================
   INDEX.HTML
================================================== */

function renderizarNoticiasIndex(
    limite = 6
) {
    if (!contenedorNoticiasIndex) {
        return;
    }

    const noticiasVisibles =
        noticias.filter(
            noticia =>
                noticia.visible !== false
        );

    const noticiasOrdenadas =
        [...noticiasVisibles].sort(
            (a, b) =>
                b.id - a.id
        );

    const noticiasAMostrar =
        noticiasOrdenadas.slice(
            0,
            limite
        );

    if (
        noticiasAMostrar.length === 0
    ) {
        contenedorNoticiasIndex.innerHTML =
            '<p class="no-news">No hay noticias disponibles.</p>';

        return;
    }

    const noticiasHTML =
        noticiasAMostrar
            .map(noticia => {
                const url =
                    obtenerUrlNoticia(
                        noticia
                    );

                return `
                    <article class="news-card">

                        <img
                            src="${noticia.imagen}"
                            alt="${escapeHtml(noticia.titulo)}"
                            class="news-card-image"
                            onerror="this.src='images/placeholder.jpg'"
                        >

                        <div class="news-card-content">

                            <h3 class="news-card-title">
                                ${escapeHtml(noticia.titulo)}
                            </h3>

                            <p class="news-card-date">
                                ${noticia.fecha} / ${noticia.autor}
                            </p>

                            <p class="news-card-summary">
                                ${escapeHtml(
                                    noticia.resumen.substring(
                                        0,
                                        100
                                    )
                                )}
                                ${
                                    noticia.resumen.length >
                                    100
                                        ? "..."
                                        : ""
                                }
                            </p>

                            <a
                                href="${url}"
                                class="news-card-link"
                            >
                                Leer más
                            </a>

                        </div>

                    </article>
                `;
            })
            .join("");

    contenedorNoticiasIndex.innerHTML =
        noticiasHTML;
}

/* ==================================================
   CARGAR METADATOS
================================================== */

async function cargarMetadata() {
    try {
        const respuesta =
            await fetch(
                "noticias-paginas/metadata.json"
            );

        if (!respuesta.ok) {
            throw new Error(
                "Error al cargar metadatos"
            );
        }

        const metadata =
            await respuesta.json();

        totalPaginas =
            metadata.totalPaginas;

        noticiasPorPagina =
            metadata.noticiasPorPagina;

    } catch (error) {
        console.warn(
            "No se pudo cargar metadata. Se usarán valores por defecto.",
            error
        );

        totalPaginas = 1;
    }
}

/* ==================================================
   CARGAR PÁGINA JSON
================================================== */

async function cargarPaginaEspecifica(
    pagina,
    limite = null
) {
    if (cargando) {
        return [];
    }

    cargando = true;

    try {
        if (contenedorNoticias) {
            contenedorNoticias.innerHTML =
                '<div class="loading-spinner">Cargando noticias...</div>';
        }

        const url =
            `noticias-paginas/pagina-${pagina}.json`;

        const respuesta =
            await fetch(url);

        if (!respuesta.ok) {
            throw new Error(
                `No se pudo cargar la página ${pagina}`
            );
        }

        const data =
            await respuesta.json();

        let noticiasPagina =
            data.noticias.filter(
                noticia =>
                    noticia.visible !== false
            );

        if (
            limite &&
            noticiasPagina.length >
            limite
        ) {
            noticiasPagina =
                noticiasPagina.slice(
                    0,
                    limite
                );
        }

        if (contenedorNoticias) {
            renderizarListaNoticiasConArray(
                noticiasPagina
            );
        }

        if (
            pagina === paginaActual
        ) {
            actualizarControlesPaginacion(
                totalPaginas
            );
        }

        return noticiasPagina;

    } catch (error) {
        console.error(
            "Error cargando página:",
            error
        );

        if (contenedorNoticias) {
            contenedorNoticias.innerHTML =
                '<p class="no-news error">Error al cargar las noticias. Por favor, recarga la página.</p>';
        }

        return [];

    } finally {
        cargando = false;
    }
}

/* ==================================================
   CARGAR NOTICIAS.JSON
================================================== */

async function cargarNoticiasCompleto() {
    try {
        const respuesta =
            await fetch(
                "noticias.json"
            );

        if (!respuesta.ok) {
            throw new Error(
                "Error al cargar noticias.json"
            );
        }

        noticias =
            await respuesta.json();

        todasLasNoticias =
            [...noticias];

        return noticias;

    } catch (error) {
        console.error(
            "Error cargando noticias completas:",
            error
        );

        return [];
    }
}

/* ==================================================
   NOTICIAS.HTML
================================================== */

function renderizarListaNoticiasConArray(
    noticiasArray
) {
    if (!contenedorNoticias) {
        return;
    }

    const noticiasVisibles =
        noticiasArray.filter(
            noticia =>
                noticia.visible !== false
        );

    if (
        noticiasVisibles.length === 0
    ) {
        contenedorNoticias.innerHTML =
            '<p class="no-news">No hay noticias disponibles.</p>';

        return;
    }

    const noticiasHTML =
        noticiasVisibles
            .map(noticia => {
                const url =
                    obtenerUrlNoticia(
                        noticia
                    );

                return `
                    <article class="news-item with-image">

                        <img
                            src="${noticia.imagen}"
                            alt="${escapeHtml(noticia.titulo)}"
                            class="news-image"
                            onerror="this.src='images/placeholder.jpg'"
                        >

                        <div class="news-content">

                            <h3 class="news-item-title">
                                ${escapeHtml(noticia.titulo)}
                            </h3>

                            <p class="news-date">
                                ${noticia.fecha} / ${noticia.autor}
                            </p>

                            <p class="news-summary">
                                ${escapeHtml(noticia.resumen)}
                            </p>

                            <a
                                href="${url}"
                                class="news-more"
                            >
                                Leer más
                            </a>

                        </div>

                    </article>
                `;
            })
            .join("");

    contenedorNoticias.innerHTML =
        noticiasHTML;
}

/* ==================================================
   PAGINACIÓN
================================================== */

async function irPagina(pagina) {
    if (
        pagina < 1 ||
        pagina > totalPaginas ||
        cargando
    ) {
        return;
    }

    paginaActual = pagina;

    await cargarPaginaEspecifica(
        paginaActual
    );

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function actualizarControlesPaginacion(
    numeroTotalPaginas
) {
    const btnAnterior =
        document.getElementById(
            "btn-pagina-anterior"
        );

    const btnSiguiente =
        document.getElementById(
            "btn-pagina-siguiente"
        );

    const indicador =
        document.getElementById(
            "indicador-pagina"
        );

    if (
        !btnAnterior ||
        !btnSiguiente ||
        !indicador
    ) {
        return;
    }

    btnAnterior.disabled =
        paginaActual === 1;

    btnSiguiente.disabled =
        paginaActual ===
            numeroTotalPaginas ||
        numeroTotalPaginas === 0;

    indicador.textContent =
        `Página ${paginaActual} de ${numeroTotalPaginas}`;
}

function inicializarPaginacion() {
    const btnAnterior =
        document.getElementById(
            "btn-pagina-anterior"
        );

    const btnSiguiente =
        document.getElementById(
            "btn-pagina-siguiente"
        );

    if (
        !btnAnterior ||
        !btnSiguiente
    ) {
        return;
    }

    const nuevoBtnAnterior =
        btnAnterior.cloneNode(true);

    const nuevoBtnSiguiente =
        btnSiguiente.cloneNode(true);

    btnAnterior.parentNode.replaceChild(
        nuevoBtnAnterior,
        btnAnterior
    );

    btnSiguiente.parentNode.replaceChild(
        nuevoBtnSiguiente,
        btnSiguiente
    );

    nuevoBtnAnterior.addEventListener(
        "click",
        () => {
            irPagina(
                paginaActual - 1
            );
        }
    );

    nuevoBtnSiguiente.addEventListener(
        "click",
        () => {
            irPagina(
                paginaActual + 1
            );
        }
    );
}

/* ==================================================
   BUSCADOR
================================================== */

async function inicializarBuscador() {
    const inputBuscar =
        document.getElementById(
            "buscador"
        );

    const btnBuscar =
        document.getElementById(
            "btn-buscar"
        );

    const pagContainer =
        document.getElementById(
            "pagination-container"
        );

    if (
        !inputBuscar ||
        !btnBuscar
    ) {
        return;
    }

    if (
        todasLasNoticias.length === 0
    ) {
        await cargarNoticiasCompleto();
    }

    async function filtrarNoticias() {
        const termino =
            inputBuscar.value
                .trim()
                .toLowerCase();

        if (termino === "") {
            if (pagContainer) {
                pagContainer.style.display =
                    "";
            }

            await cargarPaginaEspecifica(
                paginaActual
            );

            actualizarControlesPaginacion(
                totalPaginas
            );

            return;
        }

        const noticiasFiltradas =
            todasLasNoticias.filter(
                noticia => {
                    if (
                        noticia.visible ===
                        false
                    ) {
                        return false;
                    }

                    const tituloMatch =
                        noticia.titulo
                            .toLowerCase()
                            .includes(
                                termino
                            );

                    const resumenMatch =
                        noticia.resumen
                            .toLowerCase()
                            .includes(
                                termino
                            );

                    const contenidoPlano =
                        noticia.contenidoCompleto
                            .replace(
                                /<[^>]*>/g,
                                ""
                            )
                            .toLowerCase();

                    const contenidoMatch =
                        contenidoPlano.includes(
                            termino
                        );

                    return (
                        tituloMatch ||
                        resumenMatch ||
                        contenidoMatch
                    );
                }
            );

        if (pagContainer) {
            pagContainer.style.display =
                "none";
        }

        if (
            noticiasFiltradas.length === 0
        ) {
            contenedorNoticias.innerHTML =
                `<p class="no-news">No se encontraron noticias que coincidan con "${escapeHtml(termino)}".</p>`;

            return;
        }

        renderizarListaNoticiasConArray(
            noticiasFiltradas
        );
    }

    btnBuscar.addEventListener(
        "click",
        filtrarNoticias
    );

    inputBuscar.addEventListener(
        "keydown",
        event => {
            if (event.key === "Enter") {
                filtrarNoticias();
            }
        }
    );
}

/* ==================================================
   COMPATIBILIDAD CON NOTICIA.HTML ANTIGUO
================================================== */

function renderizarNoticiaIndividual() {
    const urlParams =
        new URLSearchParams(
            window.location.search
        );

    const id =
        parseInt(
            urlParams.get("id"),
            10
        );

    const contenedor =
        document.getElementById(
            "noticia-detalle"
        );

    if (!contenedor) {
        return;
    }

    const noticia =
        noticias.find(
            elemento =>
                elemento.id === id
        );

    if (!noticia) {
        document.title =
            "Noticia no encontrada | TOKIO PANIC";

        contenedor.innerHTML =
            '<p class="error">Noticia no encontrada</p>';

        return;
    }

    document.title =
        `${noticia.titulo} | NOTICIAS | TOKIO PANIC`;

    let imagenSrc =
        "images/placeholder.jpg";

    if (
        noticia.imagenes &&
        noticia.imagenes.length > 0
    ) {
        imagenSrc =
            noticia.imagenes[0];

    } else if (noticia.imagen) {
        imagenSrc =
            noticia.imagen;
    }

    contenedor.innerHTML = `
        <h1>
            ${escapeHtml(noticia.titulo)}
        </h1>

        <p class="news-date">
            ${noticia.fecha} / ${noticia.autor}
        </p>

        <img
            src="${imagenSrc}"
            alt="${escapeHtml(noticia.titulo)}"
            class="noticia-imagen"
            onerror="this.src='images/placeholder.jpg'"
        >

        <div class="noticia-contenido">
            ${noticia.contenidoCompleto}
        </div>

        <a
            href="noticias.html"
            class="back-link"
        >
            ← Ver todas las noticias
        </a>
    `;
}

/* ==================================================
   MOSTRAR ERROR
================================================== */

function mostrarError() {
    const contenedor =
        document.getElementById(
            "lista-noticias"
        ) ||
        document.getElementById(
            "lista-noticias-index"
        ) ||
        document.getElementById(
            "noticia-detalle"
        );

    if (contenedor) {
        contenedor.innerHTML =
            '<p style="color:red;">Error al cargar las noticias. Intenta más tarde.</p>';
    }
}

/* ==================================================
   ESCAPAR HTML
================================================== */

function escapeHtml(text) {
    const div =
        document.createElement("div");

    div.textContent =
        String(text ?? "");

    return div.innerHTML;
}

/* ==================================================
   INICIAR
================================================== */

document.addEventListener(
    "DOMContentLoaded",
    cargarNoticias
);
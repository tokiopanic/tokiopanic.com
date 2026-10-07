// ======================================================
// ENTREVISTAS - TOKIO PANIC
// ======================================================


// ======================================================
// IDs DE LAS ENTREVISTAS
// ======================================================
//
// Agrega aquí los IDs de las publicaciones que son
// entrevistas.
//
// Ejemplo:
// const IDS_ENTREVISTAS = [86, 82, 75, 63, 41];
//
// ======================================================

const IDS_ENTREVISTAS = [
    27,
    29,
    30,
    33,
    35,
    36,
    38,
    42,
    43,
    44,
    45,
    47,
    48,
    49,
    55,
    63,
    64,
    65,
    66,
    67,
    71,
    72,
    73,
    76,
    77,
    78,
    81,
    84,
    85,
    86
];


// ======================================================
// VARIABLES
// ======================================================

let entrevistas = [];

let entrevistasFiltradas = [];

let paginaActualEntrevistas = 1;

const entrevistasPorPagina = 10;


// ======================================================
// INICIAR
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        cargarEntrevistas();

    }
);

// ======================================================
// INDEX.HTML — 8 ENTREVISTAS MÁS RECIENTES
// ======================================================

async function cargarEntrevistasIndex() {

    const contenedor =
        document.getElementById(
            "lista-entrevistas-index"
        );

    if (!contenedor) {
        return;
    }

    try {

        const respuesta =
            await fetch("noticias.json");

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo cargar noticias.json"
            );
        }

        const noticias =
            await respuesta.json();

        const entrevistas =
            noticias
                .filter(
                    noticia =>
                        IDS_ENTREVISTAS.includes(
                            Number(noticia.id)
                        ) &&
                        noticia.visible !== false
                )
                .sort(
                    (a, b) =>
                        Number(b.id || 0) -
                        Number(a.id || 0)
                )
                .slice(0, 8);

        if (entrevistas.length === 0) {

            contenedor.innerHTML = `
                <p class="no-news">
                    No hay entrevistas disponibles.
                </p>
            `;

            return;
        }

        const entrevistasHTML =
            entrevistas
                .map(entrevista => {

                    const titulo =
                        String(
                            entrevista.titulo || ""
                        );

                    const resumen =
                        String(
                            entrevista.resumen || ""
                        );

                    const imagen =
                        entrevista.imagen ||
                        "images/placeholder.jpg";

                    const slug =
                        entrevista.slug || "";

                    const url =
                        slug
                            ? `noticias/${slug}.html`
                            : "#";

                    const resumenCorto =
                        resumen.substring(0, 100);

                    const puntosSuspensivos =
                        resumen.length > 100
                            ? "..."
                            : "";

                    return `

                        <article class="news-card">

                            <img
                                src="${imagen}"
                                alt="${escapeHtml(titulo)}"
                                class="news-card-image"
                                loading="lazy"
                                decoding="async"
                                width="600"
                                height="400"
                                onerror="this.onerror=null; this.src='images/placeholder.jpg';"
                            >

                            <div class="news-card-content">

                                <h3 class="news-card-title">
                                    ${escapeHtml(titulo)}
                                </h3>

                                <p class="news-card-date">
                                    ${entrevista.fecha || ""}
                                    /
                                    ${entrevista.autor || ""}
                                </p>

                                <p class="news-card-summary">
                                    ${escapeHtml(resumenCorto)}${puntosSuspensivos}
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

        contenedor.innerHTML =
            entrevistasHTML;

    } catch (error) {

        console.error(
            "Error al cargar entrevistas del index:",
            error
        );

        contenedor.innerHTML = `
            <p class="no-news error">
                Error al cargar las entrevistas.
                Por favor, recarga la página.
            </p>
        `;
    }
}
// ======================================================
// CARGAR ENTREVISTAS
// ======================================================

async function cargarEntrevistas() {

    const contenedor =
        document.getElementById(
            "lista-entrevistas"
        );

    if (!contenedor) {
        return;
    }

    try {

        const respuesta =
            await fetch("noticias.json");

        if (!respuesta.ok) {

            throw new Error(
                "No se pudo cargar noticias.json"
            );

        }

        const noticias =
            await respuesta.json();


        // ==================================================
        // FILTRAR POR ID
        // ==================================================

        entrevistas =
            noticias.filter(
                noticia =>
                    IDS_ENTREVISTAS.includes(
                        Number(noticia.id)
                    ) &&
                    noticia.visible !== false
            );


        // ==================================================
        // ORDENAR DE MÁS RECIENTE A MÁS ANTIGUA
        // ==================================================

        entrevistas.sort(
            (a, b) =>
                Number(b.id || 0) -
                Number(a.id || 0)
        );


        entrevistasFiltradas = [
            ...entrevistas
        ];


        // ==================================================
        // MOSTRAR
        // ==================================================

        renderizarEntrevistas();

        actualizarPaginacionEntrevistas();

        inicializarBuscadorEntrevistas();


    } catch (error) {

        console.error(
            "Error al cargar entrevistas:",
            error
        );

        contenedor.innerHTML = `
            <p class="no-news error">
                Error al cargar las entrevistas.
                Por favor, recarga la página.
            </p>
        `;

    }

}


// ======================================================
// RENDERIZAR ENTREVISTAS
// ======================================================

function renderizarEntrevistas() {

    const contenedor =
        document.getElementById(
            "lista-entrevistas"
        );

    if (!contenedor) {
        return;
    }


    if (
        entrevistasFiltradas.length === 0
    ) {

        contenedor.innerHTML = `
            <p class="no-news">
                No hay entrevistas disponibles.
            </p>
        `;

        return;

    }


    // ==================================================
    // PAGINACIÓN
    // ==================================================

    const inicio =
        (
            paginaActualEntrevistas - 1
        ) *
        entrevistasPorPagina;


    const fin =
        inicio +
        entrevistasPorPagina;


    const entrevistasPagina =
        entrevistasFiltradas.slice(
            inicio,
            fin
        );


    // ==================================================
    // GENERAR HTML
    // ==================================================

    const entrevistasHTML =
        entrevistasPagina
            .map(
                entrevista => {

                    const titulo =
                        String(
                            entrevista.titulo ||
                            ""
                        );


                    const resumen =
                        String(
                            entrevista.resumen ||
                            ""
                        );
const imagen =
    entrevista.imagen ||
    "images/placeholder.jpg";

const slug =
    entrevista.slug || "";

const url =
    slug
        ? `noticias/${slug}.html`
        : "#";

return `

    <article class="news-item with-image">

        <img
            src="${imagen}"
            alt="${escapeHtml(titulo)}"
            class="news-image"
            loading="lazy"
            decoding="async"
            width="600"
            height="400"
            onerror="this.onerror=null; this.src='images/placeholder.jpg';"
        >

        <div class="news-content">

            <h3 class="news-item-title">
                ${escapeHtml(titulo)}
            </h3>

            <p class="news-date">
                ${entrevista.fecha || ""}
                /
                ${entrevista.autor || ""}
            </p>

            <p class="news-summary">
                ${escapeHtml(resumen)}
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

                }
            )
            .join("");


    contenedor.innerHTML =
        entrevistasHTML;

}


// ======================================================
// PAGINACIÓN
// ======================================================

function actualizarPaginacionEntrevistas() {

    const btnAnterior =
        document.getElementById(
            "btn-entrevistas-anterior"
        );


    const btnSiguiente =
        document.getElementById(
            "btn-entrevistas-siguiente"
        );


    const indicador =
        document.getElementById(
            "indicador-pagina-entrevistas"
        );


    if (
        !btnAnterior ||
        !btnSiguiente ||
        !indicador
    ) {

        return;

    }


    const totalPaginas =
        Math.max(
            1,
            Math.ceil(
                entrevistasFiltradas.length /
                entrevistasPorPagina
            )
        );


    btnAnterior.disabled =
        paginaActualEntrevistas === 1;


    btnSiguiente.disabled =
        paginaActualEntrevistas >=
        totalPaginas;


    indicador.textContent =
        `Página ${paginaActualEntrevistas} de ${totalPaginas}`;

}


// ======================================================
// CAMBIAR DE PÁGINA
// ======================================================

function irPaginaEntrevistas(
    pagina
) {

    const totalPaginas =
        Math.max(
            1,
            Math.ceil(
                entrevistasFiltradas.length /
                entrevistasPorPagina
            )
        );


    if (
        pagina < 1 ||
        pagina > totalPaginas
    ) {

        return;

    }


    paginaActualEntrevistas =
        pagina;


    renderizarEntrevistas();

    actualizarPaginacionEntrevistas();


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ======================================================
// EVENTOS DE PAGINACIÓN
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {
        cargarEntrevistasIndex();
        const btnAnterior =
            document.getElementById(
                "btn-entrevistas-anterior"
            );


        const btnSiguiente =
            document.getElementById(
                "btn-entrevistas-siguiente"
            );


        if (btnAnterior) {

            btnAnterior.addEventListener(
                "click",
                () => {

                    irPaginaEntrevistas(
                        paginaActualEntrevistas - 1
                    );

                }
            );

        }


        if (btnSiguiente) {

            btnSiguiente.addEventListener(
                "click",
                () => {

                    irPaginaEntrevistas(
                        paginaActualEntrevistas + 1
                    );

                }
            );

        }

    }
);


// ======================================================
// BUSCADOR
// ======================================================

function inicializarBuscadorEntrevistas() {

    const input =
        document.getElementById(
            "buscador-entrevistas"
        );


    const boton =
        document.getElementById(
            "btn-buscar-entrevistas"
        );


    if (!input || !boton) {
        return;
    }


    function buscar() {

        const termino =
            input.value
                .trim()
                .toLowerCase();


        if (termino === "") {

            entrevistasFiltradas = [
                ...entrevistas
            ];

        } else {

            entrevistasFiltradas =
                entrevistas.filter(
                    entrevista => {

                        const titulo =
                            String(
                                entrevista.titulo ||
                                ""
                            )
                                .toLowerCase();


                        const resumen =
                            String(
                                entrevista.resumen ||
                                ""
                            )
                                .toLowerCase();


                        return (
                            titulo.includes(
                                termino
                            ) ||
                            resumen.includes(
                                termino
                            )
                        );

                    }
                );

        }


        paginaActualEntrevistas = 1;


        renderizarEntrevistas();

        actualizarPaginacionEntrevistas();

    }


    boton.addEventListener(
        "click",
        buscar
    );


    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                buscar();

            }

        }
    );

}


// ======================================================
// ESCAPAR HTML
// ======================================================

function escapeHtml(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(text ?? "");


    return div.innerHTML;

}
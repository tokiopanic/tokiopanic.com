// publicar.js
// Genera paginación JSON, páginas HTML individuales y sitemap.xml.

const fs = require("fs");
const path = require("path");

const CONFIG = {
    dominio: "https://tokiopanic.com",
    archivoNoticias: "noticias.json",
    carpetaPaginasJson: "noticias-paginas",
    carpetaNoticiasHtml: "noticias",
    noticiasPorPagina: 10,

    archivosEstaticosSitemap: [
        "/",
        "/noticias.html",
        "/podcast.html",
        "/revista.html",
        "/nosotros.html"
    ]
};

/* ==================================================
   FUNCIONES GENERALES
================================================== */

function crearSlug(texto) {
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-");
}

function escaparHtml(texto) {
    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function quitarHtml(texto) {
    return String(texto ?? "")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .trim();
}

function rutaAbsolutaWeb(ruta) {
    const valor = String(ruta || "").trim();

    if (!valor) {
        return `${CONFIG.dominio}/images/placeholder.jpg`;
    }

    if (/^https?:\/\//i.test(valor)) {
        return valor;
    }

    return `${CONFIG.dominio}/${valor.replace(/^\/+/, "")}`;
}

function rutaLocalWeb(ruta) {
    const valor = String(ruta || "").trim();

    if (!valor) {
        return "/images/placeholder.jpg";
    }

    if (/^https?:\/\//i.test(valor)) {
        return valor;
    }

    return `/${valor.replace(/^\/+/, "")}`;
}

function convertirRutasContenido(html) {
    return String(html || "")
        .replace(
            /(src|href)=(['"])images\//gi,
            "$1=$2/images/"
        )
        .replace(
            /(src|href)=(['"])\.\/images\//gi,
            "$1=$2/images/"
        );
}

function asegurarCarpeta(carpeta) {
    fs.mkdirSync(carpeta, {
        recursive: true
    });
}

/* ==================================================
   VALIDACIÓN
================================================== */

function validarNoticias(noticias) {
    const ids = new Set();
    const slugs = new Set();
    const errores = [];

    noticias.forEach((noticia, indice) => {
        const etiqueta = `Noticia en posición ${indice + 1}`;

        const obligatorios = [
            "id",
            "titulo",
            "fecha",
            "resumen",
            "imagen",
            "contenidoCompleto"
        ];

        obligatorios.forEach(campo => {
            if (
                noticia[campo] === undefined ||
                noticia[campo] === null ||
                noticia[campo] === ""
            ) {
                errores.push(
                    `${etiqueta}: falta "${campo}".`
                );
            }
        });

        if (ids.has(noticia.id)) {
            errores.push(
                `${etiqueta}: ID duplicado ${noticia.id}.`
            );
        }

        ids.add(noticia.id);

        const slug =
            noticia.slug ||
            crearSlug(noticia.titulo);

        if (!slug) {
            errores.push(
                `${etiqueta}: no se pudo crear el slug.`
            );
        }

        if (slugs.has(slug)) {
            errores.push(
                `${etiqueta}: slug duplicado "${slug}".`
            );
        }

        slugs.add(slug);

        const imagenLocal = String(
            noticia.imagen || ""
        ).replace(/^\/+/, "");

        if (
            imagenLocal &&
            !/^https?:\/\//i.test(imagenLocal) &&
            !fs.existsSync(imagenLocal)
        ) {
            console.warn(
                `⚠️ No se encontró la imagen local: ${imagenLocal}`
            );
        }
    });

    if (errores.length > 0) {
        throw new Error(
            `Se encontraron errores en noticias.json:\n- ${errores.join("\n- ")}`
        );
    }
}

/* ==================================================
   GENERAR HTML INDIVIDUAL
================================================== */

function generarHtmlNoticia(noticia) {
    const slug =
        noticia.slug ||
        crearSlug(noticia.titulo);

    const url =
        `${CONFIG.dominio}/noticias/${slug}.html`;

    const imagenAbsoluta =
        rutaAbsolutaWeb(noticia.imagen);

    const imagenLocal =
        rutaLocalWeb(noticia.imagen);

    const titulo =
        escaparHtml(noticia.titulo);

    const resumen =
        escaparHtml(noticia.resumen);

    const fecha =
        escaparHtml(noticia.fecha);

    const autorHtml =
        noticia.autor || "TOKIO PANIC";

    const autorPlano =
        quitarHtml(autorHtml) || "TOKIO PANIC";

    const contenido =
        convertirRutasContenido(
            noticia.contenidoCompleto
        );

    const datosEstructurados = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: noticia.titulo,
        description: noticia.resumen,
        image: [
            imagenAbsoluta
        ],
        datePublished: noticia.fecha,
        dateModified:
            noticia.fechaModificacion ||
            noticia.fecha,
        author: {
            "@type": "Person",
            name: autorPlano
        },
        publisher: {
            "@type": "Organization",
            name: "TOKIO PANIC",
            logo: {
                "@type": "ImageObject",
                url: `${CONFIG.dominio}/images/logofooter.png`
            }
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": url
        }
    };

    return `<!doctype html>
<html lang="es">

<head>
    <!-- Google tag -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-HNR8PWQDNB"></script>

    <script>
        window.dataLayer = window.dataLayer || [];

        function gtag() {
            dataLayer.push(arguments);
        }

        gtag("js", new Date());
        gtag("config", "G-HNR8PWQDNB");
    </script>

    <meta charset="UTF-8">
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>${titulo} | TOKIO PANIC</title>

    <meta
        name="description"
        content="${resumen}"
    >

    <link
        rel="canonical"
        href="${url}"
    >

    <!-- Open Graph -->
    <meta
        property="og:locale"
        content="es_MX"
    >

    <meta
        property="og:type"
        content="article"
    >

    <meta
        property="og:site_name"
        content="TOKIO PANIC"
    >

    <meta
        property="og:title"
        content="${titulo}"
    >

    <meta
        property="og:description"
        content="${resumen}"
    >

    <meta
        property="og:image"
        content="${imagenAbsoluta}"
    >

    <meta
        property="og:image:secure_url"
        content="${imagenAbsoluta}"
    >

    <meta
        property="og:image:alt"
        content="${titulo}"
    >

    <meta
        property="og:url"
        content="${url}"
    >

    <meta
        property="article:published_time"
        content="${fecha}"
    >

    <!-- X / Twitter -->
    <meta
        name="twitter:card"
        content="summary_large_image"
    >

    <meta
        name="twitter:title"
        content="${titulo}"
    >

    <meta
        name="twitter:description"
        content="${resumen}"
    >

    <meta
        name="twitter:image"
        content="${imagenAbsoluta}"
    >

    <!-- Estilos -->
    <link
        rel="stylesheet"
        href="/styles.css?v=6"
    >

    <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
    >

    <!-- Datos estructurados -->
    <script type="application/ld+json">
${JSON.stringify(datosEstructurados, null, 2).replace(/</g, "\\u003c")}
    </script>
</head>

<body class="internal-page">

    <div class="internal-container">

        <header>
            <a href="/index.html">
                <img
                    src="/header.png"
                    alt="TOKIO PANIC"
                    class="logo"
                >
            </a>

            <nav>
                <ul>
                    <li>
                        <a href="/index.html">
                            INICIO
                        </a>
                    </li>

                    <li>
                        <a
                            href="/noticias.html"
                            class="active"
                        >
                            NOTICIAS
                        </a>
                    </li>

                    <li>
                        <a href="/podcast.html">
                            PODCAST
                        </a>
                    </li>

                    <li>
                        <a href="/revista.html">
                            REVISTA
                        </a>
                    </li>

                    <li>
                        <a href="/nosotros.html">
                            NOSOTROS
                        </a>
                    </li>
                </ul>
            </nav>
        </header>

        <main class="noticia-detalle">

            <h1>${titulo}</h1>

            <p class="news-date">
                ${fecha} / ${autorHtml}
            </p>

            <img
                src="${imagenLocal}"
                alt="${titulo}"
                class="noticia-imagen"
                onerror="this.src='/images/placeholder.jpg'"
            >

            <div class="noticia-contenido">
                ${contenido}
            </div>

            <a
                href="/noticias.html"
                class="back-link"
            >
                ← Ver todas las noticias
            </a>

        </main>

        <!-- Compartir noticia -->
        <section
            class="share-news"
            aria-labelledby="share-title"
        >

            <span
                id="share-title"
                class="share-news-title"
            >
                COMPARTIR NOTICIA
            </span>

            <div class="share-news-buttons">

                <button
                    id="nativeShareButton"
                    class="share-icon"
                    type="button"
                    title="Compartir"
                    aria-label="Compartir noticia"
                >
                    <i
                        class="fa-solid fa-share-nodes"
                        aria-hidden="true"
                    ></i>
                </button>

                <a
                    id="shareWhatsapp"
                    class="share-icon"
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Compartir en WhatsApp"
                    aria-label="Compartir en WhatsApp"
                >
                    <i
                        class="fa-brands fa-whatsapp"
                        aria-hidden="true"
                    ></i>
                </a>

                <a
                    id="shareFacebook"
                    class="share-icon"
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Compartir en Facebook"
                    aria-label="Compartir en Facebook"
                >
                    <i
                        class="fa-brands fa-facebook-f"
                        aria-hidden="true"
                    ></i>
                </a>

                <a
                    id="shareX"
                    class="share-icon"
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Compartir en X"
                    aria-label="Compartir en X"
                >
                    <i
                        class="fa-brands fa-x-twitter"
                        aria-hidden="true"
                    ></i>
                </a>

                <a
                    id="shareTelegram"
                    class="share-icon"
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Compartir en Telegram"
                    aria-label="Compartir en Telegram"
                >
                    <i
                        class="fa-brands fa-telegram"
                        aria-hidden="true"
                    ></i>
                </a>

                <button
                    id="copyNewsLink"
                    class="share-icon"
                    type="button"
                    title="Copiar enlace"
                    aria-label="Copiar enlace de la noticia"
                >
                    <i
                        class="fa-regular fa-copy"
                        aria-hidden="true"
                    ></i>
                </button>

            </div>

            <span
                id="copyLinkMessage"
                class="copy-link-message"
                aria-live="polite"
            ></span>

        </section>

    </div>

    <footer class="footer">

        <div class="footer-container">

            <div class="footer-col">
                <img
                    src="/images/logofooter.png"
                    alt="TOKIO PANIC"
                    class="footer-logo"
                >
            </div>

            <div class="footer-col">

                <h4 class="footer-title">
                    NUESTRAS REDES SOCIALES:
                </h4>

                <div class="footer-social">

                    <a
                        href="https://www.tiktok.com/@tokiopanic"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="social-icon-link"
                    >
                        <img
                            src="/images/tiktok.png"
                            alt="TikTok"
                            class="social-icon-footer"
                        >
                    </a>

                    <a
                        href="https://www.instagram.com/tokiopanic"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="social-icon-link"
                    >
                        <img
                            src="/images/insta.png"
                            alt="Instagram"
                            class="social-icon-footer"
                        >
                    </a>

                    <a
                        href="https://www.youtube.com/@tokio-panic"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="social-icon-link"
                    >
                        <img
                            src="/images/yt.png"
                            alt="YouTube"
                            class="social-icon-footer"
                        >
                    </a>

                </div>
            </div>

            <div class="footer-col">

                <h4 class="footer-title">
                    PRENSA Y COLABORACIONES:
                </h4>

                <a
                    href="mailto:contacto@tokiopanic.com"
                    class="footer-media-kit"
                >
                    contacto@tokiopanic.com
                </a>

            </div>

        </div>

    </footer>

    <script src="/script.js"></script>

    <script>
        document.addEventListener("DOMContentLoaded", () => {
            const currentUrl = window.location.href;
            const newsTitle = ${JSON.stringify(noticia.titulo)};

            const encodedUrl =
                encodeURIComponent(currentUrl);

            const encodedTitle =
                encodeURIComponent(
                    newsTitle + " | TOKIO PANIC"
                );

            const shareWhatsapp =
                document.getElementById("shareWhatsapp");

            const shareFacebook =
                document.getElementById("shareFacebook");

            const shareX =
                document.getElementById("shareX");

            const shareTelegram =
                document.getElementById("shareTelegram");

            shareWhatsapp.href =
                "https://wa.me/?text=" +
                encodedTitle +
                "%20" +
                encodedUrl;

            shareFacebook.href =
                "https://www.facebook.com/sharer/sharer.php?u=" +
                encodedUrl;

            shareX.href =
                "https://twitter.com/intent/tweet?text=" +
                encodedTitle +
                "&url=" +
                encodedUrl;

            shareTelegram.href =
                "https://t.me/share/url?url=" +
                encodedUrl +
                "&text=" +
                encodedTitle;

            const nativeButton =
                document.getElementById(
                    "nativeShareButton"
                );

            if (navigator.share) {
                nativeButton.addEventListener(
                    "click",
                    async () => {
                        try {
                            await navigator.share({
                                title: newsTitle,
                                text:
                                    newsTitle +
                                    " | TOKIO PANIC",
                                url: currentUrl
                            });
                        } catch (error) {
                            if (
                                error.name !==
                                "AbortError"
                            ) {
                                console.error(error);
                            }
                        }
                    }
                );
            } else {
                nativeButton.style.display =
                    "none";
            }

            const copyButton =
                document.getElementById(
                    "copyNewsLink"
                );

            const copyMessage =
                document.getElementById(
                    "copyLinkMessage"
                );

            const copyIcon =
                copyButton.querySelector("i");

            copyButton.addEventListener(
                "click",
                async () => {
                    try {
                        await navigator.clipboard.writeText(
                            currentUrl
                        );

                        copyIcon.className =
                            "fa-solid fa-check";

                        copyMessage.textContent =
                            "El enlace de la noticia se copió correctamente.";

                        setTimeout(() => {
                            copyIcon.className =
                                "fa-regular fa-copy";

                            copyMessage.textContent =
                                "";
                        }, 2500);

                    } catch (error) {
                        copyMessage.textContent =
                            "No fue posible copiar el enlace.";

                        console.error(error);
                    }
                }
            );
        });
    </script>

</body>
</html>`;
}

/* ==================================================
   GENERAR PAGINACIÓN JSON
================================================== */

function generarPaginacion(noticiasOrdenadas) {
    asegurarCarpeta(
        CONFIG.carpetaPaginasJson
    );

    const totalNoticias =
        noticiasOrdenadas.length;

    const totalPaginas =
        Math.ceil(
            totalNoticias /
            CONFIG.noticiasPorPagina
        );

    const metadata = {
        totalNoticias,
        noticiasPorPagina:
            CONFIG.noticiasPorPagina,
        totalPaginas,
        ultimaActualizacion:
            new Date().toISOString()
    };

    fs.writeFileSync(
        path.join(
            CONFIG.carpetaPaginasJson,
            "metadata.json"
        ),
        JSON.stringify(metadata, null, 2),
        "utf8"
    );

    for (
        let i = 0;
        i < totalPaginas;
        i++
    ) {
        const inicio =
            i *
            CONFIG.noticiasPorPagina;

        const noticiasPagina =
            noticiasOrdenadas.slice(
                inicio,
                inicio +
                CONFIG.noticiasPorPagina
            );

        const paginaData = {
            pagina: i + 1,
            totalNoticias:
                noticiasPagina.length,
            noticias:
                noticiasPagina,
            tieneSiguiente:
                i + 1 < totalPaginas,
            tieneAnterior:
                i > 0
        };

        fs.writeFileSync(
            path.join(
                CONFIG.carpetaPaginasJson,
                `pagina-${i + 1}.json`
            ),
            JSON.stringify(
                paginaData,
                null,
                2
            ),
            "utf8"
        );
    }

    return totalPaginas;
}

/* ==================================================
   GENERAR SITEMAP
================================================== */

function generarSitemap(noticias) {
    const urlsEstaticas =
        CONFIG.archivosEstaticosSitemap.map(
            ruta => {
                return `    <url>
        <loc>${CONFIG.dominio}${ruta}</loc>
    </url>`;
            }
        );

    const urlsNoticias =
        noticias.map(noticia => {
            const slug =
                noticia.slug ||
                crearSlug(noticia.titulo);

            return `    <url>
        <loc>${CONFIG.dominio}/noticias/${slug}.html</loc>
        <lastmod>${noticia.fecha}</lastmod>
    </url>`;
        });

    const sitemap =
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[
    ...urlsEstaticas,
    ...urlsNoticias
].join("\n")}
</urlset>
`;

    fs.writeFileSync(
        "sitemap.xml",
        sitemap,
        "utf8"
    );
}

/* ==================================================
   EJECUTAR PUBLICACIÓN
================================================== */

function ejecutar() {
    console.log(
        "📖 Leyendo noticias.json..."
    );

    if (
        !fs.existsSync(
            CONFIG.archivoNoticias
        )
    ) {
        throw new Error(
            `No se encontró ${CONFIG.archivoNoticias} en la carpeta actual.`
        );
    }

    const noticias =
        JSON.parse(
            fs.readFileSync(
                CONFIG.archivoNoticias,
                "utf8"
            )
        );

    if (!Array.isArray(noticias)) {
        throw new Error(
            "noticias.json debe contener un arreglo JSON."
        );
    }

    validarNoticias(noticias);

    const noticiasOrdenadas =
        [...noticias]
            .filter(
                noticia =>
                    noticia.visible !== false
            )
            .sort(
                (a, b) =>
                    b.id - a.id
            );

    const totalPaginas =
        generarPaginacion(
            noticiasOrdenadas
        );

    console.log(
        `✅ Paginación JSON generada: ${totalPaginas} página(s).`
    );

    asegurarCarpeta(
        CONFIG.carpetaNoticiasHtml
    );

    noticiasOrdenadas.forEach(
        noticia => {
            const slug =
                noticia.slug ||
                crearSlug(
                    noticia.titulo
                );

            const archivo =
                path.join(
                    CONFIG.carpetaNoticiasHtml,
                    `${slug}.html`
                );

            fs.writeFileSync(
                archivo,
                generarHtmlNoticia(
                    noticia
                ),
                "utf8"
            );

            console.log(
                `✅ ${archivo}`
            );
        }
    );

    generarSitemap(
        noticiasOrdenadas
    );

    console.log(
        "✅ sitemap.xml actualizado."
    );

    console.log(
        `\n🎉 Publicación generada: ${noticiasOrdenadas.length} noticia(s).`
    );

    console.log(
        "📤 Sube los cambios de noticias/, noticias-paginas/, sitemap.xml y noticias-loader.js."
    );
}

try {
    ejecutar();
} catch (error) {
    console.error(
        `\n❌ ${error.message}`
    );

    process.exitCode = 1;
}
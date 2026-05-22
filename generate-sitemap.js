// generate-sitemap.js
const fs = require('fs');

// Leer noticias.json
console.log('📖 Leyendo noticias.json...');
const noticias = JSON.parse(fs.readFileSync('noticias.json', 'utf8'));

// Fecha de hoy para el sitemap
const today = new Date().toISOString().split('T')[0];

// URLs principales del sitio
const urlsPrincipales = [
    { loc: '/', priority: 1.0, changefreq: 'daily', lastmod: today },
    { loc: '/noticias.html', priority: 0.9, changefreq: 'daily', lastmod: today },
    { loc: '/podcast.html', priority: 0.8, changefreq: 'weekly', lastmod: today },
    { loc: '/nosotros.html', priority: 0.5, changefreq: 'monthly', lastmod: today }
];

// Construir el XML
let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

// Agregar URLs principales
urlsPrincipales.forEach(url => {
    sitemap += '  <url>\n';
    sitemap += `    <loc>https://tokiopanic.com${url.loc}</loc>\n`;
    sitemap += `    <lastmod>${url.lastmod}</lastmod>\n`;
    sitemap += `    <changefreq>${url.changefreq}</changefreq>\n`;
    sitemap += `    <priority>${url.priority}</priority>\n`;
    sitemap += '  </url>\n';
});

// Agregar cada noticia
console.log(`📄 Generando URLs para ${noticias.length} noticias...`);

noticias.forEach(noticia => {
    // Formatear fecha (YYYY-MM-DD)
    const fecha = noticia.fecha || today;
    
    sitemap += '  <url>\n';
    sitemap += `    <loc>https://tokiopanic.com/noticia.html?id=${noticia.id}</loc>\n`;
    sitemap += `    <lastmod>${fecha}</lastmod>\n`;
    sitemap += `    <changefreq>monthly</changefreq>\n`;
    sitemap += `    <priority>0.7</priority>\n`;
    sitemap += '  </url>\n';
});

// Cerrar el sitemap
sitemap += '</urlset>';

// Guardar el archivo
fs.writeFileSync('sitemap.xml', sitemap);
console.log('✅ sitemap.xml generado correctamente');
console.log(`📊 Total de URLs: ${urlsPrincipales.length + noticias.length}`);
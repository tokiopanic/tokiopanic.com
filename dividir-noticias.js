// dividir-noticias.js
const fs = require('fs');

// Leer el archivo original
console.log('📖 Leyendo noticias.json...');
const noticias = JSON.parse(fs.readFileSync('noticias.json', 'utf8'));

// Ordenar de más reciente a más antigua
const noticiasOrdenadas = [...noticias].sort((a, b) => b.id - a.id);

// Configuración
const NOTICIAS_POR_PAGINA = 10;
const totalNoticias = noticiasOrdenadas.length;
const totalPaginas = Math.ceil(totalNoticias / NOTICIAS_POR_PAGINA);

console.log(`📊 Total de noticias: ${totalNoticias}`);
console.log(`📄 Páginas necesarias: ${totalPaginas}`);
console.log(`📑 Noticias por página: ${NOTICIAS_POR_PAGINA}`);

// Crear carpeta para las páginas
if (!fs.existsSync('noticias-paginas')) {
    fs.mkdirSync('noticias-paginas');
    console.log('📁 Carpeta creada: noticias-paginas/');
}

// Crear archivo de metadatos
const metadata = {
    totalNoticias: totalNoticias,
    noticiasPorPagina: NOTICIAS_POR_PAGINA,
    totalPaginas: totalPaginas,
    ultimaActualizacion: new Date().toISOString()
};
fs.writeFileSync('noticias-paginas/metadata.json', JSON.stringify(metadata, null, 2));
console.log('✅ Creado: noticias-paginas/metadata.json');

// Generar cada página
for (let i = 0; i < totalPaginas; i++) {
    const inicio = i * NOTICIAS_POR_PAGINA;
    const fin = Math.min(inicio + NOTICIAS_POR_PAGINA, totalNoticias);
    const noticiasPagina = noticiasOrdenadas.slice(inicio, fin);
    
    const paginaData = {
        pagina: i + 1,
        totalNoticias: noticiasPagina.length,
        noticias: noticiasPagina,
        tieneSiguiente: i + 1 < totalPaginas,
        tieneAnterior: i > 0
    };
    
    const nombreArchivo = `noticias-paginas/pagina-${i + 1}.json`;
    fs.writeFileSync(nombreArchivo, JSON.stringify(paginaData, null, 2));
    console.log(`✅ Creado: ${nombreArchivo} (${noticiasPagina.length} noticias)`);
}

console.log('\n🎉 ¡Proceso completado!');
console.log('📤 Sube la carpeta "noticias-paginas" a GitHub');

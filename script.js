document.addEventListener('DOMContentLoaded', function() {

    const radioBar = document.querySelector('.radio-bar');

    if (radioBar) {
        radioBar.addEventListener('click', toggleRadio);
    }

});

// ===== CARRUSEL DE NOTICIAS DESTACADAS =====
document.addEventListener('DOMContentLoaded', async function () {
    const carousel = document.getElementById('hero-carousel');
    const slidesContainer = carousel?.querySelector('.hero-slides');
    const content = carousel?.querySelector('.hero-content');
    const previous = carousel?.querySelector('.hero-control-prev');
    const next = carousel?.querySelector('.hero-control-next');
    const dots = carousel?.querySelector('.hero-dots');

    if (!carousel || !slidesContainer || !content || !previous || !next || !dots) return;

    try {
        const response = await fetch('noticias-paginas/pagina-1.json');
        if (!response.ok) throw new Error('No se pudieron cargar las noticias destacadas');

        const data = await response.json();
        const featured = (data.noticias || [])
            .filter(noticia => noticia.visible !== false && noticia.imagen)
            .sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
            .slice(0, 4);

        if (!featured.length) return;

        const tag = content.querySelector('.tag');
        const title = content.querySelector('.hero-title');
        const description = content.querySelector('.hero-description');
        const link = content.querySelector('.hero-btn');
        let activeIndex = 0;
        let timer;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        featured.forEach((noticia, index) => {
            const slide = document.createElement('div');
            slide.className = 'hero-slide';
            slide.style.backgroundImage = `url(${JSON.stringify(noticia.imagen)})`;
            slidesContainer.appendChild(slide);

            const dot = document.createElement('button');
            dot.className = 'hero-dot';
            dot.type = 'button';
            dot.setAttribute('aria-label', `Mostrar noticia ${index + 1}: ${noticia.titulo}`);
            dot.addEventListener('click', () => show(index, true));
            dots.appendChild(dot);
        });

        function show(index, restartTimer = false) {
            activeIndex = (index + featured.length) % featured.length;
            const noticia = featured[activeIndex];
            const slug = noticia.slug || String(noticia.titulo || '')
                .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

            slidesContainer.querySelectorAll('.hero-slide').forEach((slide, i) =>
                slide.classList.toggle('is-active', i === activeIndex)
            );
            dots.querySelectorAll('.hero-dot').forEach((dot, i) => {
                dot.classList.toggle('is-active', i === activeIndex);
                dot.setAttribute('aria-current', i === activeIndex ? 'true' : 'false');
            });

            tag.textContent = 'EN PORTADA';
            title.textContent = noticia.titulo || '';
            description.textContent = noticia.resumen || '';
            link.href = `noticias/${slug}.html`;
            link.textContent = 'Leer ahora';
            content.classList.add('is-ready');
            if (restartTimer) startTimer();
        }

        function startTimer() {
            window.clearInterval(timer);
            if (!reducedMotion && featured.length > 1) {
                timer = window.setInterval(() => show(activeIndex + 1), 7000);
            }
        }

        previous.addEventListener('click', () => show(activeIndex - 1, true));
        next.addEventListener('click', () => show(activeIndex + 1, true));
        carousel.addEventListener('mouseenter', () => window.clearInterval(timer));
        carousel.addEventListener('mouseleave', startTimer);
        carousel.addEventListener('focusin', () => window.clearInterval(timer));
        carousel.addEventListener('focusout', event => {
            if (!carousel.contains(event.relatedTarget)) startTimer();
        });

        show(0);
        startTimer();
    } catch (error) {
        console.error('El carrusel conserva la portada fija:', error);
    }
});

function toggleRadio() {
    const player = document.getElementById("radioPlayer");
    const toggle = player.querySelector(".radio-toggle");

    player.classList.toggle("active");

    if (toggle) {
        toggle.textContent = player.classList.contains("active") ? "▼" : "▲";
    }
}

// ===== MENÚ HAMBURGUESA =====
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    
    if (menuToggle && mainNav) {
        // Abrir/cerrar menú al hacer clic
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mainNav.classList.toggle('open');
        });
        
        // Cerrar menú al hacer clic en un enlace
        const links = mainNav.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function() {
                menuToggle.classList.remove('active');
                mainNav.classList.remove('open');
            });
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {

    const radioBar = document.querySelector('.radio-bar');

    if (radioBar) {
        radioBar.addEventListener('click', toggleRadio);
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
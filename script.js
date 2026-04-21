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
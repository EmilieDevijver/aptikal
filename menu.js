document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('.navigation');
    
    menuToggle.addEventListener('click', function() {
        navigation.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
    
    // Fermer le menu quand on clique sur un lien
    const navLinks = document.querySelectorAll('.navigation a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navigation.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });
    
    // Fermer le menu si on clique en dehors
    document.addEventListener('click', function(event) {
        if (!navigation.contains(event.target) && !menuToggle.contains(event.target)) {
            navigation.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    });
});

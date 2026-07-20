var slides = document.querySelectorAll('.slide');
var currentSlide = 0;
var slideInterval = null;
var gallery = document.getElementById('gallery');

function showSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function(s, i) {
        s.classList.toggle('show', i === currentSlide);
    });
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

function prevSlide() {
    showSlide(currentSlide - 1);
}

function startSlideInterval() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
    slideInterval = setInterval(nextSlide, 3000);
}

if (slides.length > 0) {
    showSlide(0);
    startSlideInterval();
}

if (gallery) {
    var prevButton = gallery.querySelector('.carousel-button.prev');
    var nextButton = gallery.querySelector('.carousel-button.next');

    if (prevButton) {
        prevButton.addEventListener('click', function() {
            prevSlide();
            startSlideInterval();
        });
    }
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            nextSlide();
            startSlideInterval();
        });
    }
}

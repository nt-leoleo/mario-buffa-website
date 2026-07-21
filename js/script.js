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

// Header se achica al hacer scroll
var header = document.querySelector('header');
if (header) {
    window.addEventListener('scroll', function() {
        if (window.scrollY > 190) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Logo desaparece al hacer scroll
var logo = document.querySelector('.logo');
if (logo) {
    window.addEventListener('scroll', function() {
        if (window.scrollY > 0) {
            logo.classList.add('hidden');
        } else {
            logo.classList.remove('hidden');
        }
    });
}

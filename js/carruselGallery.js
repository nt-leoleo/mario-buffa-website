const prevButton = document.querySelector('.prev');
const nextButton = document.querySelector('.next');
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;

function changeSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide++;
    if(currentSlide >= slides.length) {
        currentSlide = 0;
    }
    slides[currentSlide].classList.add('active');
    console.log(`current slide ${currentSlide}`)
}
// setInterval(changeSlide, 3000);

function prevSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide--;
    if(currentSlide < 0) {
        currentSlide = slides.length - 1;
    }
    slides[currentSlide].classList.add('active');
}
function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide++;
    if(currentSlide >= slides.length) {
        currentSlide = 0;
    }
    slides[currentSlide].classList.add('active');
}
prevButton.addEventListener('click', prevSlide);
nextButton.addEventListener('click', nextSlide);
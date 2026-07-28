const burgerMenu = document.querySelector('.burger-menu');
const mHeader = document.querySelector('header');

function openMenu() {
    mHeader.classList.add('inactive')
    burgerMenu.classList.remove('inactive');
}
function closeMenu() {
    burgerMenu.classList.add('inactive');
    mHeader.classList.remove('inactive');
}
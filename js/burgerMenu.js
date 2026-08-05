const burgerMenu = document.querySelector('.burger-menu');
const mHeader = document.querySelector('header');
const pHeader = document.querySelector('.pre-header');

function openMenu() {
    mHeader.classList.add('disabled');
    pHeader.classList.add('disabled');
    burgerMenu.classList.remove('inactive');
}
function closeMenu() {
    burgerMenu.classList.add('inactive');
    mHeader.classList.remove('disabled');
    pHeader.classList.remove('disabled');
}
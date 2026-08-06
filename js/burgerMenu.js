export function burgerMenu() {
    const burger = document.querySelector(".burger");
    const close = document.querySelector('.close-menu');
    const burgerMenu = document.querySelector('.burger-menu');
    const mHeader = document.querySelector('header');
    const pHeader = document.querySelector('.pre-header');
    if (!burger || !close || !burgerMenu) return;

    burger.addEventListener('click', () => {
        mHeader.classList.add('disabled');
        pHeader.classList.add('disabled');
        burgerMenu.classList.remove('inactive');
    });

    close.addEventListener('click', () => {
        burgerMenu.classList.add('inactive');
        mHeader.classList.remove('disabled');
        pHeader.classList.remove('disabled');
    });
}
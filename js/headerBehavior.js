const header = document.querySelector("header");
const preHeader = document.querySelector('.pre-header');
let headerOffsetHeight = preHeader.offsetHeight;
let active = false;

window.addEventListener('scroll', () => {

    if (window.scrollY > headerOffsetHeight && !active) {
        active = true;
        header.classList.add("active");
        // console.log("scrolled");
    }

    if (window.scrollY <= headerOffsetHeight && active) {
        active = false;
        header.classList.remove("active");
        // console.log("un-scrolled");
    }

});
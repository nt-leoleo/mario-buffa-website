export function headerBehavior() {
    const header = document.querySelector("header");
    const preHeader = document.querySelector('.pre-header');

    if (!header) return;

    let active = false;
    let headerOffsetHeight = preHeader.offsetHeight;
    document.documentElement.style.setProperty(
        '--preHeader-height',
        `${preHeader.offsetHeight}px`
    );
    document.documentElement.style.setProperty(
        '--header-height',
        `${header.offsetHeight}px`
    );

    window.addEventListener('scroll', () => {

        if (window.scrollY > headerOffsetHeight && !active) {
            active = true;
            header.classList.add("active");
            preHeader.classList.add('disabled');
            // console.log("scrolled");
        }

        if (window.scrollY <= headerOffsetHeight && active) {
            active = false;
            header.classList.remove("active");
            preHeader.classList.remove('disabled');
            // console.log("un-scrolled");
        }

    });
}
export function headerBehavior() {
    const header = document.querySelector("header");
    const preHeader = document.querySelector('.pre-header');
    const searchNav = document.querySelector('#headerProductSearch');
    const search = document.querySelector('.header-search');
    const results = document.querySelector('.header-search-results');

    if (!header || !preHeader || !searchNav || !search) return;

    let active = false;

    const headerOffsetHeight =
        preHeader.offsetHeight + header.offsetHeight;

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
            searchNav.classList.add('active');
            search.classList.add('active');
        }

        if (window.scrollY <= headerOffsetHeight && active) {
            active = false;

            header.classList.remove("active");
            preHeader.classList.remove('disabled');
            searchNav.classList.remove('active');
            search.classList.remove('active');
        }

    });

    searchNav.addEventListener('click', () => {

        active = true;

        header.classList.add("active");
        preHeader.classList.add('disabled');
        searchNav.classList.add('active');
        search.classList.add('active');
        results.classList.add('active');

    });

    document.addEventListener('click', (e) => {

        if (!header.contains(e.target)) {

            active = false;

            header.classList.remove("active");
            preHeader.classList.remove('disabled');
            searchNav.classList.remove('active');
            search.classList.remove('active');
            results.classList.remove('active');
        }

    });
}
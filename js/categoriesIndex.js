
document.addEventListener("DOMContentLoaded", () => {
    const slider = document.querySelector(".product-categories");
    if (!slider) return;

    const viewport = slider.querySelector(".categories-viewport");
    const track = slider.querySelector(".categories-track");
    const prevButton = slider.querySelector(".slider-prev");
    const nextButton = slider.querySelector(".slider-next");

    const updateButtons = () => {
        const maxScroll = viewport.scrollWidth - viewport.clientWidth;

        prevButton.disabled = viewport.scrollLeft <= 0;
        nextButton.disabled = viewport.scrollLeft >= maxScroll - 1;
    };

    const getScrollAmount = () => {
        const card = track.querySelector(".category-card");
        if (!card) return viewport.clientWidth;

        const gap = parseFloat(getComputedStyle(track).columnGap) || 0;

        return (card.offsetWidth + gap) * 2;
    };

    prevButton.addEventListener("click", () => {
        viewport.scrollBy({
            left: -getScrollAmount(),
            behavior: "smooth"
        });
    });

    nextButton.addEventListener("click", () => {
        viewport.scrollBy({
            left: getScrollAmount(),
            behavior: "smooth"
        });
    });

    viewport.addEventListener("scroll", updateButtons);
    window.addEventListener("resize", updateButtons);

    updateButtons();
});

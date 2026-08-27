const modal = document.querySelector("#productModal");

const modalImage = document.querySelector("#modalImage");
const modalName = document.querySelector("#modalName");
const modalDescription = document.querySelector("#modalDescription");
const modalWhatsapp = document.querySelector("#modalWhatsapp");

const leftImageButton = document.querySelector("#leftImage");
const rightImageButton = document.querySelector("#rightImage");

const closeModal = document.querySelector("#closeModal");
const productModal = document.querySelector(".product-modal");

const indicatorContainer = document.querySelector(
    ".active-img-indicator-container"
);

let currentImages = [];
let imagePosition = 0;


// ─────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────

function openProductModal() {
    modal.classList.add("active");
    document.body.classList.add("modal-open");
}

function closeProductModal() {
    modal.classList.remove("active");
    document.body.classList.remove("modal-open");

    currentImages = [];
    imagePosition = 0;

    indicatorContainer.innerHTML = "";
}


// ─────────────────────────────────────────────
// SLIDER
// ─────────────────────────────────────────────

function updateSlider() {

    modalImage.src = currentImages[imagePosition];

    const dots = indicatorContainer.querySelectorAll(".dot");

    dots.forEach((dot, index) => {
        dot.classList.toggle(
            "activeDot",
            index === imagePosition
        );
    });
}


function changeImage(direction) {

    if (!currentImages.length) return;

    imagePosition += direction;

    if (imagePosition < 0) {
        imagePosition = currentImages.length - 1;
    }

    if (imagePosition >= currentImages.length) {
        imagePosition = 0;
    }

    updateSlider();
}


// ─────────────────────────────────────────────
// PRODUCTOS
// ─────────────────────────────────────────────

fetch("./data/products.json")
    .then(response => response.json())
    .then(products => {

        const productCards = document.querySelectorAll(
            ".main-products .card, .other-products .card"
        );

        productCards.forEach(card => {

            card.addEventListener("click", () => {

                const product = products[card.id];

                currentImages = Object.values(product.images);
                imagePosition = 0;

                indicatorContainer.innerHTML = "";

                currentImages.forEach(() => {

                    const dot = document.createElement("div");

                    dot.classList.add("dot");

                    indicatorContainer.appendChild(dot);
                });

                modalName.textContent = product.name;
                modalDescription.textContent = product.description;
                modalImage.alt = product.name;

                const message =
                    `Hola, quisiera consultar por el producto ${product.name}.`;

                modalWhatsapp.href =
                    `https://wa.me/5492664327955?text=${encodeURIComponent(message)}`;

                updateSlider();
                openProductModal();
            });
        });
    });


// ─────────────────────────────────────────────
// CONTROLES DEL SLIDER
// ─────────────────────────────────────────────

leftImageButton.addEventListener("click", () => {
    changeImage(-1);
});

rightImageButton.addEventListener("click", () => {
    changeImage(1);
});


// ─────────────────────────────────────────────
// CIERRE DEL MODAL
// ─────────────────────────────────────────────

modal.addEventListener("click", closeProductModal);

productModal.addEventListener("click", event => {
    event.stopPropagation();
});

closeModal.addEventListener("click", closeProductModal);

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        closeProductModal();
    }

});
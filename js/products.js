const modal = document.querySelector("#productModal");

const modalImage = document.querySelector("#modalImage");
const modalName = document.querySelector("#modalName");
const modalDescription = document.querySelector("#modalDescription");
const modalWhatsapp = document.querySelector("#modalWhatsapp");

const closeModal = document.querySelector("#closeModal");
const productModal = document.querySelector(".product-modal");

function openProductModal() {
    modal.classList.add("active");
    document.body.classList.add("modal-open");
}

function closeProductModal() {
    modal.classList.remove("active");
    document.body.classList.remove("modal-open");
}

fetch("./data/products.json")
    .then(response => response.json())
    .then(products => {

        const productCards = document.querySelectorAll(
            ".main-products .card, .other-products .card"
        );

        productCards.forEach(card => {

            card.addEventListener("click", () => {
                const product = products[card.id];
                const indicatorContainer = document.querySelector(".active-img-indicator-container");
                indicatorContainer.innerHTML = "";
                
                const images = Object.values(product.images);
                images.forEach((image, index) => {

                    const dot = document.createElement("div");

                    dot.classList.add("dot");

                    if (index === 0) {
                        dot.classList.add("active");
                    }

                    indicatorContainer.appendChild(dot);
                });

                modalImage.src = images[0];

                modalName.textContent = product.name;
                modalImage.alt = product.name;

                modalDescription.textContent = product.description;
                const message = `Hola, quisiera consultar por el producto ${product.name}.`;

                modalWhatsapp.href =
                    `https://wa.me/5492664327955?text=${encodeURIComponent(message)}`;

                openProductModal();
            });

        });

    });




modal.addEventListener("click", () => {
    closeProductModal();
});


productModal.addEventListener("click", event => {
    event.stopPropagation();
});


closeModal.addEventListener("click", () => {
    closeProductModal();
});
document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        closeProductModal();
    }

});
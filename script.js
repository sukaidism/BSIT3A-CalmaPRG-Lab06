async function getData() {
    const url = "https://fakestoreapi.com/products";
    try {
        const response = await fetch(url);
        if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        return result;
    } catch (error) {
        console.error(error.message);
    }
}

const data = getData();
const tableProducts = document.getElementById("table-product");
const productModal = document.getElementById("productModal");
const searchInput = document.querySelector('input[aria-label="Search invoice"]');
let productsCache = [];

function renderProducts(products) {
    tableProducts.innerHTML = "";

    products.forEach(product => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><input class="form-check-input m-0 align-middle table-selectable-check" type="checkbox" aria-label="Select invoice"></td>
            <td><span class="text-secondary">${product.id}</span></td>
            <td>${product.category}</td>
            <td>
                <span class="rounded-circle" width="20" height="20">
                    <img src="${product.image}" alt="${product.title}" class="rounded-circle" width="30">
                </span>
                ${product.title}
            </td>
            <td>${product.price.toFixed(2)}</td>
            <td>${product.rating.rate} (${product.rating.count})</td>
            <td class="text-left">
                <button class="btn btn-info align-text-top view-product-btn" data-product-id="${product.id}" data-bs-toggle="modal" data-bs-target="#productModal">View</button>
            </td>
        `;
        tableProducts.appendChild(row);
    });
}

data.then(products => {
    productsCache = products;
    renderProducts(productsCache);
});

if (searchInput) {
    searchInput.addEventListener("input", function() {
        const keyword = searchInput.value.trim().toLowerCase();
        const filteredProducts = productsCache.filter(product => {
            return product.title.toLowerCase().includes(keyword) || product.category.toLowerCase().includes(keyword);
        });

        renderProducts(keyword ? filteredProducts : productsCache);
    });
}

function fillProductModal(product) {
    productModal.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalProductTitle">${product.title}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"
                aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="row g-3 align-items-start">
                    <div class="col-12 col-md-5">
                    <div class="bg-light rounded p-3 d-flex justify-content-center">
                        <img id="modalProductImage" src="${product.image}" alt="${product.title}" class="img-fluid" style="max-height: 220px; object-fit: contain;">
                    </div>
                    </div>
                    <div class="col-12 col-md-7">
                    <div class="d-flex align-items-center gap-2 mb-2">
                        <span id="modalProductCategory" class="badge bg-azure-lt text-azure">${product.category}</span>
                    </div>
                    <div class="h3 mb-2" id="modalProductName">${product.title}</div>
                    <div class="d-flex align-items-center gap-3 mb-3">
                        <div class="h2 m-0 text-primary" id="modalProductPrice">$${product.price.toFixed(2)}</div>
                        <div class="text-secondary" id="modalProductRating">${product.rating.rate} (${product.rating.count} reviews)</div>
                    </div>
                    <p class="text-secondary mb-0" id="modalProductDescription">${product.description}</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary me-auto"
                data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary">Add to Cart</button>
            </div>
            </div>
        </div>`;
}

productModal.addEventListener("show.bs.modal", function(event) {
    const trigger = event.relatedTarget;
    if (!(trigger instanceof Element)) {
        return;
    }

    const button = trigger.closest(".view-product-btn");
    if (!button) {
        return;
    }

    const productId = button.getAttribute("data-product-id");
    const product = productsCache.find(p => p.id == productId);
    if (product) {
        fillProductModal(product);
    }
});

productModal.addEventListener("hidden.bs.modal", function() {
    // Guard against stale backdrops/body lock state after dynamic modal content updates.
    document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.remove());
    document.body.classList.remove("modal-open");
    document.body.style.removeProperty("overflow");
    document.body.style.removeProperty("padding-right");
    productModal.innerHTML = "";
});
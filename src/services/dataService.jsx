export const getProducts = () => {
    return JSON.parse(localStorage.getItem("products")) || [];
};

export const saveProducts = (products) => {
    localStorage.setItem("products", JSON.stringify(products));

    window.dispatchEvent(new Event("productsUpdated"));
};

export const addProduct = (product) => {
    const products = getProducts();
    saveProducts([...products, product]);
};

export const updateProduct = (updatedProduct) => {
    const products = getProducts().map(product =>
        product.id === updatedProduct.id ? updatedProduct : product
    );

    saveProducts(products);
};

export const deleteProduct = (id) => {
    const products = getProducts().filter(product => product.id !== id);
    saveProducts(products);
};

export const updateProductQuantity = (productId, quantitySold) => {
    const products = getProducts().map(product => {
        if (product.id === productId) {
            return {
                ...product,
                quantity: product.quantity - quantitySold
            };
        }
        return product;
    });

    saveProducts(products);
};

export const restoreProductQuantity = (productId, quantity) => {
    const products = getProducts().map(product => {
        if (product.id === productId) {
            return {
                ...product,
                quantity: product.quantity + quantity
            };
        }
        return product;
    });

    saveProducts(products);
};

export const getCustomers = () => {
    return JSON.parse(localStorage.getItem("customers")) || [];
};

export const saveCustomers = (customers) => {
    localStorage.setItem("customers", JSON.stringify(customers));
};

export const getInvoices = () => {
    return JSON.parse(localStorage.getItem("invoices")) || [];
};

export const saveInvoices = (invoices) => {
    localStorage.setItem("invoices", JSON.stringify(invoices));
};

export const deleteInvoice = (id) => {
    const invoices = getInvoices().filter(inv => inv.id !== id);
    localStorage.setItem("invoices", JSON.stringify(invoices));
};
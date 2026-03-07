const PRODUCTS_KEY = "products";

const defaultProducts = [
    {
        id: crypto.randomUUID(),
        name: "مولتو",
        buyPrice: 281,
        sellPrice: 300,
        quantity: 15,
    },
];

// تشغيله مرة واحدة فقط لو مفيش منتجات
export const initializeProducts = () => {
    const existing = localStorage.getItem(PRODUCTS_KEY);

    if (!existing || JSON.parse(existing).length === 0) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
    }
};

// جلب المنتجات
export const getProducts = () => {
    return JSON.parse(localStorage.getItem(PRODUCTS_KEY)) || [];
};

export default defaultProducts;
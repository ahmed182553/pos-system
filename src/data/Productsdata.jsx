const defaultProducts = [
    {
        id: 1,
        name: "توينكيز 5ج",
        buyPrice: 755,
        sellPrice: 795,
        quantity: 10,
    },
    {
        id: 2,
        name: "هوهوز 5ج",
        buyPrice: 755,
        sellPrice: 795,
        quantity: 10,
    },
    {
        id: 3,
        name: "هوهوز 10ج ",
        buyPrice: 755,
        sellPrice: 795,
        quantity: 15,
    },
];

// 🔥 نحط المنتجات في localStorage لو مفيش منتجات متخزنة
export const initializeProducts = () => {
    const existing = localStorage.getItem("products");

    if (!existing) {
        localStorage.setItem("products", JSON.stringify(defaultProducts));
    }
};

export default defaultProducts;
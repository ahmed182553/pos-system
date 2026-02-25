const defaultProducts = [
    {
        id: 1,
        name: "لاب توب",
        buyPrice: 8000,
        sellPrice: 9500,
        quantity: 5,
    },
    {
        id: 2,
        name: "ماوس",
        buyPrice: 100,
        sellPrice: 150,
        quantity: 20,
    },
    {
        id: 3,
        name: "كيبورد",
        buyPrice: 250,
        sellPrice: 350,
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
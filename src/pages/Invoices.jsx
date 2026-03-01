import { useEffect, useState } from "react";
import Cart from "../components/Cart";
import { getProducts } from "../services/dataService";
import { getCustomers } from "../services/customerService";
import { addInvoice } from "../services/invoiceService";


export default function Invoices() {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState("");

    useEffect(() => {
        setCustomers(getCustomers());
    }, []);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState("");

    // تحميل المنتجات والسلة
    useEffect(() => {
        setProducts(getProducts());

        const savedCart =
            JSON.parse(localStorage.getItem("cart")) || [];

        setCart(savedCart);

        // 👂 سماع تحديث المنتجات
        const handleProductsUpdate = () => {
            setProducts(getProducts());
        };

        window.addEventListener("productsUpdated", handleProductsUpdate);

        return () => {
            window.removeEventListener("productsUpdated", handleProductsUpdate);
        };

    }, []);

    // حفظ السلة
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    // فلترة المنتجات
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    // إضافة للسلة
    const addToCart = (product) => {

        if (product.quantity <= 0) {
            alert("المنتج غير متوفر في المخزون");
            return;
        }

        const existing = cart.find(item => item.id === product.id);

        if (existing) {

            if (existing.quantity >= product.quantity) {
                alert("لا يمكن بيع كمية أكبر من المخزون");
                return;
            }

            setCart(
                cart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );

        } else {

            setCart([
                ...cart,
                {
                    id: product.id,
                    name: product.name,
                    sellPrice: product.sellPrice,
                    buyPrice: product.buyPrice,
                    quantity: 1
                }
            ]);
        }
    };

    const increaseQty = (id) => {

        const product = products.find(p => p.id === id);

        setCart(cart.map(item => {

            if (item.id === id) {

                if (item.quantity >= product.quantity) {
                    alert("وصلت للحد الأقصى من المخزون");
                    return item;
                }

                return { ...item, quantity: item.quantity + 1 };
            }

            return item;
        }));
    };

    const decreaseQty = (id) => {

        setCart(
            cart.map(item =>
                item.id === id
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            ).filter(item => item.quantity > 0)
        );
    };

    const removeItem = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const totalAmount = cart.reduce(
        (acc, item) => acc + item.sellPrice * item.quantity,
        0
    );

    // 🔥🔥🔥 عملية الدفع + حفظ الفاتورة + خصم المخزون
    const handleCheckout = () => {

        if (cart.length === 0) {
            alert("السلة فارغة");
            return;
        }

        if (!selectedCustomer) {
            alert("من فضلك اختر عميل أولاً");
            return;
        }

        const customers = getCustomers();
        const customer = customers.find(c => c.id === selectedCustomer);

        if (!customer) {
            alert("العميل غير موجود");
            return;
        }

        const allInvoices =
            JSON.parse(localStorage.getItem("invoices")) || [];

        const payments =
            JSON.parse(localStorage.getItem("payments")) || [];

        let previousBalance = 0;

        previousBalance += Number(customer.previousBalance || 0);

        allInvoices.forEach(inv => {

            if (inv.customerId === selectedCustomer) {

                const invoicePayments = payments.filter(
                    p => p.invoiceId === inv.id
                );

                const paid = invoicePayments.reduce(
                    (sum, p) => sum + p.amount,
                    0
                );

                previousBalance += (inv.total - paid);
            }
        });

        // 1️⃣ خصم الكميات من المخزون
        const updatedProducts = products.map(product => {

            const cartItem = cart.find(item => item.id === product.id);

            if (cartItem) {
                return {
                    ...product,
                    quantity: product.quantity - cartItem.quantity
                };
            }

            return product;
        });

        localStorage.setItem("products", JSON.stringify(updatedProducts));

        // 2️⃣ إنشاء الفاتورة كاملة بالرصيد السابق
        const newInvoice = {
            id: Date.now(),
            customerId: selectedCustomer,
            customerName: customer.name,
            date: new Date().toISOString(),
            items: cart,
            total: totalAmount,
            previousBalance: previousBalance
        };

        window.dispatchEvent(new Event("productsUpdated"));

        setCart([]);
        setSelectedCustomer("");
        localStorage.removeItem("cart");

        alert("تمت عملية البيع وحفظ الفاتورة بنجاح ✅");
    };
    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen grid lg:grid-cols-2 gap-8">

            <div>
                <h2 className="text-xl font-bold mb-4">
                    المنتجات
                </h2>


                <input
                    type="text"
                    placeholder="بحث عن منتج..."
                    className="mb-4 p-2 border rounded w-full"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

                    {filteredProducts.map((product) => (

                        <div
                            key={product.id}
                            onClick={() => addToCart(product)}
                            className={`bg-white p-4 rounded-xl shadow cursor-pointer hover:shadow-lg transition 
                                ${product.quantity < 5 ? "border border-red-400" : ""}
                                `}
                        >
                            <h3 className="font-semibold">
                                {product.name}
                            </h3>

                            <p className={`text-sm 
                                ${product.quantity < 5
                                    ? "text-red-500 font-semibold"
                                    : "text-gray-500"
                                }`}
                            >
                                المخزون: {product.quantity}
                            </p>

                            <p className="text-blue-600 font-bold">
                                {product.sellPrice} جنيه
                            </p>

                        </div>
                    ))}

                </div>
            </div>

            <Cart
                cart={cart}
                totalAmount={totalAmount}
                increaseQty={increaseQty}
                decreaseQty={decreaseQty}
                removeItem={removeItem}
                handleCheckout={handleCheckout}
                customers={customers}
                selectedCustomer={selectedCustomer}
                setSelectedCustomer={setSelectedCustomer}
            />

        </div>
    );
}
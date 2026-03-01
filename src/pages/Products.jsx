import { useEffect, useState } from "react";
import { Plus, ShoppingCart } from "lucide-react";
import {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct
} from "../services/dataService";

export default function Products({ addToCart }) {

    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState("");

    const [newProduct, setNewProduct] = useState({
        name: "",
        quantity: "",
        buyPrice: "",
        sellPrice: ""
    });

    useEffect(() => {
        setProducts(getProducts());

        const handleUpdate = () => {
            setProducts(getProducts());
        };

        window.addEventListener("productsUpdated", handleUpdate);

        return () =>
            window.removeEventListener("productsUpdated", handleUpdate);
    }, []);

    const resetForm = () => {
        setNewProduct({
            name: "",
            quantity: "",
            buyPrice: "",
            sellPrice: ""
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleSaveProduct = () => {
        if (!newProduct.name || !newProduct.quantity || !newProduct.sellPrice) {
            alert("من فضلك أكمل البيانات المطلوبة");
            return;
        }

        if (Number(newProduct.quantity) < 0) {
            alert("الكمية لا يمكن أن تكون بالسالب");
            return;
        }

        const productData = {
            id: editingId || Date.now(),
            name: newProduct.name,
            quantity: Number(newProduct.quantity),
            buyPrice: Number(newProduct.buyPrice),
            sellPrice: Number(newProduct.sellPrice)
        };

        if (editingId) {
            updateProduct(productData);
        } else {
            addProduct(productData);
        }

        resetForm();
    };

    const handleDelete = (id) => {
        if (window.confirm("هل تريد حذف المنتج؟")) {
            deleteProduct(id);
        }
    };

    const handleEdit = (product) => {
        setNewProduct(product);
        setEditingId(product.id);
        setShowForm(true);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold">
                    إدارة المنتجات
                </h2>

                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-lg text-sm sm:text-base"
                >
                    <Plus size={18} />
                    إضافة منتج
                </button>
            </div>

            {/* Search */}
            <input
                type="text"
                placeholder="بحث عن منتج..."
                className="border px-3 py-2 rounded-lg w-full mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {/* Form */}
            {showForm && (
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="اسم المنتج"
                        className="border p-2 rounded text-sm"
                        value={newProduct.name}
                        onChange={(e) =>
                            setNewProduct({ ...newProduct, name: e.target.value })
                        }
                    />
                    <input
                        type="number"
                        placeholder="الكمية"
                        className="border p-2 rounded text-sm"
                        value={newProduct.quantity}
                        onChange={(e) =>
                            setNewProduct({ ...newProduct, quantity: e.target.value })
                        }
                    />
                    <input
                        type="number"
                        placeholder="سعر الشراء"
                        className="border p-2 rounded text-sm"
                        value={newProduct.buyPrice}
                        onChange={(e) =>
                            setNewProduct({ ...newProduct, buyPrice: e.target.value })
                        }
                    />
                    <input
                        type="number"
                        placeholder="سعر البيع"
                        className="border p-2 rounded text-sm"
                        value={newProduct.sellPrice}
                        onChange={(e) =>
                            setNewProduct({ ...newProduct, sellPrice: e.target.value })
                        }
                    />

                    <button
                        onClick={handleSaveProduct}
                        className="col-span-full bg-green-600 hover:bg-green-700 transition text-white py-2 rounded-lg text-sm sm:text-base"
                    >
                        {editingId ? "تعديل المنتج" : "حفظ المنتج"}
                    </button>
                </div>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        className="bg-white rounded-2xl shadow-md p-4 sm:p-5 flex flex-col justify-between hover:shadow-lg transition"
                    >
                        <div>
                            <h3 className="font-bold text-sm sm:text-base truncate">
                                {product.name}
                            </h3>

                            <p
                                className={`text-xs sm:text-sm mt-1 ${product.quantity < 5
                                        ? "text-red-500 font-semibold"
                                        : "text-gray-500"
                                    }`}
                            >
                                المخزون: {product.quantity}
                            </p>

                            <p className="text-blue-600 font-bold mt-2 text-sm sm:text-base">
                                {product.sellPrice} جنيه
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 mt-4">

                            <button
                                onClick={() => addToCart && addToCart(product)}
                                className="bg-green-600 hover:bg-green-700 transition text-white py-2 rounded-xl text-sm"
                            >
                                <ShoppingCart size={16} className="inline mr-1" />
                                إضافة للسلة
                            </button>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 transition text-white py-2 rounded-xl text-sm"
                                >
                                    تعديل
                                </button>

                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="flex-1 bg-red-500 hover:bg-red-600 transition text-white py-2 rounded-xl text-sm"
                                >
                                    حذف
                                </button>
                            </div>

                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}
const CUSTOMERS_KEY = "customers";
import { getInvoices } from "./invoiceService";

// جلب العملاء
export const getCustomers = () => {
    return JSON.parse(localStorage.getItem(CUSTOMERS_KEY)) || [];
};

// إضافة عميل
export const addCustomer = (customer) => {
    const customers = getCustomers();

    const newCustomer = {
        id: Date.now(),
        name: customer.name,
        phone: customer.phone,
        previousBalance: Number(customer.previousBalance) || 0,
    };

    localStorage.setItem(
        CUSTOMERS_KEY,
        JSON.stringify([...customers, newCustomer])
    );
};

// حذف عميل
export const deleteCustomer = (id) => {
    const customers = getCustomers();
    const updated = customers.filter(c => c.id !== id);
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(updated));
};

// تعديل عميل
export const updateCustomer = (id, updatedData) => {
    const customers = getCustomers();

    const updated = customers.map(c =>
        c.id === id ? { ...c, ...updatedData } : c
    );

    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(updated));
};

export const updateCustomerBalance = (customerId, amount) => {
    const customers = getCustomers();

    const updated = customers.map(c =>
        c.id === customerId
            ? { ...c, totalDebt: c.totalDebt + amount }
            : c
    );

    saveCustomers(updated);
};
import { getPayments } from "./paymentService";

export const calculateCustomerBalance = (customerId) => {

    const customers = getCustomers();
    const payments = getPayments();
    const invoices = getInvoices();

    const customer = customers.find(c => c.id === customerId);
    if (!customer) return 0;

    const totalInvoices = invoices
        .filter(inv => inv.customerId === customerId)
        .reduce((sum, inv) => sum + inv.total, 0);

    const totalPayments = payments
        .filter(p => p.customerId === customerId)
        .reduce((sum, p) => sum + p.amount, 0);

    return customer.previousBalance + totalInvoices - totalPayments;
};
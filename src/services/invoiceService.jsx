const INVOICES_KEY = "invoices";

export const getInvoices = () => {
    return JSON.parse(localStorage.getItem(INVOICES_KEY)) || [];
};

export const addInvoice = (invoice) => {

    const invoices = getInvoices();

    const newInvoice = {
        ...invoice,   // يأخذ كل البيانات القادمة من الفاتورة
        id: Date.now()
    };

    localStorage.setItem(
        INVOICES_KEY,
        JSON.stringify([...invoices, newInvoice])
    );
};

export const getCustomerInvoices = (customerId) => {
    return getInvoices().filter(inv => inv.customerId === customerId);
};
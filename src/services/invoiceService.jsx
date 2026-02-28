const INVOICES_KEY = "invoices";

export const getInvoices = () => {
    return JSON.parse(localStorage.getItem(INVOICES_KEY)) || [];
};

export const addInvoice = (invoice) => {
    const invoices = getInvoices();

    const newInvoice = {
        id: Date.now(),
        customerId: invoice.customerId,
        items: invoice.items,
        total: invoice.total,
        date: new Date().toISOString(),
        previousBalance,
    };

    localStorage.setItem(
        INVOICES_KEY,
        JSON.stringify([...invoices, newInvoice])
    );
};

export const getCustomerInvoices = (customerId) => {
    return getInvoices().filter(inv => inv.customerId === customerId);
};
const PAYMENTS_KEY = "payments";

export const getPayments = () => {
    return JSON.parse(localStorage.getItem(PAYMENTS_KEY)) || [];
};

export const addPayment = (payment) => {
    const payments = getPayments();

    const newPayment = {
        id: Date.now(),
        customerId: payment.customerId,
        amount: Number(payment.amount),
        date: new Date().toISOString(),
        note: payment.note || "",
    };

    localStorage.setItem(
        PAYMENTS_KEY,
        JSON.stringify([...payments, newPayment])
    );
};

export const getCustomerPayments = (customerId) => {
    return getPayments().filter(p => p.customerId === customerId);
};
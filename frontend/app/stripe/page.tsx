"use client"
import { Elements, CardElement, useStripe, useElements, Checkout } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
    throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event: any) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        const cardElement = elements.getElement(CardElement);

        if (cardElement) {
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (error) {
                console.log('[error]', error);
            } else {
                console.log('[PaymentMethod]', paymentMethod);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-xl m-auto mt-10 bg-white p-5 rounded shadow">
            <h1 className="text-2xl font-bold mb-5">Payment</h1>
            <div className="flex flex-col mb-5">
                <label className="mb-2">Card Details</label>
                <CardElement className="p-2 border border-gray-300" />
            </div>
            <button type="submit" disabled={!stripe} className="bg-blue-500 text-white px-5 py-2 rounded">
                Pay
            </button>
        </form>
    );
};

export default function Page() {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutForm />
        </Elements>
    );
}
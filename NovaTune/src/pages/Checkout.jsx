import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { paymentsService } from '../api/paymentsApi';
import { useCart } from '../context/CartContext';

// Carga la clave pública desde .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function CheckoutForm({ orderId, onSuccess, onBack }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    // Contexto del carrito (si existe) para limpiar el contador al terminar
    const { refreshCart } = useCart ? useCart() : { refreshCart: async () => {} };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);

        try {
            // 1. Crear token de tarjeta con Stripe (Frontend -> Stripe)
            // Esto nos da un ID tipo "pm_1Ag5..."
            const cardElement = elements.getElement(CardElement);
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (error) throw error;

            // 2. Guardar método en Backend (Nos devuelve el ID interno de Django)
            // Nota: Aunque guardamos el interno, para Stripe usaremos el 'paymentMethod.id'
            const saveRes = await paymentsService.savePaymentMethod(paymentMethod.id);

            // Extraemos el ID del cliente de Stripe (ej: cus_Nfe8...) que nos devuelve el backend
            const customerId = saveRes.data.customer_id;

            // 3. Confirmar Pago (Frontend -> Backend -> Stripe Intent)
            // IMPORTANTE: Ahora pasamos el customerId como tercer argumento
            const intentRes = await paymentsService.confirmPayment(
                orderId,
                paymentMethod.id,
                customerId
            );

            const { status, client_secret } = intentRes.data;

            // CASO A: El pago se completó directamente (sin 3D Secure)
            if (status === 'succeeded') {
                if (refreshCart) await refreshCart();
                onSuccess(); // Esto dispara la redirección en App.jsx
                return;
            }

            // CASO B: Requiere acción adicional (3D Secure / Confirmación del banco)
            if (status === 'requires_action' || (status !== 'succeeded' && client_secret)) {
                const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
                    client_secret,
                    {
                        // CORRECCIÓN IMPORTANTE: Usamos el ID de Stripe (pm_...), no el de la base de datos
                        payment_method: paymentMethod.id
                    }
                );

                if (confirmError) throw confirmError;

                if (paymentIntent.status === 'succeeded') {
                    if (refreshCart) await refreshCart();
                    onSuccess(); // Esto dispara la redirección en App.jsx
                    return;
                }
            }

        } catch (err) {
            console.error(err);
            // Mostrar el mensaje de error de forma amigable
            let mensaje = "Error desconocido";
            if (err.response?.data?.error) mensaje = err.response.data.error;
            else if (err.message) mensaje = err.message;

            alert(`Error en el pago: ${mensaje}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="checkout-form">
            <h3 className="text-xl font-semibold mb-4">Pago Seguro con Tarjeta</h3>

            <div className="p-4 border border-gray-300 rounded mb-6 bg-white">
                <CardElement options={{
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': { color: '#aab7c4' },
                            fontFamily: 'sans-serif',
                        },
                        invalid: { color: '#9e2146' },
                    },
                }}/>
            </div>

            <div className="flex justify-between gap-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                    disabled={loading}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={!stripe || loading}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-bold"
                >
                    {loading ? 'Procesando...' : `Pagar Pedido #${orderId}`}
                </button>
            </div>
        </form>
    );
}

// Componente Wrapper que carga el contexto de Stripe
export default function CheckoutPage({ orderId, onBack, onSuccess }) {
    return (
        <div className="card checkout-view max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg mt-8">
            <h2 className="text-2xl font-bold mb-2 text-center">Finalizar Compra</h2>
            <p className="mb-6 text-gray-600 text-center">
                Estás a un paso de completar tu pedido.
            </p>

            <Elements stripe={stripePromise}>
                <CheckoutForm
                    orderId={orderId}
                    onBack={onBack}
                    onSuccess={onSuccess}
                />
            </Elements>
        </div>
    );
}
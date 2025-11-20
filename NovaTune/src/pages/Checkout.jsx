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
    const { refreshCart } = useCart(); // Para vaciar el contador del header tras pagar

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);

        try {
            // 1. Crear token de tarjeta con Stripe (Frontend -> Stripe)
            const cardElement = elements.getElement(CardElement);
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (error) throw error;

            // 2. Guardar método en Backend (Crea Customer y adjunta PM)
            const saveRes = await paymentsService.savePaymentMethod(paymentMethod.id);
            const internalPmId = saveRes.data.payment_method_id;

            // 3. Confirmar Pago (Frontend -> Backend -> Stripe Intent)
            const intentRes = await paymentsService.confirmPayment(orderId, internalPmId);

            // 4. (Opcional) Manejo de 3D Secure si el backend lo requiriera
            if (intentRes.data.client_secret) {
                const { error: confirmError } = await stripe.confirmCardPayment(
                    intentRes.data.client_secret,
                    { payment_method: internalPmId }
                );
                if (confirmError) throw confirmError;
            }

            // 5. Éxito: Actualizamos carrito y avisamos al padre
            await refreshCart();
            onSuccess();

        } catch (err) {
            console.error(err);
            // Mostrar el mensaje de error que venga del backend o de Stripe
            alert("Error en el pago: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="checkout-form">
            <h3>Pago Seguro con Tarjeta</h3>
            <div style={{
                padding: '15px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                margin: '20px 0',
                backgroundColor: 'white'
            }}>
                <CardElement options={{
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': { color: '#aab7c4' },
                        },
                        invalid: { color: '#9e2146' },
                    },
                }}/>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="button" onClick={onBack} className="secondary" disabled={loading}>
                    Cancelar
                </button>
                <button type="submit" disabled={!stripe || loading} className="primary">
                    {loading ? 'Procesando...' : 'Pagar Ahora'}
                </button>
            </div>
        </form>
    );
}

// Componente Wrapper que carga el contexto de Stripe
export default function CheckoutPage({ orderId, onBack, onPaymentSuccess }) {
    return (
        <div className="card checkout-view max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">Finalizar Compra</h2>
            <p className="mb-4 text-gray-600">Referencia del pedido: <strong>{orderId}</strong></p>

            <Elements stripe={stripePromise}>
                <CheckoutForm
                    orderId={orderId}
                    onBack={onBack}
                    onSuccess={onPaymentSuccess}
                />
            </Elements>
        </div>
    );
}
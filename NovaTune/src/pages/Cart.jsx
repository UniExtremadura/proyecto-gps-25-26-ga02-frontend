import { useEffect, useState } from "react";
import { cartApi, ordersApi } from "../api/paymentsApi.js";
import { useCart } from "../context/CartContext.jsx";

export default function Cart ({ onCheckout, onBack }) {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const { refreshCart } = useCart();

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            const response = await cartApi.getCart();
            setCart(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (id) => {
        if (!confirm("¿Eliminar articulo?")) return;
        await cartApi.removeItem(id);
        loadCart(); // Recarga el carrito después de eliminar
        refreshCart(); // Actualiza el contexto del carrito
    };

    const handleCheckout = async () => {
        try {
            console.log("🔵 Iniciando creación de pedido...");

            // 1. Llamada al backend
            const response = await ordersApi.createOrder();

            console.log("🔵 Respuesta completa del Backend:", response);

            // 2. INTENTO DE EXTRACCIÓN ROBUSTO
            // Tu serializer 'OrderAcceptedResponseSerializer' devuelve { order_id: X, status: '...' }
            // Pero por si acaso, buscamos en varios sitios.
            const responseData = response.data || {};

            // Prioridad: 1. order_id, 2. id, 3. pk
            const newOrderId = responseData.order_id || responseData.id || responseData.pk;

            // 3. VALIDACIÓN
            if (!newOrderId) {
                console.error("🔴 ERROR CRÍTICO: No se encontró un ID en la respuesta:", responseData);
                alert("Error: El servidor respondió pero no envió el ID del pedido.");
                return;
            }

            // Comprobamos si es un UUID (contiene guiones y es largo) o un Número
            if (typeof newOrderId === 'string' && newOrderId.length > 30) {
                console.error("🔴 ERROR: El ID recibido parece un UUID, no un número:", newOrderId);
                alert("Error de sistema: Se recibió un ID de carrito en lugar de un ID de pedido.");
                return;
            }

            console.log("✅ Pedido creado correctamente. ID Numérico:", newOrderId);

            // 4. PASAMOS EL ID CORRECTO
            onCheckout(newOrderId);

        } catch (error) {
            console.error("🔴 Error creando pedido:", error);
            alert("No se pudo crear el pedido. Revisa la consola.");
        }
    };

    if (loading) return <div className="p-4">Cargando carrito...</div>;
    if (!cart || !cart.items.length) return <div className="card"><h2>Carrito vacío</h2></div>

    return (
        <div className="card cart-view">
            <h2>Tu Carrito</h2>
            <div className="cart-list">
                {cart.items.map(item => (
                    <div key={item.id} style={{borderBottom:'1px solid #eee', padding:'10px 0', display:'flex', justifyContent:'space-between'}}>
                        <span>Producto {item.product_id} (x{item.quantity})</span>
                        <strong>{item.price_at_addition} €</strong>
                        <button onClick={() => handleRemove(item.id)} style={{marginLeft:'10px', color:'red'}}>Eliminar</button>
                    </div>
                ))}
            </div>

            {/* GA02-76: Desglose de Impuestos */}
            <div style={{textAlign:'right', marginTop:'20px'}}>
                <p>Subtotal: {cart.subtotal} €</p>
                <p style={{color:'#666'}}>
                    Impuestos ({cart.tax_rate_name} {cart.tax_rate_percent}%): {cart.tax_amount} €
                </p>
                <h3>Total: {cart.total} €</h3>
            </div>

            <div style={{marginTop:'20px', display:'flex', justifyContent:'space-between'}}>
                <button className="secondary" onClick={onBack}>Seguir Comprando</button>
                <button className="primary" onClick={handleCheckout}>Tramitar Pedido</button>
            </div>
        </div>
    );
}
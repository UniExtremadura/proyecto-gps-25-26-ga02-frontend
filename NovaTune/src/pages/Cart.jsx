import { useEffect, useContext } from "react";
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
            setLoading(true);
            const response = await ordersApi.createOrder();
            // Pasamos el ID del pedido al componente padre
            onCheckout(response.data.ordered);
        } catch (err) {
            alert("Error al crear pedido: " + err.message);
            setLoading(false);
        }
    };

    if (loading) return <div className="p-4">Cargando carrito...</div>;
    if (!cart || !cart.items.length) return <div className="card"><h2>Carrito vacío</h2><button onClick={onBack}>Volver</button></div>

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
import { createContext, useState, useContext, useEffect } from 'react';
import { cartApi } from '../api/paymentsApi';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartCount, setCartCount] = useState(0);
    // Usaremos useAuth para saber si la sesión está activa y si hay que cargar el carrito
    // const { isAuthenticated } = useAuth();

    // Cargar contador inicial y refrescar cada vez que el usuario cambie
    useEffect(() => {
        // if (isAuthenticated) refreshCart();
        refreshCart(); // Asumimos que la API ya maneja si está o no autenticado
    }, [/* isAuthenticated */]);

    const refreshCart = async () => {
        try {
            const res = await cartApi.getCart();
            const count = res.data.items.reduce((acc, item) => acc + item.quantity, 0);
            setCartCount(count);
        } catch (err) {
            console.error("Error al refrescar carrito (GA02-71)", err);
            setCartCount(0);
        }
    };

    const addToCart = async (productId, price) => {
        try {
            await cartApi.addItem(productId, 1, price);
            await refreshCart(); // Actualizar contador
            alert("¡Artículo añadido!");
        } catch (err) {
            alert("Error al añadir: " + (err.response?.data?.error || err.message));
        }
    };

    return (
        <CartContext.Provider value={{ cartCount, addToCart, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
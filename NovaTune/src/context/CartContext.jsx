import {createContext, useContext, useEffect, useState} from "react";
import { cartApi} from "../api/paymentsApi.js";
import { useAuth } from "../hooks/useAuth.jsx";

const CartContext = createContext();

export function CartProvider({children, isAuthenticated}) {
    const [cartCount, setCartCount] = useState(0);

    const { isAuthenticated: authStatus } = useAuth();

    // Cargar contador inicial
    useEffect(() => {
        if (isAuthenticated) refreshCart();
        else setCartCount(0); // Si no está autenticado, el contador es 0
    }, [isAuthenticated]);

    const refreshCart = async () => {

        if (!isAuthenticated) return;

        try {
            const res = await cartApi.getCart();
            // Sumamos la cantidad de todos los items
            const count = res.data.items.reduce((acc, item) => acc + item.quantity, 0);
            setCartCount(count);
        } catch (err) {
            console.error("Error refreshing cart:", err);
            setCartCount(0);
        }
    };

    const addToCart = async (productId, price) => {
        if (!isAuthenticated) {
            alert("Debes iniciar sesión para añadir productos al carrito");
            return;
        }

        try {
            await cartApi.addItem(productId, 1, price);
            await refreshCart(); // Actualizar el contador después de agregar
            alert("Producto agregado al carrito");
        } catch (error) {
            console.error("Error al añadir:", error);
            alert("Error al añadir el producto al carrito: " + error.message);
        }
    };

    return (
        <CartContext.Provider value={{ cartCount, addToCart, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
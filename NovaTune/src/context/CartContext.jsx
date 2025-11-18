import { createContext, useContext, useState } from "react";
import { cartApi} from "../api/paymentsApi.js";

const CartContext = createContext();

export function CartProvider({children, isAuthenticated}) {
    const [cartCount, setCartCount] = useState(0);

    // Cargar contador inicial
    useEffect(() => {
        if (isAuthenticated) refreshCart();
    }, [isAuthenticated]);

    const refreshCart = async () => {
        try {
            const res = await cartApi.getCart();
            // Sumamos la cantidad de todos los items
            const count = res.data.items.reduce((acc, item) => acc + item.quantity, 0);
            setCartCount(count);
        } catch (err) {
            console.error("Error refreshing cart:", err);
        }
    };

    const addToCart = async (productId, price) => {
        try {
            await cartApi.addItem(productId, 1, price);
            await refreshCart(); // Actualizar el contador después de agregar
            alert("Producto agregado al carrito");
        } catch (error) {
            console.error("Error al añadir:", error);
        }
    };

    return (
        <CartContext.Provider value={{ cartCount, addToCart, refreshCart }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
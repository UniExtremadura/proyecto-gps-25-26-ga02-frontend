// NovaTune/src/App.jsx
import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

import RegisterForm from "./components/auth/RegisterForm.jsx";
import LoginForm from "./components/auth/LoginForm.jsx";
import LogoutButton from "./components/auth/LogoutButton.jsx";

import SongsList from "./pages/SongsList.jsx";
// --- NUEVOS IMPORTS ---
import Cart from "./pages/Cart.jsx";        // <--- AÑADIDO
import Checkout from "./pages/Checkout.jsx"; // <--- AÑADIDO
// ----------------------

import { useAuth } from "./hooks/useAuth.jsx";
import { useCart } from "./context/CartContext.jsx";

function App() {
    // const [count, setCount] = useState(0); // Este estado ya no se usa
    const [currentView, setCurrentView] = useState("home");
    const [activeOrderId, setActiveOrderId] = useState(null); // <--- ESTADO PARA PASAR EL PEDIDO ID

    const { isAuthenticated, login, logout } = useAuth();
    // ¡El hook useCart funciona porque App está envuelto en main.jsx!
    const { cartCount } = useCart();

    // --------- CONTENIDO PRINCIPAL SEGÚN LA VISTA ACTUAL ----------
    let mainContent;

    if (currentView === "home") {
        mainContent = (
            <div className="root-container">
                <div className="logos-strip">
                    <a href="https://vite.dev" target="_blank" rel="noreferrer">
                        <img src={viteLogo} className="logo" alt="Vite logo" />
                    </a>
                    <a href="https://react.dev" target="_blank" rel="noreferrer">
                        <img src={reactLogo} className="logo react" alt="React logo" />
                    </a>
                </div>

                <h1>Vite + React + NovaTune</h1>

                <div className="card">

                    <p>
                        {isAuthenticated
                            ? "¡Bienvenido! Tu sesión está activa."
                            : "Inicia sesión o regístrate para acceder al panel del artista."}
                    </p>

                    {/* BOTONES DE LOGIN / REGISTRO CUANDO NO ESTÁ AUTENTICADO */}
                    {!isAuthenticated && (
                        <div className="auth-buttons">
                            <button onClick={() => setCurrentView("register")}>Registrarse</button>
                            <button onClick={() => setCurrentView("login")}>Iniciar sesión</button>
                        </div>
                    )}

                    {/* BOTONES DE ACCESO AL DASHBOARD Y CARRITO CUANDO ESTÁ LOGUEADO */}
                    {isAuthenticated && (
                        <div className="dashboard-buttons" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {/* Botón de Estadísticas existente */}
                            <button className="primary-button" onClick={() => setCurrentView("songs")}>
                                Ver estadísticas de mis canciones
                            </button>

                            {/* Botón de acceso a Carrito (Repetido, pero útil aquí también) */}
                            <button className="primary" onClick={() => setCurrentView("cart")}>
                                🛒 Ir a mi Carrito
                            </button>
                        </div>
                    )}
                </div>

                <p className="read-the-docs">
                    Click on the Vite and React logos to learn more
                </p>
            </div>
        );
    } else if (currentView === "register") {
        mainContent = (
            <RegisterForm
                onBack={() => setCurrentView("home")}
                onSuccess={(userData) => {
                    console.log("Usuario registrado:", userData);
                    setCurrentView("home");
                }}
            />
        );
    } else if (currentView === "login") {
        mainContent = (
            <LoginForm
                onBack={() => setCurrentView("home")}
                onSuccess={(userData) => {
                    console.log("Usuario logueado:", userData);
                    //login(userData);
                    setCurrentView("home");
                }}
            />
        );
    } else if (currentView === "songs") {
        // Vista del panel de estadísticas (lista de canciones)
        mainContent = (
            <div className="songs-view">
                <button className="back-button" onClick={() => setCurrentView("home")}>
                    ← Volver al inicio
                </button>
                <SongsList />
            </div>
        );
    }
    // --- NUEVA VISTA: CARRITO (GA02-76) ---
    else if (currentView === "cart") {
        mainContent = (
            <Cart
                onBack={() => setCurrentView("home")}
                onCheckout={(orderId) => {
                    setActiveOrderId(orderId); // Guardamos el ID del pedido
                    setCurrentView("checkout"); // Pasamos a la vista de pago
                }}
            />
        );
    }
    // --- NUEVA VISTA: CHECKOUT (GA02-80) ---
    else if (currentView === "checkout") {
        mainContent = (
            <Checkout
                orderId={activeOrderId}
                onBack={() => setCurrentView("cart")} // Volver al carrito
                onPaymentSuccess={() => {
                    alert("¡Pago realizado! Se ha generado su factura.");
                    setCurrentView("home");
                }}
            />
        );
    }


    // --------- BARRA SUPERIOR DE ESTADO DE AUTENTICACIÓN (MINI-CARRITO) ----------
    return (
        <>
            <header className="auth-bar">
                <div className="auth-status">
                    <span className={"status-dot " + (isAuthenticated ? "status-on" : "status-off")}/>
                    {isAuthenticated ? "Sesión activa" : "No has iniciado sesión"}
                </div>

                {isAuthenticated && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>

                        {/* --- MINI-CARRITO (GA02-71) --- */}
                        <button
                            onClick={() => setCurrentView("cart")}
                            style={{ fontSize: '0.9em', fontWeight: 'bold' }}
                        >
                            🛒 Carrito ({cartCount})
                        </button>

                        <LogoutButton
                            onLogout={() => {
                                logout();
                                setCurrentView("home");
                            }}
                        />
                    </div>
                )}
            </header>

            {mainContent}
        </>
    );
}

export default App;
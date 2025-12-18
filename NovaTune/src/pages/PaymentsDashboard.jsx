import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

const PaymentsDashboard = () => {
    const { getCurrentUserRole } = useAuth();
    const [role, setRole] = useState(null);

    useEffect(() => {
        const fetchRole = async () => {
            const userRole = await getCurrentUserRole();
            setRole(userRole);
        };
        fetchRole();
    }, [getCurrentUserRole]);

    return (
        <div className="payments-dashboard-container" style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            <h1>Gestión de Pagos y Regalías</h1>

            {/* VISTA PARA ARTISTAS */}
            {role === 'artist' && (
                <div className="card">
                    <h2>Panel de Artista</h2>
                    <p>Aquí verás el desglose de tus regalías acumuladas por reproducciones.</p>
                    {/* Aquí iría el componente <ArtistPayments /> cuando lo tengamos separado */}
                    <div style={{ background: "#f5f5f5", padding: "15px", borderRadius: "8px", marginTop: "10px" }}>
                        <h3>Saldo acumulado: 150.00 € (Ejemplo)</h3>
                        <button className="primary-button" style={{marginTop: "10px"}}>Solicitar Retirada</button>
                    </div>
                </div>
            )}

            {/* VISTA PARA DISCOGRÁFICAS */}
            {(role === 'label' || role === 'discografica') && (
                <div className="card">
                    <h2>Panel de Discográfica</h2>
                    <p>Gestión de pagos a artistas y comisiones de la plataforma.</p>
                    {/* Aquí iría el componente <LabelPayments /> */}
                    <div style={{ marginTop: "20px" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                            <tr style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>
                                <th style={{ padding: "10px" }}>Artista</th>
                                <th style={{ padding: "10px" }}>Reproducciones</th>
                                <th style={{ padding: "10px" }}>A pagar</th>
                                <th style={{ padding: "10px" }}>Estado</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td style={{ padding: "10px" }}>Artista Demo</td>
                                <td style={{ padding: "10px" }}>1,500</td>
                                <td style={{ padding: "10px" }}>15.00 €</td>
                                <td style={{ padding: "10px" }}>Pendiente</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* VISTA DE CARGA O ERROR */}
            {!role && <p>Cargando información de pagos...</p>}
        </div>
    );
};

export default PaymentsDashboard;
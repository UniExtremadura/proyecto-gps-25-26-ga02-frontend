// src/components/AlbumSalesBadge.jsx
import { useState } from "react";
import { fetchAlbumSales } from "../api/statsApi";

export default function AlbumSalesBadge({ albumId }) {
    const [status, setStatus] = useState("idle"); // idle | loading | success | error
    const [data, setData] = useState(null);
    const [errorMsg, setErrorMsg] = useState("");

    const loadSales = async () => {
        setStatus("loading");
        setErrorMsg("");
        const res = await fetchAlbumSales(albumId, {
            includeRefunds: false,
            revenue: true,
        });

        if (!res.ok) {
            setStatus("error");
            setErrorMsg(
                res.error ||
                "No se han podido cargar las ventas de este álbum desde el microservicio de estadísticas."
            );
            return;
        }

        setData({
            orders: res.orders,
            units: res.units,
            revenue: res.revenue,
        });
        setStatus("success");
    };

    const badgeBox = (style, children) => (
        <span
            style={{
                padding: "4px 8px",
                borderRadius: 6,
                fontSize: 12,
                border: "1px solid transparent",
                ...style,
            }}
        >
            {children}
        </span>
    );

    if (status === "idle") {
        return (
            <button
                type="button"
                onClick={loadSales}
                style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    background: "#fff",
                    cursor: "pointer",
                    fontSize: 12,
                    color: "#000",
                }}
            >
                Ver ventas del álbum
            </button>
        );
    }

    if (status === "loading") {
        return (
            <span style={{ fontSize: 12, color: "#555" }}>
                Consultando ventas del álbum…
            </span>
        );
    }

    if (status === "error") {
        return (
            <div
                style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    flexWrap: "wrap",
                }}
            >
                {badgeBox(
                    {
                        background: "#ffecec",
                        color: "#b10000",
                        borderColor: "#ffb3b3",
                    },
                    errorMsg
                )}
                <button
                    type="button"
                    onClick={loadSales}
                    style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        background: "#fff",
                        cursor: "pointer",
                        fontSize: 12,
                        color: "#000",
                    }}
                >
                    Reintentar
                </button>
            </div>
        );
    }

    // success
    const { orders, units, revenue } = data || {
        orders: 0,
        units: 0,
        revenue: null,
    };

    return (
        <div
            style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
            }}
        >
            {badgeBox(
                {
                    background: "#e9f9ee",
                    color: "#1a7f37",
                    borderColor: "#b6e5c7",
                },
                `${units} unidades vendidas (${orders} pedidos)`
            )}

            {revenue != null &&
                badgeBox(
                    {
                        background: "#f0f4ff",
                        color: "#0b63b6",
                        borderColor: "#c3d4ff",
                    },
                    `Ingresos: ${Number(revenue).toFixed(2)} €`
                )}

            <button
                type="button"
                onClick={loadSales}
                style={{
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    background: "#fff",
                    cursor: "pointer",
                    fontSize: 12,
                    color: "#000",
                }}
            >
                Actualizar ventas
            </button>
        </div>
    );
}

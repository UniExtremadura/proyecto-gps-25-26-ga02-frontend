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
            setErrorMsg(res.error || "Error consultando ventas.");
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
                }}
            >
                Ver ventas del álbum
            </button>
        );
    }

    if (status === "loading") {
        return (
            <span style={{ fontSize: 12, color: "#555" }}>
        Consultando ventas…
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

    const texto =
        units === 0
            ? "Sin ventas registradas"
            : `${units} unidades vendidas (${orders} pedidos)`;

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
                    background: units === 0 ? "#eef6ff" : "#e9f9ee",
                    color: units === 0 ? "#0b63b6" : "#1a7f37",
                    borderColor: units === 0 ? "#cfe3ff" : "#b6e2c1",
                    fontWeight: units === 0 ? 400 : 600,
                },
                texto
            )}

            {revenue != null && (
                <span style={{ fontSize: 12, color: "#333" }}>
          Ingresos: <strong>{revenue} €</strong>
        </span>
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
                }}
            >
                Actualizar ventas
            </button>
        </div>
    );
}

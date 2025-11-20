// src/pages/LabelStatsDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./LabelStats.css";

const CONTENT_API_BASE =
    import.meta.env.VITE_CONTENT_API_URL || "http://127.0.0.1:8001";
const STATS_API_BASE =
    import.meta.env.VITE_STATS_API_URL || "http://127.0.0.1:8002";

function LabelStatsDashboard() {
    const [labels, setLabels] = useState([]);
    const [labelSearch, setLabelSearch] = useState("");
    const [selectedLabelId, setSelectedLabelId] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [stats, setStats] = useState(null);

    // Cargar discográficas desde backend contenidos
    useEffect(() => {
        async function loadLabels() {
            try {
                setError("");
                const resp = await fetch(`${CONTENT_API_BASE}/api/v1/labels/`);
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const data = await resp.json();
                setLabels(data.items || []);
            } catch (err) {
                console.error("Error cargando discográficas", err);
                setError(
                    "No se pudieron cargar las discográficas. Asegúrate de que el backend de contenidos (8001) está arrancado."
                );
            }
        }

        loadLabels();
    }, []);

    const filteredLabels = useMemo(() => {
        const q = labelSearch.trim().toLowerCase();
        if (!q) return labels;
        return labels.filter((l) => {
            const haystack = `${l.name || ""} ${l.label_id || ""}`.toLowerCase();
            return haystack.includes(q);
        });
    }, [labels, labelSearch]);

    const handlePickLabel = (label) => {
        setSelectedLabelId(label.label_id);
        setLabelSearch(`${label.name} — ${label.label_id}`);
        setShowSuggestions(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!selectedLabelId) {
            setError("Selecciona una discográfica antes de cargar estadísticas.");
            return;
        }

        setLoading(true);
        try {
            const url = new URL(`${STATS_API_BASE}/api/v1/stats/global`);
            url.searchParams.set("revenue", "1");
            url.searchParams.set("label_id", selectedLabelId);
            if (fromDate) url.searchParams.set("from", fromDate);
            if (toDate) url.searchParams.set("to", toDate);

            const resp = await fetch(url.toString(), {
                headers: {
                    "X-User-Role": "discografica",
                },
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            setStats(data);
        } catch (err) {
            console.error("Error cargando estadísticas", err);
            setError(
                "No se pudieron cargar las estadísticas. Revisa que el backend de estadísticas (8002) está levantado."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="label-stats-page">
            <div className="label-stats-header">
                <h1>Panel de estadísticas de discográfica</h1>
                <p>
                    Consulta reproducciones, ventas e ingresos agregados de tus artistas.
                </p>
            </div>

            <section className="label-stats-filters-card">
                <h2 className="label-stats-filters-title">Filtros</h2>

                <form className="label-stats-filters-form" onSubmit={handleSubmit}>
                    <div className="label-stats-filters-grid">
                        {/* Discográfica con buscador + desplegable */}
                        <div className="filter-field filter-field--wide">
                            <label>Discográfica</label>
                            <div className="label-search-wrapper">
                                <input
                                    type="text"
                                    value={labelSearch}
                                    placeholder="Escribe para buscar una discográfica..."
                                    onChange={(e) => {
                                        setLabelSearch(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => {
                                        // pequeño delay para permitir click en la sugerencia
                                        setTimeout(() => setShowSuggestions(false), 120);
                                    }}
                                />

                                {showSuggestions && filteredLabels.length > 0 && (
                                    <ul className="label-search-suggestions">
                                        {filteredLabels.map((label) => (
                                            <li
                                                key={label.label_id}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    handlePickLabel(label);
                                                }}
                                            >
                                                <span className="label-name">{label.name}</span>
                                                <span className="label-id">{label.label_id}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Fechas */}
                        <div className="filter-field">
                            <label>Desde</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                        </div>

                        <div className="filter-field">
                            <label>Hasta</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                            />
                        </div>

                        {/* Botón */}
                        <div className="filter-actions">
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? "Cargando..." : "Cargar estadísticas"}
                            </button>
                        </div>
                    </div>

                    {error && <p className="label-stats-error">{error}</p>}
                </form>
            </section>

            {stats && (
                <section className="label-stats-results">
                    <h2>Resumen global</h2>

                    <div className="label-stats-cards">
                        <article className="stats-card">
                            <h3>Reproducciones</h3>
                            <p className="stats-main-number">{stats.plays?.total ?? 0}</p>
                            <p className="stats-sub">
                                Reproducciones válidas:{" "}
                                <strong>{stats.plays?.valid ?? 0}</strong>
                            </p>
                        </article>

                        <article className="stats-card">
                            <h3>Ventas de álbumes</h3>
                            <p className="stats-main-number">{stats.sales?.units ?? 0}</p>
                            <p className="stats-sub">
                                Pedidos: <strong>{stats.sales?.orders ?? 0}</strong>
                                <br />
                                Ingresos:{" "}
                                <strong>{stats.sales?.revenue ?? "0.00"} €</strong>
                            </p>
                        </article>

                        <article className="stats-card">
                            <h3>Valoraciones</h3>
                            <p className="stats-main-number">
                                {stats.ratings?.average ?? "N/A"}
                            </p>
                            <p className="stats-sub">
                                Número de valoraciones:{" "}
                                <strong>{stats.ratings?.count ?? 0}</strong>
                            </p>
                        </article>
                    </div>
                </section>
            )}
        </div>
    );
}

export default LabelStatsDashboard;


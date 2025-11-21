// NovaTune/src/pages/LabelStatsDashboard.jsx
import { useEffect, useState } from "react";

const DEFAULT_AVATAR = "https://static.vecteezy.com/system/resources/previews/036/280/651/original/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";

const API_STATS_BASE = "http://127.0.0.1:8002/api/v1";
const API_CONTENT_BASE = "http://127.0.0.1:8001/api/v1";
const ROLE_HEADER = { "X-User-Role": "discografica" };

function formatNumber(value) {
    if (value === null || value === undefined) return "0";
    const num = typeof value === "string" ? Number(value) : value;
    if (Number.isNaN(num)) return "0";
    return new Intl.NumberFormat("es-ES").format(num);
}

function formatCurrency(value) {
    if (value === null || value === undefined) return "—";
    const num = typeof value === "string" ? Number(value) : value;
    if (Number.isNaN(num)) return "—";
    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 2,
    }).format(num);
}

function formatRating(avg, count) {
    if (avg === null || avg === undefined || !count) {
        return "Sin valoraciones";
    }
    const num = typeof avg === "string" ? Number(avg) : avg;
    if (Number.isNaN(num)) return "Sin valoraciones";
    return `${num.toFixed(1)} ★ (${count})`;
}

function formatDate(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("es-ES");
}

// Componente genérico para listas tipo barra horizontal
function HorizontalBarList({
                               items,
                               labelKey,
                               subtitleKey,
                               valueKey,
                               maxItems = 5,
                               valueFormatter = formatNumber,
                           }) {
    const topItems = items.slice(0, maxItems);

    const maxValue =
        topItems.reduce((max, item) => {
            const raw = item[valueKey];
            const num =
                raw === null || raw === undefined
                    ? 0
                    : typeof raw === "string"
                        ? Number(raw)
                        : raw;
            return num > max ? num : max;
        }, 0) || 1;

    return (
        <ul className="chart-list">
            {topItems.map((item) => {
                const raw = item[valueKey];
                const num =
                    raw === null || raw === undefined
                        ? 0
                        : typeof raw === "string"
                            ? Number(raw)
                            : raw;
                const width = `${(num / maxValue) * 100}%`;

                return (
                    <li key={item.id || item[labelKey]} className="chart-row">
                        <div className="chart-row-labels">
                            <span className="chart-row-main">{item[labelKey]}</span>
                            {subtitleKey && item[subtitleKey] && (
                                <span className="chart-row-sub">{item[subtitleKey]}</span>
                            )}
                        </div>
                        <div className="chart-row-bar">
                            <div className="chart-row-bar-fill" style={{ width }} />
                        </div>
                        <div className="chart-row-value">
                            {valueFormatter(num)}
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

function LabelStatsDashboard() {
    const [topRatedArtists, setTopRatedArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(
                    `${API_STATS_BASE}/stats/artists/ratings?limit=20&sort=average&enrich=1`,
                    { headers: ROLE_HEADER }
                );
                if (!res.ok) {
                    throw new Error(`Error ${res.status}`);
                }
                const data = await res.json();
                const items = data.items || [];
                setTopRatedArtists(items);

                // If backend didn't return enriched artist metadata, fetch it from contenidos
                const missingIds = items.filter(i => !i.artist && i.artist_id).map(i => i.artist_id);
                if (missingIds.length) {
                    try {
                        const ids = missingIds.join(",");
                        const r2 = await fetch(`${API_CONTENT_BASE}/artists?ids=${ids}`);
                        if (r2.ok) {
                            const artistsResp = await r2.json();
                            const artistsArr = Array.isArray(artistsResp) ? artistsResp : (artistsResp.items || []);
                            const meta = {};
                            artistsArr.forEach(a => {
                                if (a) {
                                    const key = a.id || a.artist_id || a.artistId || a.uuid || a.id_str;
                                    if (key) {
                                        // normalize to { id, name, ... }
                                        meta[key] = { id: key, name: a.name, ...a };
                                    }
                                }
                            });
                            const merged = items.map(it => ({ ...it, artist: it.artist || meta[it.artist_id] }));
                            setTopRatedArtists(merged);
                        }
                    } catch (err) {
                        // non-fatal: leave items as-is
                        console.error('Error fetching artist metadata:', err);
                    }
                }
            } catch (err) {
                console.error(err);
                setError(err?.message || "Error cargando datos");
                setTopRatedArtists([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // When a user clicks an artist row, open detail panel; fetch full artist if needed
    const handleSelectArtist = async (item) => {
        setDetailError(null);
        if (item && item.artist) {
            setSelectedArtist(item.artist);
            return;
        }
        if (!item || !item.artist_id) return;
        setDetailLoading(true);
        try {
            const r = await fetch(`${API_CONTENT_BASE}/artists/${item.artist_id}`);
            if (!r.ok) throw new Error(`Error ${r.status}`);
            const a = await r.json();
            // Normalize the response shape
            const key = a.id || a.artist_id || item.artist_id;
            const normalized = { id: key, name: a.name, ...a };
            setSelectedArtist(normalized);
        } catch (err) {
            console.error('Error loading artist detail:', err);
            setDetailError('No se pudo cargar la información del artista');
            setSelectedArtist({ id: item.artist_id });
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCloseDetail = () => {
        setSelectedArtist(null);
        setDetailError(null);
    };


    return (
        <div className="label-stats-root">
            <header className="label-stats-header">
                <h1>Estadísticas de ratings por artista</h1>
                <p className="label-stats-subtitle">Panel que muestra el ranking de artistas por valoración media.</p>
            </header>

            <section className="label-stats-charts-grid">
                <article className="chart-card">
                    <h2>Top artistas por valoración</h2>
                    <p className="chart-description">Lista de artistas ordenada por valoración media (rating).</p>

                    {loading ? (
                        <p className="chart-empty">Cargando...</p>
                    ) : error ? (
                        <p className="chart-empty">{error}</p>
                    ) : topRatedArtists.length === 0 ? (
                        <p className="chart-empty">No hay valoraciones disponibles.</p>
                    ) : (
                        <ul className="chart-list">
                            {topRatedArtists.map((a, idx) => (
                                <li key={a.artist_id} className="chart-row" onClick={() => handleSelectArtist(a)} style={{ cursor: 'pointer' }} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') handleSelectArtist(a); }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                        <span className="chart-row-rank">#{idx + 1}</span>
                                        <div className="chart-row-labels">
                                            <span className="chart-row-main">
                                                {a.artist && a.artist.name ? (
                                                    <>
                                                        <strong>{a.artist.name}</strong>
                                                        <span className="chart-row-uuid"> ({a.artist_id})</span>
                                                    </>
                                                ) : (
                                                    <strong>{a.artist_id}</strong>
                                                )}
                                            </span>
                                            <span className="chart-row-sub">{a.ratings_count} valoraciones</span>
                                        </div>
                                    </div>
                                    <div className="chart-row-value">{a.ratings_average ? Number(a.ratings_average).toFixed(2) + ' ★' : '—'}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </article>
                <article className="chart-card artist-detail-card">
                    <h2 style={{ margin: 0 }}>{selectedArtist ? (selectedArtist.name || selectedArtist.id) : 'Recuadro de artista'}</h2>
                    {selectedArtist ? (
                        <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.25rem' }}>{selectedArtist.id}</div>
                    ) : (
                        <p className="chart-description" style={{ marginTop: '0.25rem' }}>Haz click en un artista del Top para ver su información aquí.</p>
                    )}

                    {selectedArtist ? (
                        <div className="artist-detail-body" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginTop: '0.8rem' }}>
                            {detailLoading ? (
                                <div className="loading-text">Cargando...</div>
                            ) : (
                                // show selected artist image if available, otherwise show default avatar
                                <img className="artist-detail-image" src={selectedArtist.image_url || DEFAULT_AVATAR} alt={selectedArtist.name || selectedArtist.id} />
                            )}
                            <div className="artist-detail-meta">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div />
                                    <div>
                                        <button onClick={handleCloseDetail} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>Cerrar</button>
                                    </div>
                                </div>

                                {detailError && <p className="chart-description" style={{ color: '#f87171' }}>{detailError}</p>}

                                {selectedArtist.bio && <p style={{ marginTop: '0.5rem' }}>{selectedArtist.bio}</p>}

                                <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem' }}>
                                    {selectedArtist.label && <li><strong>Sello:</strong> {selectedArtist.label.name || selectedArtist.label.label_id}</li>}
                                    {selectedArtist.country && <li><strong>País:</strong> {selectedArtist.country.name || selectedArtist.country}</li>}
                                    {selectedArtist.albums_count !== undefined && <li><strong>Álbumes:</strong> {selectedArtist.albums_count}</li>}
                                    {selectedArtist.tracks_count !== undefined && <li><strong>Pistas:</strong> {selectedArtist.tracks_count}</li>}
                                    {selectedArtist.created_at && <li><strong>Creado:</strong> {formatDate(selectedArtist.created_at)}</li>}
                                </ul>

                                {selectedArtist.socials && Object.keys(selectedArtist.socials).length > 0 && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <strong>Redes:</strong>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: '0.25rem 0 0 0' }}>
                                            {Object.entries(selectedArtist.socials).map(([k, v]) => (
                                                <li key={k}><a href={v} target="_blank" rel="noreferrer">{k}</a></li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </article>
            </section>
        </div>
    );
}

export default LabelStatsDashboard;

// NovaTune/src/pages/LabelStatsDashboard.jsx
import { useEffect, useState } from "react";
import ArtistCompareCharts from "../components/ArtistCompareCharts";

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

                // 1) Fetch canonical artists from contenidos (same source SongsList uses)
                const rArtists = await fetch(`${API_CONTENT_BASE}/artists/`);
                if (!rArtists.ok) throw new Error(`Error fetching artists ${rArtists.status}`);
                const artistsResp = await rArtists.json();
                let artistsArr = [];
                if (Array.isArray(artistsResp)) artistsArr = artistsResp;
                else if (Array.isArray(artistsResp.items)) artistsArr = artistsResp.items;
                else if (Array.isArray(artistsResp.results)) artistsArr = artistsResp.results;

                const canonical = artistsArr.map(a => {
                    const id = a.artist_id || a.id || a.uuid || a.artistId;
                    return { id: String(id), name: a.name || a.title || id, meta: a };
                });

                // 2) Fetch ratings aggregation from stats service (all artists with ratings)
                // We'll request a large limit so we can merge ratings for the canonical list.
                const rRatings = await fetch(`${API_STATS_BASE}/stats/artists/ratings?limit=1000&sort=average`, { headers: ROLE_HEADER });
                let ratingsMap = {};
                if (rRatings.ok) {
                    const rr = await rRatings.json();
                    const rated = rr.items || [];
                    for (const it of rated) {
                        const aid = String(it.artist_id || it.id || it.artistId);
                        ratingsMap[aid] = { ratings_count: it.ratings_count || it.count || 0, ratings_average: it.ratings_average || it.average || null };
                    }
                }

                // 3) Merge canonical artists with ratings (if any)
                const merged = canonical.map(a => ({
                    artist: { id: a.id, name: a.name, ...a.meta },
                    artist_id: a.id,
                    ratings_count: ratingsMap[a.id]?.ratings_count || 0,
                    ratings_average: ratingsMap[a.id]?.ratings_average ?? null,
                }));

                // 4) sort by ratings_average desc then ratings_count
                merged.sort((x, y) => {
                    const ax = x.ratings_average ?? 0;
                    const ay = y.ratings_average ?? 0;
                    if (ay === ax) return (y.ratings_count || 0) - (x.ratings_count || 0);
                    return ay - ax;
                });

                setTopRatedArtists(merged);
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
        <div className="label-stats-root" style={{ display: 'flex', justifyContent: 'center' }}>
            {/* Background big card that should contain both info cards */}
            <div style={{
                background: '#081227',
                borderRadius: 12,
                padding: 32,
                minWidth: 1280,
                minHeight: 560,
                boxShadow: '0 12px 30px rgba(2,6,23,0.6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <header className="label-stats-header" style={{ width: '100%', textAlign: 'center' }}>
                    <h1>Estadísticas de ratings por artista</h1>
                    <p className="label-stats-subtitle">Panel que muestra el ranking de artistas por valoración media.</p>
                </header>

                <section className="label-stats-charts-grid" style={{ display: 'flex', justifyContent: 'center', gap: 24, alignItems: 'flex-start', margin: '24px 0', width: '100%' }}>
                <article className="chart-card" style={{ minWidth: 540, minHeight: 420 }}>
                    <h2>Top artistas por valoración</h2>
                    <p className="chart-description">Lista de artistas ordenada por valoración media (rating).</p>

                    <div className="card-scroll">
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
                    </div>
                </article>
                <article className="chart-card artist-detail-card" style={{ minWidth: 620, minHeight: 420 }}>
                    <h2 style={{ margin: 0 }}>{selectedArtist ? (selectedArtist.name || selectedArtist.id) : 'Recuadro de artista'}</h2>
                    {selectedArtist ? (
                        <div style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.25rem' }}>{selectedArtist.id}</div>
                    ) : (
                        <p className="chart-description" style={{ marginTop: '0.25rem' }}>Haz click en un artista del Top para ver su información aquí.</p>
                    )}

                    {selectedArtist ? (
                        <div className="card-scroll">
                        <div className="artist-detail-body" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginTop: '0.8rem' }}>
                            <div className="artist-detail-meta" style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div />
                                    <div>
                                        {/* Replace close button with artist image positioned top-right */}
                                        <img src={selectedArtist.image_url || DEFAULT_AVATAR} alt={selectedArtist.name || selectedArtist.id} style={{ width: 96, height: 96, borderRadius: 8, objectFit: 'cover' }} />
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

                            <div style={{flex: '0 0 420px'}}>
                                <ArtistCompareCharts selected={selectedArtist} baseline={{ratings_count: (topRatedArtists && topRatedArtists.length ? Math.round(topRatedArtists.reduce((s,i)=>s+(i.ratings_count||0),0)/topRatedArtists.length) : 0), ratings_average: (topRatedArtists && topRatedArtists.length ? (topRatedArtists.reduce((s,i)=>s+Number(i.ratings_average||0),0)/topRatedArtists.length) : 0)}} />
                            </div>
                        </div>
                        </div>
                    ) : null}
                </article>
            </section>
            </div>
        </div>
    );
}

export default LabelStatsDashboard;


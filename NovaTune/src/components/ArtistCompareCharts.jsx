import React, { useEffect, useState } from 'react';

const API_CONTENT_BASE = "http://127.0.0.1:8001/api/v1";
const API_STATS_BASE = "http://127.0.0.1:8002/api/v1";

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

export default function ArtistCompareCharts({selected}){
    // Now: render a vertical bar chart where X = tracks, Y = average rating (1..5)
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!selected) {
                setTracks([]);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                // Determine artist id from several possible fields (backend/enriched shapes differ)
                const artistId = selected.id || selected.artist_id || selected.artistId || (selected.artist && (selected.artist.id || selected.artist.artist_id));
                if (!artistId) {
                    throw new Error('Artist id not available');
                }
                // Fetch tracks for artist from contenidos
                const r = await fetch(`${API_CONTENT_BASE}/artists/${artistId}/tracks`);
                if (!r.ok) throw new Error(`Tracks fetch error ${r.status}`);
                const body = await r.json();
                const items = Array.isArray(body) ? body : (body.items || []);

                // For each track, fetch rating from stats service
                const rated = await Promise.all(items.map(async (t) => {
                    const tid = t.id || t.track_id || t.uuid || t.song_id || t.title;
                    try {
                        const rr = await fetch(`${API_STATS_BASE}/stats/songs/${encodeURIComponent(tid)}/rating`);
                        if (!rr.ok) return { track: t, average: null, count: 0 };
                        const rb = await rr.json();
                        return { track: t, average: rb.average, count: rb.count };
                    } catch (e) {
                        return { track: t, average: null, count: 0 };
                    }
                }));

                if (mounted) setTracks(rated);
            } catch (err) {
                console.error('Error loading tracks/ratings', err);
                if (mounted) setError('No se pudieron cargar las pistas o sus valoraciones');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [selected]);

    if (!selected) return null;

    return (
        <div className="artist-charts-root">
            <h3 style={{marginTop:0}}>Valoraciones por pista</h3>
            {loading ? (
                <div className="loading-text">Cargando pistas y valoraciones…</div>
            ) : error ? (
                <div className="chart-description" style={{ color: '#f87171' }}>{error}</div>
            ) : tracks.length === 0 ? (
                <div className="chart-empty">No hay pistas para este artista.</div>
            ) : (
                <div style={{ overflowX: 'auto', paddingTop: '0.5rem' }}>
                    <svg width={320} height={200} viewBox={`0 0 320 200`} preserveAspectRatio="xMinYMid">
                        {/* axes */}
                        {/* chart area constants */}
                        {
                            /*
                                chartTop = 10, chartBottom = 170, chartHeight = 160
                                Map rating in [1,5] to height in [0, chartHeight]
                                so rating=1 -> h=0 (tick at bottom), rating=5 -> h=chartHeight (tick at top)
                            */
                        }
                        <line x1={30} y1={10} x2={30} y2={170} stroke="#cbd5e1" />
                        <line x1={30} y1={170} x2={310} y2={170} stroke="#cbd5e1" />
                        {/* y ticks 1..5 */}
                        {[5,4,3,2,1].map((v,i)=>{
                            const chartTop = 10;
                            const chartHeight = 160;
                            const y = chartTop + (5 - v) * (chartHeight / 4);
                            return (
                                <g key={v}>
                                    <line x1={26} y1={y} x2={30} y2={y} stroke="#e2e8f0" />
                                    <text x={6} y={y+4} fontSize={10} fill="#94a3b8">{v}</text>
                                </g>
                            );
                        })}

                        {/* bars */}
                        {tracks.map((r, idx) => {
                            const safeCount = Math.max(1, tracks.length);
                            const barAreaWidth = 260 / safeCount;
                            const cx = 30 + 10 + idx * barAreaWidth;
                            const barW = Math.max(6, barAreaWidth * 0.6);
                            const avg = r.average === null || r.average === undefined ? null : Number(r.average);
                            const chartTop = 10;
                            const chartBottom = 170;
                            const chartHeight = chartBottom - chartTop; // 160
                            // Map avg in [1,5] -> height [0, chartHeight]
                            let h = 0;
                            if (avg !== null && !Number.isNaN(avg)) {
                                const clamped = clamp(avg, 1, 5);
                                h = ((clamped - 1) / (5 - 1)) * chartHeight;
                            }
                            h = clamp(h, 0, chartHeight);
                            const x = cx;
                            const y = chartBottom - h;
                            const tid = r.track.id || r.track.track_id || r.track.uuid || r.track.title || idx;
                            const label = (r.track.title || r.track.name || tid || '').toString().slice(0, 12);
                            return (
                                <g key={tid}>
                                    <rect x={x} y={y} width={barW} height={h} fill="#22c55e" rx={3} />
                                    <text x={x + barW/2} y={185} fontSize={10} fill="#374151" textAnchor="middle" style={{pointerEvents:'none'}}>
                                        {label}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: '0.35rem' }}>Eje X: pistas — Eje Y: nota promedio (1..5)</div>
                </div>
            )}
        </div>
    );
}

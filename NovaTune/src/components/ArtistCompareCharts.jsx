import React, { useEffect, useState } from 'react';

const API_CONTENT_BASE = "http://127.0.0.1:8001/api/v1";
const API_STATS_BASE = "http://127.0.0.1:8002/api/v1";
const ROLE_HEADER = { "X-User-Role": "discografica" };

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

export default function ArtistCompareCharts({ selected }) {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [artistCount, setArtistCount] = useState(0);
    const [artistAverage, setArtistAverage] = useState(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (!selected) {
                setTracks([]);
                setArtistCount(0);
                setArtistAverage(null);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const artistId = selected.id || selected.artist_id || selected.artistId || (selected.artist && (selected.artist.id || selected.artist.artist_id));
                if (!artistId) throw new Error('Artist id not available');

                // Try to fetch artist-level aggregate first
                try {
                    const ar = await fetch(`${API_STATS_BASE}/stats/artists/aggregate?limit=1&sort=average&enrich=0` , { headers: ROLE_HEADER });
                    if (ar.ok) {
                        // we won't rely on this heavily here; the per-track aggregation
                        // below is the authoritative source for the chart
                    }
                } catch (e) {
                    // ignore
                }

                // Fetch tracks for artist
                const r = await fetch(`${API_CONTENT_BASE}/artists/${artistId}/tracks`);
                if (!r.ok) throw new Error(`Tracks fetch error ${r.status}`);
                const body = await r.json();
                const items = Array.isArray(body) ? body : (body.items || []);

                // For each track, fetch aggregate rating (parallel)
                const rated = await Promise.all(items.map(async (t) => {
                    const tid = t.id || t.track_id || t.uuid || t.song_id || t.title;
                    if (!tid) return { track: t, average: null, count: 0 };
                    try {
                        const rr = await fetch(`${API_STATS_BASE}/stats/songs/${encodeURIComponent(tid)}/rating`);
                        if (!rr.ok) return { track: t, average: null, count: 0 };
                        const rb = await rr.json();
                        // normalize
                        let avg = null, count = 0;
                        if (rb == null) { avg = null; count = 0; }
                        else if (typeof rb.average !== 'undefined') { avg = Number(rb.average); count = Number(rb.count) || 0; }
                        else if (Array.isArray(rb.results) && rb.results.length) { const arr = rb.results; count = arr.length; avg = arr.reduce((s,it)=>s+(Number(it.stars)||0),0)/count; }
                        else if (Array.isArray(rb.items) && rb.items.length) { const arr = rb.items; count = arr.length; avg = arr.reduce((s,it)=>s+(Number(it.stars)||0),0)/count; }
                        else if (Array.isArray(rb) && rb.length) { const arr = rb; count = arr.length; avg = arr.reduce((s,it)=>s+(Number(it.stars)||0),0)/count; }
                        else if (rb && typeof rb.stars !== 'undefined') { avg = Number(rb.stars); count = 1; }

                        // fallback to ratings list if aggregate missing
                        if ((count === 0 || avg === null)) {
                            try {
                                const rr2 = await fetch(`${API_STATS_BASE}/stats/songs/${encodeURIComponent(tid)}/ratings/`);
                                if (rr2.ok) {
                                    const rb2 = await rr2.json();
                                    let arr = [];
                                    if (Array.isArray(rb2)) arr = rb2;
                                    else if (Array.isArray(rb2.results)) arr = rb2.results;
                                    else if (Array.isArray(rb2.items)) arr = rb2.items;
                                    if (arr && arr.length) { count = arr.length; avg = arr.reduce((s,it)=>s+(Number(it.stars)||0),0)/count; }
                                }
                            } catch (e) { /* ignore */ }
                        }
                        return { track: t, average: avg, count };
                    } catch (e) {
                        return { track: t, average: null, count: 0 };
                    }
                }));

                if (!mounted) return;
                setTracks(rated);
                const totalCount = rated.reduce((s,it)=>s + (Number(it.count)||0), 0);
                const weightedSum = rated.reduce((s,it)=>s + ((Number(it.average)||0) * (Number(it.count)||0)), 0);
                const avg = totalCount > 0 ? (weightedSum / totalCount) : null;
                setArtistCount(totalCount);
                setArtistAverage(avg === null ? null : Number(avg));
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

    const perTrack = 70;
    const minWidth = 360;
    const svgWidth = Math.max(minWidth, (tracks.length || 0) * perTrack + 60);

    return (
        <div className="artist-charts-root">
            <h3 style={{ marginTop: 0 }}>Valoraciones por pista</h3>
            {loading ? (
                <div className="loading-text">Cargando pistas y valoraciones…</div>
            ) : error ? (
                <div className="chart-description" style={{ color: '#f87171' }}>{error}</div>
            ) : tracks.length === 0 ? (
                <div className="chart-empty">No hay pistas para este artista.</div>
            ) : (
                <div style={{ overflowX: 'auto', paddingTop: '0.5rem', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ fontSize: 13, color: '#374151' }}>
                            <strong>Media artista:</strong>{' '}
                            {artistAverage === null ? (
                                <span style={{ color: '#6b7280' }}>Sin valoraciones</span>
                            ) : (
                                <span>{Number(artistAverage).toFixed(2)} / 5</span>
                            )}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                            <strong>Recuento:</strong> {artistCount}
                        </div>
                    </div>

                    <div style={{ minWidth: svgWidth, display: 'inline-block' }}>
                        <svg width={svgWidth} height={240} viewBox={`0 0 ${svgWidth} 240`} preserveAspectRatio="xMinYMid" style={{ display: 'block' }}>
                            {/* axes */}
                            <line x1={40} y1={20} x2={40} y2={200} stroke="#cbd5e1" />
                            <line x1={40} y1={200} x2={svgWidth - 10} y2={200} stroke="#cbd5e1" />

                            {/* y ticks 0..5 */}
                            {[5,4,3,2,1,0].map((v)=>{
                                const chartTop = 20;
                                const chartHeight = 180;
                                const y = chartTop + (5 - v) * (chartHeight / 5);
                                return (
                                    <g key={v}>
                                        <line x1={36} y1={y} x2={40} y2={y} stroke="#e2e8f0" />
                                        <text x={10} y={y+4} fontSize={10} fill="#94a3b8">{v}</text>
                                    </g>
                                );
                            })}

                            {/* bars */}
                            {tracks.map((r, idx) => {
                                const count = Math.max(1, tracks.length);
                                const chartLeft = 40;
                                const chartRight = svgWidth - 10;
                                const chartWidth = Math.max(100, chartRight - chartLeft);
                                const barAreaWidth = chartWidth / count;
                                const cx = chartLeft + 10 + idx * barAreaWidth;
                                const barW = Math.max(8, barAreaWidth * 0.6);
                                const avg = r.average === null || r.average === undefined ? null : Number(r.average);
                                const chartTop = 20;
                                const chartBottom = 200;
                                const chartHeight = chartBottom - chartTop;
                                let h = 0;
                                if (avg !== null && !Number.isNaN(avg)) { h = (clamp(avg, 0, 5) / 5) * chartHeight; }
                                h = clamp(h, 0, chartHeight);
                                const x = cx;
                                const y = chartBottom - h;
                                const tid = r.track && (r.track.id || r.track.track_id || r.track.uuid) || idx;
                                const songTitle = (r.track && (
                                    r.track.title ||
                                    r.track.name ||
                                    r.track.track_title ||
                                    r.track.song_title ||
                                    r.track.display_name ||
                                    (r.track.metadata && (r.track.metadata.title || r.track.metadata.name)) ||
                                    (r.track.attributes && r.track.attributes.title)
                                )) || String(tid);
                                const label = String(songTitle).toString().slice(0, 20);
                                return (
                                    <g key={tid}>
                                            <rect x={x} y={y} width={barW} height={h} fill="#22c55e" rx={3} />
                                            <title>{String(songTitle)}</title>
                                            <text x={x + barW/2} y={215} fontSize={11} fill="#94a3b8" textAnchor="middle" style={{pointerEvents:'none'}}>
                                                {label}
                                            </text>
                                    </g>
                                );
                            })}
                        </svg>
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: '0.35rem' }}>Eje X: pistas — Eje Y: nota promedio (0..5)</div>
                    </div>
                </div>
            )}
        </div>
    );
}

import React, { useEffect, useMemo, useState } from 'react'
import { fetchArtistSongs } from '../api/contentsApi.js'
import { fetchSongPlays, registerPlay } from '../api/statsApi.js'

const DEFAULT_ARTIST = 'e48a5127-32a9-4875-a1e5-db0ba7ae7e78'

export default function SongsList() {
    const [artistId, setArtistId] = useState(DEFAULT_ARTIST)
    const [songs, setSongs] = useState([])
    const [plays, setPlays] = useState({})
    const [error, setError] = useState(null)
    const [debugOpen, setDebugOpen] = useState(false)

    const envInfo = useMemo(() => ({
        content: import.meta.env.VITE_CONTENT_API_BASE,
        stats: import.meta.env.VITE_STATS_API_BASE,
    }), [])

    async function load() {
        setError(null)
        try {
            const list = await fetchArtistSongs(artistId)
            setSongs(list)
            // Cargar contadores en paralelo
            const pairs = await Promise.all(
                list.map(async s => [s, await fetchSongPlays(s.title)])
            )
            const map = {}
            for (const [, n] of pairs) {
                // 'title' es el song_id que estamos usando
            }
            for (const [s, n] of pairs) map[s.title] = n
            setPlays(map)
        } catch (e) {
            console.error(e)
            setError(e?.message || String(e))
            setSongs([])
            setPlays({})
        }
    }

    useEffect(() => { load() }, []) // primera carga

    async function onPlay(songId) {
        try {
            await registerPlay(songId)
            // refrescar solo ese contador
            const n = await fetchSongPlays(songId)
            setPlays(p => ({ ...p, [songId]: n }))
        } catch (e) {
            console.error(e)
            alert('No se pudo registrar la reproducción.')
        }
    }

    return (
        <div style={{ maxWidth: 980, margin: '0 auto', padding: 16 }}>
            <h1 style={{ marginBottom: 16 }}>Canciones del artista</h1>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                <span>Artista UUID:</span>
                <input
                    value={artistId}
                    onChange={e => setArtistId(e.target.value)}
                    style={{ flex: '0 0 420px', padding: 6, background: '#222', color: '#ddd', border: '1px solid #333' }}
                />
                <button onClick={load} style={{ padding: '6px 10px' }}>Recargar</button>
                <span style={{ opacity: .7, marginLeft: 8 }}>
          API: stats {envInfo.stats} | content {envInfo.content}
        </span>
            </div>

            <details open={debugOpen} onToggle={e => setDebugOpen(e.target.open)} style={{ marginBottom: 12 }}>
                <summary>Debug (clic para abrir)</summary>
                <pre style={{ background: '#0b0b0b', padding: 12, border: '1px solid #222', overflowX: 'auto' }}>
{JSON.stringify({ artistId, tracksCount: songs.length, sample: songs.slice(0,3), plays }, null, 2)}
        </pre>
            </details>

            {error && (
                <div style={{ background: '#3b0000', color: '#ffd1d1', padding: 10, borderRadius: 6, marginBottom: 12 }}>
                    Error: {error}
                </div>
            )}

            {songs.length === 0 && !error && <p>No hay canciones todavía.</p>}

            <div style={{ display: 'grid', gap: 10 }}>
                {songs.map(s => (
                    <div key={s.id ?? s.title}
                         style={{ background: '#1b1b1b', border: '1px solid #2a2a2a', borderRadius: 8, padding: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 600 }}>{s.title}</div>
                                <div style={{ fontSize: 12, opacity: .7 }}>{s.artist}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <button onClick={() => onPlay(s.title)} title="Registrar reproducción">▶</button>
                                <span style={{
                                    border: '1px solid #2f3b55',
                                    borderRadius: 999,
                                    padding: '2px 8px',
                                    fontSize: 12
                                }}>
                  {plays[s.title] ?? 0} plays
                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

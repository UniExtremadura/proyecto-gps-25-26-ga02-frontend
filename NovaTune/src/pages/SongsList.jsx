import React, { useEffect, useState } from 'react'
import { getTracksByArtist } from '../api/contentsApi.js'
import { getPlaysBySong } from '../api/statsApi.js'

const DEFAULT_ARTIST = 'e48a5127-32a9-4875-a1e5-db0ba7ae7e78'

export default function SongsList() {
    const [artistId, setArtistId] = useState(DEFAULT_ARTIST)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [songs, setSongs] = useState([])
    const [debugData, setDebugData] = useState(null)

    async function fetchSongs(id) {
        setLoading(true)
        setError('')
        try {
            const items = await getTracksByArtist(id)

            // Opcional: precargar plays (si stats está levantado)
            const withPlays = await Promise.all(
                items.map(async (s) => {
                    try {
                        const plays = await getPlaysBySong(s.id || s.title)
                        return { ...s, plays }
                    } catch {
                        return { ...s, plays: 0 }
                    }
                })
            )

            setSongs(withPlays)
            setDebugData({
                artistId: id,
                tracksCount: withPlays.length,
                sample: withPlays.slice(0, 2),
            })
        } catch (e) {
            console.error(e)
            setError(e?.message || String(e))
            setSongs([])
            setDebugData({ artistId: id, error: String(e) })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchSongs(artistId) }, []) // carga inicial

    return (
        <div>
            <h1 style={{ marginTop: 0 }}>Canciones del artista</h1>

            <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                <span>Artista UUID:</span>
                <input value={artistId} onChange={(e) => setArtistId(e.target.value)} style={{ width: 360 }} />
            </label>
            <button onClick={() => fetchSongs(artistId)} style={{ marginLeft: 8 }}>Recargar</button>

            {loading && <p style={{ marginTop: 12 }}>Cargando…</p>}
            {error && <p style={{ color: '#f66' }}>Error: {error}</p>}

            <details style={{ marginTop: 12 }}>
                <summary>Debug (clic para abrir)</summary>
                <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(debugData, null, 2)}</pre>
            </details>

            {(!loading && !error && songs.length === 0) && (
                <p>No hay canciones todavía.</p>
            )}

            <ul style={{
                listStyle: 'none', padding: 0, marginTop: 16,
                display: 'grid', gap: 12
            }}>
                {songs.map(song => (
                    <li key={song.id}
                        style={{ background: '#1b1b1b', padding: 12, borderRadius: 10,
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 600 }}>{song.title}</div>
                            {song.artistName && <div style={{ opacity: .7, fontSize: 12 }}>{song.artistName}</div>}
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <small style={{ opacity: .7 }}>id: {song.id}</small>
                            <span style={{ fontSize: 12, padding: '4px 8px', borderRadius: 999, background: '#0b3d2e' }}>
                {song.plays ?? 0} plays
              </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}

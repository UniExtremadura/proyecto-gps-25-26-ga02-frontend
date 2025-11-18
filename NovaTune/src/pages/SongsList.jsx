// src/pages/SongsList.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import PlayCountBadge from '../components/PlayCountBadge';

const CONTENT_BASE = import.meta.env.VITE_CONTENT_API_BASE || '/api/content';

// Cambia este UUID si quieres otro artista (o pon un input, ya lo dejamos soportado abajo)
const DEFAULT_ARTIST_ID = 'e48a5127-32a9-4875-a1e5-db0ba7ae7e78';

export default function SongsList() {
    const [artistId, setArtistId] = useState(DEFAULT_ARTIST_ID);
    const [status, setStatus] = useState('idle'); // idle | loading | success | error | empty
    const [songs, setSongs] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');

    const loadSongs = async (id) => {
        setStatus('loading');
        setErrorMsg('');
        try {
            const url = `${CONTENT_BASE}/artists/${encodeURIComponent(id)}/tracks/`;
            const { data } = await axios.get(url, { timeout: 5000 });
            const items = Array.isArray(data?.items) ? data.items : [];
            if (items.length === 0) {
                setSongs([]);
                setStatus('empty');
                return;
            }
            setSongs(items);
            setStatus('success');
        } catch (err) {
            let msg = 'Error cargando canciones.';
            if (err.response) {
                msg = `Error ${err.response.status} al cargar canciones.`;
            } else if (err.request) {
                msg = 'No se puede conectar con el backend de contenidos.';
            }
            setErrorMsg(msg);
            setStatus('error');
        }
    };

    useEffect(() => {
        loadSongs(artistId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div style={{ maxWidth: 900, margin: '32px auto', padding: '0 16px' }}>
            <h1 style={{ marginBottom: 16 }}>Canciones del artista</h1>

            {/* Filtro rápido por artista */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input
                    value={artistId}
                    onChange={(e) => setArtistId(e.target.value)}
                    placeholder="UUID del artista"
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd' }}
                />
                <button
                    onClick={() => loadSongs(artistId)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #ccc',
                        background: '#fff',
                        cursor: 'pointer',
                        color: 'black',
                    }}
                >
                    Recargar
                </button>
            </div>

            {status === 'loading' && <p>Cargando canciones…</p>}

            {status === 'error' && (
                <div
                    style={{
                        background: '#fff7e6',
                        border: '1px solid #ffd591',
                        color: '#ad6800',
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 12,
                    }}
                >
                    {errorMsg}
                </div>
            )}

            {status === 'empty' && (
                <div
                    style={{
                        background: '#eef6ff',
                        border: '1px solid #cfe3ff',
                        color: '#0b63b6',
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 12,
                    }}
                >
                    Este artista no tiene canciones todavía.
                </div>
            )}

            {status === 'success' && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
                    {songs.map((song) => {
                        const title = song.title ?? song.name ?? 'Sin título';
                        // Usamos el title como songId para stats (según tus datos de demo)
                        const songId = title;

                        return (
                            <li
                                key={song.id ?? title}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 12,
                                    padding: '10px 12px',
                                    border: '1px solid #eee',
                                    borderRadius: 10,
                                    background: '#fff',
                                    color: 'black',
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 600 }}>{title}</div>
                                    {song.album?.title && (
                                        <div style={{ fontSize: 12, color: '#666' }}>
                                            Álbum: {song.album.title}
                                        </div>
                                    )}
                                </div>
                                {/* Aquí está el badge con manejo de errores / sin datos */}
                                <PlayCountBadge songId={songId} />
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

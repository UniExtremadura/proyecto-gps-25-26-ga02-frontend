// src/pages/SongsList.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

import PlayCountBadge from '../components/PlayCountBadge';
import AlbumSalesBadge from '../components/AlbumSalesBadge';
import { fetchAlbumSales } from '../api/statsApi';

const CONTENT_BASE = import.meta.env.VITE_CONTENT_API_BASE || '/api/content';

export default function SongsList() {
    const [artistId, setArtistId] = useState(''); // sin UUID por defecto
    const [status, setStatus] = useState('idle'); // idle | loading | success | error | empty
    const [songs, setSongs] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');

    // Sugerencias de artistas (UUID + nombre)
    const [artistOptions, setArtistOptions] = useState([]);
    const [artistOptionsLoaded, setArtistOptionsLoaded] = useState(false);
    const [artistOptionsError, setArtistOptionsError] = useState('');
    const [isFetchingArtists, setIsFetchingArtists] = useState(false);

    // Resumen de ventas por álbum
    const [albumSummaries, setAlbumSummaries] = useState([]);
    const [summaryStatus, setSummaryStatus] = useState('idle'); // idle | loading | success | error
    const [summaryError, setSummaryError] = useState('');

    const loadSongs = async (id) => {
        const trimmed = id.trim();
        if (!trimmed) {
            setStatus('idle');
            setSongs([]);
            setErrorMsg('');
            setAlbumSummaries([]);
            setSummaryStatus('idle');
            setSummaryError('');
            return;
        }

        setStatus('loading');
        setErrorMsg('');
        setAlbumSummaries([]);
        setSummaryStatus('idle');
        setSummaryError('');

        try {
            const url = `${CONTENT_BASE}/artists/${encodeURIComponent(trimmed)}/tracks/`;
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

    // Carga perezosa de la lista de artistas cuando se enfoca el input
    const fetchArtistOptions = async () => {
        if (artistOptionsLoaded || isFetchingArtists) return;

        setIsFetchingArtists(true);
        setArtistOptionsError('');

        try {
            const url = `${CONTENT_BASE}/artists/`;
            const { data } = await axios.get(url, { timeout: 5000 });

            let items = [];

            // Soportar varias formas de respuesta: {items:[]}, {results:[]} o []
            if (Array.isArray(data?.items)) {
                items = data.items;
            } else if (Array.isArray(data?.results)) {
                items = data.results;
            } else if (Array.isArray(data)) {
                items = data;
            }

            const mapped = items.map((a) => ({
                id: a.artist_id ?? a.id,
                name: a.name ?? 'Artista sin nombre',
            }));

            setArtistOptions(mapped);
            setArtistOptionsLoaded(true);
        } catch (err) {
            console.error('Error cargando lista de artistas', err);
            setArtistOptionsError('No se pudo cargar la lista de artistas.');
        } finally {
            setIsFetchingArtists(false);
        }
    };

    const handleArtistInputFocus = () => {
        fetchArtistOptions();
    };

    const handleReloadClick = () => {
        loadSongs(artistId);
    };

    // Cuando tenemos canciones cargadas, calculamos ventas totales por álbum
    useEffect(() => {
        if (status !== 'success') {
            setAlbumSummaries([]);
            setSummaryStatus(status === 'empty' ? 'success' : 'idle');
            setSummaryError('');
            return;
        }

        if (!songs || songs.length === 0) {
            setAlbumSummaries([]);
            setSummaryStatus('success');
            setSummaryError('');
            return;
        }

        // Sacar álbumes únicos a partir de las canciones
        const albumsMap = new Map();
        for (const song of songs) {
            const albumId =
                song.album_id ??
                song.album?.id ??
                song.album?.uuid ??
                song.album?.title ??
                null;

            if (!albumId) continue;

            const albumTitle =
                song.album?.title ??
                (typeof albumId === 'string' ? albumId : String(albumId));

            if (!albumsMap.has(albumId)) {
                albumsMap.set(albumId, {
                    albumId,
                    albumTitle,
                });
            }
        }

        const albums = Array.from(albumsMap.values());
        if (albums.length === 0) {
            setAlbumSummaries([]);
            setSummaryStatus('success');
            setSummaryError('');
            return;
        }

        let cancelled = false;

        const fetchSummaries = async () => {
            setSummaryStatus('loading');
            setSummaryError('');

            try {
                const results = await Promise.all(
                    albums.map(async (album) => {
                        const res = await fetchAlbumSales(album.albumId, {
                            includeRefunds: false,
                            revenue: false,
                        });

                        if (!res.ok) {
                            return {
                                ...album,
                                units: 0,
                                orders: 0,
                                error: res.error || 'Error al obtener ventas.',
                            };
                        }

                        return {
                            ...album,
                            units: res.units ?? 0,
                            orders: res.orders ?? 0,
                        };
                    })
                );

                if (!cancelled) {
                    setAlbumSummaries(results);
                    setSummaryStatus('success');
                }
            } catch (err) {
                console.error('Error obteniendo ventas por álbum', err);
                if (!cancelled) {
                    setAlbumSummaries([]);
                    setSummaryStatus('error');
                    setSummaryError(
                        'No se pudieron cargar las ventas totales por álbum.'
                    );
                }
            }
        };

        fetchSummaries();

        return () => {
            cancelled = true;
        };
    }, [status, songs]);

    return (
        <div
            style={{
                maxWidth: 900,
                margin: '32px auto',
                padding: '0 16px',
                color: 'white',
            }}
        >
            <h1 style={{ marginBottom: 16 }}>Canciones del artista</h1>

            {/* Filtro por artista (UUID con autocompletado) */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input
                    value={artistId}
                    onChange={(e) => setArtistId(e.target.value)}
                    onFocus={handleArtistInputFocus}
                    placeholder="UUID del artista"
                    list="artist-suggestions"
                    style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid #ddd',
                        color: 'black',
                    }}
                />

                {/* Sugerencias de artistas (UUID + nombre) */}
                <datalist id="artist-suggestions">
                    {artistOptions.map((artist) => (
                        <option
                            key={artist.id}
                            value={artist.id}
                            label={`${artist.name} (${artist.id})`}
                        />
                    ))}
                </datalist>

                <button
                    onClick={handleReloadClick}
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

            {artistOptionsError && (
                <div
                    style={{
                        background: '#fff7e6',
                        border: '1px solid #ffd591',
                        color: '#ad6800',
                        padding: 8,
                        borderRadius: 8,
                        marginBottom: 8,
                        fontSize: 12,
                    }}
                >
                    {artistOptionsError}
                </div>
            )}

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
                <>
                    {/* Lista de canciones */}
                    <ul
                        style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                            display: 'grid',
                            gap: 12,
                        }}
                    >
                        {songs.map((song) => {
                            const title =
                                song.title ?? song.name ?? 'Sin título';
                            // Para reproducciones seguimos usando el título como ID
                            const songId = title;

                            // Intentamos sacar un albumId razonable
                            const albumId =
                                song.album_id ??
                                song.album?.id ??
                                song.album?.uuid ??
                                song.album?.title ??
                                null;

                            const albumTitle =
                                song.album?.title ??
                                (albumId
                                    ? String(albumId)
                                    : 'Álbum desconocido');

                            return (
                                <li
                                    key={song.id ?? title}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 12,
                                        padding: 12,
                                        border: '1px solid #eee',
                                        borderRadius: 10,
                                        background: '#fff',
                                    }}
                                >
                                    {/* Izquierda: canción + ventas del álbum */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontWeight: 600,
                                                color: '#000',
                                            }}
                                        >
                                            {title}
                                        </div>

                                        {albumId && (
                                            <div style={{ marginTop: 4 }}>
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        color: '#444',
                                                        marginBottom: 2,
                                                    }}
                                                >
                                                    Álbum: {albumTitle}
                                                </div>
                                                <AlbumSalesBadge
                                                    albumId={albumId}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Derecha: reproducciones */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 4,
                                        }}
                                    >
                                        <PlayCountBadge songId={songId} />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Resumen de ventas totales por álbum */}
                    <section style={{ marginTop: 24 }}>
                        <h2 style={{ marginBottom: 8 }}>
                            Ventas totales por álbum
                        </h2>

                        {summaryStatus === 'loading' && (
                            <p>Calculando ventas por álbum…</p>
                        )}

                        {summaryStatus === 'error' && (
                            <div
                                style={{
                                    background: '#fff7e6',
                                    border: '1px solid #ffd591',
                                    color: '#ad6800',
                                    padding: 12,
                                    borderRadius: 8,
                                    marginTop: 8,
                                }}
                            >
                                {summaryError}
                            </div>
                        )}

                        {summaryStatus === 'success' &&
                            albumSummaries.length === 0 && (
                                <p style={{ fontSize: 14 }}>
                                    No se han encontrado álbumes asociados a
                                    estas canciones.
                                </p>
                            )}

                        {summaryStatus === 'success' &&
                            albumSummaries.length > 0 && (
                                <table
                                    style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        marginTop: 8,
                                        background: '#fff',
                                        color: '#000',
                                        borderRadius: 10,
                                        overflow: 'hidden',
                                    }}
                                >
                                    <thead>
                                    <tr
                                        style={{
                                            background: '#f5f5f5',
                                            textAlign: 'left',
                                        }}
                                    >
                                        <th
                                            style={{
                                                padding: '8px 12px',
                                                borderBottom:
                                                    '1px solid #eee',
                                            }}
                                        >
                                            Álbum
                                        </th>
                                        <th
                                            style={{
                                                padding: '8px 12px',
                                                borderBottom:
                                                    '1px solid #eee',
                                                width: 140,
                                            }}
                                        >
                                            Ventas (unidades)
                                        </th>
                                        <th
                                            style={{
                                                padding: '8px 12px',
                                                borderBottom:
                                                    '1px solid #eee',
                                                width: 140,
                                            }}
                                        >
                                            Pedidos
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {albumSummaries.map((album) => (
                                        <tr key={album.albumId}>
                                            <td
                                                style={{
                                                    padding: '8px 12px',
                                                    borderBottom:
                                                        '1px solid #f0f0f0',
                                                }}
                                            >
                                                {album.albumTitle}
                                            </td>
                                            <td
                                                style={{
                                                    padding: '8px 12px',
                                                    borderBottom:
                                                        '1px solid #f0f0f0',
                                                }}
                                            >
                                                {album.units}
                                            </td>
                                            <td
                                                style={{
                                                    padding: '8px 12px',
                                                    borderBottom:
                                                        '1px solid #f0f0f0',
                                                }}
                                            >
                                                {album.orders}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                    </section>
                </>
            )}
        </div>
    );
}

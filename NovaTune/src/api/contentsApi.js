import axios from 'axios'

const CONTENT_BASE = import.meta.env.VITE_CONTENT_API_BASE || '/api/content'

// Devuelve las canciones (tracks) de un artista por UUID/ID
export async function fetchArtistSongs(artistId) {
    const url = `${CONTENT_BASE}/artists/${artistId}/tracks/` // proxy → 8001/api/v1/...
    const { data } = await axios.get(url)
    // API de contenidos devuelve { items:[...] , total:n }
    const items = Array.isArray(data?.items) ? data.items : []
    return items.map(t => ({
        id: t.id,
        title: t.title || t.name || 'untitled',
        artist: t.artist?.name || 'unknown',
    }))
}

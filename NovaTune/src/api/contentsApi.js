import axios from 'axios'

const BASE = import.meta.env.VITE_CONTENT_BASE_URL || '/api/content'

// Trae los tracks del artista. ¡OJO con la barra final para evitar 301!
export async function getTracksByArtist(artistUuid) {
    if (!artistUuid) throw new Error('artistUuid requerido')
    const url = `${BASE}/artists/${artistUuid}/tracks/` // barra final obligatoria
    const { data } = await axios.get(url)

    const items = Array.isArray(data) ? data : data.items || data.results || []
    return items.map((it) => ({
        id: it.id ?? it.pk ?? it.track_id ?? it.uuid ?? String(it.title || it.name),
        title: it.title ?? it.name ?? 'Untitled',
        artistName: it.artist?.name ?? it.artist_name ?? '',
        raw: it,
    }))
}

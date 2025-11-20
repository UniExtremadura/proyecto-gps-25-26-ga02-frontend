// src/api/statsApi.js
import axios from 'axios';

const STATS_BASE = import.meta.env.VITE_STATS_API_BASE || '/api/stats';

/**
 * GET: cuenta reproducciones
 */
export async function fetchSongPlays(songId) {
    const url = `${STATS_BASE}/songs/${encodeURIComponent(songId)}/plays`;
    try {
        const { data } = await axios.get(url, { timeout: 5000 });
        if (data && typeof data.plays === 'number') {
            return { ok: true, plays: data.plays };
        }
        return { ok: false, error: 'Respuesta inesperada de estadísticas.' };
    } catch (err) {
        if (err.response) {
            if (err.response.status === 404) {
                return { ok: true, plays: 0, notFound: true };
            }
            return { ok: false, error: `Error ${err.response.status} desde estadísticas.` };
        }
        if (err.request) {
            return { ok: false, error: 'No se puede conectar con el backend de estadísticas.' };
        }
        return { ok: false, error: 'Error desconocido en la petición de estadísticas.' };
    }
}

/**
 * POST: sumar 1 reproducción
 */
export async function incrementSongPlay(songId) {
    const url = `${STATS_BASE}/songs/${encodeURIComponent(songId)}/plays`;
    try {
        const { data } = await axios.post(url, {}, { timeout: 5000 });
        if (data && typeof data.plays === 'number') {
            return { ok: true, plays: data.plays };
        }
        return { ok: false, error: 'Respuesta inesperada al incrementar.' };
    } catch (err) {
        if (err.response) {
            return { ok: false, error: `Error ${err.response.status} al incrementar.` };
        }
        if (err.request) {
            return { ok: false, error: 'No se puede conectar para incrementar.' };
        }
        return { ok: false, error: 'Error desconocido al incrementar.' };
    }
}

/**
 * DELETE: restar 1 reproducción (elimina la más reciente)
 */
export async function decrementSongPlay(songId) {
    const url = `${STATS_BASE}/songs/${encodeURIComponent(songId)}/plays`;
    try {
        const { data } = await axios.delete(url, { timeout: 5000 });
        if (data && typeof data.plays === 'number') {
            return { ok: true, plays: data.plays };
        }
        return { ok: false, error: 'Respuesta inesperada al decrementar.' };
    } catch (err) {
        if (err.response) {
            return { ok: false, error: `Error ${err.response.status} al decrementar.` };
        }
        if (err.request) {
            return { ok: false, error: 'No se puede conectar para decrementar.' };
        }
        return { ok: false, error: 'Error desconocido al decrementar.' };
    }
}
// src/api/statsApi.js

const BASE_URL = "/api/stats"; // esto va al proxy de Vite (8002)

/**
 * Ventas por álbum.
 * Llama a: GET /api/v1/stats/albums/<album_id>/sales
 *
 * @param {string} albumId
 * @param {object} options
 *   - includeRefunds: boolean (false por defecto)
 *   - from: string ISO datetime
 *   - to: string ISO datetime
 *   - revenue: boolean (true para que devuelva revenue)
 */
// src/api/statsApi.js

export async function fetchAlbumSales(
    albumId,
    { includeRefunds = false, from, to, revenue = true } = {}
) {
    const params = new URLSearchParams();

    if (includeRefunds) params.set("include_refunds", "1");
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (revenue) params.set("revenue", "1");

    const qs = params.toString();

    // 🔧 AQUÍ EL CAMBIO IMPORTANTE
    const url = `${STATS_BASE}/albums/${encodeURIComponent(albumId)}/sales${
        qs ? `?${qs}` : ""
    }`;

    try {
        const res = await fetch(url);
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            return {
                ok: false,
                status: res.status,
                error: data.detail || "Error al obtener ventas de álbum.",
            };
        }

        return {
            ok: true,
            status: res.status,
            albumId: data.album_id,
            orders: data.orders ?? 0,
            units: data.sales ?? 0,
            revenue: data.revenue ?? null,
        };
    } catch (err) {
        console.error("fetchAlbumSales error", err);
        return {
            ok: false,
            status: 0,
            error: "No se pudo conectar con el servidor de estadísticas.",
        };
    }
}

// src/api/statsApi.js (añadir al final)

export async function fetchGlobalStats({
                                           labelId,
                                           from,
                                           to,
                                           groupBy = "artist",
                                           includeRevenue = true,
                                       } = {}) {
    try {
        const params = new URLSearchParams();

        if (labelId) {
            params.set("label_id", labelId);
        }
        if (from) {
            params.set("from", from);
        }
        if (to) {
            params.set("to", to);
        }
        if (groupBy) {
            params.set("group_by", groupBy);
        }
        if (includeRevenue) {
            params.set("revenue", "true");
        }

        let url = `${STATS_BASE}/global/`;
        const qs = params.toString();
        if (qs) {
            url = `${url}?${qs}`;
        }

        // Autenticación: el endpoint de estadísticas globales requiere rol de discográfica
        const token = localStorage.getItem("access_token");
        const config = {
            timeout: 7000,
            headers: {},
        };
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }

        const { data } = await axios.get(url, config);

        // Esperamos un payload del estilo:
        // {
        //   timeframe: { from, to },
        //   plays: { total, valid },
        //   sales: { orders, units, revenue? },
        //   ratings: { count, average },
        //   by_artist?: [ { artist_id, plays_total, ... } ]
        // }
        return {
            ok: true,
            data,
        };
    } catch (err) {
        console.error("fetchGlobalStats error", err);

        const status = err.response?.status ?? 0;
        let msg = "No se pudo conectar con el servidor de estadísticas.";

        if (status === 401) {
            msg = "No estás autenticado. Inicia sesión para ver las estadísticas de discográfica.";
        } else if (status === 403) {
            msg = "No tienes permiso para ver las estadísticas globales (rol de discográfica requerido).";
        } else if (status >= 500) {
            msg = "El servidor de estadísticas ha devuelto un error interno.";
        }

        return {
            ok: false,
            status,
            error: msg,
        };
    }
}



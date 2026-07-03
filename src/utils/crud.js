import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { jmsg } from '@/utils/swal'

const host = import.meta.env.VITE_API_HOST
const subdominio_prueba = import.meta.env.VITE_SUBDOMINIO_PRUEBA

const urls = {
    signin: `${host}/api/auth`,

    sistema: `${host}/api/sistema`,
    empresas: `${host}/api/empresas`,

    articulo_categorias: `${host}/api/articulo_categorias`,
    articulos: `${host}/api/articulos`,
    caja_aperturas: `${host}/api/caja_aperturas`,
    colaboradores: `${host}/api/colaboradores`,
    comprobante_items: `${host}/api/comprobante_items`,
    comprobantes: `${host}/api/comprobantes`,
    combo_articulos: `${host}/api/combo_articulos`,
    dinero_movimientos: `${host}/api/dinero_movimientos`,
    empresa: `${host}/api/empresa`,
    mesas: `${host}/api/mesas`,
    kardex: `${host}/api/kardex`,
    comprobante_tipos: `${host}/api/comprobante_tipos`,
    pago_metodos: `${host}/api/pago_metodos`,
    produccion_areas: `${host}/api/produccion_areas`,
    receta_insumos: `${host}/api/receta_insumos`,
    salones: `${host}/api/salones`,
    socios: `${host}/api/socios`,
    sucursales: `${host}/api/sucursales`,
    printer: `${host}/api/printer`,
    sucursal_articulos: `${host}/api/sucursal-articulos`,
    sucursal_comprobante_tipos: `${host}/api/sucursal-comprobante-tipos`,
    sucursal_pago_metodos: `${host}/api/sucursal-pago-metodos`,
    transacciones: `${host}/api/transacciones`,
    transaccion_items: `${host}/api/transaccion_items`,

    decolecta: `${host}/api/decolecta`,
}

async function get(url, options = {}) {
    return await request('GET', url, null, false, true, options)
}

async function post(url, item = {}, ms) {
    if (ms !== false && ms == null) {
        ms = 'Creado con exito'
    }

    return await request('POST', url, item, ms)
}

async function patch(url, item, ms) {
    if (ms !== false && ms == null) {
        ms = 'Actualizado con exito'
    }

    return await request('PATCH', `${url}/${item.id}`, item, ms)
}

async function delet(url, item, ms) {
    if (ms !== false && ms == null) {
        ms = 'Eliminado con exito'
    }

    return await request('DELETE', `${url}/${item.id}`, item, ms)
}

async function request(method, url, item, ms, retry = true, options = {}) {
    let response

    try {
        response = await fetch(url, {
            method,
            headers: setHeaders(item),
            body: item ? setBody(item) : undefined,
            credentials: 'include',
        })
    } catch (error) {
        jmsg('error', error)
        return { code: -2 }
    }

    return await process(
        response,
        ms,
        () => request(method, url, item, ms, false, options),
        retry,
        options,
    )
}

function setHeaders(item) {
    const auth = useAuth()
    const headers = {}

    if (auth.token) headers.Authorization = `Bearer ${auth.token}`

    if (item && !item.formData) headers['Content-Type'] = 'application/json'

    headers['x-app-version'] = auth.app_version
    headers['x-empresa'] = getSubdominio()
    headers['x-sucursal'] = getSucursal()

    return headers
}

function setBody(item) {
    if (!item.formData) return JSON.stringify(item)

    const formData = new FormData()

    const { archivo, archivos, ...resto } = item

    if (archivo) {
        formData.append('archivo', archivo)
    }

    if (archivos && Array.isArray(archivos)) {
        archivos.forEach((file) => {
            formData.append('archivos', file)
        })
    }

    formData.append('datos', JSON.stringify(resto))

    return formData
}

async function process(response, ms, retry_request, retry = true, options = {}) {
    const contentType = response.headers.get('Content-Type')

    if (contentType && contentType.includes('application/json')) {
        const res = await response.json()

        if ([401, 403, 404, 426].includes(response.status)) {
            if (response.status == 401 && retry && !response.url.endsWith('/api/auth/refresh')) {
                const refreshed = await refreshAuth()
                if (refreshed) return await retry_request()
            }

            if (!options.silent401 || response.status != 401) jmsg('error', res.msg)

            if (response.status == 401 && !options.silent401)
                useModals().setModal('mLogin', 'Sesion terminada', null, null)

            return { code: response.status }
        }

        if (res.code == -1) jmsg('error', 'Algo salio mal')

        if (res.code > 0) jmsg('error', res.msg)

        if (res.code == 0 && ms != false) jmsg('success', ms)

        return res
    } else {
        const blob = await response.blob()
        return blob
    }
}

async function refreshAuth() {
    try {
        const response = await fetch(`${urls.signin}/refresh`, {
            method: 'POST',
            headers: setHeaders({}),
            body: JSON.stringify({}),
            credentials: 'include',
        })

        if (!response.ok) {
            useAuth().setToken(null)
            return false
        }

        const res = await response.json()
        if (res.code != 0 || !res.access_token) {
            useAuth().setToken(null)
            return false
        }

        useAuth().setToken(res.access_token)
        return true
    } catch {
        useAuth().setToken(null)
        return false
    }
}

function getSubdominio() {
    const hostname = window.location.hostname

    const parts = hostname.split('.')

    if (parts.length > 2) return parts[0]

    return subdominio_prueba
}

function getSucursal() {
    return useAuth().sucursal.id
}

export { host, urls, get, post, patch, delet, getSubdominio }

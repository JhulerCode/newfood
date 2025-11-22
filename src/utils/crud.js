import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { jmsg } from '@/utils/swal'

const host = import.meta.env.VITE_API_HOST
const subdominio_prueba = import.meta.env.VITE_SUBDOMINIO_PRUEBA

const urls = {
    signin: `${host}/signin`,
    uploads: `${host}/uploads`,
    decolecta: `${host}/api/decolecta`,

    sistema: `${host}/api/sistema`,

    articulo_categorias: `${host}/api/articulo_categorias`,
    articulos: `${host}/api/articulos`,
    // cajas: `${host}/api/cajas`,
    caja_aperturas: `${host}/api/caja_aperturas`,
    colaboradores: `${host}/api/colaboradores`,
    comprobante_items: `${host}/api/comprobante_items`,
    comprobantes: `${host}/api/comprobantes`,
    dinero_movimientos: `${host}/api/dinero_movimientos`,
    empresa: `${host}/api/empresa`,
    mesas: `${host}/api/mesas`,
    kardex: `${host}/api/kardex`,
    pago_comprobantes: `${host}/api/pago_comprobantes`,
    pago_metodos: `${host}/api/pago_metodos`,
    produccion_areas: `${host}/api/produccion_areas`,
    receta_insumos: `${host}/api/receta_insumos`,
    salones: `${host}/api/salones`,
    socios: `${host}/api/socios`,
    transacciones: `${host}/api/transacciones`,
    transaccion_items: `${host}/api/transaccion_items`,
}

async function get(url) {
    let response

    try {
        response = await fetch(url, {
            method: 'GET',
            headers: setHeaders(),
        })
    } catch (error) {
        jmsg('error', error)
        return { code: -2 }
    }

    return await process(response, false)
}

async function post(url, item, ms) {
    let response

    try {
        response = await fetch(url, {
            method: 'POST',
            headers: setHeaders(item),
            body: setBody(item),
        })
    } catch (error) {
        jmsg('error', error)
        return { code: -2 }
    }

    if (ms !== false && ms == null) {
        ms = 'Creado con éxito'
    }

    return await process(response, ms)
}

async function patch(url, item, ms) {
    let response

    try {
        response = await fetch(`${url}/${item.id}`, {
            method: 'PATCH',
            headers: setHeaders(item),
            body: setBody(item),
        })
    } catch (error) {
        jmsg('error', error)
        return { code: -2 }
    }

    if (ms !== false && ms == null) {
        ms = 'Actualizado con éxito'
    }

    return await process(response, ms)
}

async function delet(url, item, ms) {
    let response

    try {
        response = await fetch(`${url}/${item.id}`, {
            method: 'DELETE',
            headers: setHeaders(item),
            body: setBody(item),
        })
    } catch (error) {
        jmsg('error', error)
        return { code: -2 }
    }

    if (ms !== false && ms == null) {
        ms = 'Eliminado con éxito'
    }

    return await process(response, ms)
}

function setHeaders(item) {
    const headers = {
        Authorization: `Bearer ${useAuth().token}`,
    }

    if (item && !item.formData) headers['Content-Type'] = 'application/json'

    headers['x-app-version'] = useAuth().app_version

    headers['x-empresa'] = getSubdominio()

    return headers
}

function setBody(item) {
    if (!item.formData) return JSON.stringify(item)

    const formData = new FormData()

    const { archivo, archivos, ...resto } = item

    // Si hay un solo archivo (propiedad archivo)
    if (archivo) {
        formData.append('archivo', archivo)
    }

    // Si hay múltiples archivos (propiedad archivos como array)
    if (archivos && Array.isArray(archivos)) {
        archivos.forEach((file) => {
            formData.append('archivos', file) // backend recibirá como array
        })
    }

    // Agregar el resto de datos como JSON
    formData.append("datos", JSON.stringify(resto))

    return formData
}

async function process(response, ms) {
    const res = await response.json()

    if ([401, 403, 404, 426].includes(response.status)) {
        jmsg('error', res.msg)

        if (response.status == 401) useModals().setModal('mLogin', 'Sesión terminada', null, null)

        return { code: response.status }
    }

    const contentType = response.headers.get("Content-Type")
    if (contentType && contentType.includes("application/json")) {
        if (res.code == -1) jmsg('error', 'Algo salió mal')

        if (res.code > 0) jmsg('error', res.msg)

        if (res.code == 0 && ms != false) jmsg('success', ms)

        return res
    }
    else {
        const blob = await response.blob()
        return blob
    }
}

function getSubdominio() {
    const hostname = window.location.hostname

    const parts = hostname.split(".")

    if (parts.length > 2) return parts[0]

    return subdominio_prueba
}

export {
    host,
    urls,
    get,
    post,
    patch,
    delet,
}

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { jmsg } from '@/utils/swal'
// import { saveAs } from 'file-saver'

const host = import.meta.env.VITE_API_HOST

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
            headers: {
                Authorization: `Bearer ${useAuth().token}`,
            },
        })
    } catch (error) {
        jmsg('error', error)
        return { code: -2 }
    }

    if (response.status == 401) {
        jmsg('error', 'Acceso denegado: autenticación incorrecta')
        useModals().setModal('mLogin', 'Sesión terminada', null, null)
        return { code: 401 }
    }

    if (response.status == 403) {
        jmsg('error', 'Acceso denegado: permisos insuficientes')
        return { code: 403 }
    }

    if (response.status == 404) {
        jmsg('error', 'Recurso no encontrado')
        return { code: 404 }
    }

    const contentType = response.headers.get("Content-Type")
    if (contentType && contentType.includes("application/json")) {
        const data = await response.json()

        if (data.code == -1) jmsg('error', 'Algo salió mal')

        if (data.code > 0) jmsg('error', data.msg)

        return data
    }
    else {
        const blob = await response.blob()
        return blob
        // const fileName = response.headers
        //     .get("Content-Disposition")
        //     ?.split("filename=")[1]
        //     ?.replace(/"/g, "")
        // saveAs(blob, fileName)
    }
}

async function post(url, item, ms) {
    let query

    try {
        query = await fetch(url, {
            method: 'POST',
            headers: setHeaders(item),
            body: item.formData ? setFormData(item) : JSON.stringify(item),
        })
    } catch (error) {
        jmsg('error', error)
        return { code: -2 }
    }

    if (query.status == 401) {
        jmsg('error', 'Acceso denegado: autenticación incorrecta')
        useModals().setModal('mLogin', 'Sesión terminada', null, null)
        return { code: 401 }
    }

    if (query.status == 403) {
        jmsg('error', 'Acceso denegado: permisos insuficientes')
        return { code: 403 }
    }

    const res = await query.json()

    if (res.code == -1) jmsg('error', 'Algo salió mal')

    if (res.code > 0) jmsg('error', res.msg)

    if (res.code == 0) {
        if (ms != false) {
            jmsg('success', ms == undefined ? 'Creado con éxito' : ms)
        }
    }

    return res
}

async function patch(url, item, ms) {
    let query

    try {
        query = await fetch(`${url}/${item.id}`, {
            method: 'PATCH',
            headers: setHeaders(item),
            body: item.formData ? setFormData(item) : JSON.stringify(item),
        })
    } catch (error) {
        jmsg('error', error)
        return { code: -2 }
    }

    if (query.status == 401) {
        jmsg('error', 'Acceso denegado: autenticación incorrecta')
        useModals().setModal('mLogin', 'Sesión terminada', null, null)
        return { code: 401 }
    }

    if (query.status == 403) {
        jmsg('error', 'Acceso denegado: permisos insuficientes')
        return { code: 403 }
    }

    const res = await query.json()

    if (res.code == -1) jmsg('error', 'Algo salió mal')

    if (res.code > 0) jmsg('error', res.msg)

    if (res.code == 0) {
        if (ms != false) {
            jmsg('success', ms == undefined ? 'Actualizado con éxito' : ms)
        }
    }

    return res
}

async function delet(url, item, ms) {
    let query

    try {
        query = await fetch(`${url}/${item.id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${useAuth().token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(item),
        })
    } catch (error) {
        jmsg('error', error)
        return { code: -2 }
    }

    if (query.status == 401) {
        jmsg('error', 'Acceso denegado: autenticación incorrecta')
        useModals().setModal('mLogin', 'Sesión terminada', null, null)
        return { code: 401 }
    }

    if (query.status == 403) {
        jmsg('error', 'Acceso denegado: permisos insuficientes')
        return { code: 403 }
    }

    const res = await query.json()

    if (res.code == -1) jmsg('error', 'Algo salió mal')

    if (res.code > 0) jmsg('error', res.msg)

    if (res.code == 0) {
        if (ms != false) {
            jmsg('success', ms == undefined ? 'Eliminado con éxito' : ms)
        }
    }

    return res
}

function getSubdominio() {
    const hostname = window.location.hostname

    const parts = hostname.split(".")

    if (parts.length > 2) return parts[0]

    return 'irmasbrasa'
}

function setFormData(item) {
    const formData = new FormData()

    const { archivo, ...resto } = item
    formData.append('archivo', archivo)
    formData.append("datos", JSON.stringify(resto))

    return formData
}

function setHeaders(item) {
    const headers = {
        Authorization: `Bearer ${useAuth().token}`,
    }

    if (!item.formData) {
        headers['Content-Type'] = 'application/json'
    }

    const subdominio = getSubdominio()
    if (subdominio) headers['x-empresa'] = subdominio

    return headers
}

export {
    host,
    urls,
    get,
    post,
    patch,
    delet,
}

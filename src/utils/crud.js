import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { jmsg } from '@/utils/swal'

const host = import.meta.env.VITE_API_HOST

const urls = {
    signin: `${host}/signin`,
    sistema: `${host}/api/sistema`,

    articulo_categorias: `${host}/api/articulo_categorias`,
    articulos: `${host}/api/articulos`,
    cajas: `${host}/api/cajas`,
    colaboradores: `${host}/api/colaboradores`,
    empresa: `${host}/api/empresa`,
    impresoras: `${host}/api/impresoras`,
    mesas: `${host}/api/mesas`,
    pago_comprobantes: `${host}/api/pago_comprobantes`,
    pago_metodos: `${host}/api/pago_metodos`,
    produccion_areas: `${host}/api/produccion_areas`,
    receta_insumos: `${host}/api/receta_insumos`,
    salones: `${host}/api/salones`,
}

async function get(url) {
    let query

    try {
        query = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${useAuth().token}`,
            },
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

    if (query.status == 404) {
        jmsg('error', 'Recurso no encontrado')
        return { code: 404 }
    }

    const res = await query.json()

    if (res.code == -1) jmsg('error', 'Algo salió mal')

    if (res.code > 0) jmsg('error', res.msg)

    return res
}

function setFormData(item) {
    const formData = new FormData();

    for (const key in item) {
        const value = item[key];

        formData.append(key, value);
    }

    return formData
}

function setHeaders(item) {
    const headers = {
        Authorization: `Bearer ${useAuth().token}`,
    }

    if (!item.formData) {
        headers['Content-Type'] = 'application/json'
    }

    return headers
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

async function getFile(url) {
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${useAuth().token}`,
        }
    })

    if (!response.ok) {
        jmsg('error', 'Archivo no encontrado')
        return
    }

    const blob = await response.blob()
    const newuri = window.URL.createObjectURL(blob)

    window.open(newuri, '_blank')
}

export {
    host,
    urls,
    get,
    post,
    patch,
    delet,
    getFile,
}

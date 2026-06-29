export const empresa_features = [
    { id: 'pedidos', label: 'Pedidos' },
    { id: 'pos', label: 'Punto de venta' },
    { id: 'mesas', label: 'Mesas' },
    { id: 'delivery', label: 'Delivery' },
    { id: 'para_llevar', label: 'Para llevar' },
    { id: 'insumos', label: 'Insumos' },
    { id: 'recetas', label: 'Recetas' },
]

const feature_ids = empresa_features.map((feature) => feature.id)

const vista_features = {
    vPedidos: 'pedidos',
    vCajaPedidos: 'pedidos',
    vReportePedidos: 'pedidos',
    vPos: 'pos',
    vSalones: 'mesas',
    vInsumos: 'insumos',
    vInventarioInsumos: 'insumos',
}

const permiso_features = {
    'vPedidos:unirMesas': 'mesas',
    'vPedidos:cambiarMesa': 'mesas',
    'vProductos:listarReceta': 'recetas',
    'vProductos:crearReceta': 'recetas',
    'vProductos:editarReceta': 'recetas',
    'vProductos:eliminarReceta': 'recetas',
}

export function normalizeFeatures(features) {
    const normalized_features = {}

    for (const feature_id of feature_ids) {
        normalized_features[feature_id] = features?.[feature_id] === true
    }

    return normalized_features
}

export function hasFeature(empresa, feature_id) {
    return normalizeFeatures(empresa?.features)[feature_id] === true
}

export function getVistaFeature(goto) {
    return vista_features[goto] || null
}

export function getPermisoFeature(permiso_id) {
    return permiso_features[permiso_id] || null
}

export function getPermisosByFeatures(permisos, empresa) {
    return (permisos || []).filter((permiso) => {
        const feature_id = getPermisoFeature(permiso.id || permiso)

        return !feature_id || hasFeature(empresa, feature_id)
    })
}

export function getMenuByFeatures(menu_base, empresa) {
    return (menu_base || [])
        .map((seccion) => {
            const children = (seccion.children || [])
                .filter((vista) => {
                    const feature_id = getVistaFeature(vista.goto)

                    return !feature_id || hasFeature(empresa, feature_id)
                })
                .map((vista) => ({
                    ...vista,
                    permisos: getPermisosByFeatures(vista.permisos, empresa),
                }))
                .filter((vista) => !vista.permisos || vista.permisos.length > 0)

            return children.length > 0 ? { ...seccion, children } : null
        })
        .filter((seccion) => seccion !== null)
}

const menuAdmin = [
    {
        id: 'admin',
        label: 'Admin',
        icon: 'fa-solid fa-building',
        children: [
            {
                label: 'Empresas',
                goto: 'vTenants',
                permisos: [
                    { id: 'vTenants:listar', label: 'Listar' },
                    { id: 'vTenants:crear', label: 'Crear' },
                    { id: 'vTenants:ver', label: 'Ver' },
                    { id: 'vTenants:editar', label: 'Editar' },
                    { id: 'vTenants:eliminar', label: 'Eliminar' },
                    { id: 'vTenantFeatures:editar', label: 'Features - Editar' },
                    { id: 'vTenantSucursales:listar', label: 'Sucursales - Listar' },
                    { id: 'vTenantSucursales:crear', label: 'Sucursales - Crear' },
                    { id: 'vTenantSucursales:ver', label: 'Sucursales - Ver' },
                    { id: 'vTenantSucursales:editar', label: 'Sucursales - Editar' },
                    { id: 'vTenantSucursales:eliminar', label: 'Sucursales - Eliminar' },
                ],
            },
        ],
    },
]

export default menuAdmin

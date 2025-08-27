import { defineStore } from "pinia"
import { urls, get, post } from '@/utils/crud.js'
import { deepCopy } from '@/utils/mine'
import { useVistas } from '@/pinia/vistas.js'
import { useModals } from '@/pinia/modals.js'

export const useAuth = defineStore('auth', {
    state: () => ({
        token: null,
        usuario: {},

        menu: [
            {
                label: 'Artículos', icon: 'fa-solid fa-boxes-stacked', children: [
                    { label: 'Categorías', goto: 'vArticuloCategorias' },
                    { label: 'Insumos', goto: 'vInsumos' },
                    { label: 'Productos', goto: 'vProductos' },
                    { label: 'Combos', goto: 'vCombos' },
                ]
            },
            {
                label: 'Ajustes', icon: 'fa-solid fa-gear', children: [
                    { label: 'Empresa', goto: 'vEmpresa' },
                    { label: 'Colaboradores', goto: 'vColaboradores' },
                    { label: 'Comprobantes de pago', goto: 'vPagoComprobantes' },
                    { label: 'Métodos de pago', goto: 'vPagoMetodos' },
                    // { label: 'Impresoras', goto: 'vImpresoras' },
                    { label: 'Cajas', goto: 'vCajas' },
                    { label: 'Áreas de producción', goto: 'vProduccionAreas' },
                    { label: 'Salones y mesas', goto: 'vSalones' },
                ]
            },
        ],
        listaPermisos: [
            {
                id: 'articulos', label: 'Artículos', vistas: [
                    {
                        id: 'vArticuloCategorias', label: 'Categorías', permisos: [
                            { id: 'vArticuloCategorias:listar', label: 'Listar' },
                            { id: 'vArticuloCategorias:crear', label: 'Crear' },
                            { id: 'vArticuloCategorias:editar', label: 'Editar' },
                            { id: 'vArticuloCategorias:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vInsumos', label: 'Insumos', permisos: [
                            { id: 'vInsumos:listar', label: 'Listar' },
                            { id: 'vInsumos:crear', label: 'Crear' },
                            { id: 'vInsumos:editar', label: 'Editar' },
                            { id: 'vInsumos:eliminar', label: 'Eliminar' },

                            { id: 'vInsumos:clonar', label: 'Clonar' },
                            { id: 'vInsumos:kardex', label: 'Ver kardex' },
                            { id: 'vInsumos:ajusteStock', label: 'Ajuste stock' },

                            { id: 'vInsumos:crearBulk', label: 'Crear masivo' },
                            { id: 'vInsumos:editarBulk', label: 'Editar masivo' },
                            { id: 'vInsumos:eliminarBulk', label: 'Eliminar masivo' },
                        ]
                    },
                    {
                        id: 'vProductos', label: 'Productos', permisos: [
                            { id: 'vProductos:listar', label: 'Listar' },
                            { id: 'vProductos:crear', label: 'Crear' },
                            { id: 'vProductos:editar', label: 'Editar' },
                            { id: 'vProductos:eliminar', label: 'Eliminar' },

                            { id: 'vProductos:clonar', label: 'Clonar' },
                            { id: 'vInsumos:kardex', label: 'Ver kardex' },
                            { id: 'vInsumos:ajusteStock', label: 'Ajuste stock' },

                            { id: 'vProductos:crearBulk', label: 'Crear masivo' },
                            { id: 'vProductos:editarBulk', label: 'Editar masivo' },
                            { id: 'vProductos:eliminarBulk', label: 'Eliminar masivo' },

                            { id: 'vProductos:listarReceta', label: 'Listar receta' },
                            { id: 'vProductos:crearReceta', label: 'Crear receta' },
                            { id: 'vProductos:editarReceta', label: 'Editar receta' },
                            { id: 'vProductos:eliminarReceta', label: 'Eliminar receta' },
                        ]
                    },
                    {
                        id: 'vCombos', label: 'Combos', permisos: [
                            { id: 'vCombos:listar', label: 'Listar' },
                            { id: 'vCombos:crear', label: 'Crear' },
                            { id: 'vCombos:editar', label: 'Editar' },
                            { id: 'vCombos:eliminar', label: 'Eliminar' },
                        ]
                    },
                ]
            },
            {
                id: 'ajustes', label: 'Ajustes', vistas: [
                    {
                        id: 'vEmpresa', label: 'Empresa', permisos: [
                            { id: 'vEmpresa:ver', label: 'Ver' },
                            { id: 'vEmpresa:editar', label: 'Editar' },
                        ]
                    },
                    {
                        id: 'vColaboradores', label: 'Colaboradores', permisos: [
                            { id: 'vColaboradores:listar', label: 'Listar' },
                            { id: 'vColaboradores:crear', label: 'Crear' },
                            { id: 'vColaboradores:ver', label: 'Ver' },
                            { id: 'vColaboradores:editar', label: 'Editar' },
                            { id: 'vColaboradores:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vPagoComprobantes', label: 'Comprobantes de pago', permisos: [
                            { id: 'vPagoComprobantes:listar', label: 'Listar' },
                            { id: 'vPagoComprobantes:editar', label: 'Editar' },
                        ]
                    },
                    {
                        id: 'vPagoMetodos', label: 'Métodos de pago', permisos: [
                            { id: 'vPagoMetodos:listar', label: 'Listar' },
                            { id: 'vPagoMetodos:crear', label: 'Crear' },
                            { id: 'vPagoMetodos:editar', label: 'Editar' },
                            { id: 'vPagoMetodos:eliminar', label: 'Eliminar' },
                        ]
                    },
                    // {
                    //     id: 'vImpresoras', label: 'Impresoras', permisos: [
                    //         { id: 'vImpresoras:listar', label: 'Listar' },
                    //         { id: 'vImpresoras:crear', label: 'Crear' },
                    //         { id: 'vImpresoras:editar', label: 'Editar' },
                    //         { id: 'vImpresoras:eliminar', label: 'Eliminar' },
                    //     ]
                    // },
                    {
                        id: 'vCajas', label: 'Cajas', permisos: [
                            { id: 'vCajas:listar', label: 'Listar' },
                            { id: 'vCajas:crear', label: 'Crear' },
                            { id: 'vCajas:editar', label: 'Editar' },
                            { id: 'vCajas:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vProduccionAreas', label: 'Áreas de producción', permisos: [
                            { id: 'vProduccionAreas:listar', label: 'Listar' },
                            { id: 'vProduccionAreas:crear', label: 'Crear' },
                            { id: 'vProduccionAreas:editar', label: 'Editar' },
                            { id: 'vProduccionAreas:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        id: 'vSalones', label: 'Salones y mesas', permisos: [
                            { id: 'vSalones:listar', label: 'Listar' },
                            { id: 'vSalones:crear', label: 'Crear' },
                            { id: 'vSalones:editar', label: 'Editar' },
                            { id: 'vSalones:eliminar', label: 'Eliminar' },
                            { id: 'vSalones:listarMesa', label: 'Listar mesas' },
                            { id: 'vSalones:crearMesa', label: 'Crear mesa' },
                            { id: 'vSalones:editarMesa', label: 'Editar mesa' },
                            { id: 'vSalones:eliminarMesa', label: 'Eliminar mesa' },
                        ]
                    },
                ]
            },
        ],

        showNavbar: true,
        loading: { show: false, text: '' },

        isDarkMode: null,
        tables: {},
        avances: {},
    }),
    actions: {
        initVars() {
            this.token = null
            this.permisos = []
            this.usuario = {}
            this.tables = {}
        },

        // ----- LOGIN ----- //
        async login() {
            if (this.token == null) return false

            this.setLoading(true, 'Cargando cuenta...')
            const result = await get(`${urls.colaboradores}/login`)
            this.setLoading(false)

            if (result.code != 0) return false

            this.usuario = deepCopy(result.data)
            this.permisos = this.usuario.permisos

            this.setTheme(this.usuario.theme)
            this.setPrimaryColor(this.usuario.color)
            // Formato de fecha
            this.showNavbar = this.usuario.menu_visible

            return true
        },
        async logout(vueRouter) {
            this.setLoading(true, 'Cerrando sesion...')
            const result = await post(`${urls.signin}/logout`, { id: this.usuario.colaborador }, false)
            this.setLoading(false)

            if (result.code != 0) return

            if (vueRouter) vueRouter.replace({ name: 'SignIn' })

            this.initVars()
            useVistas().initVars()
            useModals().initVars()
        },
        verifyPermiso(...permisos) {
            // return this.usuario?.permisos?.includes(permiso)
            return permisos.some(p => this.usuario?.permisos?.includes(p))
        },

        // ----- TABLES ----- //
        updateQuery(columns, qry) {
            columns.filter(a => a.op).forEach(b => {
                qry.fltr[b.id] = { op: b.op, val: b.val, val1: b.val1 }
            })

            qry.cols = columns.filter(a => a.show).map(b => b.id)
        },
        saveTableColumns(tableName, columns) {
            if (!tableName) return

            this.tables[tableName] = columns.map((col) => {
                return {
                    id: col.id,
                    width: col.width,
                    show: col.show,
                    seek: col.seek,
                    sort: col.sort,
                    op: col.op,
                    val: col.val,
                    val1: col.val1,
                    orden: col.orden,
                    sortDirection: col.sortDirection
                }
            })
        },
        setColumns(tableName, columns) {
            // ----- RECUPERA LAS COLUMNAS GUARDADAS ----- //
            if (this.tables[tableName]) {
                for (const a of columns) {
                    Object.assign(a, this.tables[tableName].find(b => b.id === a.id))
                }
            }
        },

        // ----- PREFERENCIAS ----- //
        setTheme(theme) {
            if (!theme) return

            this.usuario.theme = theme
            this.isDarkMode = theme == '2'

            if (theme == '1') {
                document.body.classList.remove('dark-mode')
            }
            else {
                document.body.classList.add('dark-mode')
            }
        },
        setPrimaryColor(color) {
            if (!color) return

            this.usuario.color = color
            document.documentElement.style.setProperty('--primary-color', color)
            document.documentElement.style.setProperty('--primary-color-dark', this.obscurecerColor(color))
        },
        obscurecerColor(color, porcentaje = 10) {
            const r = parseInt(color.substring(1, 3), 16);
            const g = parseInt(color.substring(3, 5), 16);
            const b = parseInt(color.substring(5, 7), 16);

            const rObscurecido = Math.max(0, Math.floor(r - (r * porcentaje / 100)));
            const gObscurecido = Math.max(0, Math.floor(g - (g * porcentaje / 100)));
            const bObscurecido = Math.max(0, Math.floor(b - (b * porcentaje / 100)));

            return `#${rObscurecido.toString(16).padStart(2, '0')}${gObscurecido.toString(16).padStart(2, '0')}${bObscurecido.toString(16).padStart(2, '0')}`;
        },

        setLoading(show, text) {
            if (text === undefined) text = ''

            this.loading = { show, text }
        },
    },
    persist: {
        storage: localStorage,
        paths: ['token', 'isDarkMode', 'tables', 'avances']
    }
})

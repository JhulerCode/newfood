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
                id: 'compras', label: 'Compras', icon: 'fa-solid fa-cart-shopping', children: [
                    {
                        label: 'Proveedores', goto: 'vProveedores', permisos: [
                            { id: 'vProveedores:listar', label: 'Listar' },
                            { id: 'vProveedores:crear', label: 'Crear' },
                            { id: 'vProveedores:ver', label: 'Ver' },
                            { id: 'vProveedores:editar', label: 'Editar' },
                            { id: 'vProveedores:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        label: 'Compras', goto: 'vCompras', permisos: [
                            { id: 'vCompras:listar', label: 'Listar' },
                            { id: 'vCompras:crear', label: 'Crear' },
                            { id: 'vCompras:ver', label: 'Ver' },
                            // { id: 'vCompras:anular', label: 'Anular' },
                            { id: 'vCompras:editar', label: 'Editar' },
                            { id: 'vCompras:eliminar', label: 'Eliminar' },
                        ]
                    },
                ]
            },
            {
                id: 'ventas', label: 'Ventas', icon: 'fa-solid fa-store', children: [
                    {
                        label: 'Clientes', goto: 'vClientes', permisos: [
                            { id: 'vClientes:listar', label: 'Listar' },
                            { id: 'vClientes:crear', label: 'Crear' },
                            { id: 'vClientes:ver', label: 'Ver' },
                            { id: 'vClientes:editar', label: 'Editar' },
                            { id: 'vClientes:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        label: 'Pedidos', goto: 'vPedidos', permisos: [
                            { id: 'vPedidos:listar', label: 'Listar' },
                            { id: 'vPedidos:crear', label: 'Crear' },
                            { id: 'vPedidos:ver', label: 'Ver' },
                            { id: 'vPedidos:anular', label: 'Anular' },
                            { id: 'vPedidos:editar', label: 'Editar' },
                            { id: 'vPedidos:eliminar', label: 'Eliminar' },

                            { id: 'vPedidos:imprimirComanda', label: 'Imprimir comanda' },
                            { id: 'vPedidos:imprimirPrecuenta', label: 'Imprimir precuenta' },
                            { id: 'vPedidos:generarComprobante', label: 'Generar comprobante' },
                            { id: 'vPedidos:verComprobantes', label: 'Ver comprobantes' },
                            { id: 'vPedidos:entregar', label: 'Confirmar entrega' },

                            { id: 'vPedidos:unirMesas', label: 'Unir mesas' },
                            { id: 'vPedidos:cambiarMesa', label: 'Cambiar mesa' },
                        ]
                    }
                ]
            },
            {
                id: 'caja', label: 'Caja', icon: 'fa-solid fa-cash-register', children: [
                    {
                        label: 'Resumen', goto: 'vCajaResumen', permisos: [
                            { id: 'vCajaResumen:ver', label: 'Ver resumen de caja' },
                        ],
                    },
                    {
                        label: 'Ingresos y egresos', goto: 'vCajaMovimientos', permisos: [
                            { id: 'vCajaMovimientos:listar', label: 'Listar' },
                            { id: 'vCajaMovimientos:crear', label: 'Crear' },
                            { id: 'vCajaMovimientos:editar', label: 'Editar' },
                            { id: 'vCajaMovimientos:eliminar', label: 'Eliminar' },
                        ]
                    }
                ]
            },
            {
                id: 'articulos', label: 'Artículos', icon: 'fa-solid fa-boxes-stacked', children: [
                    {
                        label: 'Categorías', goto: 'vArticuloCategorias', permisos: [
                            { id: 'vArticuloCategorias:listar', label: 'Listar' },
                            { id: 'vArticuloCategorias:crear', label: 'Crear' },
                            { id: 'vArticuloCategorias:editar', label: 'Editar' },
                            { id: 'vArticuloCategorias:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        label: 'Insumos', goto: 'vInsumos', permisos: [
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
                        label: 'Productos', goto: 'vProductos', permisos: [
                            { id: 'vProductos:listar', label: 'Listar' },
                            { id: 'vProductos:crear', label: 'Crear' },
                            { id: 'vProductos:editar', label: 'Editar' },
                            { id: 'vProductos:eliminar', label: 'Eliminar' },

                            { id: 'vProductos:clonar', label: 'Clonar' },
                            { id: 'vProductos:kardex', label: 'Ver kardex' },
                            { id: 'vProductos:ajusteStock', label: 'Ajuste stock' },

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
                        label: 'Combos', goto: 'vCombos', permisos: [
                            { id: 'vCombos:listar', label: 'Listar' },
                            { id: 'vCombos:crear', label: 'Crear' },
                            { id: 'vCombos:editar', label: 'Editar' },
                            { id: 'vCombos:eliminar', label: 'Eliminar' },
                        ]
                    },
                ]
            },
            {
                id: 'ajustes', label: 'Ajustes', icon: 'fa-solid fa-gear', children: [
                    {
                        label: 'Empresa', goto: 'vEmpresa', permisos: [
                            { id: 'vEmpresa:ver', label: 'Ver' },
                            { id: 'vEmpresa:editar', label: 'Editar' },
                        ]
                    },
                    {
                        label: 'Colaboradores', goto: 'vColaboradores', permisos: [
                            { id: 'vColaboradores:listar', label: 'Listar' },
                            { id: 'vColaboradores:crear', label: 'Crear' },
                            { id: 'vColaboradores:ver', label: 'Ver' },
                            { id: 'vColaboradores:editar', label: 'Editar' },
                            { id: 'vColaboradores:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        label: 'Comprobantes de pago', goto: 'vPagoComprobantes', permisos: [
                            { id: 'vPagoComprobantes:listar', label: 'Listar' },
                            { id: 'vPagoComprobantes:editar', label: 'Editar' },
                        ]
                    },
                    {
                        label: 'Métodos de pago', goto: 'vPagoMetodos', permisos: [
                            { id: 'vPagoMetodos:listar', label: 'Listar' },
                            { id: 'vPagoMetodos:crear', label: 'Crear' },
                            { id: 'vPagoMetodos:editar', label: 'Editar' },
                            { id: 'vPagoMetodos:eliminar', label: 'Eliminar' },
                        ]
                    },
                    // { label: 'Impresoras', goto: 'vImpresoras' },
                    {
                        label: 'Cajas', goto: 'vCajas', permisos: [
                            { id: 'vCajas:listar', label: 'Listar' },
                            { id: 'vCajas:crear', label: 'Crear' },
                            { id: 'vCajas:editar', label: 'Editar' },
                            { id: 'vCajas:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        label: 'Áreas de producción', goto: 'vProduccionAreas', permisos: [
                            { id: 'vProduccionAreas:listar', label: 'Listar' },
                            { id: 'vProduccionAreas:crear', label: 'Crear' },
                            { id: 'vProduccionAreas:editar', label: 'Editar' },
                            { id: 'vProduccionAreas:eliminar', label: 'Eliminar' },
                        ]
                    },
                    {
                        label: 'Salones y mesas', goto: 'vSalones', permisos: [
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

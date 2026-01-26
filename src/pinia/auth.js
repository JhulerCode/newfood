import { defineStore } from 'pinia'
import { urls, get, post, patch } from '@/utils/crud.js'
import { deepCopy } from '@/utils/mine'
import { useVistas } from '@/pinia/vistas.js'
// import { useModals } from '@/pinia/modals.js'
import { io } from 'socket.io-client'
import { host } from '@/utils/crud.js'
import { jmsg } from '@/utils/swal'

export const useAuth = defineStore('auth', {
    state: () => ({
        token: null,
        usuario: {},
        socket: null,
        empresa: {},
        sucursal: {},
        app_version: '1.6.7',

        menu: [
            {
                id: 'compras',
                label: 'Compras',
                icon: 'fa-solid fa-cart-shopping',
                children: [
                    {
                        label: 'Proveedores',
                        goto: 'vProveedores',
                        permisos: [
                            { id: 'vProveedores:listar', label: 'Listar' },
                            { id: 'vProveedores:crear', label: 'Crear' },
                            { id: 'vProveedores:ver', label: 'Ver' },
                            { id: 'vProveedores:editar', label: 'Editar' },
                            { id: 'vProveedores:eliminar', label: 'Eliminar' },
                        ],
                    },
                    {
                        label: 'Compras',
                        goto: 'vCompras',
                        permisos: [
                            { id: 'vCompras:listar', label: 'Listar' },
                            { id: 'vCompras:crear', label: 'Crear' },
                            { id: 'vCompras:ver', label: 'Ver' },
                            { id: 'vCompras:editar', label: 'Editar' },
                            { id: 'vCompras:eliminar', label: 'Eliminar' },
                        ],
                    },
                ],
            },
            {
                id: 'ventas',
                label: 'Ventas',
                icon: 'fa-solid fa-store',
                children: [
                    {
                        label: 'Clientes',
                        goto: 'vClientes',
                        permisos: [
                            { id: 'vClientes:listar', label: 'Listar' },
                            { id: 'vClientes:crear', label: 'Crear' },
                            { id: 'vClientes:ver', label: 'Ver' },
                            { id: 'vClientes:editar', label: 'Editar' },
                            { id: 'vClientes:eliminar', label: 'Eliminar' },
                        ],
                    },
                    {
                        label: 'Pedidos',
                        goto: 'vPedidos',
                        permisos: [
                            { id: 'vPedidos:listar', label: 'Listar' },
                            { id: 'vPedidos:crear', label: 'Crear' },
                            { id: 'vPedidos:ver', label: 'Ver' },
                            { id: 'vPedidos:editar', label: 'Editar' },
                            { id: 'vPedidos:addProductos', label: 'Añadir productos' },
                            { id: 'vPedidos:editarDetalles', label: 'Editar detalles' },
                            { id: 'vPedidos:anular', label: 'Anular' },
                            // { id: 'vPedidos:editar', label: 'Editar' },
                            { id: 'vPedidos:eliminar', label: 'Eliminar' },

                            { id: 'vPedidos:imprimirComanda', label: 'Reimprimir pedido' },
                            { id: 'vPedidos:imprimirPrecuenta', label: 'Imprimir precuenta' },
                            { id: 'vPedidos:generarComprobante', label: 'Generar comprobante' },
                            { id: 'vPedidos:verComprobantes', label: 'Ver comprobantes' },
                            { id: 'vPedidos:entregar', label: 'Confirmar entrega' },

                            { id: 'vPedidos:unirMesas', label: 'Unir mesas' },
                            { id: 'vPedidos:cambiarMesa', label: 'Cambiar mesa' },
                        ],
                    },
                    {
                        label: 'Punto de venta',
                        goto: 'vPos',
                        permisos: [{ id: 'vPos:crear', label: 'Crear' }],
                    },
                ],
            },
            {
                id: 'caja',
                label: 'Caja',
                icon: 'fa-solid fa-cash-register',
                children: [
                    {
                        label: 'Apertura y cierre',
                        goto: 'vCajaResumen',
                        permisos: [
                            { id: 'vCajaResumen:ver', label: 'Ver resumen' },
                            { id: 'vCajaResumen:aperturar', label: 'Aperturar caja' },
                            { id: 'vCajaResumen:cerrar', label: 'Cerrar caja' },
                        ],
                    },
                    {
                        label: 'Ingresos y egresos',
                        goto: 'vCajaMovimientos',
                        permisos: [
                            { id: 'vCajaMovimientos:listar', label: 'Listar' },
                            { id: 'vCajaMovimientos:crear', label: 'Crear' },
                            { id: 'vCajaMovimientos:editar', label: 'Editar' },
                            { id: 'vCajaMovimientos:eliminar', label: 'Eliminar' },
                        ],
                    },
                ],
            },
            {
                id: 'inventario',
                label: 'Inventario',
                icon: 'fa-solid fa-boxes-stacked',
                children: [
                    {
                        label: 'Insumos',
                        goto: 'vInventarioInsumos',
                        permisos: [
                            { id: 'vInventarioInsumos:listar', label: 'Listar' },
                            { id: 'vInventarioInsumos:kardex', label: 'Ver kardex' },
                            { id: 'vInventarioInsumos:ajusteStock', label: 'Ajuste stock' },
                        ],
                    },
                    {
                        label: 'Productos',
                        goto: 'vInventarioProductos',
                        permisos: [
                            { id: 'vInventarioProductos:listar', label: 'Listar' },
                            { id: 'vInventarioProductos:kardex', label: 'Ver kardex' },
                            { id: 'vInventarioProductos:ajusteStock', label: 'Ajuste stock' },
                        ],
                    },
                ],
            },
            {
                id: 'reportes',
                label: 'Reportes',
                icon: 'fa-solid fa-chart-line',
                children: [
                    {
                        label: 'Pedidos',
                        goto: 'vReportePedidos',
                        permisos: [
                            { id: 'vReportePedidos:listar', label: 'Listar' },
                            { id: 'vReportePedidos:ver', label: 'Ver' },
                            { id: 'vReportePedidos:imprimirComanda', label: 'Imprimir' },
                            { id: 'vReportePedidos:verComprobantes', label: 'Ver comprobantes' },
                        ],
                    },
                    {
                        label: 'Comprobantes',
                        goto: 'vReporteComprobantes',
                        permisos: [
                            { id: 'vReporteComprobantes:listar', label: 'Listar' },
                            { id: 'vReporteComprobantes:anular', label: 'Anular' },
                            { id: 'vReporteComprobantes:canjear', label: 'Canjear' },
                            { id: 'vReporteComprobantes:verPagos', label: 'Ver pagos' },
                            { id: 'vReporteComprobantes:agregarPagos', label: 'Agregar pagos' },
                            { id: 'vReporteComprobantes:editarPagos', label: 'Editar pagos' },
                            { id: 'vReporteComprobantes:enviarCorreo', label: 'Enviar por email' },
                            { id: 'vReporteComprobantes:imprimir', label: 'Imprimir' },
                            { id: 'vReporteComprobantes:descargarPdf', label: 'Descargar PDF' },
                            { id: 'vReporteComprobantes:descargarXml', label: 'Descargar XML' },
                            { id: 'vReporteComprobantes:descargarCdr', label: 'Descargar CDR' },
                            {
                                id: 'vReporteComprobantes:consultarEstado',
                                label: 'Consultar estado',
                            },
                        ],
                    },
                    {
                        label: 'Comprobantes detallado',
                        goto: 'vComprobantesDetallado',
                        permisos: [{ id: 'vComprobantesDetallado:listar', label: 'Listar' }],
                    },
                    {
                        label: 'Aperturas de caja',
                        goto: 'vCajaAperturas',
                        permisos: [
                            { id: 'vCajaAperturas:listar', label: 'Listar' },
                            { id: 'vCajaAperturas:verResumen', label: 'Ver resumen' },
                            { id: 'vCajaAperturas:imprimirResumen', label: 'Imprimir resumen' },
                        ],
                    },
                    {
                        label: 'Ingresos y egresos',
                        goto: 'vDineroMovimientos',
                        permisos: [{ id: 'vDineroMovimientos:listar', label: 'Listar' }],
                    },
                    {
                        label: 'Dashboard',
                        goto: 'vDashboard',
                        permisos: [{ id: 'vDashboard:ver', label: 'Listar' }],
                    },
                ],
            },
            {
                id: 'ajustes',
                label: 'Ajustes',
                icon: 'fa-solid fa-gear',
                children: [
                    {
                        label: 'Empresa',
                        goto: 'vEmpresa',
                        permisos: [
                            { id: 'vEmpresa:ver', label: 'Ver' },
                            { id: 'vEmpresa:editar', label: 'Editar' },
                        ],
                    },
                    {
                        label: 'Sucursales',
                        goto: 'vSucursales',
                        permisos: [
                            { id: 'vSucursales:listar', label: 'Listar' },
                            { id: 'vSucursales:crear', label: 'Crear' },
                            { id: 'vSucursales:ver', label: 'Ver' },
                            { id: 'vSucursales:editar', label: 'Editar' },
                            { id: 'vSucursales:eliminar', label: 'Eliminar' },
                            { id: 'vSucursales:cambiarSucursal', label: 'Cambiar de sucursal' },

                            { id: 'vImpresionAreas:listar', label: 'Áreas de impresión - Listar' },
                            { id: 'vImpresionAreas:crear', label: 'Áreas de impresión - Crear' },
                            { id: 'vImpresionAreas:editar', label: 'Áreas de impresión - Editar' },
                            {
                                id: 'vImpresionAreas:eliminar',
                                label: 'Áreas de impresión - Eliminar',
                            },
                        ],
                    },
                    {
                        label: 'Salones y mesas',
                        goto: 'vSalones',
                        permisos: [
                            { id: 'vSalones:listar', label: 'Listar' },
                            { id: 'vSalones:crear', label: 'Crear' },
                            { id: 'vSalones:editar', label: 'Editar' },
                            { id: 'vSalones:eliminar', label: 'Eliminar' },
                            { id: 'vSalones:listarMesa', label: 'Listar mesas' },
                            { id: 'vSalones:crearMesa', label: 'Crear mesa' },
                            { id: 'vSalones:editarMesa', label: 'Editar mesa' },
                            { id: 'vSalones:eliminarMesa', label: 'Eliminar mesa' },
                        ],
                    },
                    {
                        label: 'Tipos de comprobante',
                        goto: 'vComprobanteTipos',
                        permisos: [
                            { id: 'vComprobanteTipos:listar', label: 'Listar' },
                            { id: 'vComprobanteTipos:crear', label: 'Crear' },
                            { id: 'vComprobanteTipos:eliminar', label: 'Eliminar' },
                        ],
                    },
                    {
                        label: 'Métodos de pago',
                        goto: 'vPagoMetodos',
                        permisos: [
                            { id: 'vPagoMetodos:listar', label: 'Listar' },
                            { id: 'vPagoMetodos:crear', label: 'Crear' },
                            { id: 'vPagoMetodos:editar', label: 'Editar' },
                            { id: 'vPagoMetodos:eliminar', label: 'Eliminar' },
                        ],
                    },
                    {
                        label: 'Categorías',
                        goto: 'vArticuloCategorias',
                        permisos: [
                            { id: 'vArticuloCategorias:listar', label: 'Listar' },
                            { id: 'vArticuloCategorias:crear', label: 'Crear' },
                            { id: 'vArticuloCategorias:editar', label: 'Editar' },
                            { id: 'vArticuloCategorias:eliminar', label: 'Eliminar' },
                        ],
                    },
                    {
                        label: 'Insumos',
                        goto: 'vInsumos',
                        permisos: [
                            { id: 'vInsumos:listar', label: 'Listar' },
                            { id: 'vInsumos:crear', label: 'Crear' },
                            { id: 'vInsumos:editar', label: 'Editar' },
                            { id: 'vInsumos:eliminar', label: 'Eliminar' },

                            { id: 'vInsumos:clonar', label: 'Clonar' },

                            { id: 'vInsumos:crearBulk', label: 'Crear masivo' },
                            { id: 'vInsumos:editarBulk', label: 'Editar masivo' },
                            { id: 'vInsumos:eliminarBulk', label: 'Eliminar masivo' },
                        ],
                    },
                    {
                        label: 'Productos',
                        goto: 'vProductos',
                        permisos: [
                            { id: 'vProductos:listar', label: 'Listar' },
                            { id: 'vProductos:crear', label: 'Crear' },
                            { id: 'vProductos:editar', label: 'Editar' },
                            { id: 'vProductos:eliminar', label: 'Eliminar' },

                            { id: 'vProductos:clonar', label: 'Clonar' },

                            { id: 'vProductos:crearBulk', label: 'Crear masivo' },
                            { id: 'vProductos:editarBulk', label: 'Editar masivo' },
                            { id: 'vProductos:eliminarBulk', label: 'Eliminar masivo' },

                            { id: 'vProductos:listarReceta', label: 'Listar receta' },
                            { id: 'vProductos:crearReceta', label: 'Crear receta' },
                            { id: 'vProductos:editarReceta', label: 'Editar receta' },
                            { id: 'vProductos:eliminarReceta', label: 'Eliminar receta' },
                        ],
                    },
                    {
                        label: 'Combos',
                        goto: 'vCombos',
                        permisos: [
                            { id: 'vCombos:listar', label: 'Listar' },
                            { id: 'vCombos:crear', label: 'Crear' },
                            { id: 'vCombos:editar', label: 'Editar' },
                            { id: 'vCombos:eliminar', label: 'Eliminar' },

                            { id: 'vCombos:crearBulk', label: 'Crear masivo' },
                            { id: 'vCombos:editarBulk', label: 'Editar masivo' },
                            { id: 'vCombos:eliminarBulk', label: 'Eliminar masivo' },
                            {
                                id: 'vCombos:crearComponentesBulk',
                                label: 'Crear componentes masivo',
                            },
                        ],
                    },
                    {
                        label: 'Colaboradores',
                        goto: 'vColaboradores',
                        permisos: [
                            { id: 'vColaboradores:listar', label: 'Listar' },
                            { id: 'vColaboradores:crear', label: 'Crear' },
                            { id: 'vColaboradores:ver', label: 'Ver' },
                            { id: 'vColaboradores:editar', label: 'Editar' },
                            { id: 'vColaboradores:eliminar', label: 'Eliminar' },
                        ],
                    },
                ],
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

        // --- LOGIN --- //
        async login() {
            if (this.token == null) return false

            this.setLoading(true, 'Cargando cuenta...')
            const result = await get(`${urls.colaboradores}/login`)
            this.setLoading(false)

            if (result.code != 0) return false

            this.setSessionDatos(result)

            // this.usuario = deepCopy(result.data)
            // this.permisos = this.usuario.permisos

            // this.setTheme(this.usuario.theme)
            // this.setPrimaryColor(this.usuario.color)
            // // Formato de fecha
            // this.showNavbar = this.usuario.menu_visible

            this.connectSocket()

            return true
        },
        setSessionDatos(result) {
            this.usuario = deepCopy(result.data)
            this.permisos = this.usuario.permisos

            this.setTheme(this.usuario.theme)
            this.setPrimaryColor(this.usuario.color)
            this.setInicialTables(this.usuario.tables)
            this.setInicialAvances(this.usuario.avances)
            // Formato de fecha
            this.showNavbar = this.usuario.menu_visible

            if (result.empresa) {
                this.empresa = deepCopy(result.empresa)
            }

            if (
                !this.sucursal.id ||
                !this.empresa.sucursales.some((a) => a.id == this.sucursal.id)
            ) {
                if (this.empresa.sucursales[0]) {
                    this.sucursal = deepCopy(this.empresa.sucursales[0])
                }
            }
        },
        connectSocket() {
            this.disconnectSocket()

            this.socket = io(host, {
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 2000,
            })

            this.socket.on('connect', () => {
                this.socket.emit('joinUser', {
                    id: this.usuario.colaborador,
                    nombres: this.usuario.nombres,
                    apellidos: this.usuario.apellidos,
                    empresa: this.empresa.id,
                    sucursal: this.sucursal.id,
                })

                this.listenSocket()
            })

            this.socket.on('disconnect', (reason) => {
                console.log('Socket desconectado:', reason)
            })
        },
        listenSocket() {
            // --- empresa --- //
            this.socket.on('empresa-updated', (data) => {
                // console.log(data)
                this.empresa = data
            })

            // --- colaboradores --- //
            this.socket.on('colaborador-updated', (data) => {
                console.log(data)
                // this.empresa = data
            })

            // --- Pedidos --- //
            this.socket.on('vComanda:crear', (data) => {
                useVistas().addItem('vPedidos', 'pedidos', data, 'first')
                useVistas().vPedidos?.setIntervalTimeAgo()
                useVistas().vPedidos?.calculatePendientes()
                if (data.venta_canal == 1) useVistas().vPedidos?.setMesasPedidos()
            })

            this.socket.on('vComanda:editar', (data) => {
                useVistas().updateItem('vPedidos', 'pedidos', data)
                useVistas().vPedidos?.setIntervalTimeAgo()
                useVistas().vPedidos?.calculatePendientes()
                if (data.venta_canal == 1) useVistas().vPedidos?.setMesasPedidos()
            })

            this.socket.on('vComanda:addProductos', (data) => {
                useVistas().updateItem('vPedidos', 'pedidos', data)
                useVistas().vPedidos?.setIntervalTimeAgo()
            })

            this.socket.on('mPedidoDetalles:modificar', (data) => {
                useVistas().updateItem('vPedidos', 'pedidos', data)
                useVistas().vPedidos?.setIntervalTimeAgo()
            })

            this.socket.on('vPedidos:eliminar', (data) => {
                useVistas().removeItem('vPedidos', 'pedidos', data)
                useVistas().vPedidos?.setIntervalTimeAgo()
                useVistas().vPedidos?.calculatePendientes()
                if (data.venta_canal == 1) useVistas().vPedidos?.setMesasPedidos()
            })

            this.socket.on('vPedidos:anular', (data) => {
                useVistas().removeItem('vPedidos', 'pedidos', data)
                useVistas().vPedidos?.setIntervalTimeAgo()
                useVistas().vPedidos?.calculatePendientes()
                if (data.venta_canal == 1) useVistas().vPedidos?.setMesasPedidos()
            })

            this.socket.on('vPedidos:entregar', (data) => {
                useVistas().updateItem('vPedidos', 'pedidos', data)
                useVistas().vPedidos?.setIntervalTimeAgo()
                useVistas().vPedidos?.calculatePendientes()
            })

            this.socket.on('vPedidos:entregarBulk', (data) => {
                useVistas().vPedidos.pedidos = useVistas().vPedidos.pedidos.filter(
                    (a) => !data.includes(a.id),
                )
                useVistas().vPedidos?.calculatePendientes()
            })

            this.socket.on('mCambiarMesa:cambiar', (data) => {
                useVistas().updateItem('vPedidos', 'pedidos', data)
                useVistas().vPedidos?.setIntervalTimeAgo()
                useVistas().vPedidos?.setMesasPedidos()
            })

            this.socket.on('mMesasUnir:unir', () => {
                useVistas().vPedidos?.loadSalones()
            })

            this.socket.on('vEmitirComprobante:grabar', (data) => {
                useVistas().updateItem('vPedidos', 'pedidos', data)
                useVistas().vPedidos?.setIntervalTimeAgo()
                useVistas().vPedidos?.calculatePendientes()
                // console.log(data.venta_canal)
                if (data.venta_canal == 1) useVistas().vPedidos?.setMesasPedidos()
            })

            this.socket.on('pc_principal_socket_not_found', () => {
                jmsg('error', 'DivergeRest Printer no iniciado')
            })

            // --- Articulos --- //
            this.socket.on('mArticulo:crear', () => {
                useVistas().vComanda?.loadArticulos()
            })

            this.socket.on('mArticulo:modificar', () => {
                useVistas().vComanda?.loadArticulos()
            })

            // --- Categorias --- //
            this.socket.on('mArticuloCategoria:crear', () => {
                useVistas().vComanda?.loadCategorias()
            })

            this.socket.on('mArticuloCategoria:modificar', () => {
                useVistas().vComanda?.loadCategorias()
            })
        },
        async logout(vueRouter) {
            this.setLoading(true, 'Cerrando sesion...')
            const result = await post(
                `${urls.signin}/logout`,
                { id: this.usuario.colaborador },
                false,
            )
            this.setLoading(false)

            if (result.code != 0) return

            if (vueRouter) vueRouter.replace({ name: 'SignIn' })

            // this.initVars()
            // useVistas().initVars()
            // useModals().initVars()
            this.disconnectSocket()

            window.location.reload()
        },
        disconnectSocket() {
            if (this.socket) {
                // Detén intentos de reconexión
                this.socket.io.opts.reconnection = false

                // Elimina todos los listeners
                this.socket.removeAllListeners()

                // Cierra la conexión
                this.socket.disconnect()

                // Limpia la referencia
                this.socket = null

                console.log('🔌 Socket desconectado y limpiado completamente')
            }
        },
        verifyPermiso(...permisos) {
            // console.log(permisos)
            return permisos.some((p) => this.usuario?.permisos?.includes(p))
        },

        // --- TABLES --- //
        updateQuery(columns, qry) {
            columns
                .filter((a) => a.op)
                .forEach((b) => {
                    qry.fltr[b.id] = { op: b.op, val: b.val, val1: b.val1 }
                })

            qry.cols = columns.filter((a) => a.show).map((b) => b.id)
        },
        async saveTableColumns(tableName, columns) {
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
                    sortDirection: col.sortDirection,
                }
            })

            const send = {
                id: this.usuario.colaborador,
                tables: this.tables,
            }

            this.setLoading(true, 'Cargando...')
            const res = await patch(`${urls.colaboradores}/tables`, send, false)
            this.setLoading(false)

            if (res.code != 0) return
        },
        setColumns(tableName, columns) {
            // --- RECUPERA LAS COLUMNAS GUARDADAS --- //
            if (this.tables[tableName]) {
                for (const a of columns) {
                    Object.assign(
                        a,
                        this.tables[tableName].find((b) => b.id === a.id),
                    )
                }
            }
        },
        setInicialTables(tables) {
            this.tables = tables
        },

        // ----- AVANCES ----- //
        async saveAvances(card, data) {
            this.avances[card] = data

            const send = {
                id: this.usuario.colaborador,
                avances: this.avances,
            }

            this.setLoading(true, 'Cargando...')
            const res = await patch(`${urls.colaboradores}/avances`, send, false)
            this.setLoading(false)

            if (res.code != 0) return
        },
        setInicialAvances(avances) {
            this.avances = avances
        },

        // --- PREFERENCIAS --- //
        setTheme(theme) {
            if (!theme) return

            this.usuario.theme = theme
            this.isDarkMode = theme == '2'

            if (theme == '1') {
                document.body.classList.remove('dark-mode')
            } else {
                document.body.classList.add('dark-mode')
            }
        },
        setPrimaryColor(color) {
            if (!color) return

            this.usuario.color = color
            document.documentElement.style.setProperty('--primary-color', color)
            document.documentElement.style.setProperty(
                '--primary-color-dark',
                this.obscurecerColor(color),
            )
        },
        obscurecerColor(color, porcentaje = 10) {
            const r = parseInt(color.substring(1, 3), 16)
            const g = parseInt(color.substring(3, 5), 16)
            const b = parseInt(color.substring(5, 7), 16)

            const rObscurecido = Math.max(0, Math.floor(r - (r * porcentaje) / 100))
            const gObscurecido = Math.max(0, Math.floor(g - (g * porcentaje) / 100))
            const bObscurecido = Math.max(0, Math.floor(b - (b * porcentaje) / 100))

            return `#${rObscurecido.toString(16).padStart(2, '0')}${gObscurecido.toString(16).padStart(2, '0')}${bObscurecido.toString(16).padStart(2, '0')}`
        },

        setLoading(show, text) {
            if (text === undefined) text = ''

            this.loading = { show, text }
        },
    },
    persist: {
        storage: localStorage,
        paths: ['token', 'isDarkMode', 'tables', 'avances', 'sucursal'],
    },
})

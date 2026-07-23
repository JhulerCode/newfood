import { defineStore } from 'pinia'
import { urls, get, post, patch, getSubdominio } from '@/utils/crud.js'
import { deepCopy } from '@/utils/mine'
import { useVistas } from '@/pinia/vistas.js'
// import { useModals } from '@/pinia/modals.js'
import { io } from 'socket.io-client'
import { host } from '@/utils/crud.js'
import { jmsg } from '@/utils/swal'
import Swal from 'sweetalert2'
import {
    getMenuByFeatures,
    getPermisoFeature,
    hasFeature,
    normalizeFeatures,
} from '@/utils/menuFeatures.js'
import menuUser from '@/menus/menuUser.js'
import menuAdmin from '@/menus/menuAdmin.js'

export const useAuth = defineStore('auth', {
    state: () => ({
        usuario: {},
        socket: null,
        empresa: {},
        sucursal: {},
        app_version: '1.8.1',
        token: null,

        showNavbar: true,
        loading: { show: false, text: '' },

        isDarkMode: null,
        tables: {},
        avances: {},
        access_notice: null,
    }),
    getters: {
        isAdminSubdominio() {
            return getSubdominio() === 'admin'
        },
        menu() {
            return this.isAdminSubdominio ? menuAdmin : menuUser
        },
        vistaInicial() {
            return this.isAdminSubdominio ? 'vTenants' : this.usuario?.vista_inicial
        },
        empresa_features(state) {
            return normalizeFeatures(state.empresa?.features)
        },
        menuByFeatures() {
            return getMenuByFeatures(this.menu, this.empresa)
        },
        menuByFeaturesAndPermisos() {
            return getMenuByFeatures(this.menu, this.empresa)
                .map((seccion) => {
                    const children = seccion.children.filter((vista) =>
                        (this.usuario.permisos || []).some((permiso) =>
                            permiso.startsWith(vista.goto + ':'),
                        ),
                    )

                    return children.length > 0 ? { ...seccion, children } : null
                })
                .filter((seccion) => seccion !== null)
        },
    },
    actions: {
        initVars() {
            this.permisos = []
            this.usuario = {}
            this.tables = {}
            this.sucursal = {}
            this.token = null
        },
        setToken(token) {
            this.token = token
        },

        // --- LOGIN --- //
        async login() {
            this.setLoading(true, 'Cargando cuenta...')
            const result = await get(`${urls.colaboradores}/login`, { silent401: true })
            this.setLoading(false)

            if (result.code != 0) {
                this.disconnectSocket()
                return false
            }

            this.setSessionDatos(result)
            this.showAccessNotice(this.access_notice)

            // this.usuario = deepCopy(result.data)
            // this.permisos = this.usuario.permisos

            // this.setTheme(this.usuario.theme)
            // this.setPrimaryColor(this.usuario.color)
            // // Formato de fecha
            // this.showNavbar = this.usuario.menu_visible

            if (!this.isAdminSubdominio) this.connectSocket()

            return true
        },
        setSessionDatos(result) {
            this.usuario = deepCopy(result.data)
            this.permisos = this.usuario.permisos
            this.access_notice = result.access_notice || this.usuario.access_notice || null

            this.setTheme(this.usuario.theme)
            this.setPrimaryColor(this.usuario.color)
            this.setInicialTables(this.usuario.tables)
            this.setInicialAvances(this.usuario.avances)
            // Formato de fecha
            this.showNavbar = this.usuario.menu_visible

            if (result.empresa) {
                this.empresa = deepCopy(result.empresa)
            }

            const sucursales = this.empresa.sucursales || []
            const sucursalesDisponibles = sucursales.filter((a) => this.isSucursalDisponible(a))
            const usuarioSucursal = sucursalesDisponibles.find((a) => a.id == this.usuario.sucursal)
            const sucursalActual = sucursalesDisponibles.find((a) => a.id == this.sucursal?.id)
            const puedeCambiarSucursal = this.verifyPermiso('vSucursales:cambiarSucursal')

            if (puedeCambiarSucursal && sucursalActual) {
                this.sucursal = deepCopy(sucursalActual)
            } else if (usuarioSucursal) {
                this.sucursal = deepCopy(usuarioSucursal)
            } else if (puedeCambiarSucursal && sucursalesDisponibles[0]) {
                this.sucursal = deepCopy(sucursalesDisponibles[0])
            } else {
                this.sucursal = {}
            }
        },
        isSucursalDisponible(sucursal) {
            if (!sucursal || sucursal.activo === false) return false
            if (!sucursal.fecha_fin) return false

            const hoy = new Date()
            hoy.setHours(0, 0, 0, 0)

            const fechaFin = new Date(`${sucursal.fecha_fin}T00:00:00`)
            fechaFin.setDate(fechaFin.getDate() + 2)

            return fechaFin >= hoy
        },
        showAccessNotice(access_notice) {
            if (!access_notice || this.isAdminSubdominio) return

            const key = `access_notice:${access_notice.title}:${access_notice.text}`
            if (sessionStorage.getItem(key)) return

            sessionStorage.setItem(key, 'true')
            Swal.fire({
                icon: access_notice.icon || 'warning',
                title: access_notice.title,
                text: access_notice.text,
                confirmButtonText: 'Entendido',
                confirmButtonColor: 'var(--primary-color)',
                background: 'var(--bg-color)',
                color: 'var(--text-color2)',
            })
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
                    session_id: this.usuario.session_id,
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

            this.socket.on('printer_agent_socket_not_found', () => {
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
            this.setToken(null)

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
            return permisos.some((permiso_id) => {
                const feature_id = getPermisoFeature(permiso_id)

                if (feature_id && !this.verifyFeature(feature_id)) return false

                return this.usuario?.permisos?.includes(permiso_id)
            })
        },
        verifyFeature(feature_id) {
            return hasFeature(this.empresa, feature_id)
        },
        async refreshEmpresa() {
            this.setLoading(true, 'Actualizando empresa...')
            const res = await post(`${urls.signin}/refresh-empresa`)
            this.setLoading(false)

            if (res.code != 0) return

            this.empresa = res.data
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

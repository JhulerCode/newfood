<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Pedidos</strong>

            <ul class="tipos">
                <li :class="{ 'tipo-activo': vista.venta_canal == 1 }" @click="selTipoPedido(1)">
                    Mesas
                    <div class="pendientes">
                        {{ vista.mesaPendientes }}
                    </div>
                </li>
                <li :class="{ 'tipo-activo': vista.venta_canal == 2 }" @click="selTipoPedido(2)">
                    Para llevar
                    <div class="pendientes">
                        {{ vista.llevarPendientes }}
                    </div>
                </li>
                <li :class="{ 'tipo-activo': vista.venta_canal == 3 }" @click="selTipoPedido(3)">
                    Delivery
                    <div class="pendientes">
                        {{ vista.deliveryPendientes }}
                    </div>
                </li>
            </ul>

            <div class="buttons">
                <JdButton
                    text="Nuevo"
                    backColor="primary-color"
                    color="text-color3"
                    @click="nuevo()"
                    style="margin-right: 1rem"
                    v-if="useAuth.verifyPermiso('vPedidos:crear') && vista.venta_canal != 1"
                />
            </div>
        </div>

        <template v-if="vista.venta_canal == 1">
            <div class="salones-head">
                <ul class="container-salones">
                    <li
                        v-for="(a, i) in vista.salones || []"
                        :key="i"
                        class="salon"
                        :class="{ 'salon-selected': vista.salon == a.id }"
                        @click="vista.salon = a.id"
                    >
                        <span>{{ a.nombre }}</span>
                    </li>
                </ul>

                <div class="salones-actions">
                    <JdButton
                        icon="fa-solid fa-arrows-to-dot"
                        text="Unir mesas"
                        tipo="2"
                        @click="openUnirMesas()"
                        v-if="useAuth.verifyPermiso('vPedidos:unirMesas')"
                    />

                    <JdButton
                        icon="fa-solid fa-rotate-right"
                        text="Recargar"
                        tipo="2"
                        @click="loadPedidos()"
                        v-if="useAuth.verifyPermiso('vPedidos:listar')"
                    />
                </div>
            </div>

            <ul class="container-mesas">
                <li
                    v-for="(a, i) in mesasFiltered || []"
                    :key="i"
                    class="mesa"
                    :class="{ 'mesa-ocupada': a.pedido }"
                    @click="abrirComandaMesa(a)"
                >
                    <p class="mesa-nombre">
                        {{ a.nombre }}
                    </p>

                    <p v-if="a.unidos && a.unidos.length > 0">
                        <span v-for="(c, k) in a.unidos || []" :key="k">
                            {{ c.nombre }}
                        </span>
                    </p>

                    <p class="mesa-pedido-tiempo" v-if="a.pedido">
                        <i class="fa-regular fa-clock"></i>
                        {{ a.pedido.timeAgo }}
                    </p>

                    <div class="mesa-actions">
                        <!-- {{ a }} -->
                        <JdButton
                            icon="fa-solid fa-ellipsis"
                            title="Acciones"
                            tipo="2"
                            :id="'button-options-' + a.id"
                            @click.stop="toogleRowOptions({ ...a, i })"
                            v-if="a.pedido"
                        />

                        <JdButton
                            icon="fa-solid fa-unlink"
                            title="Desunir mesas"
                            tipo="2"
                            @click.stop="desunirMesas(a)"
                            v-if="a.unidos && a.unidos.length > 0"
                        />
                    </div>
                </li>
            </ul>
        </template>

        <template v-if="vista.venta_canal != 1">
            <JdTable
                :name="tableName"
                :columns="columns"
                :datos="pedidosFiltered || []"
                :colNro="true"
                :colAct="true"
                :reload="loadPedidos"
                :rowOptions="tableRowOptions"
                @rowOptionSelected="runMethod"
            >
            </JdTable>
        </template>
    </div>

    <mMesasUnir v-if="useModals.show.mMesasUnir" />
    <mCambiarMesa v-if="useModals.show.mCambiarMesa" />
    <mPedidoComprobantes v-if="useModals.show.mPedidoComprobantes" />
    <mPedidoDetalles v-if="useModals.show.mPedidoDetalles" />

    <mAnular v-if="useModals.show.mAnular" @anulado="anulado" />

    <transition name="fade">
        <ul
            class="row-options-case scroll-tiny"
            v-if="optionsCaseItem.i >= 0"
            @click.stop
            :id="'options-case-' + this.tableName"
        >
            <template v-for="(b, i) in tableRowOptions" :key="i">
                <!-- {{ optionsCaseItem.pedido }} -->
                <li @click="selectOption(b)" v-if="verifyPermiso(optionsCaseItem.pedido, b)">
                    <i :class="b.icon"></i>
                    <span>{{ b.label }}</span>
                </li>
            </template>
        </ul>
    </transition>
</template>

<script>
import { JdTable, JdButton, mAnular } from '@jhuler/components'

import mMesasUnir from '@/views/ventas/pedidos/mMesasUnir.vue'
import mCambiarMesa from '@/views/ventas/pedidos/mCambiarMesa.vue'
import mPedidoComprobantes from '@/views/ventas/pedidos/mPedidoComprobantes.vue'
import mPedidoDetalles from '@/views/ventas/pedidos/mPedidoDetalles.vue'

import { useModals } from '@/pinia/modals'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'

import { urls, get, patch, post, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

import dayjs from 'dayjs'

export default {
    components: {
        JdButton,
        JdTable,
        mMesasUnir,
        mCambiarMesa,
        mPedidoComprobantes,
        mAnular,
        mPedidoDetalles,
    },
    data: () => ({
        useModals: useModals(),
        useAuth: useAuth(),
        useVistas: useVistas(),
        dayjs,

        vista: {},

        optionsShow: false,
        optionsLista: [],

        tableName: 'vPedidos',
        columns: [
            {
                id: 'venta_codigo',
                title: 'Nro pedido',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'venta_socio_datos',
                title: 'Cliente',
                prop: 'venta_socio_datos.nombres',
                width: '15rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'timeAgo',
                title: 'Tiempo transcurrido',
                width: '12rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'createdBy',
                title: 'Vendedor',
                prop: 'createdBy1.nombres_apellidos',
                width: '15rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'monto',
                title: 'Importe',
                toRight: true,
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'venta_facturado',
                title: 'Facturado?',
                prop: 'venta_facturado1.nombre',
                format: 'yesno',
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'venta_entregado',
                title: 'Entregado?',
                prop: 'venta_entregado1.nombre',
                format: 'yesno',
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
            // {
            //     id: 'pagado',
            //     title: 'Pagado?',
            //     prop: 'pagado1.nombre',
            //     format: 'yesno',
            //     width: '6rem',
            //     show: true,
            //     seek: true,
            //     sort: true,
            // },
            {
                id: 'estado',
                title: 'Estado',
                prop: 'estado1.nombre',
                format: 'estado',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
        tableRowOptions: [
            // {
            //     label: 'Editar',
            //     icon: 'fa-solid fa-pen-to-square',
            //     action: 'editar',
            //     permiso: 'vPedidos:editar',
            //     ocultar: { estado: 0, comprobantes_monto: { op: '>', val: 0 } },
            // },
            {
                label: 'Ver',
                icon: 'fa-regular fa-folder-open',
                action: 'ver',
                permiso: 'vPedidos:ver',
            },
            {
                label: 'Añadir productos',
                icon: 'fa-solid fa-plus',
                action: 'addProductos',
                permiso: 'vPedidos:addProductos',
                ocultar: { estado: 0, venta_facturado: true },
            },
            {
                label: 'Editar detalles',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editarDetalles',
                permiso: 'vPedidos:editarDetalles',
                ocultar: { estado: 0, venta_facturado: true, venta_canal: 1 },
            },
            {
                label: 'Anular',
                icon: 'fa-solid fa-ban',
                action: 'anular',
                permiso: 'vPedidos:anular',
                ocultar: { estado: 0, comprobantes_monto: { op: '>', val: 0 } },
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash-can',
                action: 'eliminar',
                permiso: 'vPedidos:eliminar',
            },
            {
                label: 'Reimprimir pedido',
                icon: 'fa-solid fa-print',
                action: 'imprimirComanda',
                permiso: 'vPedidos:imprimirComanda',
            },
            {
                label: 'Imprimir precuenta',
                icon: 'fa-solid fa-print',
                action: 'imprimirPrecuenta',
                permiso: 'vPedidos:imprimirPrecuenta',
                ocultar: { estado: 0, venta_facturado: true },
            },
            {
                label: 'Generar comprobante',
                icon: 'fa-solid fa-file-invoice',
                action: 'generarComprobante',
                permiso: 'vPedidos:generarComprobante',
                ocultar: { estado: 0, venta_facturado: true },
            },
            {
                label: 'Ver comprobantes',
                icon: 'fa-solid fa-up-right-from-square',
                action: 'verComprobantes',
                permiso: 'vPedidos:verComprobantes',
                ocultar: { estado: 0 },
            },
            {
                label: 'Confirmar entrega',
                icon: 'fa-solid fa-flag-checkered',
                action: 'entregar',
                permiso: 'vPedidos:entregar',
                ocultar: {
                    estado: 0,
                    venta_canal: 1,
                    venta_facturado: false,
                    venta_entregado: true,
                },
            },
            {
                label: 'Cambiar mesa',
                icon: 'fa-solid fa-arrows-up-down-left-right',
                action: 'openCambiarMesa',
                permiso: 'vPedidos:cambiarMesa',
                ocultar: { estado: 0, venta_canal: ['2', '3'] },
            },
        ],
        optionsCaseItem: {},
    }),
    computed: {
        mesasFiltered() {
            if (this.vista.salon == null) return []
            const salon = this.vista.salones.find((a) => a.id == this.vista.salon)
            return salon.mesas
                .filter((a) => a.unida == false)
                .sort((a, b) => a.nombre.localeCompare(b.nombre))
        },
        pedidosFiltered() {
            return this.vista.pedidos.filter(
                (a) => a.venta_canal == this.vista.venta_canal && a.estado == 1,
            )
        },
    },
    async created() {
        this.vista = this.useVistas.vPedidos
        this.vista.setIntervalTimeAgo = this.setIntervalTimeAgo
        this.vista.setMesasPedidos = this.setMesasPedidos
        this.vista.calculatePendientes = this.calculatePendientes
        this.vista.loadSalones = this.loadSalones

        if (this.vista.loaded) return

        this.vista.mesaPendientes = 0
        this.vista.llevarPendientes = 0
        this.vista.deliveryPendientes = 0
        this.vista.venta_canal = 1

        if (this.useAuth.verifyPermiso('vPedidos:listar') == true) this.loadSalones()
    },
    beforeUnmount() {
        clearInterval(this.vista.intervalAgo)
    },
    methods: {
        initFiltros() {
            this.columns[0].op = 'Es'
            this.columns[0].val = dayjs().format('YYYY-MM-DD')
        },
        setQuery() {
            this.vista.qry = {
                fltr: {
                    tipo: { op: 'Es', val: 2 },
                    estado: { op: 'Es', val: '1' },
                    // venta_canal: {
                    //     op: 'Es',
                    //     val: this.vista.venta_canal.toString(),
                    // },
                },
                cols: [],
                incl: ['createdBy1'],
                sqls: ['comprobantes_monto', 'pagos_monto'],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
            this.vista.qry.cols.push(
                'createdAt',
                'venta_entregado',
                'venta_canal',

                'socio',
                'observacion',
                'tipo',
                'venta_pago_metodo',
                'venta_pago_con',
            )

            if (this.vista.venta_canal == 1) {
                this.vista.qry.cols.push('venta_mesa')
                this.vista.qry.incl.push('venta_mesa1')
            }
        },
        async loadPedidos() {
            this.setQuery()

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.loading = { show: false }
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.pedidos = res.data

            this.setIntervalTimeAgo()
            this.calculatePendientes()
        },
        setQuerySalones() {
            this.vista.qry1 = {
                fltr: {
                    activo: { op: 'Es', val: true },
                },
                cols: ['nombre'],
                incl: ['mesas'],
            }
        },
        async loadSalones() {
            this.setQuerySalones()

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.salones}?qry=${JSON.stringify(this.vista.qry1)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.salones = res.data
            this.vista.salon = this.vista.salones[0].id

            await this.loadPedidos()
            this.setMesasPedidos()
        },
        setMesasPedidos() {
            if (!this.pedidosFiltered.length) {
                for (const salon of this.vista.salones) {
                    for (const mesa of salon.mesas) {
                        mesa.pedido = null
                    }
                }
                return
            }

            // Crear un mapa (idMesa -> pedido)
            const pedidosMesaMap = Object.fromEntries(
                this.pedidosFiltered.map((p) => [p.venta_mesa, p]),
            )

            // Asignar el pedido correspondiente o null
            for (const salon of this.vista.salones) {
                for (const mesa of salon.mesas) {
                    mesa.pedido = pedidosMesaMap[mesa.id] || null
                }
            }
        },

        setIntervalTimeAgo() {
            this.setTimeAgo()
            clearInterval(this.vista.intervalAgo)

            this.vista.intervalAgo = setInterval(() => {
                console.log(1)
                this.setTimeAgo()
            }, 1000)
        },
        setTimeAgo() {
            if (this.vista.venta_canal == 1) {
                for (const a of this.vista.salones) {
                    for (const b of a.mesas) {
                        if (b.pedido)
                            b.pedido.timeAgo = this.calculateTimeDifference(b.pedido.createdAt)
                    }
                }
            } else {
                for (const a of this.vista.pedidos) {
                    a.timeAgo = this.calculateTimeDifference(a.createdAt)
                }
            }
        },
        calculateTimeDifference(targetDate) {
            const now = dayjs()
            const target = dayjs(targetDate)

            const diffInSeconds = now.diff(target, 'second')
            if (diffInSeconds == 1) {
                return `hace ${diffInSeconds} segundo`
            }
            if (diffInSeconds < 60) {
                return `hace ${diffInSeconds} segundos`
            }

            const diffInMinutes = now.diff(target, 'minute')
            if (diffInMinutes == 1) {
                return `hace ${diffInMinutes} minuto`
            }
            if (diffInMinutes < 60) {
                return `hace ${diffInMinutes} minutos`
            }

            const diffInHours = now.diff(target, 'hour')
            if (diffInHours == 1) {
                return `hace ${diffInHours} hora`
            }
            return `hace ${diffInHours} horas`
        },
        calculatePendientes() {
            const conteoPorTipo = this.vista.pedidos
                .filter((a) => a.estado == 1)
                .reduce((acc, item) => {
                    acc[item.venta_canal] = (acc[item.venta_canal] || 0) + 1
                    return acc
                }, {})

            console.log(conteoPorTipo)
            this.vista.mesaPendientes = conteoPorTipo[1] || 0
            this.vista.llevarPendientes = conteoPorTipo[2] || 0
            this.vista.deliveryPendientes = conteoPorTipo[3] || 0
        },

        selTipoPedido(key) {
            this.vista.venta_canal = key
        },

        nuevo(datosMesa) {
            let send = {
                tipo: 2,
                venta_canal: this.vista.venta_canal,
                socio: `${this.useAuth.usuario.empresa.subdominio}-CLIENTES-VARIOS`,
                venta_socio_datos: {
                    doc_tipo: '0',
                    doc_numero: '00000000',
                    doc_nombres: '00000000 - CLIENTES VARIOS',
                    nombres: 'CLIENTES VARIOS',
                },
                pago_condicion: 1,
                estado: 1,
                venta_entregado: false,
                transaccion_items: [],
            }

            if (this.vista.venta_canal == 1) {
                send = { ...send, ...datosMesa }
            }

            this.useVistas.showVista('vComanda', 'Nuevo pedido')
            const vistaComanda = this.useVistas.vComanda
            vistaComanda.mode = 1
            vistaComanda.pedido = send
            vistaComanda.socios = [{ id: send.socio, ...send.venta_socio_datos }]
        },

        runMethod(method, item, item2) {
            this[method](item, item2)
        },
        async ver(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const send = {
                pedido: { ...res.data },
                socios: [
                    {
                        id: item.socio,
                        ...item.venta_socio_datos,
                    },
                ],
                pago_metodos: [
                    {
                        id: res.data.venta_pago_metodo,
                        ...res.data.venta_pago_metodo1,
                    },
                ],
            }

            this.useModals.setModal(
                'mPedidoDetalles',
                `Pedido N° ${item.venta_codigo}`,
                3,
                send,
                true,
            )
        },
        addProductos(item) {
            this.useVistas.showVista('vComanda', 'Editar pedido')
            const vistaComanda = this.useVistas.vComanda
            vistaComanda.mode = 2
            vistaComanda.pedido = { ...item, transaccion_items: [] }
        },
        editarDetalles(item) {
            const send = {
                pedido: {
                    id: item.id,
                    socio: item.socio,
                    venta_canal: item.venta_canal,
                    venta_socio_datos: item.venta_socio_datos,
                    repartidor: item.repartidor,
                    venta_pago_metodo: item.venta_pago_metodo,
                    venta_pago_con: item.venta_pago_con,
                    observacion: item.observacion,
                },
                socios: [
                    {
                        id: item.socio,
                        ...item.venta_socio_datos,
                    },
                ],
            }

            this.useModals.setModal('mPedidoDetalles', 'Editar detalles', 2, send, true)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.transacciones, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useAuth.socket.emit('vPedidos:eliminar', {
                empresa: this.useAuth.usuario.empresa.id,
                data: item,
            })
        },
        anular(item) {
            const send = {
                url: 'transacciones',
                vista: 'vPedidos',
                array: 'pedidos',
                item,
            }

            this.useModals.setModal(
                'mAnular',
                `Anular pedido N° ${item.venta_codigo}`,
                null,
                send,
                true,
            )
        },
        async anulado(item) {
            this.useAuth.socket.emit('vPedidos:anular', {
                empresa: this.useAuth.usuario.empresa.id,
                data: item,
            })
        },
        async imprimirComanda(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            let venta_canal = ''

            if (res.data.venta_canal == 1) {
                venta_canal = `${res.data.venta_mesa1.salon1.nombre} - ${res.data.venta_mesa1.nombre}`
            } else if (res.data.venta_canal == 2) {
                venta_canal = 'PARA LLEVAR'
            } else if (res.data.venta_canal == 3) {
                venta_canal = 'DELIVERY'
            }

            const send = {
                fecha: res.data.fecha,
                venta_canal,
                venta_codigo: res.data.venta_codigo,
                is_reprint: true,
                productos: res.data.transaccion_items,
            }

            const uriEncoded = `http://${this.useAuth.usuario.empresa.pc_principal_ip}/imprimir/comanda.php?data=${encodeURIComponent(JSON.stringify(send))}`
            console.log(uriEncoded)
            const nuevaVentana = window.open(
                uriEncoded,
                '_blank',
                'width=1,height=1,top=0,left=0,scrollbars=no,toolbar=no,location=no,status=no,menubar=no',
            )

            setTimeout(() => {
                nuevaVentana.close()
            }, 500)
        },
        async imprimirPrecuenta(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            let atencion = ''

            if (res.data.venta_canal == 1) {
                atencion = `${res.data.venta_mesa1.salon1.nombre} - ${res.data.venta_mesa1.nombre}`
            } else if (res.data.venta_canal == 2) {
                atencion = 'PARA LLEVAR'
            } else if (res.data.venta_canal == 3) {
                atencion = 'DELIVERY'
            }

            const send = {
                empresa_datos: this.useAuth.usuario.empresa,
                fecha: res.data.fecha,
                venta_canal: res.data.venta_canal,
                atencion,
                venta_codigo: res.data.venta_codigo,
                is_reprint: true,
                productos: res.data.transaccion_items,
                venta_socio_datos: res.data.venta_socio_datos,
                venta_pago_metodo1: res.data.venta_pago_metodo1,
                venta_pago_con: res.data.venta_pago_con,
                impresora: {
                    tipo: this.useAuth.usuario.impresora_caja.impresora_tipo,
                    nombre: this.useAuth.usuario.impresora_caja.impresora,
                },
            }

            const uriEncoded = `http://${this.useAuth.usuario.empresa.pc_principal_ip}/imprimir/precuenta.php?data=${encodeURIComponent(JSON.stringify(send))}`
            console.log(uriEncoded)
            const nuevaVentana = window.open(
                uriEncoded,
                '_blank',
                'width=1,height=1,top=0,left=0,scrollbars=no,toolbar=no,location=no,status=no,menubar=no',
            )

            setTimeout(() => {
                nuevaVentana.close()
            }, 500)
        },
        async generarComprobante(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.showVista('vEmitirComprobante', 'Emitir comprobante')
            const vistaEmitirComprobante = this.useVistas.vEmitirComprobante

            const comprobante_items = res.data.transaccion_items
                .filter((a) => a.cantidad > a.venta_entregado)
                .map((a) => ({
                    id1: a.id,
                    articulo: a.articulo,
                    has_receta: a.has_receta,
                    receta_insumos: a.receta_insumos,
                    is_combo: a.is_combo,
                    combo_articulos: a.combo_articulos,
                    venta_entregado: a.venta_entregado,
                    cantidadMax: a.cantidad - a.venta_entregado,

                    nombre: a.articulo1.nombre,
                    unidad: a.articulo1.unidad,
                    cantidad: a.cantidad - a.venta_entregado,
                    pu: a.pu,
                    igv_afectacion: a.igv_afectacion,
                    igv_porcentaje: a.igv_porcentaje,
                }))

            vistaEmitirComprobante.comprobante = {
                socio: res.data.socio,
                pago_condicion: res.data.pago_condicion,
                estado: 1,
                fecha_emision: dayjs().format('YYYY-MM-DD'),

                comprobante_items,

                transaccion: res.data.id,
                transaccion1: {
                    id: res.data.id,
                    venta_codigo: res.data.venta_codigo,
                    venta_canal: res.data.venta_canal,
                    venta_mesa1: res.data.venta_mesa1,
                },
            }

            vistaEmitirComprobante.socio = { id: res.data.socio, ...res.data.venta_socio_datos }
            vistaEmitirComprobante.socios = [vistaEmitirComprobante.socio]
        },
        async verComprobantes(item) {
            const send = {
                transaccion: item,
                comprobantes: [],
            }

            this.useModals.setModal(
                'mPedidoComprobantes',
                `Comprobantes - Pedido N° ${item.venta_codigo}`,
                null,
                send,
                true,
            )
        },
        async entregar(item) {
            const resQst = await jqst('¿Está seguro de entregar el pedido?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await patch(
                `${urls.transacciones}/entregar`,
                item,
                'Pedido entregado con éxito',
            )
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useAuth.socket.emit('vPedidos:entregar', {
                empresa: this.useAuth.usuario.empresa.id,
                data: res.data,
            })
        },

        async abrirComandaMesa(mesa) {
            if (mesa.pedido) {
                // this.editar(mesa.pedido)
            } else {
                const salon_find = this.vista.salones.find((a) =>
                    a.mesas.some((b) => b.id === mesa.id),
                )
                const salon1 = { id: salon_find.id, nombre: salon_find.nombre }

                this.nuevo({
                    venta_mesa: mesa.id,
                    venta_mesa1: { nombre: mesa.nombre, salon1 },
                })
            }
        },
        openCambiarMesa(item) {
            const send = {
                pedido: item,
                salones: this.vista.salones,
            }

            this.useModals.setModal('mCambiarMesa', `Cambiar de mesa`, null, send, true)
        },
        openUnirMesas() {
            this.useModals.setModal('mMesasUnir', 'Unir mesas', true)
        },
        async desunirMesas(item) {
            const resQst = await jqst('¿Está seguro de dividir las mesas agrupadas?')
            if (resQst.isConfirmed == false) return

            const send = {
                id: item.id,
                unidos: item.unidos,
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await post(`${urls.mesas}/desunir`, send, 'Mesas divididas con éxito')
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useAuth.socket.emit('mMesasUnir:unir', {
                empresa: this.useAuth.usuario.empresa.id,
            })
        },

        // --- OPTIONS DEL GRID DE MESAS --- //
        toogleRowOptions(item) {
            const previousItem = this.optionsCaseItem
            this.hide()
            if (previousItem.i == item.i) return

            this.optionsCaseItem = item
            const screenWidth = window.innerWidth
            const screenHeight = window.innerHeight

            this.$nextTick(() => {
                const el = document.getElementById('options-case-' + this.tableName)

                setTimeout(() => {
                    const rect = document
                        .getElementById(`button-options-${item.id}`)
                        .getBoundingClientRect()
                    const rect2 = el.getBoundingClientRect()

                    if (screenWidth < rect.left + rect2.width) {
                        el.style.right = `${screenWidth - rect.right + window.scrollX}px`
                    } else {
                        el.style.left = `${rect.left + window.scrollX}px`
                    }

                    if (screenHeight < rect.bottom + rect2.height) {
                        el.style.bottom = `${screenHeight - rect.top + window.scrollY + 5}px`
                    } else {
                        el.style.top = `${rect.bottom + window.scrollY + 5}px`
                    }

                    document.body.addEventListener('click', this.closeOnOutside)
                }, 0)
            })
        },
        closeOnOutside(event) {
            const el = document.getElementById('options-case-' + this.tableName)

            if (el && !el.contains(event.target)) {
                this.hide()
            }
        },
        hide() {
            this.optionsCaseItem = {}
            document.body.removeEventListener('click', this.closeOnOutside)
        },
        selectOption(a) {
            this.runMethod(a.action, this.optionsCaseItem.pedido, this.optionsCaseItem)
            this.hide()
        },
        verifyPermiso(a, b) {
            // Si existe 'ocultar', evaluar condiciones para ocultar
            if (b.ocultar) {
                for (const prop in b.ocultar) {
                    const condicion = b.ocultar[prop]
                    const valorFila = a[prop]

                    if (valorFila === undefined) continue

                    // Caso 1: array
                    if (Array.isArray(condicion)) {
                        if (condicion.includes(valorFila)) return false // se oculta
                    }
                    // Caso 2: objeto con operador
                    else if (typeof condicion === 'object' && condicion.op && 'val' in condicion) {
                        if (this.comparar(valorFila, condicion.op, condicion.val)) return false
                    }
                    // Caso 3: valor simple
                    else {
                        if (condicion == valorFila) return false // se oculta
                    }
                }
            }

            // Si no hay permiso definido, solo dependerá de 'ocultar'
            if (!b.permiso) return true

            // Evaluar permiso si existe
            return this.useAuth.verifyPermiso(b.permiso)
        },
        comparar(a, op, b) {
            switch (op) {
                case '>':
                    return a > b
                case '<':
                    return a < b
                case '>=':
                    return a >= b
                case '<=':
                    return a <= b
                case '==':
                    return a == b
                case '!=':
                    return a != b
                default:
                    return false
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.tipos {
    display: flex;
    flex-wrap: wrap;

    li {
        border: var(--border);
        padding: 0.3rem 1rem;
        border-radius: 0.3rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .pendientes {
            border-radius: 50%;
            background-color: var(--primary-color);
            color: white;
            width: 1.2rem;
            height: 1.2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
        }
    }

    .tipo-activo {
        background-color: var(--bg-color2);
        // color: white;
    }
}

.salones-head {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 1rem;
}

.salones-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.container-salones {
    display: flex;
    flex-wrap: wrap;

    .salon {
        align-items: center;
        gap: 0.5rem;
        border: var(--border);
        border-radius: 0.3rem;
        padding: 0.3rem 0.5rem;
        cursor: pointer;

        span {
            font-size: 1.2rem;
        }
    }

    .salon-selected {
        background-color: var(--bg-color2);
    }
}

.container-mesas {
    max-height: 100%;
    overflow-y: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin: 1rem 0 0 0;
    // align-items: flex-start;

    .mesa {
        width: 13rem;
        height: 9rem;
        border-radius: 0.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        background-color: var(--verde);
        cursor: pointer;
        padding: 0.5rem;

        .mesa-nombre {
            font-size: 1.2rem;
            color: white;
        }

        .mesa-pedido-tiempo {
            color: white;

            * {
                color: white;
            }
        }

        .mesa-actions {
            display: flex;
            gap: 0.5rem;
        }
    }

    .mesa-ocupada {
        background-color: var(--rojo);
    }
}

.row-options-case {
    position: absolute;
    user-select: none;
    max-height: 15rem;
    overflow-y: auto;
    background-color: var(--bg-color);
    z-index: 2;
    box-shadow: 0 0 0.5rem 0.1rem var(--shadow-color);
    border-radius: 0.3rem;

    li {
        cursor: pointer;
        padding: 0.5rem 0.8rem;
        display: grid;
        grid-template-columns: 1.5rem 1fr;

        &:hover {
            background-color: var(--bg-color-hover);
        }

        span {
            text-wrap: nowrap;
        }
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.1s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@media (max-width: 540px) {
    .container-mesas {
        gap: 1rem;

        .mesa {
            width: 11rem;
        }
    }
}
</style>

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

            <JdButton
                text="Nuevo"
                backColor="primary-color"
                color="text-color3"
                @click="nuevo()"
                v-if="useAuth.verifyPermiso('vPedidos:crear')"
                style="margin-right: 1rem"
            />
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

                <JdButton
                    icon="fa-solid fa-arrows-to-dot"
                    text="Unir mesas"
                    tipo="2"
                    @click="openUnirMesas()"
                    v-if="useAuth.verifyPermiso('vPedidos:unirMesas')"
                />
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
                :datos="vista.pedidos || []"
                :colNro="true"
                :colAct="true"
                :reload="loadPedidos"
                :rowOptions="tableRowOptions"
                @rowOptionSelected="runMethod"
            >
                <!-- <template v-slot:colMoreInfo="{ item }">
                </template> -->
            </JdTable>
        </template>
    </div>

    <mMesasUnir v-if="useModals.show.mMesasUnir" @mesasUnidas="loadSalones" />
    <mCambiarMesa v-if="useModals.show.mCambiarMesa" @mesaCambiada="loadSalones" />
    <mPedidoComprobantes v-if="useModals.show.mPedidoComprobantes" />
    <!--<mPagarCuenta v-if="useModals.show.mPagarCuenta" /> -->

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
import JdButton from '@/components/inputs/JdButton.vue'
import JdTable from '@/components/JdTable.vue'
import mAnular from '@/components/mAnular.vue'

import mMesasUnir from '@/views/ventas/pedidos/mMesasUnir.vue'
import mCambiarMesa from '@/views/ventas/pedidos/mCambiarMesa.vue'
import mPedidoComprobantes from '@/views/ventas/pedidos/mPedidoComprobantes.vue'
// import mPagarCuenta from '@/views/u/ventas/clientePedidos/mPagarCuenta.vue'

import { useModals } from '@/pinia/modals'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'

import { urls, get, patch, post } from '@/utils/crud'
import { getItemFromArray, redondear } from '@/utils/mine'
import { jqst } from '@/utils/swal'
// import { socio_pedidos_estados } from '@/data/procesos_estados'

import dayjs from 'dayjs'

export default {
    components: {
        JdButton,
        JdTable,
        mMesasUnir,
        mCambiarMesa,
        mPedidoComprobantes,
        // mPagarCuenta,
        mAnular,
    },
    data: () => ({
        useModals: useModals(),
        useAuth: useAuth(),
        useVistas: useVistas(),
        getItemFromArray,
        // socio_pedidos_estados,
        redondear,
        dayjs,

        vista: {},
        // vista.intervalAgo: null,

        optionsShow: false,
        optionsLista: [],

        tableName: 'vPedidos',
        columns: [
            {
                id: 'venta_codigo',
                title: 'Nro comanda',
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
            {
                label: 'Editar',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editar',
                permiso: 'vPedidos:editar',
                ocultar: { estado: 0, comprobantes_monto: { op: '>', val: 0 } },
            },
            {
                label: 'Anular',
                icon: 'fa-solid fa-ban',
                action: 'anular',
                permiso: 'vPedidos:anular',
                ocultar: { estado: 0, comprobantes_monto: { op: '>', val: 0 } },
            },
            {
                label: 'Imprimir comanda',
                icon: 'fa-solid fa-print',
                action: 'imprimir',
                permiso: 'vPedidos:imprimirComanda',
            },
            {
                label: 'Imprimir precuenta',
                icon: 'fa-solid fa-print',
                action: 'imprimir',
                permiso: 'vPedidos:imprimirPrecuenta',
                ocultar: { estado: 0 },
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
                ocultar: { estado: 0, venta_canal: 1, venta_facturado: false, venta_entregado: true },
            },
            {
                label: 'Cambiar mesa',
                icon: 'fa-solid fa-arrows-up-down-left-right',
                action: 'openCambiarMesa',
                permiso: 'vPedidos:cambiarMesa',
                ocultar: { estado: 0, venta_canal: ['2', '3'] },
            },
        ],

        // tableRowOptions1: [
        //     {
        //         label: 'Editar',
        //         icon: 'fa-solid fa-pen-to-square',
        //         action: 'editar',
        //         permiso: 'vPedidos:editar',
        //         ocultar: { estado: 0, comprobantes_monto: { op: '>', val: 0 } },
        //     },
        //     {
        //         label: 'Anular',
        //         icon: 'fa-solid fa-ban',
        //         action: 'anular',
        //         permiso: 'vPedidos:anular',
        //         ocultar: { estado: 0, comprobantes_monto: { op: '>', val: 0 } },
        //     },
        //     {
        //         label: 'Imprimir comanda',
        //         icon: 'fa-solid fa-print',
        //         action: 'imprimir',
        //         permiso: 'vPedidos:imprimirComanda',
        //     },
        //     {
        //         label: 'Imprimir precuenta',
        //         icon: 'fa-solid fa-print',
        //         action: 'imprimir',
        //         permiso: 'vPedidos:imprimirPrecuenta',
        //         ocultar: { estado: 0 },
        //     },
        //     {
        //         label: 'Generar comprobante',
        //         icon: 'fa-solid fa-file-invoice',
        //         action: 'generarComprobante',
        //         permiso: 'vPedidos:generarComprobante',
        //         ocultar: { estado: 0, venta_facturado: true },
        //     },
        //     {
        //         label: 'Ver comprobantes',
        //         icon: 'fa-solid fa-up-right-from-square',
        //         action: 'verComprobantes',
        //         permiso: 'vPedidos:verComprobantes',
        //         ocultar: { estado: 0 },
        //     },
        //     {
        //         label: 'Cambiar mesa',
        //         icon: 'fa-solid fa-arrows-up-down-left-right',
        //         action: 'openCambiarMesa',
        //         permiso: 'vPedidos:cambiarMesa',
        //         ocultar: { estado: 0 },
        //     },
        // ],

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
    },
    async created() {
        this.vista = this.useVistas.vPedidos

        // this.loadPendientesCantidad()

        if (this.vista.loaded) {
            if (this.vista.reload) {
                // ESTO LO MANDA ACTUALIZAR COMANDA
                if (this.vista.venta_canal == 1) {
                    this.loadSalones()
                } else {
                    this.loadPedidos()
                }
            }
        } else {
            this.vista.mesaPendientes = 0
            this.vista.llevarPendientes = 0
            this.vista.deliveryPendientes = 0
            this.vista.venta_canal = 1

            this.loadSalones()
        }
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
                    venta_canal: {
                        op: 'Es',
                        val: this.vista.venta_canal.toString(),
                    },
                },
                cols: [],
                incl: ['createdBy1'],
                sqls: ['comprobantes_monto', 'pagos_monto'],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
            this.vista.qry.cols.push('createdAt', 'venta_entregado', 'venta_canal')

            if (this.vista.venta_canal == 1) {
                this.vista.qry.fltr.estado = { op: 'Es', val: '1' }
                this.vista.qry.fltr.venta_entregado = { op: 'Es', val: false }
                this.vista.qry.cols.push('venta_mesa')
                this.vista.qry.incl.push('venta_mesa1')
                // } else {
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

            if (this.vista.venta_canal != 1) this.setIntervalTimeAgo()
            this.loadPendientesCantidad()
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
            this.setIntervalTimeAgo()
        },
        setMesasPedidos() {
            if (this.vista.pedidos.length == 0) return

            const pedidosMesaMap = this.vista.pedidos.reduce(
                (obj, a) => ((obj[a.venta_mesa] = a), obj),
                {},
            )

            for (const a of this.vista.salones) {
                for (const b of a.mesas) {
                    if (pedidosMesaMap[b.id]) {
                        b.pedido = pedidosMesaMap[b.id]
                    }
                }
            }
        },

        setIntervalTimeAgo() {
            this.setTimeAgo()
            clearInterval(this.vista.intervalAgo)

            this.vista.intervalAgo = setInterval(() => {
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

        selTipoPedido(key) {
            this.vista.venta_canal = key

            this.vista.salon = null
            this.vista.salones = []
            this.vista.pedidos = []

            if (key == 1) {
                this.loadSalones()
            } else {
                this.loadPedidos()
            }
        },

        async loadPendientesCantidad() {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}/ventas-pendientes`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.mesaPendientes = res.data.find((a) => a.venta_canal == 1)?.cantidad || 0
            this.vista.llevarPendientes = res.data.find((a) => a.venta_canal == 2)?.cantidad || 0
            this.vista.deliveryPendientes = res.data.find((a) => a.venta_canal == 3)?.cantidad || 0
        },

        nuevo(datosMesa) {
            let send = {
                tipo: 2,
                venta_canal: this.vista.venta_canal,
                socio: 1,
                venta_socio_datos: {
                    doc_tipo: '1',
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
        async editar(item, mesa) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            let salon1
            if (mesa) {
                const salon_find = this.vista.salones.find((a) =>
                    a.mesas.some((b) => b.id === mesa.id),
                )
                salon1 = { id: salon_find.id, nombre: salon_find.nombre }
            }

            this.useVistas.showVista('vComanda', 'Editar comanda')
            const vistaComanda = this.useVistas.vComanda
            vistaComanda.mode = 2
            vistaComanda.pedido = res.data
            vistaComanda.pedido.salon1 = salon1
            vistaComanda.socios = [
                {
                    id: res.data.socio,
                    ...res.data.venta_socio_datos,
                },
            ]
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
            if (this.vista.venta_canal == 1) {
                const salon = this.vista.salones.find((a) => a.id == this.vista.salon)
                const mesa = salon.mesas.find((a) => a.id == item.venta_mesa)
                mesa.pedido = null
            }

            if (item.venta_canal == 1) {
                this.vista.mesaPendientes--
            } else if (item.venta_canal == 2) {
                this.vista.llevarPendientes--
            } else if (item.venta_canal == 3) {
                this.vista.deliveryPendientes--
            }
        },
        imprimir(item) {
            console.log(item)
        },
        async generarComprobante(item, mesa) {
            // if (item.monto <= item.comprobantes_monto)
            //     return jmsg('error', 'El pedido ya fue procesado')

            // this.useAuth.setLoading(true, 'Cargando...')
            // const resCaja = await get(`${urls.cajas}?filtros=${JSON.stringify({ abierto: true })}`)
            // this.useAuth.setLoading(false)

            // if (resCaja.code != 0) return

            // if (resCaja.data.length == 0) {
            //     jmsg('warning', 'Ninguna caja aperturada')

            //     const item = {
            //         moneda: 1,
            //         monto: null,
            //         abierto: true,
            //     }

            //     this.useModals.setModal('AperturarCaja', `Aperturar caja`, true, 1, item)
            // }
            // else {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.showVista('vEmitirComprobante', 'Emitir comprobante')
            const vistaEmitirComprobante = this.useVistas.vEmitirComprobante

            let salon1
            if (mesa) {
                const salon_find = this.vista.salones.find((a) =>
                    a.mesas.some((b) => b.id === mesa.id),
                )
                salon1 = { id: salon_find.id, nombre: salon_find.nombre }
            }

            const comprobante_items = res.data.transaccion_items
                .filter((a) => a.cantidad > a.venta_entregado)
                .map((a) => ({
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
                fecha: dayjs().format('YYYY-MM-DD'),

                comprobante_items,

                transaccion: {
                    id: res.data.id,
                    venta_codigo: res.data.venta_codigo,
                    venta_canal: res.data.venta_canal,
                    venta_mesa1: res.data.venta_mesa1,
                    salon1,
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

            this.vista.pedidos.splice(item.i, 1, res.data)
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
                    venta_mesa1: { nombre: mesa.nombre },
                    salon1,
                })
            }
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

            this.loadSalones()
        },
        openCambiarMesa(item, mesa) {
            const salon_find = this.vista.salones.find((a) => a.mesas.some((b) => b.id === mesa.id))
            const salon1 = { id: salon_find.id, nombre: salon_find.nombre }

            const send = {
                pedido: item,
                salones: this.vista.salones,
                mesa1: {
                    id: mesa.id,
                    nombre: mesa.nombre,
                },
                salon1,
            }

            this.useModals.setModal('mCambiarMesa', `Cambiar de mesa`, null, send, true)
        },

        // ----- OPTIONS DEL GRID DE MESAS ----- //
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

<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Pedidos de la caja aperturada</strong>
        </div>

        <div class="card">
            <JdTable
                :name="tableName"
                :columns="columns"
                :datos="vista.transacciones || []"
                :colAct="true"
                :reload="loadPedidos"
                :rowOptions="tableRowOptions"
                @rowOptionSelected="runMethod"
            />
        </div>
    </div>

    <mPedidoDetalles v-if="useModals.show.mPedidoDetalles" />
    <mPedidoComprobantes v-if="useModals.show.mPedidoComprobantes" />
</template>

<script>
import { JdTable } from '@jhuler/components'

import mPedidoDetalles from '@/views/ventas/pedidos/mPedidoDetalles.vue'
import mPedidoComprobantes from '@/views/ventas/pedidos/mPedidoComprobantes.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get } from '@/utils/crud'

export default {
    components: {
        JdTable,
        mPedidoDetalles,
        mPedidoComprobantes,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},
        tableName: 'vCajaPedidos',
        columns: [
            {
                id: 'fecha',
                title: 'Fecha',
                format: 'date',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'venta_codigo',
                title: 'Nro pedido',
                width: '10rem',
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
                id: 'venta_canal',
                title: 'Canal',
                prop: 'venta_canal1.nombre',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'salon',
                title: 'Salón',
                prop: 'venta_mesa1.salon1.nombre',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'mesa',
                title: 'Mesa',
                prop: 'venta_mesa1.nombre',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'socio',
                title: 'Cliente',
                prop: 'socio1.nombres',
                width: '15rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'monto',
                title: 'Importe',
                format: 'currency',
                moneda: 'S/',
                width: '8rem',
                show: true,
                seek: false,
                sort: true,
            },
            {
                id: 'estado',
                title: 'Estado',
                prop: 'estado1.nombre',
                format: 'estado',
                width: '8rem',
                show: true,
                seek: false,
                sort: true,
            },
        ],
        tableRowOptions: [
            {
                label: 'Ver',
                icon: 'fa-regular fa-folder-open',
                action: 'ver',
                permiso: 'vCajaPedidos:ver',
            },
            {
                label: 'Ver comprobantes',
                icon: 'fa-solid fa-up-right-from-square',
                action: 'verComprobantes',
                permiso: 'vCajaPedidos:verComprobantes',
            },
        ],
    }),
    async created() {
        this.vista = this.useVistas.vCajaPedidos
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vCajaPedidos:listar')) {
            this.loadPedidos()
        }
    },
    methods: {
        async loadCajaApertura() {
            const qry = {
                fltr: {
                    estado: { op: 'Es', val: '1' },
                    sucursal: { op: 'Es', val: this.useAuth.sucursal.id },
                },
                cols: ['fecha_apertura', 'monto_apertura'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.caja_aperturas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return
            this.vista.caja_apertura = res.data[0] || null
        },
        setQuery() {
            this.vista.qry = {
                fltr: {
                    caja_apertura: { op: 'Es', val: this.vista.caja_apertura.id },
                    tipo: { op: 'Es', val: 2 },
                },
                incl: ['createdBy1', 'venta_mesa1', 'socio1'],
                iccl: {
                    venta_mesa1: {
                        incl: ['salon1'],
                    },
                },
                ordr: [['createdAt', 'DESC']],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
            this.vista.qry.cols.push('tipo', 'caja_apertura')
        },
        async loadPedidos() {
            await this.loadCajaApertura()
            if (!this.vista.caja_apertura) {
                this.vista.transacciones = []
                this.vista.loaded = true
                return
            }

            this.setQuery()
            this.vista.transacciones = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return
            this.vista.transacciones = res.data
        },
        runMethod(method, item) {
            this[method](item)
        },
        async loadPedido(item) {
            const qry = {
                incl: ['socio1', 'venta_mesa1', 'venta_pago_metodo1'],
                iccl: { venta_mesa1: { incl: ['salon1'] } },
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            if (res.code != 0) return false

            const itemsQry = {
                incl: ['articulo1'],
                cols: { exclude: [] },
                fltr: { transaccion: { op: 'Es', val: item.id } },
                ordr: [['createdAt', 'ASC']],
            }
            this.useAuth.setLoading(true, 'Cargando...')
            const itemsRes = await get(
                `${urls.transaccion_items}?qry=${JSON.stringify(itemsQry)}`,
            )
            this.useAuth.setLoading(false)
            if (itemsRes.code != 0) return false

            res.data.transaccion_items = itemsRes.data
            return res
        },
        async ver(item) {
            const res = await this.loadPedido(item)
            if (res == false) return

            const send = {
                pedido: { ...res.data },
                socios: [{ id: res.data.socio, ...res.data.venta_socio_datos }],
                pago_metodos: [{ ...res.data.venta_pago_metodo1 }],
                transaccion_estados: [{ ...res.data.estado1 }],
            }

            this.useModals.setModal(
                'mPedidoDetalles',
                `Pedido N° ${res.data.venta_codigo}`,
                3,
                send,
                true,
            )
        },
        verComprobantes(item) {
            const send = { transaccion: item, comprobantes: [] }
            this.useModals.setModal(
                'mPedidoComprobantes',
                `Comprobantes - Pedido N° ${item.venta_codigo}`,
                null,
                send,
                true,
            )
        },
    },
}
</script>

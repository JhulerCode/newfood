<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Pedidos</strong>

            <div class="buttons"></div>
        </div>

        <div class="card">
            <JdTable
                :name="tableName"
                :columns="columns"
                :datos="vista.transacciones || []"
                :colAct="true"
                :configFiltros="openConfigFiltros"
                :reload="loadPedidos"
                :rowOptions="tableRowOptions"
                @rowOptionSelected="runMethod"
            >
                <template v-slot:cVenta_canal="{ item }">
                    <template v-if="item.venta_canal == 1">
                        {{ item.venta_mesa1.salon1.nombre }} - {{ item.venta_mesa1.nombre }}
                    </template>
                    <template v-else>
                        {{ item.venta_canal1.nombre }}
                    </template>
                </template>
            </JdTable>
        </div>
    </div>

    <mPedidoDetalles v-if="useModals.show.mPedidoDetalles" />
    <mPedidoComprobantes v-if="useModals.show.mPedidoComprobantes" />

    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdTable, mConfigFiltros } from '@jhuler/components'

import mPedidoDetalles from '@/views/ventas/pedidos/mPedidoDetalles.vue'
import mPedidoComprobantes from '@/views/ventas/pedidos/mPedidoComprobantes.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'

import dayjs from 'dayjs'

export default {
    components: {
        JdTable,
        mConfigFiltros,

        mPedidoDetalles,
        mPedidoComprobantes,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),
        dayjs,

        vista: {},

        tableName: 'vReportePedidos',
        columns: [
            {
                id: 'fecha',
                title: 'Fecha',
                type: 'date',
                format: 'date',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'venta_codigo',
                title: 'Nro pedido',
                type: 'text',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'createdBy',
                title: 'Vendedor',
                prop: 'createdBy1.nombres_apellidos',
                type: 'select',
                mostrar: 'nombres_apellidos',
                width: '15rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'venta_canal',
                title: 'Canal',
                prop: 'venta_canal1.nombre',
                type: 'select',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'salon',
                title: 'Salón',
                prop: 'venta_mesa1.salon1.nombre',
                filtrable: false,
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'mesa',
                title: 'Mesa',
                prop: 'venta_mesa1.nombre',
                filtrable: false,
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'socio',
                title: 'Cliente',
                prop: 'socio1.nombres',
                type: 'select',
                mostrar: 'doc_nombres',
                width: '15rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'monto',
                title: 'Importe',
                type: 'number',
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
                type: 'select',
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
                permiso: 'vReportePedidos:ver',
            },
            {
                label: 'Imprimir',
                icon: 'fa-solid fa-print',
                action: 'imprimir',
                permiso: 'vReportePedidos:imprimirComanda',
            },
            {
                label: 'Ver comprobantes',
                icon: 'fa-solid fa-up-right-from-square',
                action: 'verComprobantes',
                permiso: 'vReportePedidos:verComprobantes',
            },
        ],
    }),
    async created() {
        this.vista = this.useVistas.vReportePedidos
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vReportePedidos:listar') == true) this.loadPedidos()
    },
    methods: {
        initFiltros() {
            this.columns[0].op = 'Está dentro de'
            this.columns[0].val = dayjs().startOf('month').format('YYYY-MM-DD')
            this.columns[0].val1 = dayjs().format('YYYY-MM-DD')
        },
        setQuery() {
            this.vista.qry = {
                fltr: { tipo: { op: 'Es', val: 2 } },
                incl: ['createdBy1', 'venta_mesa1', 'socio1'],
                iccl: {
                    venta_mesa1: {
                        incl: ['salon1'],
                    },
                },
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
            this.vista.qry.cols.push('tipo')
        },
        async loadPedidos() {
            this.setQuery()

            this.vista.transacciones = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.transacciones = res.data
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()

            for (const a of this.columns) {
                if (a.id == 'createdBy') a.reload = this.loadColaboradores
                if (a.id == 'socio') a.reload = this.loadSocios
                if (a.id == 'venta_canal') a.lista = this.vista.venta_canales
                if (a.id == 'estado') a.lista = this.vista.transaccion_estados
            }
            const cols = this.columns

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadPedidos,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async loadPedido(item) {
            const qry = {
                incl: ['socio1', 'venta_mesa1', 'venta_pago_metodo1'],
                iccl: {
                    venta_mesa1: {
                        incl: ['salon1'],
                    },
                },
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return false

            const qry1 = {
                incl: ['articulo1'],
                cols: { exclude: [] },
                fltr: { transaccion: { op: 'Es', val: item.id } },
                ordr: [['createdAt', 'ASC']],
            }
            this.useAuth.setLoading(true, 'Cargando...')
            const res1 = await get(`${urls.transaccion_items}?qry=${JSON.stringify(qry1)}`)
            this.useAuth.setLoading(false)

            if (res1.code != 0) return false

            res.data.transaccion_items = res1.data

            return res
        },
        async ver(item) {
            const res = await this.loadPedido(item)
            if (res == false) return

            const send = {
                pedido: { ...res.data },
                socios: [
                    {
                        id: res.data.socio,
                        ...res.data.venta_socio_datos,
                    },
                ],
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
        async imprimir(item) {
            const res = await this.loadPedido(item)
            if (res == false) return

            let atencion = ''

            if (res.data.venta_canal == 1) {
                atencion = `${res.data.venta_mesa1.salon1.nombre} - ${res.data.venta_mesa1.nombre}`
            } else if (res.data.venta_canal == 2) {
                atencion = 'PARA LLEVAR'
            } else if (res.data.venta_canal == 3) {
                atencion = 'DELIVERY'
            }

            const send = {
                createdAt: res.data.createdAt,
                atencion,
                venta_codigo: res.data.venta_codigo,
                cliente_datos: res.data.venta_socio_datos,
                is_reprint: true,
                productos: res.data.transaccion_items,
                subdominio: this.useAuth.empresa.subdominio,
            }

            this.useAuth.socket.emit('vComanda:imprimir', send)
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

        async loadDatosSistema() {
            const qry = ['transaccion_estados', 'pago_condiciones', 'venta_canales']

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
        async loadColaboradores() {
            const qry = {
                fltr: {},
                cols: ['nombres', 'apellidos', 'nombres_apellidos'],
            }

            this.vista.socios = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.colaboradores}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.vista.colaboradores = res.data
            return res.data
        },
        async loadSocios() {
            const qry = {
                fltr: { tipo: { op: 'Es', val: 2 }, activo: { op: 'Es', val: true } },
                cols: ['doc_numero', 'nombres', 'doc_nombres'],
            }

            this.vista.socios = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.vista.socios = res.data
            return res.data
        },
    },
}
</script>

<style lang="scss" scoped></style>

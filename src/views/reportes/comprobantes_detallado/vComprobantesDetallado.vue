<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Comprobantes detallado</strong>

            <div class="buttons"></div>
        </div>

        <JdTable
            :name="tableName"
            :columns="columns"
            :datos="vista.comprobantes || []"
            :configFiltros="openConfigFiltros"
            :reload="loadComprobantes"
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

    <mComprobantePagos
        v-if="useModals.show.mComprobantePagos"
        @pagosModificados="actualizarPagos"
    />

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
    <mAnular v-if="useModals.show.mAnular" />
</template>

<script>
import JdTable from '@/components/JdTable.vue'
import mAnular from '@/components/mAnular.vue'

import mConfigCols from '@/components/mConfigCols.vue'
import mConfigFiltros from '@/components/mConfigFiltros.vue'

import mComprobantePagos from '@/views/reportes/comprobantes/mComprobantePagos.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'

import dayjs from 'dayjs'

export default {
    components: {
        JdTable,
        mAnular,
        mConfigCols,
        mConfigFiltros,

        mComprobantePagos,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),
        dayjs,

        vista: {},

        tableName: 'vComprobantesDetallado',
        columns: [
            {
                id: 'comprobante_fecha',
                title: 'Fecha',
                prop: 'comprobante1.venta_fecha_emision',
                format: 'date',
                type: 'date',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'comprobante_tipo',
                title: 'Tipo compr.',
                prop: 'comprobante1.venta_tipo_documento_codigo1.nombre',
                type: 'select',
                width: '10rem',
                show: true,
                sort: true,
                seek: true,
            },
            {
                id: 'comprobante_serie',
                title: 'Serie',
                prop: 'comprobante1.venta_serie',
                type: 'text',
                width: '5rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'comprobante_correlativo',
                title: 'Correlativo',
                prop: 'comprobante1.venta_numero',
                type: 'text',
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'articulo',
                title: 'Producto',
                prop: 'articulo1.nombre',
                width: '20rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                type: 'number',
                width: '8rem',
                show: true,
                seek: false,
                sort: true,
            },
            {
                id: 'pu',
                title: 'Precio unitario',
                type: 'number',
                format: 'currency',
                moneda: 'S/',
                width: '8rem',
                show: true,
                seek: false,
                sort: true,
            },
            {
                id: 'descuento_mostrar',
                title: 'Descuento',
                filtrable: false,
                width: '8rem',
                show: true,
                seek: false,
                sort: true,
            },
            {
                id: 'total',
                title: 'Monto',
                type: 'number',
                format: 'currency',
                moneda: 'S/',
                filtrable: false,
                width: '8rem',
                show: true,
                seek: false,
                sort: true,
            },
            {
                id: 'comprobante_estado',
                title: 'Estado',
                prop: 'comprobante_estado1.nombre',
                type: 'select',
                format: 'estado',
                width: '8rem',
                show: true,
                seek: false,
                sort: true,
            },
        ],
    }),
    async created() {
        this.vista = this.useVistas.vComprobantesDetallado
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vComprobantesDetallado:listar') == true)
            this.loadComprobantes()
    },
    methods: {
        initFiltros() {
            this.columns[0].op = 'Está dentro de'
            this.columns[0].val = dayjs().startOf('month').format('YYYY-MM-DD')
            this.columns[0].val1 = dayjs().format('YYYY-MM-DD')
        },
        setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['comprobante1', 'articulo1'],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadComprobantes() {
            this.setQuery()

            this.vista.comprobantes = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.comprobante_items}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.comprobantes = res.data
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()

            const cols = this.columns
            cols.find((a) => a.id == 'comprobante_tipo').lista = this.vista.pago_comprobantes
            cols.find((a) => a.id == 'comprobante_estado').lista = this.vista.comprobante_estados

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadComprobantes,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        async loadDatosSistema() {
            const qry = ['pago_comprobantes', 'comprobante_estados']

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
    },
}
</script>

<style lang="scss" scoped></style>

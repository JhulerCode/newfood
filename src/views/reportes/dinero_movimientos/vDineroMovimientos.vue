<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Ingresos y egresos</strong>

            <div class="buttons"></div>
        </div>

        <JdTable
            :name="tableName"
            :columns="columns"
            :datos="vista.dinero_movimientos || []"
            :colAct="true"
            :configFiltros="openConfigFiltros"
            :reload="loadMovimientos"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
        >
            <template v-slot:cDetalle="{ item }">
                {{ item.comprobante1?.serie_correlativo }}
                {{ item.detalle }}
            </template>
        </JdTable>
    </div>

    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import { JdTable, mConfigFiltros } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'

import dayjs from 'dayjs'

export default {
    components: {
        JdTable,
        mConfigFiltros,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vDineroMovimientos',
        columns: [
            {
                id: 'fecha',
                title: 'Fecha',
                format: 'date',
                type: 'date',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'tipo',
                title: 'Tipo',
                prop: 'tipo1.nombre',
                type: 'select',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'operacion',
                title: 'Operación',
                prop: 'operacion1.nombre',
                type: 'select',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'pago_metodo',
                title: 'Método de pago',
                prop: 'pago_metodo1.nombre',
                type: 'select',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'monto',
                title: 'Monto',
                format: 'decimal',
                type: 'number',
                toRight: true,
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'detalle',
                title: 'Detalle',
                slot: 'cDetalle',
                width: '15rem',
                filtrable: false,
                show: true,
                seek: false,
                sort: false,
            },
            {
                id: 'estado',
                title: 'Estado',
                prop: 'estado1.nombre',
                type: 'select',
                format: 'estado',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
        tableRowOptions: [],
    }),
    async created() {
        this.vista = this.useVistas.vDineroMovimientos
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vDineroMovimientos:listar') == true) this.loadMovimientos()
    },
    methods: {
        initFiltros() {
            this.columns[0].op = 'Está dentro de'
            this.columns[0].val = dayjs().startOf('month').format('YYYY-MM-DD')
            this.columns[0].val1 = dayjs().format('YYYY-MM-DD')
        },
        setQuery() {
            this.vista.qry = {
                fltr: {
                    // operacion: { op: 'No es', val: '1' },
                },
                incl: ['pago_metodo1', 'comprobante1'],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
            // this.vista.qry.cols.push('monto')
        },
        async loadMovimientos() {
            this.setQuery()

            this.vista.dinero_movimientos = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(
                `${urls.dinero_movimientos}?qry=${JSON.stringify(this.vista.qry)}`,
            )
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.dinero_movimientos = res.data
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()
            await this.loadPagoMetodos()

            const cols = this.columns
            cols.find((a) => a.id == 'tipo').lista = this.vista.caja_operacion_tipos
            cols.find((a) => a.id == 'operacion').lista = this.vista.caja_operaciones
            cols.find((a) => a.id == 'pago_metodo').lista = this.vista.pago_metodos
            cols.find((a) => a.id == 'estado').lista = this.vista.dinero_movimiento_estados

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadMovimientos,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },
        async loadDatosSistema() {
            const qry = ['caja_operacion_tipos', 'caja_operaciones', 'dinero_movimiento_estados']

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
        async loadPagoMetodos() {
            const qry = {
                fltr: {},
                cols: ['nombre'],
            }

            this.vista.socios = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.pago_metodos}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.vista.pago_metodos = res.data
        },

        runMethod(method, item) {
            this[method](item)
        },
    },
}
</script>

<style lang="scss" scoped></style>

<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Ingresos y egresos</strong>

            <div class="buttons">
                <JdButton
                    text="Nuevo"
                    title="Crear nuevo"
                    @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vCajaMovimientos:crear')"
                />
            </div>
        </div>

        <JdTable
            :name="tableName"
            :columns="columns"
            :datos="vista.dinero_movimientos || []"
            :colAct="true"
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

    <mCajaMovimiento v-if="useModals.show.mCajaMovimiento" />
</template>

<script>
import JdButton from '@/components/inputs/JdButton.vue'
import JdTable from '@/components/JdTable.vue'

import mCajaMovimiento from './mCajaMovimiento.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'
import { redondear } from '@/utils/mine'
import dayjs from 'dayjs'

export default {
    components: {
        JdButton,
        JdTable,

        mCajaMovimiento,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),
        redondear,

        vista: {},

        tableName: 'vCajaMovimientos',
        columns: [
            {
                id: 'fecha',
                title: 'Fecha',
                format: 'date',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'tipo',
                title: 'Tipo',
                prop: 'tipo1.nombre',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'operacion',
                title: 'Operación',
                prop: 'operacion1.nombre',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'pago_metodo',
                title: 'Método de pago',
                prop: 'pago_metodo1.nombre',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'monto_real',
                title: 'Monto',
                format: 'decimal',
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
                show: true,
                seek: false,
                sort: false,
            },
        ],
        tableRowOptions: [
            // {
            //     label: 'Editar',
            //     icon: 'fa-solid fa-pen-to-square',
            //     action: 'editar',
            //     permiso: 'vCajaMovimientos:editar',
            // },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash-can',
                action: 'eliminar',
                permiso: 'vCajaMovimientos:eliminar',
            },
        ],
    }),
    async created() {
        this.vista = this.useVistas.vCajaMovimientos
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        await this.loadCajaApertura()
        if (this.useAuth.verifyPermiso('vCajaMovimientos:listar') == true) {
            if (this.vista.caja_apertura) this.loadMovimientos()
        }
    },
    methods: {
        async loadCajaApertura() {
            const qry = {
                fltr: { estado: { op: 'Es', val: '1' } },
                cols: ['fecha_apertura', 'monto_apertura'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.caja_aperturas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.caja_apertura = res.data[0]
        },
        setQuery() {
            this.vista.qry = {
                fltr: {
                    caja_apertura: { op: 'Es', val: this.vista.caja_apertura.id },
                },
                incl: ['pago_metodo1', 'comprobante1'],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
            this.vista.qry.cols.push('tipo', 'monto')
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

        nuevo() {
            const item = {
                fecha: dayjs().format('YYYY-MM-DD'),
                caja_apertura: this.vista.caja_apertura.id,
                pago_metodo: 1,
            }

            this.useModals.setModal('mCajaMovimiento', 'Nueva categoría', 1, item)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.dinero_movimientos, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vCajaMovimientos', 'dinero_movimientos', item)
        },
    },
}
</script>

<style lang="scss" scoped></style>

<template>
    <JdModal modal="mKardex">
        <div class="header">
            <p>{{ modal.articulo.nombre }} ({{ modal.articulo.unidad }})</p>

            <div>
                <p>
                    <small>Stock:</small>
                    {{ redondear(modal.stock) }}
                </p>

                <!-- <p>
                    <small>Valor:</small>
                    {{ redondear(modal.valor) }}
                </p> -->
            </div>
        </div>

        <JdTable
            :columns="columns"
            :datos="modal.kardex || []"
            :reload="loadKardex"
            :colAct="true"
            :rowOptions="tableRowOptions"
            maxHeight="80vh"
            @rowOptionSelected="runMethod"
        >
            <template v-slot:cMoreInfo="{ item }">
                <template v-if="item.transaccion1?.compra_comprobante_serie">
                    {{ item.transaccion1?.compra_comprobante_serie }}-{{
                        item.transaccion1?.compra_comprobante_correlativo
                    }}
                </template>
                <template v-if="item.comprobante1">
                    {{ item.comprobante1?.serie_correlativo }}
                </template>
            </template>
        </JdTable>
    </JdModal>
</template>

<script>
import { JdModal, JdTable } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'
import { redondear, getItemFromArray } from '@/utils/mine'

import dayjs from 'dayjs'

export default {
    components: {
        JdModal,
        JdTable,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        redondear,
        getItemFromArray,
        dayjs,

        modal: {},
        // articulo: {},

        columns: [
            {
                id: 'fecha',
                title: 'Fecha',
                prop: 'fecha',
                format: 'date',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'tipo',
                title: 'Operación',
                prop: 'tipo1.nombre',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                format: 'decimal',
                toRight: true,
                width: '8rem',
                show: true,
            },
            {
                id: 'articulo1.unidad',
                title: 'Unidad',
                prop: 'articulo1.unidad',
                width: '5rem',
                show: true,
            },
            {
                id: 'comprobante',
                title: 'Comprobante',
                slot: 'cMoreInfo',
                width: '10rem',
                show: true,
            },
            {
                id: 'transaccion1.socio',
                title: 'Socio',
                prop: 'transaccion1.socio1.nombres',
                width: '10rem',
                show: true,
            },
            {
                id: 'observacion',
                title: 'Observación',
                width: '10rem',
                show: true,
            },
        ],
        tableRowOptions: [
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash-can',
                action: 'eliminar',
                permiso: ['vInsumos:ajusteStock', 'vProductos:ajusteStock'],
                ocultar: { tipo: [1, 2] },
            },
        ],
    }),
    async created() {
        this.modal = this.useModals.mKardex

        await this.loadKardex()
    },
    methods: {
        setQuery() {
            this.modal.qry = {
                fltr: {
                    articulo: { op: 'Es', val: this.modal.articulo.id },
                    sucursal: { op: 'Es', val: this.useAuth.sucursal.id },
                },
                incl: ['articulo1', 'transaccion1', 'comprobante1'],
                iccl: {
                    comprobante1: {
                        incl: ['socio1']
                    },
                    transaccion1: {
                        cols: ['compra_comprobante_serie', 'compra_comprobante_correlativo'],
                        incl: ['socio1']
                    }
                }
            }

            this.useAuth.updateQuery(this.columns, this.modal.qry)
            this.modal.qry.cols.push('observacion')
        },
        async loadKardex() {
            this.setQuery()

            this.modal.kardex = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.kardex}?qry=${JSON.stringify(this.modal.qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.kardex = res.data
            this.calculateStock()
        },
        calculateStock() {
            this.modal.stock = 0
            this.modal.valor = 0

            for (const a of this.modal.kardex) {
                this.modal.stock += a.cantidad
                this.modal.valor += a.cantidad * a.pu
            }
        },

        runMethod(method, item) {
            this[method](item)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            const send = {
                id: item.id,
                tipo: item.tipo,
                articulo: this.modal.articulo.id,
                cantidad: Math.abs(item.cantidad),
            }

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.kardex, send)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const i = this.modal.kardex.findIndex((a) => a.id == item.id)
            this.modal.kardex.splice(i, 1)
            this.calculateStock()
        },
    },
}
</script>

<style lang="scss" scoped>
.header {
    display: flex;
    justify-content: space-between;
    gap: 2rem;
    margin-bottom: 2rem;

    div {
        display: flex;
        gap: 1rem;
    }
}

.anulado {
    color: var(--rojo);
}
</style>

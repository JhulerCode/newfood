<template>
    <JdModal modal="mPedidoComprobantes">
        <div class="datos">
            <JdTable
                :columns="columns"
                :datos="modal.comprobantes || []"
                :colNro="true"
                :reload="loadComprobantes"
                class="table-pagos"
            >
            </JdTable>
        </div>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdTable from '@/components/JdTable.vue'
// import JdButton from '@/components/inputs/JdButton.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'

export default {
    components: {
        JdModal,
        JdTable,
        // JdButton,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        columns: [
            {
                id: 'venta_fecha_emision',
                title: 'Fecha',
                format: 'date',
                width: '7rem',
                show: true,
                sort: true,
                seek: true,
            },
            {
                id: 'venta_tipo_documento_codigo',
                title: 'Tipo compr.',
                prop: 'venta_tipo_documento_codigo1.nombre',
                width: '10rem',
                show: true,
                sort: true,
                seek: true,
            },
            {
                id: 'venta_serie',
                title: 'Serie',
                width: '7rem',
                show: true,
                sort: true,
                seek: true,
            },
            {
                id: 'venta_numero',
                title: 'Correlativo',
                width: '7rem',
                show: true,
                sort: true,
                seek: true,
            },
            {
                id: 'socio',
                title: 'Cliente',
                prop: 'socio1.nombres',
                width: '15rem',
                show: true,
                sort: true,
                seek: true,
            },
            {
                id: 'monto',
                title: 'Monto',
                toRight: true,
                width: '7rem',
                show: true,
                sort: true,
                seek: true,
            },
            // { id: '', width: '7rem', title: 'Deuda', slot: 'colDeuda', toRight: true },
        ],
    }),
    async created() {
        this.modal = this.useModals.mPedidoComprobantes

        this.loadComprobantes()
        // this.vista = this.useVistas.getVista('vClientePedidos')
    },
    beforeUnmount() {
        // this.vista.pedidos.find(a => a.)
    },
    methods: {
        async loadComprobantes() {
            const qry = {
                fltr: {
                    transaccion: { op: 'Es', val: this.modal.transaccion.id },
                },
            }

            this.useAuth.updateQuery(this.columns, qry)
            this.modal.comprobantes = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.comprobantes}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.comprobantes = res.data
        },
        // openPagar(item) {
        //     this.useModals.setModal('mPagarCuenta', `Pagar cuenta`, true, 1, item)
        // },
    },
}
</script>

<style lang="scss" scoped>
.table-pagos {
    .pagado {
        width: fit-content;
        border-radius: 0.3rem;
        padding: 0.3rem 0.5rem;
        background-color: var(--verde);
        color: var(--text-color3);
        font-size: 0.8rem;
    }
}
</style>

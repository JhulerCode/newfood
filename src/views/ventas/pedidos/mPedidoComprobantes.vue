<template>
    <JdModal modal="mPedidoComprobantes">
        <div class="datos">
            <JdTable
                :columns="columns"
                :datos="modal.comprobantes || []"
                :colAct="true"
                :reload="loadComprobantes"
                :rowOptions="tableRowOptions"
                @rowOptionSelected="runMethod"
            >
            </JdTable>
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdTable } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'

export default {
    components: {
        JdModal,
        JdTable,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        columns: [
            {
                id: 'fecha_emision',
                title: 'Fecha',
                format: 'date',
                width: '7rem',
                show: true,
                sort: true,
                seek: true,
            },
            {
                id: 'doc_tipo',
                title: 'Tipo compr.',
                prop: 'doc_tipo1.nombre',
                width: '10rem',
                show: true,
                sort: true,
                seek: true,
            },
            {
                id: 'serie_correlativo',
                title: 'Nro comprobante',
                type: 'text',
                width: '10rem',
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
                sort: true,
                seek: true,
            },
            {
                id: 'monto',
                title: 'Monto',
                format: 'currency',
                moneda: 'S/',
                width: '7rem',
                show: true,
                sort: true,
                seek: true,
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
                sort: false,
            },
            {
                id: 'pago_condicion',
                title: 'Condición de pago',
                type: 'select',
                prop: 'pago_condicion1.nombre',
                width: '8rem',
                show: true,
                seek: false,
                sort: true,
            },
            {
                id: 'pagos_monto',
                title: 'Cobrado',
                type: 'number',
                format: 'currency',
                moneda: 'S/',
                width: '8rem',
                show: true,
                seek: false,
                sort: true,
            },
        ],
        tableRowOptions: [
            {
                label: 'Imprimir',
                icon: 'fa-solid fa-print',
                action: 'imprimir',
                permiso: 'vReporteComprobantes:imprimir',
            },
        ],
    }),
    async created() {
        this.modal = this.useModals.mPedidoComprobantes

        this.loadComprobantes()
    },
    methods: {
        setQuery() {
            this.modal.qry = {
                fltr: {
                    transaccion: { op: 'Es', val: this.modal.transaccion.id },
                },
                sqls: ['pagos_monto'],
            }

            this.useAuth.updateQuery(this.columns, this.modal.qry)
            this.modal.qry.cols.push('serie', 'numero')
        },
        async loadComprobantes() {
            this.setQuery()

            this.modal.comprobantes = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.comprobantes}?qry=${JSON.stringify(this.modal.qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.comprobantes = res.data
        },

        runMethod(method, item) {
            this[method](item)
        },
        async imprimir(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.comprobantes}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const send = {
                ...res.data,
                impresora: {
                    tipo: this.useAuth.usuario.impresora_caja.impresora_tipo,
                    nombre: this.useAuth.usuario.impresora_caja.impresora,
                },
                subdominio: this.useAuth.usuario.empresa.subdominio,
            }

            this.useAuth.socket.emit('vEmitirComprobante:imprimir', send)

            // const uriEncoded = `http://${this.useAuth.usuario.empresa.pc_principal_ip}/imprimir/comprobante.php?data=${encodeURIComponent(JSON.stringify(send))}`
            // console.log(uriEncoded)
            // const nuevaVentana = window.open(
            //     uriEncoded,
            //     '_blank',
            //     'width=1,height=1,top=0,left=0,scrollbars=no,toolbar=no,location=no,status=no,menubar=no',
            // )

            // setTimeout(() => {
            //     nuevaVentana.close()
            // }, 500)
        },
    },
}
</script>

<style lang="scss" scoped></style>

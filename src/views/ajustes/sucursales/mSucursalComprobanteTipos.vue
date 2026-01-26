<template>
    <JdModal modal="mSucursalComprobanteTipos">
        <JdTable
            :columns="columns"
            :datos="modal.comprobante_tipos || []"
            :reload="loadSucursalComprobanteTipos"
            :seeker="false"
            :download="false"
        >
            <template v-slot:cEstado="{ item }">
                <JdSelect
                    :nec="true"
                    :lista="modal.activo_estados || []"
                    v-model="item.estado"
                    :disabled="modal.mode == 3"
                    @elegir="modificar(item)"
                />
            </template>
        </JdTable>
    </JdModal>
</template>

<script>
import { JdModal, JdTable, JdSelect } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, patch } from '@/utils/crud'

export default {
    components: {
        JdModal,
        JdTable,
        JdSelect,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        colaborador: {},

        columns: [
            {
                id: 'comprobante_tipo',
                title: 'Tipo de comprobante',
                prop: 'comprobante_tipo1.serie',
                width: '10rem',
                show: true,
                sort: true,
            },
            {
                id: 'estado',
                title: 'Estado',
                slot: 'cEstado',
                width: '10rem',
                show: true,
                sort: true,
            },
        ],
    }),
    async created() {
        this.modal = this.useModals.mSucursalComprobanteTipos

        await this.loadDatosSistema()
        this.loadSucursalComprobanteTipos()
    },
    methods: {
        async loadDatosSistema() {
            const qry = ['activo_estados']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
        },
        async loadSucursalComprobanteTipos() {
            const qry = {
                fltr: {
                    sucursal: { op: 'Es', val: this.modal.item.id },
                },
                incl: ['comprobante_tipo1'],
                cols: ['estado'],
            }

            this.modal.comprobante_tipos = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.sucursal_comprobante_tipos}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.comprobante_tipos = res.data
        },
        async modificar(item) {
            const send = {
                id: item.id,
                estado: item.estado,
            }

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.sucursal_comprobante_tipos, send)
            this.useAuth.setLoading(false)

            if (res.code != 0) return
        },
    },
}
</script>

<template>
    <JdModal modal="mPagoMetodoLocales">
        <JdTable
            :columns="columns"
            :datos="modal.sucursales || []"
            :reload="loadSucursales"
            :seeker="false"
            :download="false"
        >
            <template v-slot:cEstado="{ item }">
                <JdSelect
                    :nec="true"
                    :lista="modal.activo_estados || []"
                    v-model="item.estado"
                    :disabled="modal.mode == 3"
                    @elegir="modificar"
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
                id: 'sucursal',
                title: 'Sucursal',
                prop: 'sucursal1.codigo',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'estado',
                title: 'Estado',
                slot: 'cEstado',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
    }),
    async created() {
        this.modal = this.useModals.mPagoMetodoLocales

        await this.loadDatosSistema()
        this.loadSucursales()
    },
    methods: {
        async loadSucursales() {
            const qry = {
                fltr: {
                    pago_metodo: { op: 'Es', val: this.modal.item.id },
                },
                incl: ['sucursal1'],
                cols: ['estado'],
            }

            this.modal.sucursales = []
            this.modal.sucursalesLoaded = false
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.sucursal_pago_metodos}?qry=${JSON.stringify(qry)}`)
            this.modal.sucursalesLoaded = true
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.sucursales = res.data
        },
        async loadDatosSistema() {
            const qry = ['activo_estados']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
        },
        async modificar(item) {
            const send = {
                id: item.id,
                estado: item.estado,
            }

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.sucursal_pago_metodos, send)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            // this.useVistas.updateItem('vPagoMetodos', 'pago_metodos', res.data)
            // this.useModals.show.mPagoMetodoLocales = false
        },
    },
}
</script>

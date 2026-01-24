<template>
    <JdModal modal="mSucursalCambiar">
        <JdTable
            :columns="columns"
            :datos="useAuth.empresa.sucursales || []"
            :seeker="false"
            :download="false"
        >
            <template v-slot:cElegir="{ item }">
                <JdButton text="Elegir" tipo="2" :small="true" @click="elegir(item)" />
            </template>
        </JdTable>
    </JdModal>
</template>

<script>
import { JdModal, JdTable, JdButton } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'
import { deepCopy } from '@/utils/mine'

// import { urls, patch } from '@/utils/crud'

export default {
    components: {
        JdModal,
        JdTable,
        JdButton,
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
                prop: 'codigo',
                width: '15rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'elegir',
                title: '',
                slot: 'cElegir',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
    }),
    async created() {
        this.modal = this.useModals.mSucursalCambiar

        // await this.loadDatosSistema()
        // this.loadSucursales()
    },
    methods: {
        // async loadSucursales() {
        //     const qry = {
        //         fltr: {
        //             pago_metodo: { op: 'Es', val: this.modal.item.id },
        //         },
        //         incl: ['sucursal1'],
        //         cols: ['estado'],
        //     }

        //     this.modal.sucursales = []
        //     this.modal.sucursalesLoaded = false
        //     this.useAuth.setLoading(true, 'Cargando...')
        //     const res = await get(`${urls.sucursal_pago_metodos}?qry=${JSON.stringify(qry)}`)
        //     this.modal.sucursalesLoaded = true
        //     this.useAuth.setLoading(false)

        //     if (res.code != 0) return

        //     this.modal.sucursales = res.data
        // },
        // async loadDatosSistema() {
        //     const qry = ['activo_estados']
        //     const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

        //     if (res.code != 0) return

        //     Object.assign(this.modal, res.data)
        // },
        async elegir(item) {
            this.useAuth.sucursal = deepCopy(item)
            window.location.reload()
        },
    },
}
</script>

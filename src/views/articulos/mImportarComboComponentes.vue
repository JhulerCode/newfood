<template>
    <JdModal
        modal="mImportarComboComponentes"
        :buttons="buttons"
        @button-click="(action) => this[action]()"
    >
        <JdTable :columns="columns" :datos="modal.articulos" :seeker="false" :download="false">
        </JdTable>
    </JdModal>
</template>

<script>
import { JdModal, JdTable } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, post } from '@/utils/crud'

export default {
    components: {
        JdModal,
        JdTable,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        modal: {},

        columns: [
            {
                id: 'articulo_principal',
                title: 'Combo',
                prop: 'articulo_principal1.nombre',
                show: true,
                width: '18rem',
            },
            {
                id: 'articulo',
                title: 'Componente',
                prop: 'articulo1.nombre',
                show: true,
                width: '18rem',
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                width: '8rem',
                show: true,
            },
        ],

        buttons: [{ text: 'Grabar', action: 'grabar', spin: false, show: true }],
    }),
    created() {
        this.modal = this.useModals.mImportarComboComponentes
    },
    methods: {
        eliminar(item) {
            this.modal.articulos = this.modal.articulos.filter((a) => a !== item)
        },
        async grabar() {
            const send = {
                articulos: this.modal.articulos,
            }

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(`${urls.combo_articulos}/bulk`, send)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.show.mImportarComboComponentes = false
        },
    },
}
</script>

<style scoped>
button {
    margin-top: 20px;
}
</style>

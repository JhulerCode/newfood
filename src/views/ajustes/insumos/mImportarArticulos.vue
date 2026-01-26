<template>
    <JdModal
        modal="mImportarArticulos"
        :buttons="buttons"
        @button-click="(action) => this[action]()"
    >
        <JdTable :columns="columns" :datos="modal.articulos" :seeker="false" :download="false" />
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
            { id: 'nombre', title: 'Nombre', width: '25rem', show: true, seek: true },
            {
                id: 'categoria',
                title: 'Categoría',
                prop: 'categoria1.nombre',
                width: '10rem',
                show: true,
            },
            {
                id: 'unidad',
                title: 'Unidad',
                width: '6rem',
                show: true,
            },
            {
                id: 'tributo',
                title: 'Tributo',
                prop: 'tributo1.nombre',
                width: '18rem',
                show: true,
            },
            {
                id: 'has_receta',
                title: 'Es transformado?',
                width: '8rem',
                show: true,
            },
            {
                id: 'precio_venta',
                title: 'Precio de venta',
                width: '8rem',
                show: true,
            },
            // {
            //     id: 'produccion_area',
            //     title: 'Área de impresión',
            //     prop: 'produccion_area1.nombre',
            //     width: '8rem',
            //     show: true,
            // },
        ],

        buttons: [{ text: 'Grabar', action: 'grabar', spin: false, show: true }],
    }),
    created() {
        this.modal = this.useModals.mImportarArticulos

        if (this.modal.tipo == 1) {
            this.columns[4].show = false
            this.columns[5].show = false
            this.columns[6].show = false
        }

        if (this.modal.tipo == 2) {
            this.columns[2].show = false

            if (this.modal.is_combo == true) {
                this.columns[4].show = false
            }
        }
    },
    methods: {
        eliminar(item) {
            this.modal.articulos = this.modal.articulos.filter((a) => a !== item)
        },
        async grabar() {
            const send = {
                tipo: this.modal.tipo,
                articulos: this.modal.articulos,
            }

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(`${urls.articulos}/bulk`, send)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.show.mImportarArticulos = false
        },
    },
}
</script>

<style scoped>
button {
    margin-top: 20px;
}
</style>

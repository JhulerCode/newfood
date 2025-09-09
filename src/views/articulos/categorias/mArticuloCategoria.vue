<template>
    <JdModal
        modal="mArticuloCategoria"
        :buttons="buttons"
        @button-click="(action) => this[action]()"
    >
        <div class="container-datos">
            <JdSelect
                label="Tipo"
                :nec="true"
                v-model="articulo_categoria.tipo"
                :lista="modal.articulo_tipos"
                :disabled="modal.mode == 3"
            />

            <JdInput
                label="Nombre"
                :nec="true"
                v-model="articulo_categoria.nombre"
                :disabled="modal.mode == 3"
            />

            <JdInput
                label="Color"
                :nec="true"
                type="color"
                v-model="articulo_categoria.color"
                :disabled="modal.mode == 3"
            />

            <JdSwitch
                label="Activo"
                v-model="articulo_categoria.activo"
                :disabled="modal.mode == 3"
            />
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdSelect, JdInput, JdSwitch } from 'jd-components'

import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdSelect,
        JdInput,
        JdSwitch,
    },
    data: () => ({
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        articulo_categoria: {},

        buttons: [
            { text: 'Grabar', action: 'crear', spin: false },
            { text: 'Actualizar', action: 'modificar', spin: false },
        ],
    }),
    created() {
        this.modal = this.useModals.mArticuloCategoria
        this.articulo_categoria = this.useModals.mArticuloCategoria.item

        this.loadDatosSistema()
        this.showButtons()
    },
    methods: {
        showButtons() {
            if (this.modal.mode == 1) {
                this.buttons[0].show = true
            } else if (this.modal.mode == 2) {
                this.buttons[1].show = true
            }
        },
        checkDatos() {
            if (incompleteData(this.articulo_categoria, ['tipo', 'nombre', 'color'])) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Modificando...')
            const res = await post(urls.articulo_categorias, this.articulo_categoria)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.addItem('vArticuloCategorias', 'articulo_categorias', res.data)
            this.useModals.show.mArticuloCategoria = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Modificando...')
            const res = await patch(urls.articulo_categorias, this.articulo_categoria)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vArticuloCategorias', 'articulo_categorias', res.data)
            this.useModals.show.mArticuloCategoria = false
        },

        async loadDatosSistema() {
            const qry = ['articulo_tipos']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 20rem;
    gap: 0.5rem;
}
</style>

<template>
    <JdModal modal="mProduccionArea" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdInput
                label="Nombre"
                :nec="true"
                v-model="modal.item.nombre"
                :disabled="modal.mode == 3"
            />

            <JdInput
                label="Impresora"
                :nec="true"
                v-model="modal.item.impresora"
                :disabled="modal.mode == 3"
            />

            <JdSwitch label="Activo" v-model="modal.item.activo" :disabled="modal.mode == 3" />
        </div>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdInput from '@/components/inputs/JdInput.vue'
import JdSwitch from '@/components/inputs/JdSwitch.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, post, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        JdSwitch,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        colaborador: {},

        buttons: [
            {
                text: 'Grabar',
                action: 'crear',
                permiso: 'vProduccionAreas:crear',
            },
            {
                text: 'Actualizar',
                action: 'modificar',
                permiso: 'vProduccionAreas:editar',
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mProduccionArea
        this.setButtons()
    },
    methods: {
        setButtons() {
            if (this.modal.mode == 1) {
                this.buttons[0].show = true
                this.buttons[1].show = false
            } else if (this.modal.mode == 2) {
                this.buttons[0].show = false
                this.buttons[1].show = true
            }
        },
        checkDatos() {
            const props = ['nombre', 'impresora', 'activo']

            if (incompleteData(this.modal.item, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(urls.produccion_areas, this.modal.item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.addItem('vProduccionAreas', 'produccion_areas', res.data)
            this.useModals.show.mProduccionArea = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.produccion_areas, this.modal.item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vProduccionAreas', 'produccion_areas', res.data)
            this.useModals.show.mProduccionArea = false
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 20rem;
    gap: 1rem 2rem;
}
</style>

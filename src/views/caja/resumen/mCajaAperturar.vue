<template>
    <JdModal modal="mCajaAperturar" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdInput
                label="Fecha y hora"
                type="datetime-local"
                :nec="true"
                v-model="caja_apertura.fecha_apertura"
                :disabled="true"
                v-if="modal.mode == 1"
            />

            <JdInput
                label="Efectivo (S/)"
                :nec="true"
                type="number"
                v-model="caja_apertura.monto_apertura"
                :disabled="modal.mode == 3"
                v-if="modal.mode == 1"
            />

            <JdInput
                label="Fecha y hora"
                type="datetime-local"
                :nec="true"
                v-model="caja_apertura.fecha_cierre"
                :disabled="true"
                v-if="modal.mode == 2"
            />

            <JdInput
                label="Efectivo (S/)"
                :nec="true"
                type="number"
                v-model="caja_apertura.monto_cierre"
                :disabled="modal.mode == 3"
                v-if="modal.mode == 2"
            />
        </div>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdInput from '@/components/inputs/JdInput.vue'

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
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        caja_apertura: {},

        buttons: [
            { text: 'Aperutar', action: 'crear' },
            { text: 'Cerrar', action: 'modificar' },
        ],
    }),
    created() {
        this.modal = this.useModals.mCajaAperturar
        this.caja_apertura = this.useModals.mCajaAperturar.item

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
            const props =
                this.modal.mode == 1
                    ? ['fecha_apertura', 'monto_apertura']
                    : ['fecha_cierre', 'monto_cierre']

            if (incompleteData(this.caja_apertura, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Aperturando caja...')
            const res = await post(urls.caja_aperturas, this.caja_apertura)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.addItem('vCajaResumen', 'caja_aperturas', res.data)
            this.useModals.show.mCajaAperturar = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Cerrando caja...')
            const res = await patch(urls.caja_aperturas, this.caja_apertura)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vCajaResumen', 'caja_aperturas', res.data)
            this.useModals.show.mCajaAperturar = false
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

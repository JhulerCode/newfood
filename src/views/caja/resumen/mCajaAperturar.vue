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

            <div class="diferencia">
                <small>Diferencia:</small>
                <p v-if="modal.mode == 2" :class="{ 'diferencia-negativa': diferencia_negativa }">
                    {{ diferencia }}
                    <!-- {{ caja_apertura.caja_total }} -->
                </p>
            </div>
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, post, patch } from '@/utils/crud'
import { incompleteData, redondear } from '@/utils/mine'
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

        redondear,

        modal: {},
        caja_apertura: {},

        buttons: [
            { text: 'Aperutar', action: 'crear' },
            { text: 'Cerrar', action: 'modificar' },
        ],
    }),
    computed: {
        diferencia() {
            return redondear((this.caja_apertura.monto_cierre || 0) - this.caja_apertura.caja_total)
        },
        diferencia_negativa() {
            return this.diferencia < 0
        },
    },
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
            const res = await post(
                urls.caja_aperturas,
                this.caja_apertura,
                'Caja aperturada con éxito',
            )
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            // this.useVistas.addItem('vCajaResumen', 'caja_aperturas', res.data)
            this.$emit('aperturado', res.data)
            this.useModals.show.mCajaAperturar = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Cerrando caja...')
            const res = await patch(
                urls.caja_aperturas,
                this.caja_apertura,
                'Caja cerrada con éxito',
            )
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            // this.useVistas.updateItem('vCajaResumen', 'caja_aperturas', res.data)
            this.$emit('cerrado')
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

    .diferencia {
        // display: flex;
        text-align: right;

        .diferencia-negativa {
            color: var(--rojo);
            font-size: 1.4rem;
        }
    }
}
</style>

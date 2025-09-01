<template>
    <JdModal modal="mCajaMovimiento" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdInput
                label="Fecha"
                type="date"
                :nec="true"
                v-model="dinero_movimiento.fecha"
                :disabled="true"
            />

            <JdSelect
                label="Tipo"
                :nec="true"
                v-model="dinero_movimiento.tipo"
                :lista="tipos"
                :disabled="modal.mode == 3"
            />

            <JdSelect
                label="Operación"
                :nec="true"
                v-model="dinero_movimiento.operacion"
                :lista="
                    modal.caja_operaciones?.filter(
                        (a) => a.tipo == dinero_movimiento.tipo && a.id != 1,
                    ) || []
                "
                :disabled="modal.mode == 3"
            />

            <JdInput
                label="Detalle"
                :nec="true"
                v-model="dinero_movimiento.detalle"
                :disabled="modal.mode == 3"
            />

            <!-- <JdSelect
                label="Método de pago"
                :nec="true"
                v-model="dinero_movimiento.pago_metodo"
                :lista="modal.pago_metodos"
                :disabled="modal.mode == 3"
            /> -->

            <JdInput
                label="Efectivo (S/)"
                :nec="true"
                type="number"
                v-model="dinero_movimiento.monto"
                :disabled="modal.mode == 3"
            />
        </div>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdInput from '@/components/inputs/JdInput.vue'
import JdSelect from '@/components/inputs/JdSelect.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        JdSelect,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        dinero_movimiento: {},
        tipos: [
            { id: 1, nombre: 'INGRESO' },
            { id: 2, nombre: 'EGRESO' },
        ],

        buttons: [
            { text: 'Aperutar', action: 'crear' },
            { text: 'Cerrar', action: 'modificar' },
        ],
    }),
    created() {
        this.modal = this.useModals.mCajaMovimiento
        this.dinero_movimiento = this.useModals.mCajaMovimiento.item

        this.showButtons()
        this.loadDatosSistema()
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
            const props = ['fecha', 'tipo', 'operacion', 'detalle', 'monto']

            if (incompleteData(this.dinero_movimiento, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Aperturando caja...')
            const res = await post(urls.dinero_movimientos, this.dinero_movimiento)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.addItem('vCajaMovimientos', 'dinero_movimientos', res.data, 'first')
            this.useModals.show.mCajaMovimiento = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Cerrando caja...')
            const res = await patch(urls.dinero_movimientos, this.dinero_movimiento)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vCajaMovimientos', 'dinero_movimientos', res.data)
            this.useModals.show.mCajaMovimiento = false
        },

        async loadDatosSistema() {
            const qry = ['caja_operaciones']
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

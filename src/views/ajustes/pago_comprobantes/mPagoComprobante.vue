<template>
    <JdModal modal="mPagoComprobante" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdInput label="Nombre" :nec="true" v-model="modal.item.nombre" :disabled="true" />

            <JdInput label="Serie" v-model="modal.item.serie" :disabled="modal.mode == 3" />

            <JdInput
                label="Número"
                type="number"
                v-model="modal.item.numero"
                :disabled="modal.mode == 3"
            />

            <JdSwitch label="Activo" v-model="modal.item.activo" :disabled="modal.mode == 3" />

            <JdSwitch
                label="Por defecto?"
                v-model="modal.item.estandar"
                :disabled="modal.mode == 3"
            />
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdSwitch } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, patch } from '@/utils/crud'
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
                text: 'Actualizar',
                action: 'modificar',
                show: true,
                permiso: 'vPagoComprobantes:editar',
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mPagoComprobante
    },
    methods: {
        checkDatos() {
            const props = ['nombre', 'activo', 'estandar']

            if (incompleteData(this.modal.item, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        shapeDatos() {
            if (this.modal.item.numero == '') {
                this.modal.item.numero = null
            }
        },
        async modificar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.pago_comprobantes, this.modal.item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vPagoComprobantes', 'pago_comprobantes', res.data)
            this.useModals.show.mPagoComprobante = false
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

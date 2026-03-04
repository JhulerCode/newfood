<template>
    <JdModal
        modal="mComprobanteWhatsapp"
        :buttons="buttons"
        @button-click="(action) => this[action]()"
    >
        <div class="container-datos">
            <JdInput
                label="Nro celular del cliente"
                :nec="true"
                type="number"
                placeholder="999888777"
                v-model="modal.item.phone_to_send"
            />
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, post } from '@/utils/crud'
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

        usuario: null,
        contrasena: null,

        buttons: [{ text: 'Enviar whatsapp', action: 'enviarWhatsapp', show: true }],
    }),
    created() {
        this.modal = this.useModals.mComprobanteWhatsapp
    },
    methods: {
        checkDatos() {
            const props = ['phone_to_send']
            if (incompleteData(this.modal.item, props)) {
                jmsg('warning', 'Ingrese un nro celular válido')
                return true
            }

            if (this.modal.item.phone_to_send.toString().length != 9) {
                jmsg('warning', 'Ingrese un nro celular válido')
                return true
            }

            return false
        },
        async enviarWhatsapp() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Enviando...')
            const res = await post(
                `${urls.comprobantes}/send-whatsapp`,
                this.modal.item,
                'Whatsapp enviado con éxito',
            )
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.show.mComprobanteWhatsapp = false
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 25rem;
    gap: 0.5rem;
}
</style>

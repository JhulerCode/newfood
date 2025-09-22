<template>
    <JdModal
        modal="mComprobanteCorreo"
        :buttons="buttons"
        @button-click="(action) => this[action]()"
    >
        <div class="container-datos">
            <JdInput
                label="Email del cliente"
                :nec="true"
                type="email"
                v-model="modal.item.email_to_send"
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

        buttons: [{ text: 'Enviar email', action: 'enviarCorreo', show: true }],
    }),
    created() {
        this.modal = this.useModals.mComprobanteCorreo
    },
    methods: {
        checkDatos() {
            const props = ['email_to_send']
            if (incompleteData(this.modal.item, props)) {
                jmsg('warning', 'Ingrese un email válido')

                return true
            }

            return false
        },
        async enviarCorreo() {
            this.useAuth.setLoading(true, 'Enviando...')
            const res = await post(
                `${urls.comprobantes}/send-mail`,
                this.modal.item,
                'Correo enviado con éxito',
            )
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.show.mComprobanteCorreo = false
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

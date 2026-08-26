<template>
    <JdModal
        modal="mComprobanteWhatsapp"
        :buttons="buttons"
        :btnClose="!modal.afterEmit"
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
    emits: ['enviado', 'omitido'],
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        usuario: null,
        contrasena: null,

        buttons: [
            { text: 'Omitir', action: 'omitir', tipo: 2, show: false },
            { text: 'Enviar whatsapp', action: 'enviarWhatsapp', show: true },
        ],
    }),
    created() {
        this.modal = this.useModals.mComprobanteWhatsapp
        this.modal.item.phone_to_send = this.normalizePhone(
            this.modal.item.phone_to_send || this.modal.item.cliente_datos?.telefono,
        )
        this.buttons[0].show = this.modal.afterEmit === true
    },
    methods: {
        normalizePhone(phone) {
            const digits = String(phone || '').replace(/\D/g, '')

            return digits.length == 11 && digits.startsWith('51') ? digits.slice(2) : digits
        },
        checkDatos() {
            const props = ['phone_to_send']
            if (incompleteData(this.modal.item, props)) {
                jmsg('warning', 'Ingrese un nro celular válido')
                return true
            }

            this.modal.item.phone_to_send = this.normalizePhone(this.modal.item.phone_to_send)

            if (!/^9\d{8}$/.test(this.modal.item.phone_to_send)) {
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
            this.$emit('enviado')
        },
        omitir() {
            this.useModals.show.mComprobanteWhatsapp = false
            this.$emit('omitido')
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

<template>
    <JdModal modal="mPedidoItemNota" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdTextArea v-model="modal.item.observacion" />
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdTextArea } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'

export default {
    components: {
        JdModal,
        JdTextArea,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),

        buttons: [
            {
                text: 'Grabar',
                action: 'grabar',
                show: true,
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mPedidoItemNota
    },
    methods: {
        async grabar() {
            this.useModals.show.mPedidoItemNota = false
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

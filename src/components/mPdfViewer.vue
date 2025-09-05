<template>
    <JdModal modal="mPdfViewer">
        <div class="container-datos">
            <iframe :src="this.modal.item" v-if="this.modal.item"></iframe>
        </div>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'

import { useModals } from '@/pinia/modals'
import { useAuth } from '@/pinia/auth'

export default {
    components: {
        JdModal,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),

        usuario: null,
        contrasena: null,

        // buttons: [
        //     { text: 'Cancelar', action: 'cancelar', tipo: '2', show: true },
        //     { text: 'Ingresar', action: 'ingresar', show: true },
        // ],
    }),
    created() {
        this.modal = this.useModals.mPdfViewer
    },
    methods: {},
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 40rem;
    gap: 1rem;
    height: 80vh;

    iframe {
        width: 100%;
        height: 100%;
    }
}
</style>

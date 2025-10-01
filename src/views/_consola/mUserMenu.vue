<template>
    <JdModal
        modal="mUserMenu"
        :hasHead="false"
        :hasBack="false"
        padding="0.5rem"
        :closeOnClickOutside="true"
        :closeOnInputEsc="true"
    >
        <div class="user-texts">
            <p
                class="user-name max-1line"
                :title="`${useAuth.usuario.nombres} ${useAuth.usuario.apellidos}`"
            >
                {{ useAuth.usuario.nombres }} {{ useAuth.usuario.apellidos }}
            </p>
            <p class="max-1line" :title="useAuth.usuario.cargo">
                <small>{{ useAuth.usuario.cargo }}</small>
            </p>
        </div>

        <ul>
            <li @click="openPreferenciasUsuario">
                <i class="fa-solid fa-sliders" @click="openPreferencias"></i>
                <span>Preferencias</span>
            </li>

            <li @click="updateSession">
                <i class="fa-solid fa-rotate-right"></i>
                <span>Actualizar sesión</span>
            </li>

            <li @click="logout">
                <i class="fa-solid fa-right-from-bracket"></i>
                <span>Salir del sistema</span>
            </li>
        </ul>
    </JdModal>
</template>

<script>
import { JdModal } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'

export default {
    components: {
        JdModal,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),

        modal: {},
    }),
    created() {
        this.modal = this.useModals.mUserMenu
    },
    methods: {
        async openPreferenciasUsuario() {
            this.useModals.setModal('mUserPreferences', 'Preferencias', null, null, true)
            this.useModals.show.mUserMenu = false
        },
        updateSession() {
            this.useAuth.login()
        },
        async logout() {
            await this.useAuth.logout(this.$router)
        },
    },
}
</script>

<style lang="scss" scoped>
.user-texts {
    border-bottom: var(--border);
    padding-bottom: 0.5rem;
    max-width: 12rem;
    display: none;
}

li {
    cursor: pointer;
    padding: 0.5rem 0.8rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
        background-color: var(--bg-color-hover);
    }

    * {
        font-size: 0.9rem;
    }
}

@media (max-width: 540px) {
    .user-texts {
        display: block !important;
    }
}
</style>

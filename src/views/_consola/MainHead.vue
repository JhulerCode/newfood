<template>
    <header>
        <div class="left">
            <div class="btn" @click="toogleNavbar">
                <i class="fa-solid fa-bars"></i>
            </div>

            <img src="@/assets/img/logo-black.png" v-if="!useAuth.isDarkMode">
            <img src="@/assets/img/logo-white.png" v-else>
        </div>

        <div class="right">
            <div class="actions">
                <ThemeConfig backGround="2"/>

                <ScreenConfig />
            </div>

            <div class="user-info" v-if="useAuth.usuario" @click="openUserMenu">
                <div class="user-texts">
                    <p class="user-name max-1line" :title="`${useAuth.usuario.nombres} ${useAuth.usuario.apellidos}`">
                        {{ useAuth.usuario.nombres }} {{ useAuth.usuario.apellidos }}
                    </p>
                    <p class="max-1line" :title="useAuth.usuario.cargo">
                        <small>{{ useAuth.usuario.cargo }}</small>
                    </p>
                </div>

                <div class="user-foto">
                    {{ useAuth.usuario.apellidos
                        ? useAuth.usuario.nombres[0] + useAuth.usuario.apellidos[0]
                        : useAuth.usuario.nombres?.slice(0, 2) }}
                </div>
            </div>
        </div>
    </header>
</template>

<script>
import ThemeConfig from '@/components/actions/ThemeConfig.vue'
import ScreenConfig from '@/components/actions/ScreenConfig.vue'

import { useAuth } from '@/pinia/auth.js'
import { useModals } from '@/pinia/modals'

// import { urls, patch } from '@/utils/crud'

export default {
    components: {
        ThemeConfig,
        ScreenConfig,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
    }),
    methods: {
        toogleNavbar() {
            this.useAuth.showNavbar = !this.useAuth.showNavbar
        },
        reloadWindow() {
            window.location.reload()
        },

        openUserMenu() {
            this.useModals.setModal('mUserMenu', 'Menu de usuario', null, null, true)
        },
    },
}
</script>

<style lang="scss" scoped>
header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.5rem 1.5rem;
    height: 4.5rem;

    .left {
        display: flex;
        align-items: center;
        gap: 1rem;

        .btn {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;

            &:hover {
                background-color: var(--bg-color);
            }
        }

        img {
            height: 2.5rem;
        }
    }

    >.right {
        display: flex;
        align-items: center;
        gap: 1rem;

        .actions {
            display: flex;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;

            .user-foto {
                width: 3rem;
                height: 3rem;
                border-radius: 50%;
                background-color: var(--bg-color-hover);
                border: 1px solid var(--text-color2);
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 1.2rem;
            }

            .user-texts {
                width: 10rem;
                overflow: hidden;
                text-align: right;

                .user-name {
                    font-size: 0.85rem;
                    font-weight: bold;
                }
            }
        }
    }
}

@media (max-width: 540px) {
    header {
        >.right {
            .actions {
                display: none;
            }
        }
    }
}
</style>
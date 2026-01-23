<template>
    <header>
        <div class="left"></div>

        <div class="right">
            <div class="actions">
                <div class="btn" @click="reloadWindow">
                    <i class="fa-solid fa-rotate-right"></i>
                </div>

                <div
                    class="btn"
                    @click="darkLigthMode"
                    :title="`Modo ${!useAuth.isDarkMode ? 'oscuro' : 'claro'}`"
                >
                    <i class="fa-regular fa-moon" v-if="!useAuth.isDarkMode"></i>
                    <i class="fa-regular fa-sun" v-else></i>
                </div>

                <div class="btn" @click="fullScreen" title="Pantalla completa">
                    <i class="fa-solid fa-expand"></i>
                </div>
            </div>
        </div>
    </header>
</template>

<script>
import { useAuth } from '@/pinia/auth.js'
import { useModals } from '@/pinia/modals'

import { urls, patch } from '@/utils/crud'

export default {
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
        async darkLigthMode() {
            const send = {
                id: this.useAuth.usuario.colaborador,
                theme: this.useAuth.isDarkMode == true ? '1' : '2',
            }

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(`${urls.colaboradores}/preferencias`, send, false)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useAuth.setTheme(send.theme)
        },
        fullScreen() {
            // Alterna el modo pantalla completa
            const doc = window.document
            const docEl = doc.documentElement

            const requestFullScreen =
                docEl.requestFullscreen ||
                docEl.mozRequestFullScreen ||
                docEl.webkitRequestFullscreen ||
                docEl.msRequestFullscreen
            const cancelFullScreen =
                doc.exitFullscreen ||
                doc.mozCancelFullScreen ||
                doc.webkitExitFullscreen ||
                doc.msExitFullscreen

            if (
                !doc.fullscreenElement &&
                !doc.mozFullScreenElement &&
                !doc.webkitFullscreenElement &&
                !doc.msFullscreenElement
            ) {
                requestFullScreen.call(docEl)
            } else {
                cancelFullScreen.call(doc)
            }
        },
    },
}
</script>

<style lang="scss" scoped>
header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    border-bottom: var(--border);

    .left {
        display: flex;
        gap: 0.5rem;
    }

    .right {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0 1.5rem 0 0;

        .actions {
            display: flex;
        }
    }

    .btn {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;

        i {
            font-size: 1.2rem;
            color: var(--text-color2);
        }

        &:hover {
            background-color: var(--bg-color);

            * {
                color: var(--primary-color);
            }
        }
    }
}
</style>

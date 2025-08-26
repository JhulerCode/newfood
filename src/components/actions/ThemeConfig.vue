<template>
    <div
        class="btn"
        :class="{ 'bg-color2': backGround == 2 }"
        @click="darkLigthMode"
        :title="`Modo ${!useAuth.isDarkMode ? 'oscuro' : 'claro'}`"
    >
        <iSun v-if="useAuth.isDarkMode" height="1.2rem" width="1.2rem" />
        <iMoon v-else height="1.2rem" width="1.2rem" />
    </div>
</template>

<script>
import iMoon from '@/components/icons/iMoon.vue'
import iSun from '@/components/icons/iSun.vue'

import { useAuth } from '@/pinia/auth.js'

import { urls, patch } from '@/utils/crud'

export default {
    props: {
        backGround: { type: [Number, String], default: 1 },
    },
    components: {
        iMoon,
        iSun,
    },
    data: () => ({
        useAuth: useAuth(),
    }),
    methods: {
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
    },
}
</script>

<style lang="scss" scoped>
.btn {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    &:hover {
        background-color: var(--bg-color2);
    }
}

.bg-color2 {
    &:hover {
        background-color: var(--bg-color) !important;
    }
}
</style>

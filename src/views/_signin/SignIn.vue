<template>
    <main class="signin">
        <SignInLeft />

        <div class="card">
            <div class="actions">
                <ThemeConfig />
            </div>

            <div class="container-logo">
                <img src="@/assets/img/logo-black.png" v-if="!useAuth.isDarkMode">
                <img src="@/assets/img/logo-white.png" v-else>
            </div>

            <div class="info">
                <strong>¡Bienvenido!</strong>
                <p>Ingrese sus datos de acceso</p>
            </div>

            <JdInput :nec="true" label="Usuario" v-model="usuario" height="3" class="mrg-btm1" />
            <JdInputPassword :nec="true" label="Contraseña" v-model="contrasena" height="3" class="mrg-btm2" />
            <JdButton text="INGRESAR" @click="signin()" class="boton-ingresar" />
        </div>
    </main>
</template>

<script>
import JdInput from '@/components/inputs/JdInput.vue'
import JdInputPassword from '@/components/inputs/JdInputPassword.vue'
import JdButton from '@/components/inputs/JdButton.vue'
import ThemeConfig from './ThemeConfig.vue'
import SignInLeft from './SignInLeft.vue'

import { useAuth } from '@/pinia/auth'

import { host, urls, post } from '@/utils/crud'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdInput,
        JdInputPassword,
        JdButton,
        ThemeConfig,
        SignInLeft,
    },
    data: () => ({
        useAuth: useAuth(),

        logo_uri: '',

        usuario: '', contrasena: '', token: '',
        shown: false,

        host,
    }),
    created() {
        if (this.useAuth.isDarkMode) {
            document.body.classList.add('dark-mode')
        }
    },
    mounted() {
        const remembered = localStorage.getItem('remember-usuario')
        if (remembered) {
            this.usuario = remembered
            // this.contrasena = remembered
        }
    },
    methods: {
        async signin() {
            if (this.usuario == '' || this.contrasena == '') {
                return jmsg('warning', 'Ingrese usuario y contraseña')
            }

            const auth = {
                usuario: this.usuario,
                contrasena: this.contrasena,
            }

            this.useAuth.setLoading(true, 'Ingresando...')
            const { code, token } = await post(urls.signin, auth, 'Acceso correcto')
            this.useAuth.setLoading(false)

            if (code != 0) return

            this.useAuth.token = token

            localStorage.setItem('remember-usuario', this.usuario)

            this.$router.replace({ name: 'ConsolaView' })
        },
    }
}
</script>

<style lang="scss" scoped>
.signin {
    height: 100dvh;
    width: 100vw;
    overflow: hidden;
    display: flex;
}

.card {
    height: 100dvh;
    width: 35%;
    max-width: 95%;
    padding: 0 5rem;
    text-align: center;
    background-color: var(--bg-color);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .actions {
        position: absolute;
        top: 2rem;
        right: 2rem;
        display: flex;

        .btn {
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;

            i {
                color: var(--text-color2);
            }

            &:hover {
                // background-color: var(--bg-color2);
                // border: solid 1px var(--primary-color);

                * {
                    color: var(--primary-color);
                }
            }
        }
    }

    .container-logo {
        height: 5rem;
        margin-bottom: 2rem;

        img {
            max-height: 100%;
        }
    }

    .info {
        margin-bottom: 2rem;

        strong {
            font-size: 1.4rem;
        }

        p {
            margin-top: 1rem;
            color: var(--text-color2);
        }
    }

    .boton-ingresar {
        width: 100%;
        height: 3rem;
    }
}


@media (max-width: 900px) {
    .card {
        width: 100vw !important;
        max-width: 100vw !important;
    }
}
</style>
<template>
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
        </div>

        <div class="container-logo">
            <img :src="empresa_logo" />
        </div>

        <strong v-if="empresa?.razon_social" class="empresa-nombre">
            {{ empresa.razon_social }}
        </strong>

        <div class="info">
            <strong>¡Bienvenido!</strong>
            <p>Ingrese sus datos de acceso</p>
        </div>

        <JdInput :nec="true" label="Usuario" v-model="usuario" height="3" class="mrg-btm1" />

        <JdInputPassword
            :nec="true"
            label="Contraseña"
            v-model="contrasena"
            height="3"
            class="mrg-btm2"
        />
        <JdButton text="INGRESAR" @click="signin()" class="boton-ingresar" />

        <small>v{{ useAuth.app_version }}</small>
    </div>
</template>

<script>
import { JdInput, JdInputPassword, JdButton } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'

import defaultLogo from '@/assets/img/logo.webp'
import { host, urls, post, getSubdominio } from '@/utils/crud'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdInput,
        JdInputPassword,
        JdButton,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),

        usuario: '',
        contrasena: '',
        empresa: null,
        shown: false,
    }),
    created() {
        this.loadEmpresa()
    },
    mounted() {
        const remembered = localStorage.getItem('remember-usuario')
        if (remembered) {
            this.usuario = remembered
            // this.contrasena = remembered
        }
    },
    methods: {
        reloadWindow() {
            window.location.reload()
        },
        async darkLigthMode() {
            const send = {
                id: this.useAuth.usuario.id,
                theme: this.useAuth.isDarkMode == true ? '1' : '2',
            }

            this.useAuth.setTheme(send.theme)
        },

        async loadEmpresa() {
            try {
                const subdominio = getSubdominio()
                const response = await fetch(
                    `${host}/api/public/empresas/${encodeURIComponent(subdominio)}`,
                )
                if (!response.ok) return

                const res = await response.json()
                if (res.code != 0) return

                this.empresa = res.data
            } catch {
                this.empresa = null
            }
        },

        async signin() {
            if (this.usuario == '' || this.contrasena == '') {
                return jmsg('warning', 'Ingrese usuario y contraseña')
            }

            const auth = {
                usuario: this.usuario,
                contrasena: this.contrasena,
                client_info: this.getClientInfo(),
            }

            this.useAuth.setLoading(true, 'Ingresando...')
            const result = await post(urls.signin, auth, 'Acceso correcto')
            this.useAuth.setLoading(false)

            if (result.code != 0 || !result.access_token) return

            this.useAuth.setToken(result.access_token)
            if (result.sucursal_id) this.useAuth.sucursal = { id: result.sucursal_id }

            const login = await this.useAuth.login()
            if (!login) return

            this.useAuth.setLoading(true, 'Preparando vista...')
            localStorage.setItem('remember-usuario', this.usuario)
            this.$router.replace({ name: 'ConsolaView' })
            this.useVistas.showVista(this.useAuth.vistaInicial)
        },
        getClientInfo() {
            return {
                user_agent: navigator.userAgent,
                platform: navigator.userAgentData?.platform || navigator.platform || null,
                language: navigator.language,
                languages: navigator.languages,
                screen: {
                    width: window.screen?.width,
                    height: window.screen?.height,
                    pixel_ratio: window.devicePixelRatio,
                },
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            }
        },
    },
    computed: {
        empresa_logo() {
            return this.empresa?.logo_url || defaultLogo
        },
    },
}
</script>

<style lang="scss" scoped>
.right {
    // width: 30rem;
    // max-width: 80%;
    padding: 5rem 5rem;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    border-radius: 0 2rem 2rem 0;
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);

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
            background-color: var(--bg-color2);

            i {
                color: var(--text-color2);
            }

            &:hover {
                * {
                    color: var(--text-color);
                }
            }
        }
    }

    .container-logo {
        height: 8rem;
        max-width: 20rem;
        margin-bottom: 1rem;

        img {
            border-radius: 1rem;
            max-height: 100%;
            max-width: 100%;
        }
    }

    .empresa-nombre {
        max-width: 24rem;
        margin-bottom: 1.5rem;
        color: var(--text-color);
        font-size: 1.05rem;
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
</style>

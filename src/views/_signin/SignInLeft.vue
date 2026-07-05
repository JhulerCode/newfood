<template>
    <div class="left">
        <div class="container-logo">
            <img :src="empresa_logo" />
        </div>

        <strong v-if="empresa?.razon_social" class="empresa-nombre">
            {{ empresa.razon_social }}
        </strong>
    </div>
</template>

<script>
import defaultLogo from '@/assets/img/logo.webp'
import { urls, get, getSubdominio } from '@/utils/crud'

export default {
    data: () => ({
        empresa: null,
    }),
    computed: {
        empresa_logo() {
            return this.empresa?.logo_url || defaultLogo
        },
    },
    created() {
        this.loadEmpresa()
    },
    methods: {
        async loadEmpresa() {
            try {
                const subdominio = getSubdominio()
                const res = await get(`${urls.public}/empresas/${encodeURIComponent(subdominio)}`)
                if (res.code != 0) return

                this.empresa = res.data
            } catch {
                this.empresa = null
            }
        },
    },
}
</script>

<style lang="scss" scoped>
.left {
    padding: 5rem 5rem;
    border-radius: 2rem 0 0 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    // background: linear-gradient(135deg, #0f4c75, #2492c2);
    // background: linear-gradient(135deg, var(--primary-color), #6acbe0);
    // background: linear-gradient(135deg, #0f4c75, #6acbe0);
    // background: linear-gradient(135deg, #2492c2e6, #6acbe0b3);
    // backdrop-filter: blur(3px);
    // -webkit-backdrop-filter: blur(3px);

    .container-logo {
        max-height: 8rem;
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
        color: var(--text-color);
        font-size: 1.05rem;
        text-align: center;
    }
}
</style>

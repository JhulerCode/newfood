<template>
    <section class="main-center">
        <vColaboradores v-if="useVistas.show.vColaboradores" />
    </section>
</template>

<script>
import { useVistas } from '@/pinia/vistas.js'

import vColaboradores from '@/views/ajustes/colaboradores/vColaboradores.vue';

export default {
    components: {
        vColaboradores
    },
    data: () => ({
        useVistas: useVistas()
    })
}
</script>

<style lang="scss">
.main-center {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: hidden;

    .vista {
        background-color: var(--bg-color);
        padding: 2rem 2rem;
        border-radius: 0.5rem;

        >.head {
            margin-bottom: 1rem;
            display: flex;
            justify-content: space-between;
            // align-items: center;
            gap: 1rem;
            flex-wrap: wrap;
            border-bottom: var(--border);
            padding-bottom: 1rem;

            strong {
                font-size: 1.4rem;
            }

            .buttons {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }
        }
    }

    .vista-fill{
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
}
</style>
<template>
    <section class="main-center">
        <vEmpresa v-if="useVistas.show.vEmpresa" />
        <vColaboradores v-if="useVistas.show.vColaboradores" />
        <VPagoComprobantes v-if="useVistas.show.vPagoComprobantes" />
        <vPagoMetodos v-if="useVistas.show.vPagoMetodos" />
        <vImpresoras v-if="useVistas.show.vImpresoras" />
        <vCajas v-if="useVistas.show.vCajas" />
        <vProduccionAreas v-if="useVistas.show.vProduccionAreas" />
    </section>
</template>

<script>
import { useVistas } from '@/pinia/vistas.js'

import vEmpresa from '@/views/ajustes/empresa/vEmpresa.vue'
import vColaboradores from '@/views/ajustes/colaboradores/vColaboradores.vue'
import VPagoComprobantes from '@/views/ajustes/pago_comprobantes/vPagoComprobantes.vue'
import vPagoMetodos from '@/views/ajustes/pago_metodos/vPagoMetodos.vue'
import vImpresoras from '@/views/ajustes/impresoras/vImpresoras.vue'
import vCajas from '@/views/ajustes/cajas/vCajas.vue'
import vProduccionAreas from '@/views/ajustes/produccion_areas/vProduccionAreas.vue'

export default {
    components: {
        vEmpresa,
        vColaboradores,
        VPagoComprobantes,
        vPagoMetodos,
        vImpresoras,
        vCajas,
        vProduccionAreas,
    },
    data: () => ({
        useVistas: useVistas(),
    }),
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

        > .head {
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

    .vista-fill {
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
    }
}
</style>

<template>
    <section class="main-center">
        <vProveedores v-if="useVistas.show.vProveedores" />
        <vCompras v-if="useVistas.show.vCompras" />

        <vClientes v-if="useVistas.show.vClientes" />
        <vPedidos v-if="useVistas.show.vPedidos" />
        <vComanda v-if="useVistas.show.vComanda" />
        <vEmitirComprobante v-if="useVistas.show.vEmitirComprobante" />
        <vPos v-if="useVistas.show.vPos" />

        <vCajaResumen v-if="useVistas.show.vCajaResumen" />
        <vCajaMovimientos v-if="useVistas.show.vCajaMovimientos" />

        <vInventarioInsumos v-if="useVistas.show.vInventarioInsumos" />
        <vInventarioProductos v-if="useVistas.show.vInventarioProductos" />

        <vReportePedidos v-if="useVistas.show.vReportePedidos" />
        <vReporteComprobantes v-if="useVistas.show.vReporteComprobantes" />
        <VComprobantesDetallado v-if="useVistas.show.vComprobantesDetallado" />
        <vCajaAperturas v-if="useVistas.show.vCajaAperturas" />
        <vDineroMovimientos v-if="useVistas.show.vDineroMovimientos" />
        <vDashboard v-if="useVistas.show.vDashboard" />

        <vEmpresa v-if="useVistas.show.vEmpresa" />
        <vSucursales v-if="useVistas.show.vSucursales" />
        <vSalones v-if="useVistas.show.vSalones" />
        <vComprobanteTipos v-if="useVistas.show.vComprobanteTipos" />
        <vPagoMetodos v-if="useVistas.show.vPagoMetodos" />
        <vArticuloCategorias v-if="useVistas.show.vArticuloCategorias" />
        <vInsumos v-if="useVistas.show.vInsumos" />
        <vProductos v-if="useVistas.show.vProductos" />
        <vCombos v-if="useVistas.show.vCombos" />
        <vColaboradores v-if="useVistas.show.vColaboradores" />

        <vTenants v-if="useVistas.show.vTenants" />
    </section>
</template>

<script>
import { useVistas } from '@/pinia/vistas.js'

//----- COMPRAS --- //
import vProveedores from '@/views/compras/proveedores/vProveedores.vue'
import vCompras from '@/views/compras/compras/vCompras.vue'

//----- VENTAS --- //
import vClientes from '@/views/ventas/clientes/vClientes.vue'
import vPedidos from '@/views/ventas/pedidos/vPedidos.vue'
import vComanda from '@/views/ventas/pedidos/vComanda.vue'
import vEmitirComprobante from '@/views/ventas/pedidos/vEmitirComprobante.vue'
import vPos from '@/views/ventas/pedidos/vPos.vue'

//----- CAJA --- //
import vCajaResumen from '@/views/caja/resumen/vCajaResumen.vue'
import vCajaMovimientos from '@/views/caja/movimientos/vCajaMovimientos.vue'

//----- INVENTARIO --- //
import vInventarioInsumos from '@/views/inventario/vInventarioInsumos.vue'
import vInventarioProductos from '@/views/inventario/vInventarioProductos.vue'

//----- REPORTES --- //
import vReportePedidos from '@/views/reportes/pedidos/vReportePedidos.vue'
import vReporteComprobantes from '@/views/reportes/comprobantes/vReporteComprobantes.vue'
import VComprobantesDetallado from '../reportes/comprobantes_detallado/vComprobantesDetallado.vue'
import vCajaAperturas from '@/views/reportes/caja_aperturas/vCajaAperturas.vue'
import vDineroMovimientos from '@/views/reportes/dinero_movimientos/vDineroMovimientos.vue'
import vDashboard from '@/views/reportes/dashboard/vDashboard.vue'

//----- AJUSTES --- //
import vEmpresa from '@/views/ajustes/empresa/vEmpresa.vue'
import vSucursales from '@/views/ajustes/sucursales/vSucursales.vue'
import vSalones from '@/views/ajustes/salones/vSalones.vue'
import vComprobanteTipos from '@/views/ajustes/comprobante_tipos/vComprobanteTipos.vue'
import vPagoMetodos from '@/views/ajustes/pago_metodos/vPagoMetodos.vue'
import vArticuloCategorias from '@/views/ajustes/categorias/vArticuloCategorias.vue'
import vInsumos from '@/views/ajustes/insumos/vInsumos.vue'
import vProductos from '@/views/ajustes/productos/vProductos.vue'
import vCombos from '@/views/ajustes/combos/vCombos.vue'
import vColaboradores from '@/views/ajustes/colaboradores/vColaboradores.vue'

//--- ADMIN ---//
import vTenants from '@/views/_admin/tenants/vTenants.vue'

export default {
    components: {
        vProveedores,
        vCompras,

        vClientes,
        vPedidos,
        vComanda,
        vEmitirComprobante,
        vPos,

        vCajaResumen,
        vCajaMovimientos,

        vInventarioInsumos,
        vInventarioProductos,


        vReportePedidos,
        vReporteComprobantes,
        VComprobantesDetallado,
        vCajaAperturas,
        vDineroMovimientos,
        vDashboard,

        vEmpresa,
        vSucursales,
        vSalones,
        vComprobanteTipos,
        vPagoMetodos,
        vArticuloCategorias,
        vInsumos,
        vProductos,
        vCombos,
        vColaboradores,

        vTenants,
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

    // .tablero {
    //     padding: 2rem 2rem;
    //     overflow-y: auto;
    // }

    .vista {
        // background-color: var(--bg-color);
        // border-radius: 0.5rem;
        padding: 2rem 2rem 1rem 2rem;
        overflow-y: auto;

        > .head {
            margin-bottom: 1rem;
            display: flex;
            justify-content: space-between;
            gap: 1rem;
            flex-wrap: wrap;
            // border-bottom: var(--border);
            // padding-bottom: 1rem;

            strong {
                font-size: 1.4rem;
            }

            .buttons {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
            }
        }

        .card {
            padding: 1rem;
            background-color: var(--bg-color);
            border-radius: 0.5rem;
            // box-shadow: 0 0 0.5rem var(--shadow-color);
            overflow: hidden;

            .card-head {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 1.5rem;
            }
        }
    }

    .vista-fill {
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        // padding: 2rem 2rem;
    }
}

@media (max-width: 540px) {
    .main-center {
        .vista {
            padding: 1rem 1rem;
        }
    }
}
</style>

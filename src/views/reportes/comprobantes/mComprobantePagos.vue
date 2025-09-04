<template>
    <JdModal
        modal="mComprobantePagos"
        :buttons="buttons"
        @button-click="(action) => this[action]()"
    >
        <div class="container-pagos" v-if="modal.mode == 1 || modal.mode == 2">
            <div class="head">
                Métodos de pago

                <p>
                    <small>Por pagar:</small>
                    {{ redondear(modal.porPagar) }}
                </p>

                <p>
                    <small>Vuelto:</small>
                    {{ redondear(modal.vuelto) }}
                </p>
            </div>

            <ul class="container-pago-metodos">
                <li
                    v-for="(a, i) in modal.pago_metodos"
                    :key="i"
                    :style="{ 'border-color': a.color }"
                >
                    <p>{{ a.nombre }}</p>

                    <div style="display: flex">
                        <JdInput type="number" v-model="a.monto" @input="calcularPorPagar(a)" />

                        <!-- <JdButton
                            icon="fa-regular fa-hand-point-left"
                            title="Exacto"
                            :small="true"
                            :tipo="2"
                            @click="pagoExacto(a)"
                        /> -->
                    </div>
                </li>
            </ul>
        </div>

        <div class="datos" v-if="modal.mode == 3">
            <JdTable
                :columns="columns"
                :datos="modal.pagos || []"
                :colNro="true"
                :colAct="true"
                :rowOptions="tableRowOptions"
                @rowOptionSelected="runMethod"
                :reload="loadPagos"
                class="table-pagos"
            >
            </JdTable>
        </div>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdInput from '@/components/inputs/JdInput.vue'
import JdTable from '@/components/JdTable.vue'
// import JdButton from '@/components/inputs/JdButton.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, patch } from '@/utils/crud'
import { redondear } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        // JdButton,
        JdTable,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        redondear,

        columns: [
            {
                id: 'fecha',
                title: 'Fecha',
                format: 'date',
                width: '7rem',
                show: true,
                sort: true,
                seek: true,
            },
            {
                id: 'pago_metodo',
                title: 'Método de pago',
                prop: 'pago_metodo1.nombre',
                width: '10rem',
                show: true,
                sort: true,
                seek: true,
            },
            {
                id: 'monto',
                title: 'Monto',
                format: 'currency',
                moneda: 'S/',
                width: '7rem',
                show: true,
                sort: true,
                seek: true,
            },
            // {
            //     id: 'estado',
            //     title: 'Estado',
            //     type: 'select',
            //     prop: 'estado1.nombre',
            //     format: 'estado',
            //     width: '8rem',
            //     show: true,
            //     seek: false,
            //     sort: false,
            // },
        ],
        tableRowOptions: [
            {
                label: 'Editar',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editar',
                permiso: 'vReporteComprobantes:editarPago',
            },
            {
                label: 'Eliminar',
                icon: 'fa-regular fa-trash-can',
                action: 'eliminar',
                permiso: 'vReporteComprobantes:eliminarPago',
                ocultar: { estado: 0 },
            },
        ],
        buttons: [{ text: 'Grabar', action: 'grabar', show: true }],
    }),
    async created() {
        this.modal = this.useModals.mComprobantePagos

        // this.showButtons()
        if (this.modal.mode == 1 || this.modal.mode == 2) {
            await this.loadPagoMetodos()
            this.calcularPorPagar()
        }
        if (this.modal.mode == 3) this.loadPagos()
    },
    methods: {
        // showButtons() {
        //     if (this.modal.mode == 2) {
        //         this.buttons[0].show = true
        //     }
        // },
        async loadPagos() {
            const qry = {
                fltr: {
                    comprobante: { op: 'Es', val: this.modal.comprobante.id },
                },
            }

            this.useAuth.updateQuery(this.columns, qry)
            qry.incl = ['pago_metodo1']

            this.modal.pagos = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.dinero_movimientos}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.pagos = res.data
        },
        async loadPagoMetodos() {
            const qry = {
                fltr: { activo: { op: 'Es', val: true } },
                cols: ['nombre', 'color'],
            }

            this.modal.pago_metodos = []
            this.useAuth.setLoading(true, 'Cargando...')
            this.modal.pago_metodosLoaded = false
            const res = await get(`${urls.pago_metodos}?qry=${JSON.stringify(qry)}`)
            this.modal.pago_metodosLoaded = true
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.modal.pago_metodos = res.data
        },
        calcularPorPagar() {
            let pagos_monto = 0

            for (const a of this.modal.pago_metodos) {
                if (a.monto) pagos_monto += Number(a.monto)
            }

            if (pagos_monto == 0) {
                this.modal.porPagar = this.modal.comprobante.monto
                this.modal.vuelto = 0
            } else if (pagos_monto <= this.modal.comprobante.monto) {
                this.modal.porPagar = this.modal.comprobante.monto - pagos_monto
                this.modal.vuelto = 0
            } else {
                this.modal.porPagar = 0
                this.modal.vuelto = pagos_monto - this.modal.comprobante.monto
            }
        },

        checkDatos() {
            if (redondear(this.modal.porPagar) > 0) {
                jmsg('warning', 'Importes de pago insuficientes')

                return true
            }

            return false
        },
        shapeDatos() {
            this.modal.comprobante.modal_mode = this.modal.mode
            this.modal.comprobante.pago_metodos = this.modal.pago_metodos
        },
        async grabar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await patch(`${urls.comprobantes}/actualizar-pagos`, this.modal.comprobante)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.$emit('pagosModificados', this.modal.comprobante)
            this.useModals.show.mComprobantePagos = false
        },
    },
}
</script>

<style lang="scss" scoped>
.container-pagos {
    overflow-y: hidden;
    display: grid;
    grid-template-rows: auto 1fr;
    border-radius: 0.3rem;

    .head {
        background-color: var(--bg-color2);
        padding: 0.5rem;
        display: flex;
        gap: 1rem;
    }

    .container-pago-metodos {
        padding: 0.5rem;
        display: grid;
        grid-template-columns: 15rem 15rem;
        gap: 1rem;
        max-height: 10rem;
        overflow-y: auto;

        li {
            border: 2px solid;
            display: grid;
            grid-template-columns: 7rem 1fr;
            padding: 0.5rem;
            border-radius: 0.5rem;
        }
    }
}

.container-datos {
    display: grid;
    grid-template-columns: 10rem 10rem;
    gap: 0.5rem;
}
</style>

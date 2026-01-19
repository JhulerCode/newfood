<template>
    <JdModal modal="mTransaccion" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <div class="left">
                <JdInput
                    type="date"
                    label="Fecha"
                    :nec="true"
                    v-model="modal.transaccion.fecha"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/3"
                />
                <!-- @change="changeDate" -->

                <JdSelect
                    :label="modal.transaccion.tipo == 1 ? 'Proveedor' : 'Cliente'"
                    :nec="true"
                    v-model="modal.transaccion.socio"
                    :lista="modal.socios || []"
                    mostrar="nombres"
                    :loaded="modal.sociosLoaded"
                    @reload="loadSocios()"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/5"
                />
                <!-- @elegir="setSocio" -->

                <JdSelect
                    label="Comprobante"
                    :nec="true"
                    v-model="modal.transaccion.compra_comprobante"
                    :lista="modal.comprobante_tipos || []"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/4"
                />
                <!-- :disabled="modal.mode == 3" -->

                <JdInput
                    label="Serie"
                    :nec="true"
                    v-model="modal.transaccion.compra_comprobante_serie"
                    style="grid-column: 1/3"
                    :disabled="modal.mode == 3"
                />

                <JdInput
                    label="Correlativo"
                    :nec="true"
                    v-model="modal.transaccion.compra_comprobante_correlativo"
                    style="grid-column: 3/5"
                    :disabled="modal.mode == 3"
                />
            </div>

            <div class="right">
                <JdSelect
                    label="Estado"
                    v-model="modal.transaccion.estado"
                    :lista="modal.transaccion_estados || []"
                    :disabled="true"
                    style="grid-column: 1/3"
                />

                <JdSelect
                    label="Condición de pago"
                    :nec="true"
                    v-model="modal.transaccion.pago_condicion"
                    :lista="modal.pago_condiciones || []"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/5"
                />
            </div>
        </div>

        <mTransaccionItems ref="vItems" />

        <div class="botom">
            <div class="left">
                <JdTextArea
                    label="Observación"
                    v-model="modal.transaccion.observacion"
                    :disabled="modal.mode == 3"
                />

                <JdTextArea
                    label="Motivo de anulación"
                    v-model="modal.transaccion.anulado_motivo"
                    :disabled="true"
                    v-if="modal.transaccion.anulado_motivo"
                />
            </div>

            <div class="totales">
                <span>Ope. gravadas:</span>
                <p>{{ redondear(modal.mtoOperGravadas) }}</p>

                <span>Ope. exoneradas:</span>
                <p>{{ redondear(modal.mtoOperExoneradas) }}</p>

                <span>Ope. inafectas:</span>
                <p>{{ redondear(modal.mtoOperInafectas) }}</p>

                <span>Subtotal:</span>
                <p>{{ redondear(modal.valorVenta) }}</p>

                <span>Impuesto:</span>
                <p>{{ redondear(modal.mtoIGV) }}</p>

                <strong>Importe total:</strong>
                <strong class="total">
                    {{ getItemFromArray(modal.transaccion.moneda, modal.monedas, 'simbolo') }}
                    {{ redondear(modal.mtoImpVenta) }}
                </strong>
            </div>
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdSelect, JdTextArea } from '@jhuler/components'

import mTransaccionItems from './mTransaccionItems.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch } from '@/utils/crud'
import { getItemFromArray, redondear, incompleteData } from '@/utils/mine'
import { jqst, jmsg } from '@/utils/swal'

import dayjs from 'dayjs'

export default {
    components: {
        JdModal,
        JdInput,
        JdSelect,
        JdTextArea,
        mTransaccionItems,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        getItemFromArray,
        redondear,

        modal: {},

        buttons: [
            { text: 'Guardar avance', action: 'guardarAvance', tipo: '2' },
            { text: 'Nuevo', action: 'nuevo', tipo: '2', show: true },
            { text: 'Grabar', action: 'grabar' },
            { text: 'Actualizar', action: 'modificar' },
        ],
    }),
    async created() {
        this.modal = this.useModals.mTransaccion

        this.showButtons()

        this.loadDatosSistema()
        // this.loadPagoComprobantes()
        // this.loadComprobanteTipos()

        if (this.modal.mode == 1) {
            this.setTotalesCero()
            this.loadSocios()
        } else if (this.modal.mode == 2) {
            this.modal.sociosLoaded = true
        }
    },
    methods: {
        showButtons() {
            if (this.modal.mode == 1) {
                this.buttons[0].show = true
                this.buttons[2].show = true
            }
            if (this.modal.mode == 2) {
                this.buttons[3].show = true
            }
        },

        setTotalesCero() {
            this.modal.mtoOperGravadas = 0
            this.modal.mtoOperExoneradas = 0
            this.modal.mtoOperInafectas = 0
            this.modal.valorVenta = 0
            this.modal.mtoIGV = 0
            this.modal.mtoImpVenta = 0
        },
        initPedido() {
            this.modal.transaccion = {
                tipo: this.modal.transaccion.tipo,
                fecha: dayjs().format('YYYY-MM-DD'),
                estado: 1,
                transaccion_items: [],
            }

            this.modal.mode = 1
            // this.modal.socio = {}
            this.setTotalesCero()
        },
        async nuevo() {
            if (this.modal.mode != 1) this.loadSocios()

            if (this.modal.mode == 3 || this.modal.transaccion.transaccion_items.length == 0) {
                this.initPedido()
            } else {
                const resQst = await jqst('¿Está seguro de generar un nuevo pedido?')
                if (resQst.isConfirmed) this.initPedido()
            }
        },

        // changeDate() {
        //     for (const a of this.modal.transaccion.transaccion_items) {
        //         a.lote = this.setLote()
        //     }
        // },
        // setLote() {
        //     return `${obtenerNumeroJuliano(this.modal.transaccion.fecha)}-${Math.floor(Math.random() * 90 + 10)}`
        // },

        // setSocio(item) {
        //     this.modal.socio = { ...item }
        // },

        checkDatos() {
            const props = [
                'tipo',
                'fecha',
                'socio',
                'compra_comprobante',
                'compra_comprobante_serie',
                'compra_comprobante_correlativo',
                'pago_condicion',
            ]

            if (incompleteData(this.modal.transaccion, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            if (this.modal.transaccion.transaccion_items.length == 0) {
                jmsg('warning', 'Agregue al menos un articulo')
                return true
            }

            for (const a of this.modal.transaccion.transaccion_items) {
                const props1 = ['articulo', 'cantidad', 'pu', 'igv_afectacion', 'igv_porcentaje']

                if (incompleteData(a, props1)) {
                    jmsg('warning', 'Ingrese los datos necesarios de los articulos')
                    return true
                }
            }

            return false
        },
        shapeDatos() {
            this.modal.transaccion.monto = this.modal.mtoImpVenta.toFixed(2)
        },
        // async grabar1() {
        //     if (this.checkDatos()) return
        //     this.shapeDatos()
        //     console.log(this.modal.transaccion)
        // },
        async grabar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(urls.transacciones, this.modal.transaccion)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const vista = this.modal.transaccion.tipo == 1 ? 'vCompras' : 'vVentas'
            this.useVistas.addItem(vista, 'transacciones', res.data, 'first')
            this.useModals.show.mTransaccion = false
        },
        async guardarAvance() {
            const resQst = await jqst('¿Está seguro de guardar y reemplazar el guardado anterior?')
            if (resQst.isConfirmed) {
                const card = this.modal.transaccion.tipo == 1 ? 'mCompra' : 'mVenta'
                this.useAuth.avances[card] = this.modal.transaccion
                this.useModals.show.mTransaccion = false
            }
        },
        async modificar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Modificando...')
            const res = await patch(urls.transacciones, this.modal.transaccion)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const vista = this.modal.transaccion.tipo == 1 ? 'vCompras' : 'vVentas'
            this.useVistas.updateItem(vista, 'transacciones', res.data)
            this.useModals.show.mTransaccion = false
        },

        async loadSocios() {
            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: this.modal.transaccion.tipo },
                    activo: { op: 'Es', val: true },
                },
                cols: ['nombres'],
            }

            this.modal.socios = []
            this.modal.sociosLoaded = false
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            this.modal.sociosLoaded = true

            if (res.code !== 0) return

            this.modal.socios = res.data

            // if (this.modal.transaccion.socio) {
            //     this.modal.socio = this.modal.socios.find(
            //         (a) => a.id == this.modal.transaccion.socio,
            //     )
            // }
        },
        // async loadPagoComprobantes() {
        //     const qry = {
        //         fltr: {},
        //         cols: ['nombre', 'serie', 'correlativo'],
        //     }

        //     this.useAuth.setLoading(true, 'Cargando...')
        //     const res = await get(`${urls.comprobante_tipos}?qry=${JSON.stringify(qry)}`)
        //     this.useAuth.setLoading(false)

        //     if (res.code != 0) return

        //     this.modal.comprobante_tipos = res.data
        // },
        // async loadComprobanteTipos() {
        //     this.useAuth.setLoading(true, 'Cargando...')
        //     this.modal.comprobanteTiposLoaded = false
        //     const res = await get(urls.empresa)
        //     this.useAuth.setLoading(false)
        //     this.modal.comprobanteTiposLoaded = true

        //     if (res.code != 0) return
        //     console.log(res.data)
        //     this.modal.comprobante_tipos = res.data.comprobante_tipos
        // },
        async loadDatosSistema() {
            const qry = ['transaccion_estados', 'pago_condiciones', 'comprobante_tipos']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;
    gap: 2rem;

    .left {
        display: grid;
        grid-template-columns: repeat(4, 7rem);
        gap: 0.5rem;
        height: fit-content;
    }

    .right {
        display: grid;
        grid-template-columns: repeat(4, 5rem);
        gap: 0.5rem;
        height: fit-content;
    }
}

.botom {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    gap: 2rem;

    .left {
        display: grid;
        grid-template-columns: 30rem;
        gap: 0.5rem;
        height: fit-content;
    }

    .totales {
        background-color: var(--bg-color2);
        padding: 1rem;
        border-radius: 0.5rem;
        display: grid;
        grid-template-columns: 10rem 10rem;
        gap: 0.5rem;
        align-items: center;
        height: fit-content;

        p {
            text-align: right;
        }

        .total {
            font-size: 1.4rem;
            text-align: right;
        }
    }
}
</style>

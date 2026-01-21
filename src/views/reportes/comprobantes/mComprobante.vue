<template>
    <JdModal modal="mComprobante" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdInput
                label="Fecha"
                v-model="modal.comprobante.fecha_emision"
                :disabled="true"
                style="grid-column: 1/3"
            />

            <i
                class="fa-regular fa-copy"
                style="cursor: pointer"
                title="Copiar id"
                @click="copyToClipboard(modal.comprobante.id)"
            ></i>

            <JdInput
                label="Serie y correlativo"
                v-model="modal.comprobante.serie_correlativo"
                :disabled="true"
                style="grid-column: 1/3"
            />

            <JdInput
                label="Atención"
                v-model="atencion"
                :disabled="true"
                style="grid-column: 1/3"
            />

            <JdInput
                label="Nro doc"
                v-model="modal.comprobante.cliente_datos.doc_numero"
                :disabled="true"
                style="grid-column: 1/3"
            />

            <JdInput
                label="Cliente"
                v-model="modal.comprobante.cliente_datos.razon_social_nombres"
                :disabled="true"
                style="grid-column: 1/4"
            />

            <JdInput
                label="Dirección"
                v-model="modal.comprobante.cliente_datos.direccion"
                :disabled="true"
                style="grid-column: 1/4"
            />

            <JdSelect
                label="Estado"
                v-model="modal.comprobante.estado"
                :lista="modal.comprobante_estados"
                :disabled="true"
                style="grid-column: 1/3"
            />
        </div>

        <JdTable
            :columns="columns"
            :datos="modal.comprobante.comprobante_items || []"
            :columnsResizable="true"
            :seeker="false"
            :colNro="false"
            :download="false"
        />

        <div class="datos-bottom">
            <div>

            </div>

            <div class="right">
                <strong>Total:</strong>
                <strong class="total"> S/ {{ redondear(modal.mtoImpVenta) }} </strong>
            </div>
        </div>

        <JdInput
            label="Motivo de anulación"
            v-model="modal.comprobante.anulado_motivo"
            :disabled="true"
            style="grid-column: 1/2"
            v-if="modal.comprobante.estado == 0"
            class="mrg-top1"
        />
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdSelect, JdTable } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'
import { redondear, copyToClipboard } from '@/utils/mine'

export default {
    emits: ['detallesModificados'],
    components: {
        JdModal,
        JdInput,
        JdSelect,
        JdTable,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        copyToClipboard,
        redondear,

        buttons: [
            {
                text: 'Imprimir',
                action: 'modificar',
                show: false,
                tipo: '2',
            },
            {
                text: 'Actualizar',
                action: 'modificar',
            },
        ],

        columns: [
            {
                id: 'descripcion',
                title: 'Producto',
                width: '20rem',
                show: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                format: 'number',
                toRight: true,
                width: '5rem',
                show: true,
            },
            {
                id: 'pu',
                title: 'Pu',
                toRight: true,
                width: '5rem',
                show: true,
            },
            {
                id: 'total',
                title: 'Importe',
                format: 'decimal',
                toRight: true,
                width: '6rem',
                show: true,
            },
        ],
    }),
    computed: {
        atencion() {
            if (this.modal.comprobante.transaccion1.venta_canal == 1) {
                return (
                    this.modal.comprobante.transaccion1.venta_mesa1.salon1.nombre +
                    ' - ' +
                    this.modal.comprobante.transaccion1.venta_mesa1.nombre
                )
            } else {
                return this.modal.comprobante.transaccion1.venta_canal == 2
                    ? 'PARA LLEVAR'
                    : 'DELIVERY'
            }
        },
    },
    created() {
        this.modal = this.useModals.mComprobante

        this.sumarItems()
    },
    methods: {
        async loadSocios(txtBuscar) {
            if (!txtBuscar) {
                this.modal.socios.length = 0
                return
            }

            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: 2 },
                    activo: { op: 'Es', val: true },
                    or: {
                        nombres: { op: 'Contiene', val: txtBuscar },
                        doc_numero: { op: 'Contiene', val: txtBuscar },
                    },
                },
                cols: [
                    'nombres',
                    'doc_tipo',
                    'doc_numero',
                    'doc_nombres',
                    'telefono',
                    'direccion',
                    'referencia',
                ],
            }

            this.modal.spinSocios = true
            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
            this.modal.spinSocios = false

            if (res.code !== 0) return

            this.modal.socios = res.data
        },
        async loadPagoMetodos() {
            const qry = {
                fltr: { activo: { op: 'Es', val: true } },
                cols: ['nombre'],
            }

            this.modal.pago_metodos = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.pago_metodos}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.pago_metodos = res.data
        },

        setSocio(item) {
            if (item) {
                this.modal.comprobante.cliente_datos = {
                    doc_tipo: item.doc_tipo,
                    doc_numero: item.doc_numero,
                    doc_nombres: item.doc_nombres,
                    nombres: item.nombres,
                    telefono: item.telefono,
                    direccion: item.direccion,
                    referencia: item.referencia,
                }
            } else {
                this.modal.comprobante.cliente_datos = {}
            }
        },
        nuevoSocio() {
            const send = { tipo: 2, activo: true }

            this.useModals.setModal('mSocio', 'Nuevo cliente', 1, send)
        },
        setSocioCreated(item) {
            this.modal.socios = [item]
            this.modal.comprobante.socio = item.id

            this.setSocio(item)
        },

        sumarItems() {
            for (const a of this.modal.comprobante.comprobante_items) this.calcularUno(a)

            this.calcularTotales()
        },
        calcularUno(item) {
            item.vu =
                item.igv_afectacion == '10' ? item.pu / (1 + item.igv_porcentaje / 100) : item.pu

            item.mtoValorVenta = item.cantidad * item.vu
            item.igv =
                item.igv_afectacion == '10' ? item.mtoValorVenta * (item.igv_porcentaje / 100) : 0
            item.total = item.mtoValorVenta + item.igv
        },
        calcularTotales() {
            this.modal.mtoOperGravadas = 0
            this.modal.mtoOperExoneradas = 0
            this.modal.mtoOperInafectas = 0
            this.modal.mtoIGV = 0

            for (const a of this.modal.comprobante.comprobante_items) {
                if (a.igv_afectacion == '10') {
                    this.modal.mtoOperGravadas += a.mtoValorVenta
                    this.modal.mtoIGV += a.igv
                } else if (a.igv_afectacion == '20') {
                    this.modal.mtoOperExoneradas += a.mtoValorVenta
                } else if (a.igv_afectacion == '30') {
                    this.modal.mtoOperInafectas += a.mtoValorVenta
                }
            }

            this.modal.valorVenta =
                this.modal.mtoOperGravadas +
                this.modal.mtoOperExoneradas +
                this.modal.mtoOperInafectas
            this.modal.mtoImpVenta = this.modal.valorVenta + this.modal.mtoIGV
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 10rem 10rem 10rem;
    gap: 0.5rem;
    margin-bottom: 2rem;

    .dato-cliente {
        display: flex;
        gap: 0.5rem;
    }
}

.datos-bottom {
    margin-top: 2rem;
    display: flex;
    gap: 1rem;
    justify-content: space-between;

    .left {
        display: grid;
        grid-template-columns: 20rem;
        gap: 0.5rem;
    }

    .right {
        background-color: var(--bg-color2);
        padding: 1rem;
        border-radius: 0.5rem;
        display: grid;
        grid-template-columns: 4rem 9rem;
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

@media (max-width: 540px) {
    .container-datos {
        grid-template-columns: minmax(100%, 33.5rem) !important;
    }
}
</style>

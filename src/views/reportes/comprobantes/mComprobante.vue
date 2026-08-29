<template>
    <JdModal modal="mComprobante" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdInput
                label="Fecha"
                v-model="fecha_formateada"
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
                style="grid-column: 5/6"
            />

            <JdInput
                label="Nro doc"
                v-model="modal.comprobante.cliente_datos.doc_numero"
                :disabled="true"
                style="grid-column: 1/3"
            />

            <JdInput
                label="Atención"
                v-model="modal.comprobante.atencion"
                :disabled="true"
                style="grid-column: 5/6"
            />

            <JdInput
                label="Cliente"
                v-model="modal.comprobante.cliente_datos.razon_social_nombres"
                :disabled="true"
                style="grid-column: 1/4"
            />

            <JdSelect
                label="Estado"
                v-model="modal.comprobante.estado"
                :lista="modal.comprobante_estados"
                :disabled="true"
                style="grid-column: 5/6"
            />

            <JdInput
                label="Dirección"
                v-model="modal.comprobante.cliente_datos.direccion"
                :disabled="true"
                style="grid-column: 1/4"
            />
        </div>

        <JdTable
            :columns="columns"
            :datos="modal.comprobante.comprobante_items || []"
            :columnsResizable="true"
            :seeker="false"
            :colNro="false"
            :download="false"
        >
            <template v-slot:colDescuento="{ item }">
                {{ mostrarDescuento(item) }}
            </template>
        </JdTable>

        <div class="datos-bottom">
            <div></div>

            <div class="right" v-if="modal.totals">
                <span>Ope. gravadas:</span>
                <p>{{ redondear(modal.totals.MNT_TOT_GRAVADO) }}</p>

                <template v-if="modal.totals.MNT_TOT_EXONERADO > 0">
                    <span>Ope. exoneradas:</span>
                    <p>{{ redondear(modal.totals.MNT_TOT_EXONERADO) }}</p>
                </template>

                <template v-if="modal.totals.MNT_TOT_INAFECTO > 0">
                    <span>Ope. inafectas:</span>
                    <p>{{ redondear(modal.totals.MNT_TOT_INAFECTO) }}</p>
                </template>

                <template v-if="modal.totals.MNT_TOT_GRATUITO > 0">
                    <span>Ope. gratuitas:</span>
                    <p>{{ redondear(modal.totals.MNT_TOT_GRATUITO) }}</p>
                </template>

                <span>Descuentos:</span>
                <p>{{ redondear(modal.totals.MNT_TOT_DESCUENTO) }}</p>

                <span>IGV:</span>
                <p>{{ redondear(modal.totals.MNT_TOT_TRIB_IGV) }}</p>

                <template v-if="modal.totals.MNT_TOT_TRIB_ISC > 0">
                    <span>ISC:</span>
                    <p>{{ redondear(modal.totals.MNT_TOT_TRIB_ISC) }}</p>
                </template>

                <template v-if="modal.totals.MNT_IMPUESTO_BOLSAS > 0">
                    <span>ICBPER:</span>
                    <p>{{ redondear(modal.totals.MNT_IMPUESTO_BOLSAS) }}</p>
                </template>

                <strong>Importe total:</strong>
                <strong class="total"> {{ redondear(modal.totals.MNT_TOT) }} </strong>
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

import dayjs from 'dayjs'

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
                title: 'Precio',
                format: 'decimal',
                toRight: true,
                width: '5rem',
                show: true,
            },
            {
                id: 'descuento',
                title: 'Descuento',
                slot: 'colDescuento',
                toRight: true,
                width: '7rem',
                show: true,
            },
            {
                id: 'valor_venta',
                title: 'Subtotal',
                format: 'decimal',
                toRight: true,
                width: '6rem',
                show: true,
            },
            {
                id: 'igv',
                title: 'Impuesto',
                format: 'decimal',
                toRight: true,
                width: '6rem',
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

        codigosAfectacionGratuitas: [
            '11',
            '12',
            '13',
            '14',
            '15',
            '16',
            '21',
            '31',
            '32',
            '33',
            '34',
            '35',
            '36',
            '37',
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
        fecha_formateada() {
            return dayjs(this.modal.comprobante.fecha_emision).format('DD/MM/YYYY')
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
            this.calcularTotales()
        },
        mostrarDescuento(item) {
            if (!Number(item.descuento_valor)) return '-'

            return item.descuento_tipo == 1
                ? `${this.redondear(item.descuento_valor)}`
                : `${this.redondear(item.descuento_valor)}%`
        },
        calcularUno(item) {
            const cantidad = Number(item.cantidad) || 0
            const pu = Number(item.pu) || 0
            const igvPorcentaje = Number(item.igv_porcentaje) || 0
            const igvAfectacion = item.igv_afectacion
            const descuentoTipo = item.descuento_tipo
            const descuentoValor = Number(item.descuento_valor) || 0
            const impuestoBolsaUnitario = item.has_bolsa_tax === true ? 0.5 : 0
            const iscPorcentaje = Number(item.isc_porcentaje) || 0
            const iscMontoFijoUnitario = Number(item.isc_monto_fijo_uni) || 0
            const ivapPorcentaje = Number(item.ivap_porcentaje) || 0
            const tasaIsc = iscPorcentaje / 100

            let tasaIgv = 0
            if (igvAfectacion === '10') tasaIgv = igvPorcentaje / 100
            if (igvAfectacion === '17') tasaIgv = (ivapPorcentaje || igvPorcentaje) / 100
            if (['11', '12', '13', '14', '15', '16'].includes(igvAfectacion)) {
                tasaIgv = igvPorcentaje / 100
            }

            const operacionGratuita = this.codigosAfectacionGratuitas.includes(igvAfectacion)
            let valorUnitarioBruto
            let iscUnitario = 0

            if (iscMontoFijoUnitario > 0) {
                iscUnitario = iscMontoFijoUnitario
                valorUnitarioBruto =
                    tasaIgv > 0 ? pu / (1 + tasaIgv) - iscUnitario : pu - iscUnitario
            } else if (iscPorcentaje > 0) {
                valorUnitarioBruto =
                    tasaIgv > 0 ? pu / ((1 + tasaIsc) * (1 + tasaIgv)) : pu / (1 + tasaIsc)
                iscUnitario = valorUnitarioBruto * tasaIsc
            } else {
                valorUnitarioBruto = tasaIgv > 0 ? pu / (1 + tasaIgv) : pu
            }

            valorUnitarioBruto = Math.max(0, valorUnitarioBruto)

            let descuentoUnitarioSinTributos = 0
            if (descuentoValor > 0 && cantidad > 0) {
                if (descuentoTipo == 1) {
                    let descuentoSinTributos

                    if (iscMontoFijoUnitario > 0) {
                        const descuentoSinIgv =
                            tasaIgv > 0 ? descuentoValor / (1 + tasaIgv) : descuentoValor
                        descuentoSinTributos = Math.max(
                            0,
                            descuentoSinIgv - iscMontoFijoUnitario * cantidad,
                        )
                    } else if (iscPorcentaje > 0) {
                        let factorImpuestos = 1 + tasaIsc
                        if (tasaIgv > 0) factorImpuestos *= 1 + tasaIgv
                        descuentoSinTributos = descuentoValor / factorImpuestos
                    } else {
                        descuentoSinTributos =
                            tasaIgv > 0 ? descuentoValor / (1 + tasaIgv) : descuentoValor
                    }

                    descuentoUnitarioSinTributos = descuentoSinTributos / cantidad
                } else if (descuentoTipo == 2) {
                    descuentoUnitarioSinTributos = valorUnitarioBruto * (descuentoValor / 100)
                }
            }

            const valorUnitario = Math.max(0, valorUnitarioBruto - descuentoUnitarioSinTributos)
            iscUnitario =
                iscMontoFijoUnitario > 0
                    ? iscMontoFijoUnitario
                    : iscPorcentaje > 0
                      ? valorUnitario * tasaIsc
                      : 0

            const igvUnitario = tasaIgv > 0 ? (valorUnitario + iscUnitario) * tasaIgv : 0
            const precioVentaUnitario =
                valorUnitario + iscUnitario + igvUnitario + impuestoBolsaUnitario

            item.VAL_VTA_ITEM = valorUnitario * cantidad
            item.MNT_IGV_ITEM = igvUnitario * cantidad
            item.MNT_ISC_ITEM = iscUnitario * cantidad
            item.MNT_DSCTO_ITEM = descuentoUnitarioSinTributos * cantidad
            item.IMPUESTO_BOLSAS_UNIT = impuestoBolsaUnitario

            if (operacionGratuita) {
                item.valor_venta = 0
                item.igv = 0
                item.total = 0
            } else {
                item.valor_venta = item.VAL_VTA_ITEM
                item.igv = item.MNT_IGV_ITEM
                item.total = precioVentaUnitario * cantidad
            }
        },
        calcularTotales() {
            const totals = {
                MNT_TOT_GRAVADO: 0,
                MNT_TOT_EXONERADO: 0,
                MNT_TOT_INAFECTO: 0,
                MNT_TOT_GRATUITO: 0,
                MNT_TOT_DESCUENTO: 0,
                MNT_TOT_TRIB_IGV: 0,
                MNT_TOT_TRIB_ISC: 0,
                MNT_IMPUESTO_BOLSAS: 0,
                MNT_TOT: 0,
            }

            for (const item of this.modal.comprobante.comprobante_items || []) {
                this.calcularUno(item)

                totals.MNT_TOT_DESCUENTO += item.MNT_DSCTO_ITEM || 0
                totals.MNT_TOT_TRIB_ISC += item.MNT_ISC_ITEM || 0
                totals.MNT_IMPUESTO_BOLSAS +=
                    (item.IMPUESTO_BOLSAS_UNIT || 0) * (Number(item.cantidad) || 0)

                if (this.codigosAfectacionGratuitas.includes(item.igv_afectacion)) {
                    totals.MNT_TOT_GRATUITO += item.VAL_VTA_ITEM || 0
                } else if (item.igv_afectacion === '10' || item.igv_afectacion === '17') {
                    totals.MNT_TOT_GRAVADO += item.VAL_VTA_ITEM || 0
                    totals.MNT_TOT_TRIB_IGV += item.MNT_IGV_ITEM || 0
                } else if (item.igv_afectacion === '20') {
                    totals.MNT_TOT_EXONERADO += item.VAL_VTA_ITEM || 0
                } else if (item.igv_afectacion === '30' || item.igv_afectacion === '40') {
                    totals.MNT_TOT_INAFECTO += item.VAL_VTA_ITEM || 0
                }
            }

            totals.MNT_TOT =
                totals.MNT_TOT_GRAVADO +
                totals.MNT_TOT_EXONERADO +
                totals.MNT_TOT_INAFECTO +
                totals.MNT_TOT_TRIB_IGV +
                totals.MNT_TOT_TRIB_ISC +
                totals.MNT_IMPUESTO_BOLSAS

            this.modal.totals = totals
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr)) 15rem;
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
        grid-template-columns: 10rem 9rem;
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

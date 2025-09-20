<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>
                Emitir comprobante - Pedido N° {{ vista.comprobante.transaccion.venta_codigo }}
                <template v-if="vista.comprobante.transaccion.venta_canal == 1">
                    ({{ vista.comprobante.transaccion.salon1.nombre }} -
                    {{ vista.comprobante.transaccion.venta_mesa1.nombre }})
                </template>
                <template v-else-if="vista.comprobante.transaccion.venta_canal == 2">
                    (PARA LLEVAR)</template
                >
                <template v-else-if="vista.comprobante.transaccion.venta_canal == 3">
                    (DELIVERY)</template
                >
            </strong>

            <div class="buttons">
                <JdButton
                    text="Regresar"
                    icon="fa-solid fa-arrow-left"
                    tipo="2"
                    @click="regresar()"
                />
                <JdButton
                    text="Grabar"
                    @click="grabar()"
                    tipo="2"
                    v-if="useAuth.verifyPermiso('vPedidos:generarComprobante')"
                />
                <JdButton
                    text="Grabar e imprimir"
                    @click="grabarImprimir()"
                    v-if="useAuth.verifyPermiso('vPedidos:generarComprobante')"
                />
            </div>
        </div>

        <div class="comanda">
            <div class="left">
                <div class="datos">
                    <JdInput
                        label="Fecha"
                        type="date"
                        :nec="true"
                        v-model="vista.comprobante.fecha_emision"
                        :disabled="true"
                        style="grid-column: 1/3"
                    />

                    <JdSelect
                        label="Tipo comprobante"
                        :nec="true"
                        v-model="vista.comprobante.doc_tipo"
                        :lista="vista.pago_comprobantes"
                        style="grid-column: 1/4"
                    />

                    <div style="grid-column: 1/5" class="dato-cliente">
                        <!-- {{ vista.socio }} -->
                        <JdSelectQuery
                            label="Cliente"
                            :nec="true"
                            v-model="vista.comprobante.socio"
                            :spin="vista.spinSocios"
                            :lista="vista.socios || []"
                            mostrar="doc_nombres"
                            @search="loadSocios"
                            @elegir="setSocio"
                            style="grid-column: 1/5"
                        />

                        <JdButton
                            icon="fa-solid fa-user-plus"
                            title="Nuevo socio"
                            tipo="2"
                            :small="true"
                            @click="nuevoSocio()"
                        />
                    </div>

                    <JdSelect
                        label="Condicion de pago"
                        :nec="true"
                        :lista="vista.pago_condiciones"
                        v-model="vista.comprobante.pago_condicion"
                        style="grid-column: 1/4"
                        @elegir="setPagoCondicion"
                    />
                </div>

                <div class="totales" v-if="vista.totals">
                    <span>Ope. gravadas:</span>
                    <p>{{ redondear(vista.totals.MNT_TOT_GRAVADO) }}</p>

                    <span>Ope. exoneradas:</span>
                    <p>{{ redondear(vista.totals.MNT_TOT_EXONERADO) }}</p>

                    <span>Ope. inafectas:</span>
                    <p>{{ redondear(vista.totals.MNT_TOT_INAFECTO) }}</p>

                    <span>Ope. gratuitas</span>
                    <p>{{ redondear(vista.totals.MNT_TOT_GRATUITO) }}</p>

                    <span>Descuentos:</span>
                    <p>{{ redondear(vista.totals.MNT_TOT_DESCUENTO) }}</p>

                    <span>IGV:</span>
                    <p>{{ redondear(vista.totals.MNT_TOT_TRIB_IGV) }}</p>

                    <span>ISC:</span>
                    <p>{{ redondear(vista.totals.MNT_TOT_TRIB_ISC) }}</p>

                    <span>ICBPER:</span>
                    <p>{{ redondear(vista.totals.MNT_IMPUESTO_BOLSAS) }}</p>

                    <strong>Importe total</strong>
                    <strong class="total">
                        {{ redondear(vista.totals.MNT_TOT) }}
                    </strong>
                </div>

                <!-- <div class="totales" v-if="vista.totals">
                    <span>Sub Total Ventas:</span>
                    <p>{{ redondear(vista.totals.sub_total_ventas) }}</p>

                    <template v-if="false">
                        <span>Anticipos:</span>
                        <p>{{ redondear(vista.totals.anticipos) }}</p>
                    </template>

                    <span>Descuentos:</span>
                    <p>{{ redondear(vista.totals.descuentos) }}</p>

                    <span>Valor Venta:</span>
                    <p>{{ redondear(vista.totals.valor_venta) }}</p>

                    <span>ISC:</span>
                    <p>{{ redondear(vista.totals.isc) }}</p>

                    <span>IGV:</span>
                    <p>{{ redondear(vista.totals.igv) }}</p>

                    <span>ICBPER:</span>
                    <p>{{ redondear(vista.totals.icbper) }}</p>

                    <template v-if="false">
                        <span>Otros Cargos:</span>
                        <p>{{ redondear(vista.totals.otros_cargos) }}</p>

                        <span>Otros Tributos:</span>
                        <p>{{ redondear(vista.totals.otros_tributos) }}</p>
                    </template>

                    <strong>Importe Total</strong>
                    <strong class="total">
                        {{ redondear(vista.totals.importe_total) }}
                    </strong>
                </div> -->
            </div>

            <div class="right">
                <JdTable
                    :columns="columnsArticulos"
                    :datos="vista.comprobante.comprobante_items || []"
                    height="100%"
                    class="pedido-items"
                    :seeker="false"
                    :download="false"
                    :colAct="true"
                    colActWidth="4.5rem"
                    @onInput="runMethod"
                >
                    <template v-slot:cAction="{ item }">
                        <JdButton
                            icon="fa-regular fa-handshake"
                            :small="true"
                            tipo="2"
                            :title="item.cortesia ? 'Quitar cortesia' : 'Cortesia'"
                            @click="setCortesia(item)"
                        />

                        <JdButton
                            icon="fa-solid fa-trash-can"
                            :small="true"
                            tipo="2"
                            title="Quitar"
                            @click="quitarArticulo(item)"
                        />
                    </template>

                    <template v-slot:colDescuento="{ item }">
                        <template v-if="codigosAfectacionGratuitas.includes(item.igv_afectacion)"
                            >CORTESÍA</template
                        >
                        <div class="item_descuento" v-else>
                            <JdSelect
                                v-model="item.descuento_tipo"
                                :lista="descuento_tipos"
                                mostrar="codigo"
                                @elegir="setDescuentoTipo(item)"
                            />

                            <JdInput
                                type="number"
                                :toRight="true"
                                v-model="item.descuento_valor"
                                @input="setDescuentoValor(item)"
                            />
                        </div>
                    </template>
                </JdTable>

                <div class="container-pagos">
                    <div class="head">
                        Métodos de pago

                        <p>
                            <small>Por pagar:</small>
                            {{ redondear(vista.porPagar) }}
                        </p>

                        <p>
                            <small>Vuelto:</small>
                            {{ redondear(vista.vuelto) }}
                        </p>
                    </div>

                    <ul class="container-pago-metodos" v-if="vista.comprobante.pago_condicion == 1">
                        <li
                            v-for="(a, i) in vista.pago_metodos"
                            :key="i"
                            :style="{ 'border-color': a.color }"
                        >
                            <p>{{ a.nombre }}</p>

                            <div style="display: flex">
                                <JdInput
                                    type="number"
                                    v-model="a.monto"
                                    @input="calcularPorPagar(a)"
                                />

                                <JdButton
                                    icon="fa-regular fa-hand-point-left"
                                    title="Exacto"
                                    :small="true"
                                    :tipo="2"
                                    @click="pagoExacto(a)"
                                />
                            </div>
                        </li>
                    </ul>

                    <div class="container-credito" v-else>
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <p>Venta a crédito</p>
                        <span>Tendrá que agregar los pagos más adelante</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <mSocio @created="setSocioCreated" v-if="useModals.show.mSocio" />
</template>

<script>
import { JdTable, JdButton, JdInput, JdSelect, JdSelectQuery } from '@jhuler/components'

import mSocio from '@/views/compras/proveedores/mSocio.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post } from '@/utils/crud'
import { redondear, getItemFromArray, incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdButton,
        JdInput,
        JdSelect,
        JdSelectQuery,
        JdTable,
        mSocio,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        redondear,
        getItemFromArray,

        vista: {},

        newPago: {},

        descuento_tipos: [
            { id: 1, nombre: 'MONTO', codigo: 'M' },
            { id: 2, nombre: 'PORCENTAJE', codigo: '%' },
        ],

        reloadSocio: false,

        columnsArticulos: [
            { id: 'nombre', width: '15rem', title: 'Producto', show: true },
            {
                id: 'cantidad',
                title: 'Cantidad',
                width: '5rem',
                // prop: 'cantidad',
                input: true,
                type: 'number',
                oninput: 'sumarUno',
                toRight: true,
                show: true,
            },
            {
                id: 'pu',
                title: 'Precio',
                format: 'decimal',
                width: '5rem',
                toRight: true,
                show: true,
            },
            {
                id: 'descuento',
                width: '10rem',
                title: 'Descuento',
                slot: 'colDescuento',
                toRight: true,
                show: true,
            },
            {
                id: 'valor_venta',
                title: 'Subtotal',
                format: 'decimal',
                width: '6rem',
                show: true,
                toRight: true,
            },
            {
                id: 'igv',
                title: 'Impuesto',
                format: 'decimal',
                width: '6rem',
                show: true,
                toRight: true,
            },
            {
                id: 'total',
                title: 'Importe',
                format: 'decimal',
                width: '6rem',
                show: true,
                toRight: true,
            },
        ],

        codigosAfectacionGratuitas: [
            '11',
            '12',
            '13',
            '14',
            '15',
            '16', // Gravado – Retiro por...
            '21', // Exonerado - Transferencia gratuita
            '31',
            '32',
            '33',
            '34',
            '35',
            '36',
            '37', // Inafecto – Retiro por... o Transferencia gratuita
        ],
    }),
    async created() {
        this.vista = this.useVistas.vEmitirComprobante

        // this.sumarItems()
        await this.loadDatosSistema()
        await this.loadPagoMetodos()
        this.calculateInvoiceTotals()

        await this.loadPagoComprobantes()
        const asd = this.vista.pago_comprobantes.find((a) => a.estandar == true)
        this.vista.comprobante.doc_tipo = asd.id
    },
    methods: {
        async loadDatosSistema() {
            const qry = ['pago_condiciones', 'CATALOGO_TRIBUTOS_SUNAT']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
        async loadPagoComprobantes() {
            const qry = {
                fltr: { activo: { op: 'Es', val: true } },
                cols: ['nombre', 'estandar'],
            }

            this.vista.pago_comprobantes = []
            this.vista.pagoComprobantesLoaded = false
            this.useAuth.loading = { show: true, text: 'Cargando...' }
            const res = await get(`${urls.pago_comprobantes}?qry=${JSON.stringify(qry)}`)
            this.useAuth.loading = { show: false, text: '' }
            this.vista.pagoComprobantesLoaded = true

            if (res.code != 0) return

            this.vista.pago_comprobantes = res.data
        },
        async loadPagoMetodos() {
            const qry = {
                fltr: { activo: { op: 'Es', val: true } },
                cols: ['nombre', 'color'],
            }

            this.vista.pago_metodos = []
            this.vista.pagoMetodosLoaded = false
            this.useAuth.loading = { show: true, text: 'Cargando...' }
            const res = await get(`${urls.pago_metodos}?qry=${JSON.stringify(qry)}`)
            this.useAuth.loading = { show: false, text: '' }
            this.vista.pagoMetodosLoaded = true

            if (res.code != 0) return

            this.vista.pago_metodos = res.data
        },
        async loadSocios(txtBuscar) {
            if (!txtBuscar) {
                this.vista.socios.length = 0
                return
            }

            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: 2 },
                    activo: { op: 'Es', val: true },
                    nombres: { op: 'Contiene', val: txtBuscar },
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

            this.vista.spinSocios = true
            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
            this.vista.spinSocios = false

            if (res.code !== 0) return

            this.vista.socios = res.data
        },

        // calculateInvoiceLineValues1(product) {
        //     const tributosCatalog = this.vista.CATALOGO_TRIBUTOS_SUNAT
        //     const bolsa_tax_unit_amount = 0.5
        //     // asegurar números
        //     const pu = product.pu
        //     const igvPct = product.igv_porcentaje
        //     const igvRate = igvPct / 100
        //     const cantidad = product.cantidad

        //     // 1) calcular VU (valor unitario sin IGV) según afectación
        //     // si la afectación es gravada (10) y el PU viene con IGV -> quitar IGV
        //     const igvAfect = product.igv_afectacion
        //     const vu = igvAfect === '10' ? pu / (1 + igvRate) : Number(product.vu ?? pu)
        //     // Nota: si product.vu ya está definido y correcto (sin IGV), preferirlo; si no, usar pu.

        //     // defaults
        //     const has_bolsa_tax = !!product.has_bolsa_tax
        //     const isc_porcentaje = product.isc_porcentaje
        //     const isc_precio_sugerido = product.isc_precio_sugerido
        //     const isc_monto_fijo_uni = product.isc_monto_fijo_uni
        //     const ivap_porcentaje = product.ivap_porcentaje

        //     // tax_info fallback
        //     let tax_info = tributosCatalog[igvAfect]
        //     if (!tax_info) {
        //         const defaultInafecto = tributosCatalog['30'] || {
        //             codigo_tributo: '9998',
        //             codigo_internacional: 'FRE',
        //             codigo: 'INA',
        //             nombre: 'Inafecto',
        //             categoria_impuesto_id: 'O',
        //         }
        //         tax_info = {
        //             ...defaultInafecto,
        //             codigo_tributo: '9998',
        //             nombre: `Desconocido - ${igvAfect}`,
        //         }
        //     }

        //     // -------------------
        //     // 2) Descuento: calcular antes de impuestos
        //     // product.descuento_tipo:
        //     //   1 => descuento monetario TOTAL de la línea (se asume con IGV incluido)
        //     //   2 => descuento porcentaje (ej. 10 => 10%)
        //     // -------------------
        //     let descuento_vu = 0 // descuento por unidad (neto)
        //     let descuento_total = 0 // descuento total neto (línea)
        //     let descuento_base = 0 // base sobre la que aplica % descuento (vu * qty)
        //     let descuento_factor = 0 // porcentaje en decimal

        //     if (
        //         product.descuento_tipo != null &&
        //         product.descuento_valor != null &&
        //         product.descuento_valor !== 0
        //     ) {
        //         if (product.descuento_tipo == 1) {
        //             // descuento_valor = monto total del descuento en PRECIO CON IGV (para toda la línea)
        //             const descuentoConIGV = product.descuento_valor
        //             const descuentoTotalNeto = descuentoConIGV / (1 + igvRate) // pasar a monto neto
        //             descuento_vu = descuentoTotalNeto / cantidad
        //             descuento_total = descuentoTotalNeto
        //             descuento_base = vu * cantidad
        //             descuento_factor = descuento_base > 0 ? descuento_vu / vu : 0
        //         } else if (product.descuento_tipo === 2) {
        //             // descuento_valor es porcentaje
        //             descuento_base = vu * cantidad
        //             descuento_factor = product.descuento_valor / 100
        //             descuento_total = descuento_base * descuento_factor
        //             descuento_vu = vu * descuento_factor
        //         }
        //     } else {
        //         descuento_vu = 0
        //         descuento_total = 0
        //         descuento_base = 0
        //         descuento_factor = 0
        //     }

        //     // cortar errores numéricos
        //     descuento_vu = Number(descuento_vu || 0)
        //     descuento_total = Number(descuento_total || 0)
        //     descuento_base = Number(descuento_base || 0)
        //     descuento_factor = Number(descuento_factor || 0)

        //     // 3) Valor unitario neto después de descuento (base para impuestos)
        //     const vu_neto = vu - descuento_vu // POR UNIDAD
        //     const valor_total_sin_impuestos_raw =
        //         tax_info.codigo_tributo === '9996' ? 0 : vu_neto * cantidad

        //     // 4) ICBPER (independiente del descuento, es por unidad)
        //     const icbper_unitario = has_bolsa_tax ? bolsa_tax_unit_amount : 0
        //     const icbper_total = icbper_unitario * cantidad

        //     // 5) ISC (calcular sobre base neta cuando aplica sistema '01'; si '02' o '03' sigue su lógica)
        //     let isc_unitario = 0,
        //         isc_base_unit = 0,
        //         isc_percent = 0,
        //         isc_tier = ''
        //     if (product.isc_sistema_codigo) {
        //         switch (product.isc_sistema_codigo) {
        //             case '01':
        //                 isc_unitario = vu_neto * (isc_porcentaje / 100) // base = vu_neto
        //                 isc_base_unit = vu_neto
        //                 isc_percent = isc_porcentaje
        //                 isc_tier = '01'
        //                 break
        //             case '02':
        //                 isc_unitario = isc_monto_fijo_uni
        //                 isc_base_unit = isc_monto_fijo_uni
        //                 isc_percent = 0
        //                 isc_tier = '02'
        //                 break
        //             case '03':
        //                 isc_unitario = isc_precio_sugerido * (isc_porcentaje / 100)
        //                 isc_base_unit = isc_precio_sugerido
        //                 isc_percent = isc_porcentaje
        //                 isc_tier = '03'
        //                 break
        //         }
        //     }
        //     const isc_total = isc_unitario * cantidad
        //     const isc_base_total = isc_base_unit * cantidad

        //     // 6) IVAP (si aplica)
        //     const ivap_unitario = igvAfect === '17' ? vu_neto * (ivap_porcentaje / 100) : 0
        //     const ivap_total = ivap_unitario * cantidad

        //     // 7) IGV base y cálculo (IGV efectivo solo si afectacion == '10')
        //     const igv_base_unit = vu_neto + isc_unitario // base unitaria para IGV
        //     const igv_unitario = igvAfect === '10' ? igv_base_unit * igvRate : 0
        //     const igv_total = igv_unitario * cantidad
        //     const igv_base_total = igv_base_unit * cantidad

        //     // 8) Totales y precio referencia
        //     const total_impuestos = igv_total + isc_total + ivap_total + icbper_total
        //     const precio_unitario_final = Number(
        //         (vu_neto + isc_unitario + ivap_unitario + igv_unitario + icbper_unitario).toFixed(
        //             10,
        //         ),
        //     ) // 10 decs para XML si quieres
        //     const valor_total_sin_impuestos = valor_total_sin_impuestos_raw
        //     const descuento_total_round = descuento_total
        //     const igv_total_round = igv_total
        //     const isc_total_round = isc_total
        //     const icbper_total_round = icbper_total
        //     const ivap_total_round = ivap_total
        //     const total_impuestos_round = total_impuestos
        //     const valor_venta_round = vu_neto * cantidad
        //     const total_linea_round = valor_venta_round + total_impuestos_round

        //     // también asignar campos en product si los necesitas (opcional)
        //     product.vu = vu
        //     product.descuento_vu = descuento_vu
        //     product.descuento_total = descuento_total_round
        //     product.descuento_base = descuento_base
        //     product.descuento_factor = descuento_factor

        //     const noOnerosas = ['11', '12', '13', '14', '15', '16', '17']
        //     product.valor_venta = noOnerosas.includes(igvAfect) ? 0 : valor_venta_round
        //     product.igv = noOnerosas.includes(igvAfect) ? 0 : igv_total_round
        //     product.total = noOnerosas.includes(igvAfect) ? 0 : total_linea_round

        //     // product.valor_venta = valor_venta_round
        //     // product.igv = igv_total_round
        //     // product.total = total_linea_round

        //     // ====================== RETORNO ======================
        //     return {
        //         descripcion: product.descripcion,
        //         producto_codigo: product.codigo,
        //         unidad: product.unidad,
        //         cantidad: cantidad,

        //         valor_unitario_neto: Number(vu_neto.toFixed(10)), // por unidad sin IGV (después de descuento)
        //         valor_total_sin_impuestos: valor_total_sin_impuestos, // base de la línea (2 dec)
        //         precio_unitario_final: precio_unitario_final, // para PricingReference (10 decs)
        //         // total_linea: total_linea_round, // total final por línea
        //         total_linea: noOnerosas.includes(igvAfect) ? 0 : total_linea_round,

        //         descuentos: {
        //             total: descuento_total_round,
        //             base: descuento_base,
        //             factor: Number(descuento_factor.toFixed(6)),
        //         },

        //         impuestos: {
        //             total: total_impuestos_round,
        //             igv: {
        //                 base_unit: Number(igv_base_unit.toFixed(10)),
        //                 base_total: igv_base_total,
        //                 porcentaje: igvPct,
        //                 monto_unitario: Number(igv_unitario.toFixed(10)),
        //                 monto_total: igv_total_round,
        //                 codigo_afectacion: igvAfect,
        //             },
        //             icbper: {
        //                 monto_unitario: Number(icbper_unitario.toFixed(2)),
        //                 monto_total: icbper_total_round,
        //                 cantidad_bolsas: has_bolsa_tax ? cantidad : 0,
        //             },
        //             isc: {
        //                 base_unit: Number(isc_base_unit.toFixed(10)),
        //                 base_total: isc_base_total,
        //                 porcentaje: isc_percent,
        //                 monto_unitario: Number(isc_unitario.toFixed(10)),
        //                 monto_total: isc_total_round,
        //                 sistema: product.isc_sistema_codigo,
        //                 tier_range: isc_tier,
        //             },
        //             ivap: {
        //                 porcentaje: ivap_porcentaje,
        //                 monto_unitario: Number(ivap_unitario.toFixed(10)),
        //                 monto_total: ivap_total_round,
        //             },
        //         },
        //     }
        // },
        // calculateInvoiceTotals1(
        //     globalAllowanceAmount = 0,
        //     globalChargeAmount = 0,
        //     prepaidAmount = 0,
        // ) {
        //     const tributosCatalog = this.vista.CATALOGO_TRIBUTOS_SUNAT

        //     let GrossLineExtensionAmount = 0 // Sub total ventas antes de descuentos
        //     // let LineExtensionAmount = 0 // Base después de descuentos
        //     let totalTaxAmountInvoice = 0
        //     let AllowanceTotalAmount = globalAllowanceAmount
        //     let ChargeTotalAmount = globalChargeAmount

        //     const aggregatedTaxes = {}

        //     for (const item of this.vista.comprobante.comprobante_items) {
        //         const lineData = this.calculateInvoiceLineValues(item, tributosCatalog)

        //         // Base neta después de descuentos (valor de venta de la línea)
        //         const postDiscountBase = Number(lineData.valor_total_sin_impuestos || 0)

        //         // Descuento de línea
        //         const lineDiscount = Number((lineData.descuentos && lineData.descuentos.total) || 0)

        //         // Base antes de descuentos = base después + descuento de línea
        //         const preDiscountBase = postDiscountBase + lineDiscount

        //         // Acumular
        //         GrossLineExtensionAmount += preDiscountBase // Sub total ventas (antes de descuentos)
        //         // LineExtensionAmount += postDiscountBase // auxiliar (neto)
        //         totalTaxAmountInvoice += Number(
        //             lineData.impuestos && lineData.impuestos.total ? lineData.impuestos.total : 0,
        //         )

        //         // Descuentos (global + líneas)
        //         AllowanceTotalAmount += lineDiscount

        //         // Agregar impuestos agrupados
        //         if (lineData.impuestos) {
        //             aggregatedTaxes.igv =
        //                 (aggregatedTaxes.igv || 0) +
        //                 Number((lineData.impuestos.igv && lineData.impuestos.igv.monto_total) || 0)
        //             aggregatedTaxes.isc =
        //                 (aggregatedTaxes.isc || 0) +
        //                 Number((lineData.impuestos.isc && lineData.impuestos.isc.monto_total) || 0)
        //             aggregatedTaxes.icbper =
        //                 (aggregatedTaxes.icbper || 0) +
        //                 Number(
        //                     (lineData.impuestos.icbper && lineData.impuestos.icbper.monto_total) ||
        //                         0,
        //                 )
        //             aggregatedTaxes.ivap =
        //                 (aggregatedTaxes.ivap || 0) +
        //                 Number(
        //                     (lineData.impuestos.ivap && lineData.impuestos.ivap.monto_total) || 0,
        //                 )

        //             for (const [k, v] of Object.entries(lineData.impuestos)) {
        //                 if (['total', 'igv', 'isc', 'icbper', 'ivap'].includes(k)) continue
        //                 if (v && typeof v.monto_total === 'number') {
        //                     aggregatedTaxes.otros = (aggregatedTaxes.otros || 0) + v.monto_total
        //                 }
        //             }
        //         }
        //     }

        //     // Sub total ventas = suma bases antes de descuentos
        //     const SubTotalVentas = GrossLineExtensionAmount

        //     // Descuentos = global + líneas
        //     const Descuentos = AllowanceTotalAmount

        //     // Valor venta = sub total - descuentos
        //     const ValorVenta = SubTotalVentas - Descuentos

        //     // Importe total = valor venta + impuestos + cargos - anticipos
        //     const ImporteTotal =
        //         ValorVenta + totalTaxAmountInvoice + ChargeTotalAmount - prepaidAmount

        //     // Guardar resultados
        //     this.vista.totals = {
        //         sub_total_ventas: SubTotalVentas,
        //         anticipos: prepaidAmount,
        //         descuentos: Descuentos,
        //         valor_venta: ValorVenta,
        //         isc: aggregatedTaxes.isc || 0,
        //         igv: aggregatedTaxes.igv || 0,
        //         icbper: aggregatedTaxes.icbper || 0,
        //         otros_cargos: ChargeTotalAmount,
        //         otros_ributos: (aggregatedTaxes.ivap || 0) + (aggregatedTaxes.otros || 0),
        //         importe_total: ImporteTotal,
        //     }

        //     this.calcularPorPagar()
        // },
        sumarUno(item) {
            if (item.cantidad > item.cantidadMax) {
                item.cantidad = item.cantidadMax
                return jmsg('warning', 'Cantidad no disponible')
            }

            this.calculateInvoiceTotals()
        },
        calculateInvoiceLineValues(item) {
            const cantidad = item.cantidad
            const pu = item.pu // Precio unitario de lista (con IGV/ISC)
            const igv_porcentaje = item.igv_porcentaje
            const igv_afectacion = item.igv_afectacion // Catálogo 07
            const descuento_tipo = item.descuento_tipo
            const descuento_valor = item.descuento_valor
            const bolsa_tax_unit_amount = item.has_bolsa_tax === true ? 0.5 : 0
            const isc_porcentaje = item.isc_porcentaje !== null ? item.isc_porcentaje : 0
            const isc_monto_fijo_uni =
                item.isc_monto_fijo_uni !== null ? item.isc_monto_fijo_uni : 0
            const ivap_porcentaje = item.ivap_porcentaje !== null ? item.ivap_porcentaje : 0

            // Tasas de impuestos en formato decimal
            const IGV_RATE_DECIMAL = igv_porcentaje / 100
            // const IVAP_RATE_DECIMAL = ivap_porcentaje / 100
            const ISC_RATE_DECIMAL = isc_porcentaje / 100

            // Variables para los cálculos intermedios y finales
            let val_unit_item_raw // VAL_UNIT_ITEM antes de descuentos de ítem, sin IGV/ISC
            let isc_unitario_calculated = 0 // ISC unitario para el cálculo de otros impuestos
            let cod_tip_sist_isc = null // Código de sistema de cálculo del ISC
            let por_isc_item_output = null // Porcentaje de ISC para el JSON final

            // 2. Determinar COD_TIP_PRC_VTA (Tipo de Precio de Venta)
            let cod_tip_prc_vta = '01' // Default: Precio unitario (incluye IGV)
            if (this.codigosAfectacionGratuitas.includes(igv_afectacion)) {
                cod_tip_prc_vta = '02'
            }

            // 3. Determinar COD_TRIB_IGV_ITEM y POR_IGV_ITEM para el JSON final
            let cod_trib_igv_item
            let por_igv_item_output // Porcentaje de IGV/IVAP para el JSON final
            let actual_igv_rate_for_calculation // Tasa de IGV/IVAP real para los cálculos

            switch (igv_afectacion) {
                case '10': // Gravado - Operación Onerosa
                    cod_trib_igv_item = '1000'
                    por_igv_item_output = igv_porcentaje
                    actual_igv_rate_for_calculation = IGV_RATE_DECIMAL
                    break
                case '17': // Gravado - IVAP
                    cod_trib_igv_item = '1016'
                    por_igv_item_output = ivap_porcentaje > 0 ? ivap_porcentaje : igv_porcentaje // Prioriza IVAP rate
                    actual_igv_rate_for_calculation = por_igv_item_output / 100
                    break
                case '20': // Exonerado - Operación Onerosa
                    cod_trib_igv_item = '9997'
                    por_igv_item_output = 0
                    actual_igv_rate_for_calculation = 0
                    break
                case '30': // Inafecto - Operación Onerosa
                    cod_trib_igv_item = '9998'
                    por_igv_item_output = 0
                    actual_igv_rate_for_calculation = 0
                    break
                case '40': // Exportación de Bienes o Servicios
                    cod_trib_igv_item = '9995'
                    por_igv_item_output = 0
                    actual_igv_rate_for_calculation = 0
                    break
                case '11':
                case '12':
                case '13':
                case '14':
                case '15':
                case '16': // Gravado – Retiro por... (Gratuito pero afecto a IGV por naturaleza)
                    cod_trib_igv_item = '9996'
                    por_igv_item_output = igv_porcentaje
                    actual_igv_rate_for_calculation = IGV_RATE_DECIMAL
                    break
                case '21':
                case '31':
                case '32':
                case '33':
                case '34':
                case '35':
                case '36':
                case '37': // Exonerado/Inafecto - Transferencia gratuita o retiro
                    cod_trib_igv_item = '9996'
                    por_igv_item_output = 0
                    actual_igv_rate_for_calculation = 0
                    break
                default:
                    cod_trib_igv_item = '9998' // Default a Inafecto si no hay match claro
                    por_igv_item_output = 0
                    actual_igv_rate_for_calculation = 0
                    break
            }

            // Determinar si el item está gravado con IGV/IVAP para cálculos de base imponible
            const isGravado = actual_igv_rate_for_calculation > 0

            // 4. Calcular VAL_UNIT_ITEM (val_unit_item_raw) y ISC unitario inicial, trabajando hacia atrás desde pu
            if (isc_monto_fijo_uni > 0) {
                // ISC por monto fijo unitario (Catálogo 08, código 02)
                cod_tip_sist_isc = '02'
                por_isc_item_output = 0 // No aplica porcentaje si es monto fijo unitario
                isc_unitario_calculated = isc_monto_fijo_uni // El ISC unitario es el monto fijo

                if (isGravado) {
                    // pu = VU + ISC_fixed + (VU + ISC_fixed) * IGV_rate = (VU + ISC_fixed) * (1 + IGV_rate)
                    val_unit_item_raw =
                        pu / (1 + actual_igv_rate_for_calculation) - isc_unitario_calculated
                } else {
                    // pu = VU + ISC_fixed
                    val_unit_item_raw = pu - isc_unitario_calculated
                }
            } else if (isc_porcentaje > 0) {
                // ISC por porcentaje (ejemplo usa código 01)
                cod_tip_sist_isc = '01'
                por_isc_item_output = isc_porcentaje

                if (isGravado) {
                    // pu = VU * (1 + ISC_rate) * (1 + IGV_rate)
                    val_unit_item_raw =
                        pu / ((1 + ISC_RATE_DECIMAL) * (1 + actual_igv_rate_for_calculation))
                } else {
                    // pu = VU * (1 + ISC_rate)
                    val_unit_item_raw = pu / (1 + ISC_RATE_DECIMAL)
                }
                isc_unitario_calculated = val_unit_item_raw * ISC_RATE_DECIMAL // Calcular ISC unitario basado en VAL_UNIT_ITEM_raw
            } else {
                // Sin ISC
                if (isGravado) {
                    // pu = VU * (1 + IGV_rate)
                    val_unit_item_raw = pu / (1 + actual_igv_rate_for_calculation)
                } else {
                    // pu = VU
                    val_unit_item_raw = pu
                }
            }

            // Asegurarse de que val_unit_item_raw no sea negativo
            if (val_unit_item_raw < 0) val_unit_item_raw = 0

            // 5. Calcular MNT_BRUTO (monto bruto del item antes de descuentos por item)
            // Este campo podría variar cuando se aplica un descuento para mostrar el valor original.
            const mnt_bruto_total = val_unit_item_raw * cantidad

            // 6. Aplicar descuentos por item al VAL_UNIT_ITEM_raw
            let monto_dscto_unitario_sin_igv = 0
            if (descuento_valor > 0) {
                if (descuento_tipo == 1) {
                    // Descuento en monto del total de la línea (incluye todos los impuestos: IGV, ISC)
                    let descuento_total_monetario = descuento_valor
                    let descuento_total_sin_tributos // Este será el monto descontado sin ISC/IGV

                    if (isc_monto_fijo_uni > 0) {
                        // Caso 1: ISC por Monto Fijo Unitario (ej. Catálogo 08, código 02) [1]

                        // 1. Quitar el efecto multiplicador del IGV:
                        let desc_post_igv = descuento_total_monetario
                        if (isGravado) {
                            // Dividir entre (1 + Tasa IGV)
                            desc_post_igv =
                                descuento_total_monetario / (1 + actual_igv_rate_for_calculation)
                        }

                        // 2. Quitar el componente total del ISC Fijo:
                        // Descuento_Base_ISC = Descuento_post_IGV - (ISC_unitario_fijo * cantidad)
                        const isc_total_fijo = isc_monto_fijo_uni * cantidad
                        descuento_total_sin_tributos = Math.max(0, desc_post_igv - isc_total_fijo)
                    } else if (isc_porcentaje > 0) {
                        // Caso 2: ISC por Porcentaje (ej. Catálogo 08, código 01) [2]

                        // 1. Calcular el factor de impuestos combinados: (1 + Tasa ISC) * (1 + Tasa IGV)
                        let factor_impuestos = 1 + ISC_RATE_DECIMAL
                        if (isGravado) {
                            factor_impuestos *= 1 + actual_igv_rate_for_calculation
                        }

                        // 2. Dividir el descuento total por el factor de impuestos combinados para obtener la base sin tributos:
                        descuento_total_sin_tributos = descuento_total_monetario / factor_impuestos
                    } else {
                        // Caso 3: Solo IGV (o Exonerado/Inafecto Oneroso)
                        descuento_total_sin_tributos = isGravado
                            ? descuento_total_monetario / (1 + actual_igv_rate_for_calculation)
                            : descuento_total_monetario
                    }

                    // Dividir el descuento total sin tributos por la cantidad para obtener el descuento unitario a la base (VAL_UNIT_ITEM)
                    monto_dscto_unitario_sin_igv = descuento_total_sin_tributos / cantidad
                } else if (descuento_tipo == 2) {
                    // Descuento en porcentaje
                    monto_dscto_unitario_sin_igv = val_unit_item_raw * (descuento_valor / 100)
                }
            }
            // Asegurarse de que el descuento no haga el valor unitario negativo
            const val_unit_item_after_discount = Math.max(
                0,
                val_unit_item_raw - monto_dscto_unitario_sin_igv,
            )

            // 7. Recalcular ISC unitario final después del descuento del item (si es por porcentaje)
            let isc_unitario_final =
                isc_monto_fijo_uni > 0
                    ? isc_monto_fijo_uni
                    : isc_porcentaje > 0
                      ? val_unit_item_after_discount * ISC_RATE_DECIMAL
                      : 0

            // 8. Calcular IGV unitario final
            let mnt_igv_item_unitario_final = 0
            if (isGravado) {
                // MNT_IGV_ITEM = (VAL_UNIT_ITEM + MNT_ISC_ITEM) x POR_IGV_ITEM
                mnt_igv_item_unitario_final =
                    (val_unit_item_after_discount + isc_unitario_final) *
                    actual_igv_rate_for_calculation
            }

            // 9. Calcular PRC_VTA_UNIT_ITEM (precio de venta unitario final)
            const precio_venta_unitario_final =
                val_unit_item_after_discount +
                isc_unitario_final +
                mnt_igv_item_unitario_final +
                bolsa_tax_unit_amount

            // 10. Asignar al producto
            item.PRC_VTA_UNIT_ITEM = precio_venta_unitario_final // Precio del item incluido IGV
            item.VAL_UNIT_ITEM = val_unit_item_after_discount // Valor del item sin IGV
            item.VAL_VTA_ITEM = val_unit_item_after_discount * cantidad // Valor total del item sin IGV
            item.MNT_BRUTO = mnt_bruto_total // Monto bruto del item
            item.MNT_PV_ITEM = precio_venta_unitario_final * cantidad // Venta Total del ITEM incluido IGV, descuentos, cargos adicionales

            item.COD_TIP_PRC_VTA = cod_tip_prc_vta
            item.COD_TRIB_IGV_ITEM = cod_trib_igv_item // Código de tributo IGV/IVAP (Catálogo 05)
            item.POR_IGV_ITEM = por_igv_item_output // Tasa de IGV del item
            item.MNT_IGV_ITEM = mnt_igv_item_unitario_final * cantidad // IGV total del item

            item.MNT_DSCTO_ITEM = 0
            if (monto_dscto_unitario_sin_igv * cantidad > 0) {
                item.MNT_DSCTO_ITEM = monto_dscto_unitario_sin_igv * cantidad // Monto total del descuento del item sin IGV
            }
            if (isc_unitario_final > 0) {
                item.MNT_ISC_ITEM = isc_unitario_final * cantidad // ISC total del item
                item.POR_ISC_ITEM = por_isc_item_output // Porcentaje de ISC del item
                item.COD_TIP_SIST_ISC = cod_tip_sist_isc // Código de sistema de cálculo del ISC (Catálogo 08)
            }
            if (bolsa_tax_unit_amount > 0) {
                item.IMPUESTO_BOLSAS_UNIT = bolsa_tax_unit_amount // Impuesto a la bolsa unitario
            }

            const esOperacionGratuita = item.COD_TIP_PRC_VTA === '02'
            if (esOperacionGratuita) {
                item.valor_venta = 0.0
                item.igv = 0.0
                item.total = 0.0
            } else {
                item.valor_venta = item.VAL_VTA_ITEM
                item.igv = item.MNT_IGV_ITEM
                item.total = item.MNT_PV_ITEM
            }
        },
        calculateInvoiceTotals() {
            // --- Procesamiento de ítems y acumulación de totales ---
            let rawTotalGravadoItems = 0
            let rawTotalExoneradoItems = 0
            let rawTotalInafectoItems = 0
            let rawTotalGratuitoItems = 0
            let rawTotalIgvItems = 0
            let rawTotalIscItems = 0
            let rawTotalDescuentoItems = 0 // Descuentos por ítem
            let rawTotalIcbperItems = 0

            // Catálogo 07 para identificar ítems inafectos (operación onerosa)
            const codigosAfectacionInafectoOneroso = ['30', '40'] // 30: Inafecto - Operación Onerosa, 40: Exportación de Bienes o Servicios

            for (const item of this.vista.comprobante.comprobante_items) {
                this.calculateInvoiceLineValues(item)

                const valVtaItem = item.VAL_VTA_ITEM
                const mntIgvItem = item.MNT_IGV_ITEM || 0
                const mntIscItem = item.MNT_ISC_ITEM || 0
                const mntDsctoItem = item.MNT_DSCTO_ITEM || 0
                const impBolsaUnit = item.IMPUESTO_BOLSAS_UNIT || 0
                const cantUnidItem = item.cantidad

                // Suma de impuestos de todos los ítems
                rawTotalIscItems += mntIscItem
                rawTotalDescuentoItems += mntDsctoItem
                rawTotalIcbperItems += impBolsaUnit * cantUnidItem

                // Separación de bases imponibles (gravado, exonerado, inafecto, gratuito)
                const igvAfectacion = item.igv_afectacion
                if (this.codigosAfectacionGratuitas.includes(igvAfectacion)) {
                    // Gratuito
                    rawTotalGratuitoItems += valVtaItem
                } else if (igvAfectacion === '10' || igvAfectacion === '17') {
                    // Gravado
                    rawTotalGravadoItems += valVtaItem
                    rawTotalIgvItems += mntIgvItem
                } else if (igvAfectacion === '20') {
                    // Exonerado
                    console.log(item.articulo, item.nombre)
                    rawTotalExoneradoItems += valVtaItem
                } else if (codigosAfectacionInafectoOneroso.includes(igvAfectacion)) {
                    // Inafecto
                    rawTotalInafectoItems += valVtaItem
                }
            }

            this.vista.totals = {}

            // Aplicar Descuento Global (reduce la base gravada y su IGV si aplica)
            const descuentoGlobalBase = this.vista.descuento_global?.monto || 0
            const descuentoGlobalTipo = this.vista.descuento_global?.tipo

            if (descuentoGlobalBase && descuentoGlobalBase > 0) {
                if (rawTotalGravadoItems > 0) {
                    const factorReduccion = descuentoGlobalBase / rawTotalGravadoItems
                    rawTotalGravadoItems -= descuentoGlobalBase
                    rawTotalIgvItems -= rawTotalIgvItems * factorReduccion
                } else if (rawTotalExoneradoItems > 0) {
                    rawTotalExoneradoItems -= descuentoGlobalBase
                } else if (rawTotalInafectoItems > 0) {
                    rawTotalInafectoItems -= descuentoGlobalBase
                }

                this.vista.totals.MNT_DSCTO_GLOB = descuentoGlobalBase

                // Si hay anticipo, este sobrescribe el COD_TIP_DSCTO del anticipo. Se debe manejar la prioridad si ambos aplican. Por simplicidad, el último que se asigna prevalece.
                if (descuentoGlobalTipo) this.vista.totals.COD_TIP_DSCTO = descuentoGlobalTipo
            }

            // Asegurarse de que los totales no sean negativos después de descuentos/anticipos
            rawTotalGravadoItems = Math.max(0, rawTotalGravadoItems)
            rawTotalExoneradoItems = Math.max(0, rawTotalExoneradoItems)
            rawTotalInafectoItems = Math.max(0, rawTotalInafectoItems)
            rawTotalIgvItems = Math.max(0, rawTotalIgvItems)

            // --- Asignación de totales finales a la cabecera ---
            this.vista.totals.MNT_TOT_GRAVADO = rawTotalGravadoItems
            this.vista.totals.MNT_TOT_EXONERADO = rawTotalExoneradoItems
            this.vista.totals.MNT_TOT_INAFECTO = rawTotalInafectoItems
            this.vista.totals.MNT_TOT_GRATUITO = rawTotalGratuitoItems
            this.vista.totals.MNT_TOT_DESCUENTO = rawTotalDescuentoItems
            this.vista.totals.MNT_TOT_TRIB_IGV = rawTotalIgvItems
            this.vista.totals.MNT_TOT_TRIB_ISC = rawTotalIscItems
            this.vista.totals.MNT_IMPUESTO_BOLSAS = rawTotalIcbperItems

            // Cálculo del Monto Total del Documento (MNT_TOT)
            this.vista.totals.MNT_TOT =
                rawTotalGravadoItems +
                rawTotalExoneradoItems +
                rawTotalInafectoItems +
                rawTotalIgvItems +
                rawTotalIscItems +
                rawTotalIcbperItems

            this.vista.totals.importe_total = this.vista.totals.MNT_TOT

            this.calcularPorPagar()
        },

        setDescuentoTipo(item) {
            item.descuento_valor = null
            // item.descuento_base = null
            // item.descuento_factor = null
            // item.descuento_total = null

            this.calculateInvoiceTotals()
            // this.sumarUno(item)
        },
        setDescuentoValor(item) {
            if (item.descuento_tipo == 1) {
                if (item.descuento_valor > item.pu * item.cantidad) {
                    jmsg('warning', 'El descuento no puede ser mayor al importe')
                    item.descuento_valor = null
                }
            } else if (item.descuento_tipo == 2) {
                if (item.descuento_valor > 100) {
                    jmsg('warning', 'El descuento no puede ser mayor a 100%')
                    item.descuento_valor = null
                }
            }

            this.calculateInvoiceTotals()
            // this.sumarUno(item)
        },
        setCortesia(item) {
            const i = this.vista.comprobante.comprobante_items.findIndex(
                (a) => a.articulo == item.articulo,
            )

            if (item.igv_afectacion == '10') {
                this.vista.comprobante.comprobante_items[i].igv_afectacion =
                    item.igv_afectacion == '10' ? '12' : '10'
            } else if (item.igv_afectacion == '20') {
                this.vista.comprobante.comprobante_items[i].igv_afectacion =
                    item.igv_afectacion == '20' ? '21' : '20'
            } else if (item.igv_afectacion == '30') {
                this.vista.comprobante.comprobante_items[i].igv_afectacion =
                    item.igv_afectacion == '30' ? '37' : '30'
            }

            this.vista.comprobante.comprobante_items[i].descuento_tipo = null
            this.vista.comprobante.comprobante_items[i].descuento_valor = null
            // this.vista.comprobante.comprobante_items[i].descuento_base = null
            // this.vista.comprobante.comprobante_items[i].descuento_factor = null
            // this.vista.comprobante.comprobante_items[i].descuento_total = null
            // this.vista.comprobante.comprobante_items[i].descuento_vu = null

            this.calculateInvoiceTotals()
        },
        quitarArticulo(item) {
            const i = this.vista.comprobante.comprobante_items.findIndex(
                (a) => a.articulo == item.articulo,
            )
            this.vista.comprobante.comprobante_items.splice(i, 1)

            // this.sumarItems()
            this.calculateInvoiceTotals()
            this.calcularPorPagar()
        },

        setPagoCondicion() {
            for (const a of this.vista.pago_metodos) {
                a.monto = null
            }

            this.calcularPorPagar()
        },
        pagoExacto(item) {
            if (item.monto > 0) {
                item.monto = null
            } else {
                item.monto = redondear(this.vista.totals.importe_total, 2)
            }

            this.calcularPorPagar()
        },
        calcularPorPagar() {
            let pagos_monto = 0

            for (const a of this.vista.pago_metodos) {
                if (a.monto) pagos_monto += Number(a.monto)
            }

            if (pagos_monto == 0) {
                this.vista.porPagar = this.vista.totals.importe_total
                this.vista.vuelto = 0
            } else if (pagos_monto <= this.vista.totals.importe_total) {
                this.vista.porPagar = this.vista.totals.importe_total - pagos_monto
                this.vista.vuelto = 0
            } else {
                this.vista.porPagar = 0
                this.vista.vuelto = pagos_monto - this.vista.totals.importe_total
            }
        },

        setSocio(item) {
            this.vista.socio = item
        },
        nuevoSocio() {
            const send = { tipo: 2, activo: true }

            this.useModals.setModal('mSocio', 'Nuevo cliente', 1, send)
        },
        setSocioCreated(item) {
            this.vista.socios = [item]
            this.vista.comprobante.socio = item.id

            this.setSocio(item)
        },

        checkDatos() {
            const props = ['fecha_emision', 'doc_tipo', 'socio', 'pago_condicion']

            if (incompleteData(this.vista.comprobante, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            if (this.vista.comprobante.doc_tipo == '01') {
                if (['0', '1', '4', '7'].includes(this.vista.socio.doc_tipo)) {
                    jmsg('error', 'El cliente debe tener RUC')
                    return true
                }
            }

            if (this.vista.comprobante.doc_tipo == '03') {
                // if (this.vista.socio.doc_numero == '00000000') {
                //     jmsg('error', 'El cliente debe tener un DNI válido')
                //     return true
                // }

                if (['6', '4', '7'].includes(this.vista.socio.doc_tipo)) {
                    jmsg('error', 'El cliente debe tener DNI')
                    return true
                }
            }

            if (this.vista.comprobante.comprobante_items.length == 0) {
                jmsg('warning', 'Debe agregar al menos un artículo')
                return true
            }

            for (const a of this.vista.comprobante.comprobante_items) {
                const props1 = [
                    'articulo',
                    'nombre',
                    'unidad',
                    'cantidad',
                    'pu',
                    'igv',
                    'igv_afectacion',
                ]

                if (incompleteData(a, props1)) {
                    jmsg('warning', 'Ingrese los datos necesarios de cada articulo')
                    return true
                }

                if (a.cantidad < 1) {
                    jmsg('warning', 'Lo cantidad en cada articulo no puede ser menor a 1')
                    return true
                }
            }

            if (this.vista.comprobante.pago_condicion == 1) {
                if (redondear(this.vista.porPagar) > 0) {
                    jmsg('warning', 'Importes de pago insuficientes')
                    return true
                }
            }

            return false
        },
        shapeDatos() {
            if (this.vista.comprobante.pago_condicion == 2) {
                this.vista.comprobante.pago_metodos = []
            } else {
                this.vista.comprobante.pago_metodos = this.vista.pago_metodos
            }

            // this.vista.comprobante.sub_total_ventas = this.vista.totals.sub_total_ventas
            // this.vista.comprobante.anticipos = this.vista.totals.anticipos
            // this.vista.comprobante.descuentos = this.vista.totals.descuentos
            // this.vista.comprobante.valor_venta = this.vista.totals.valor_venta
            // this.vista.comprobante.isc = this.vista.totals.isc
            // this.vista.comprobante.igv = this.vista.totals.igv
            // this.vista.comprobante.icbper = this.vista.totals.icbper
            // this.vista.comprobante.otros_cargos = this.vista.totals.otros_cargos
            // this.vista.comprobante.otros_tributos = this.vista.totals.otros_tributos
            // this.vista.comprobante.monto = this.vista.totals.importe_total

            this.vista.comprobante.gravado = this.vista.totals.MNT_TOT_GRAVADO
            this.vista.comprobante.exonerado = this.vista.totals.MNT_TOT_EXONERADO
            this.vista.comprobante.inafecto = this.vista.totals.MNT_TOT_INAFECTO
            this.vista.comprobante.gratuito = this.vista.totals.MNT_TOT_GRATUITO
            this.vista.comprobante.descuentos = this.vista.totals.MNT_TOT_DESCUENTO
            this.vista.comprobante.igv = this.vista.totals.MNT_TOT_TRIB_IGV
            this.vista.comprobante.isc = this.vista.totals.MNT_TOT_TRIB_ISC
            this.vista.comprobante.icbper = this.vista.totals.MNT_IMPUESTO_BOLSAS
            this.vista.comprobante.monto = this.vista.totals.MNT_TOT
        },
        async grabar1() {
            if (this.checkDatos()) return
            this.shapeDatos()

            console.log(this.vista.comprobante)
        },
        async grabar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(urls.comprobantes, this.vista.comprobante)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const vistaPedidos = this.useVistas.vPedidos
            if (vistaPedidos) {
                vistaPedidos.reload = true
            }
            this.useVistas.closePestana('vEmitirComprobante', 'vPedidos')
        },
        async grabarImprimir() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(urls.comprobantes, this.vista.comprobante)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const vistaPedidos = this.useVistas.vPedidos
            if (vistaPedidos) {
                vistaPedidos.reload = true
            }
            this.useVistas.closePestana('vEmitirComprobante', 'vPedidos')
        },

        runMethod(method, item) {
            this[method](item)
        },
        regresar() {
            this.useVistas.closePestana('vEmitirComprobante', 'vPedidos')
        },
    },
}
</script>

<style lang="scss" scoped>
.comanda {
    height: 100%;
    overflow: hidden;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 2rem;

    .left {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 2rem;

        .datos {
            display: grid;
            grid-template-columns: repeat(4, 7rem);
            gap: 0.5rem;

            .dato-cliente {
                display: flex;
                gap: 0.5rem;
            }
        }

        .totales {
            background-color: var(--bg-color2);
            padding: 1rem;
            border-radius: 0.5rem;
            display: grid;
            grid-template-columns: 10rem 1fr;
            gap: 0.5rem;
            align-items: center;

            p {
                text-align: right;
            }

            .total {
                font-size: 1.5rem;
                text-align: right;
            }
        }
    }

    > .right {
        display: grid;
        grid-template-rows: 1fr auto;
        gap: 1rem;
        overflow: hidden;

        .pedido-items {
            .item_descuento {
                display: flex;
            }
        }

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
                grid-template-columns: 1fr 1fr 1fr;
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

            .container-credito {
                text-align: center;

                p {
                    font-size: 1.3rem;
                }

                span {
                    color: var(--text-color2);
                }
            }
        }
    }
}
</style>

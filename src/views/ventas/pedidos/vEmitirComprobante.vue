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
                        v-model="vista.comprobante.fecha"
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
                    <span>Sub Total Ventas:</span>
                    <p>{{ redondear(vista.totals.sub_total_ventas) }}</p>

                    <!-- <span>Anticipos:</span>
                    <p>{{ redondear(vista.totals.anticipos) }}</p> -->

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

                    <!-- <span>Otros Cargos:</span>
                    <p>{{ redondear(vista.totals.otros_cargos) }}</p>

                    <span>Otros Tributos:</span>
                    <p>{{ redondear(vista.totals.otros_tributos) }}</p> -->

                    <strong>Importe Total</strong>
                    <strong class="total">
                        {{ redondear(vista.totals.importe_total) }}
                    </strong>
                </div>
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
                        <div class="item_descuento" v-if="item.igv_afectacion == 10">
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
                            <!-- {{ redondear(item.descuento_vu) }} -->
                        </div>

                        <div v-else>
                            CORTESÍA
                        </div>
                        {{ item.igv_afectacion }}
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

        calculateInvoiceLineValues(product) {
            const tributosCatalog = this.vista.CATALOGO_TRIBUTOS_SUNAT
            const bolsa_tax_unit_amount = 0.5
            // asegurar números
            const pu = product.pu
            const igvPct = product.igv_porcentaje
            const igvRate = igvPct / 100
            const cantidad = product.cantidad

            // 1) calcular VU (valor unitario sin IGV) según afectación
            // si la afectación es gravada (10) y el PU viene con IGV -> quitar IGV
            const igvAfect = product.igv_afectacion
            const vu = igvAfect === '10' ? pu / (1 + igvRate) : Number(product.vu ?? pu)
            // Nota: si product.vu ya está definido y correcto (sin IGV), preferirlo; si no, usar pu.

            // defaults
            const has_bolsa_tax = !!product.has_bolsa_tax
            const isc_porcentaje = product.isc_porcentaje
            const isc_precio_sugerido = product.isc_precio_sugerido
            const isc_monto_fijo_unitario = product.isc_monto_fijo_unitario
            const ivap_porcentaje = product.ivap_porcentaje

            // tax_info fallback
            let tax_info = tributosCatalog[igvAfect]
            if (!tax_info) {
                const defaultInafecto = tributosCatalog['30'] || {
                    codigo_tributo: '9998',
                    codigo_internacional: 'FRE',
                    codigo: 'INA',
                    nombre: 'Inafecto',
                    categoria_impuesto_id: 'O',
                }
                tax_info = {
                    ...defaultInafecto,
                    codigo_tributo: '9998',
                    nombre: `Desconocido - ${igvAfect}`,
                }
            }

            // -------------------
            // 2) Descuento: calcular antes de impuestos
            // product.descuento_tipo:
            //   1 => descuento monetario TOTAL de la línea (se asume con IGV incluido)
            //   2 => descuento porcentaje (ej. 10 => 10%)
            // -------------------
            let descuento_vu = 0 // descuento por unidad (neto)
            let descuento_total = 0 // descuento total neto (línea)
            let descuento_base = 0 // base sobre la que aplica % descuento (vu * qty)
            let descuento_factor = 0 // porcentaje en decimal

            if (
                product.descuento_tipo != null &&
                product.descuento_valor != null &&
                product.descuento_valor !== 0
            ) {
                if (product.descuento_tipo == 1) {
                    // descuento_valor = monto total del descuento en PRECIO CON IGV (para toda la línea)
                    const descuentoConIGV = product.descuento_valor
                    const descuentoTotalNeto = descuentoConIGV / (1 + igvRate) // pasar a monto neto
                    descuento_vu = descuentoTotalNeto / cantidad
                    descuento_total = descuentoTotalNeto
                    descuento_base = vu * cantidad
                    descuento_factor = descuento_base > 0 ? descuento_vu / vu : 0
                } else if (product.descuento_tipo === 2) {
                    // descuento_valor es porcentaje
                    descuento_base = vu * cantidad
                    descuento_factor = product.descuento_valor / 100
                    descuento_total = descuento_base * descuento_factor
                    descuento_vu = vu * descuento_factor
                }
            } else {
                descuento_vu = 0
                descuento_total = 0
                descuento_base = 0
                descuento_factor = 0
            }

            // cortar errores numéricos
            descuento_vu = Number(descuento_vu || 0)
            descuento_total = Number(descuento_total || 0)
            descuento_base = Number(descuento_base || 0)
            descuento_factor = Number(descuento_factor || 0)

            // 3) Valor unitario neto después de descuento (base para impuestos)
            const vu_neto = vu - descuento_vu // POR UNIDAD
            const valor_total_sin_impuestos_raw =
                tax_info.codigo_tributo === '9996' ? 0 : vu_neto * cantidad

            // 4) ICBPER (independiente del descuento, es por unidad)
            const icbper_unitario = has_bolsa_tax ? bolsa_tax_unit_amount : 0
            const icbper_total = icbper_unitario * cantidad

            // 5) ISC (calcular sobre base neta cuando aplica sistema '01'; si '02' o '03' sigue su lógica)
            let isc_unitario = 0,
                isc_base_unit = 0,
                isc_percent = 0,
                isc_tier = ''
            if (product.isc_sistema_codigo) {
                switch (product.isc_sistema_codigo) {
                    case '01':
                        isc_unitario = vu_neto * (isc_porcentaje / 100) // base = vu_neto
                        isc_base_unit = vu_neto
                        isc_percent = isc_porcentaje
                        isc_tier = '01'
                        break
                    case '02':
                        isc_unitario = isc_monto_fijo_unitario
                        isc_base_unit = isc_monto_fijo_unitario
                        isc_percent = 0
                        isc_tier = '02'
                        break
                    case '03':
                        isc_unitario = isc_precio_sugerido * (isc_porcentaje / 100)
                        isc_base_unit = isc_precio_sugerido
                        isc_percent = isc_porcentaje
                        isc_tier = '03'
                        break
                }
            }
            const isc_total = isc_unitario * cantidad
            const isc_base_total = isc_base_unit * cantidad

            // 6) IVAP (si aplica)
            const ivap_unitario = igvAfect === '17' ? vu_neto * (ivap_porcentaje / 100) : 0
            const ivap_total = ivap_unitario * cantidad

            // 7) IGV base y cálculo (IGV efectivo solo si afectacion == '10')
            const igv_base_unit = vu_neto + isc_unitario // base unitaria para IGV
            const igv_unitario = igvAfect === '10' ? igv_base_unit * igvRate : 0
            const igv_total = igv_unitario * cantidad
            const igv_base_total = igv_base_unit * cantidad

            // 8) Totales y precio referencia
            const total_impuestos = igv_total + isc_total + ivap_total + icbper_total
            const precio_unitario_final = Number(
                (vu_neto + isc_unitario + ivap_unitario + igv_unitario + icbper_unitario).toFixed(
                    10,
                ),
            ) // 10 decs para XML si quieres
            const valor_total_sin_impuestos = valor_total_sin_impuestos_raw
            const descuento_total_round = descuento_total
            const igv_total_round = igv_total
            const isc_total_round = isc_total
            const icbper_total_round = icbper_total
            const ivap_total_round = ivap_total
            const total_impuestos_round = total_impuestos
            const valor_venta_round = vu_neto * cantidad
            const total_linea_round = valor_venta_round + total_impuestos_round

            // también asignar campos en product si los necesitas (opcional)
            product.vu = vu
            product.descuento_vu = descuento_vu
            product.descuento_total = descuento_total_round
            product.descuento_base = descuento_base
            product.descuento_factor = descuento_factor

            const noOnerosas = ['11','12','13','14','15','16','17']
            product.valor_venta = noOnerosas.includes(igvAfect) ? 0 : valor_venta_round
            product.igv = noOnerosas.includes(igvAfect) ? 0 : igv_total_round
            product.total = noOnerosas.includes(igvAfect) ? 0 : total_linea_round

            // product.valor_venta = valor_venta_round
            // product.igv = igv_total_round
            // product.total = total_linea_round

            // ====================== RETORNO ======================
            return {
                descripcion: product.descripcion,
                producto_codigo: product.codigo,
                unidad: product.unidad,
                cantidad: cantidad,

                valor_unitario_neto: Number(vu_neto.toFixed(10)), // por unidad sin IGV (después de descuento)
                valor_total_sin_impuestos: valor_total_sin_impuestos, // base de la línea (2 dec)
                precio_unitario_final: precio_unitario_final, // para PricingReference (10 decs)
                // total_linea: total_linea_round, // total final por línea
                total_linea: noOnerosas.includes(igvAfect) ? 0 : total_linea_round,

                descuentos: {
                    total: descuento_total_round,
                    base: descuento_base,
                    factor: Number(descuento_factor.toFixed(6)),
                },

                impuestos: {
                    total: total_impuestos_round,
                    igv: {
                        base_unit: Number(igv_base_unit.toFixed(10)),
                        base_total: igv_base_total,
                        porcentaje: igvPct,
                        monto_unitario: Number(igv_unitario.toFixed(10)),
                        monto_total: igv_total_round,
                        codigo_afectacion: igvAfect,
                    },
                    icbper: {
                        monto_unitario: Number(icbper_unitario.toFixed(2)),
                        monto_total: icbper_total_round,
                        cantidad_bolsas: has_bolsa_tax ? cantidad : 0,
                    },
                    isc: {
                        base_unit: Number(isc_base_unit.toFixed(10)),
                        base_total: isc_base_total,
                        porcentaje: isc_percent,
                        monto_unitario: Number(isc_unitario.toFixed(10)),
                        monto_total: isc_total_round,
                        sistema: product.isc_sistema_codigo,
                        tier_range: isc_tier,
                    },
                    ivap: {
                        porcentaje: ivap_porcentaje,
                        monto_unitario: Number(ivap_unitario.toFixed(10)),
                        monto_total: ivap_total_round,
                    },
                },
            }
        },
        calculateInvoiceTotals(
            globalAllowanceAmount = 0,
            globalChargeAmount = 0,
            prepaidAmount = 0,
        ) {
            const tributosCatalog = this.vista.CATALOGO_TRIBUTOS_SUNAT

            let GrossLineExtensionAmount = 0 // Sub total ventas antes de descuentos
            // let LineExtensionAmount = 0 // Base después de descuentos
            let totalTaxAmountInvoice = 0
            let AllowanceTotalAmount = globalAllowanceAmount
            let ChargeTotalAmount = globalChargeAmount

            const aggregatedTaxes = {}

            for (const item of this.vista.comprobante.comprobante_items) {
                const lineData = this.calculateInvoiceLineValues(item, tributosCatalog)

                // Base neta después de descuentos (valor de venta de la línea)
                const postDiscountBase = Number(lineData.valor_total_sin_impuestos || 0)

                // Descuento de línea
                const lineDiscount = Number((lineData.descuentos && lineData.descuentos.total) || 0)

                // Base antes de descuentos = base después + descuento de línea
                const preDiscountBase = postDiscountBase + lineDiscount

                // Acumular
                GrossLineExtensionAmount += preDiscountBase // Sub total ventas (antes de descuentos)
                // LineExtensionAmount += postDiscountBase // auxiliar (neto)
                totalTaxAmountInvoice += Number(
                    lineData.impuestos && lineData.impuestos.total ? lineData.impuestos.total : 0,
                )

                // Descuentos (global + líneas)
                AllowanceTotalAmount += lineDiscount

                // Agregar impuestos agrupados
                if (lineData.impuestos) {
                    aggregatedTaxes.igv =
                        (aggregatedTaxes.igv || 0) +
                        Number((lineData.impuestos.igv && lineData.impuestos.igv.monto_total) || 0)
                    aggregatedTaxes.isc =
                        (aggregatedTaxes.isc || 0) +
                        Number((lineData.impuestos.isc && lineData.impuestos.isc.monto_total) || 0)
                    aggregatedTaxes.icbper =
                        (aggregatedTaxes.icbper || 0) +
                        Number(
                            (lineData.impuestos.icbper && lineData.impuestos.icbper.monto_total) ||
                                0,
                        )
                    aggregatedTaxes.ivap =
                        (aggregatedTaxes.ivap || 0) +
                        Number(
                            (lineData.impuestos.ivap && lineData.impuestos.ivap.monto_total) || 0,
                        )

                    for (const [k, v] of Object.entries(lineData.impuestos)) {
                        if (['total', 'igv', 'isc', 'icbper', 'ivap'].includes(k)) continue
                        if (v && typeof v.monto_total === 'number') {
                            aggregatedTaxes.otros = (aggregatedTaxes.otros || 0) + v.monto_total
                        }
                    }
                }
            }

            // Sub total ventas = suma bases antes de descuentos
            const SubTotalVentas = GrossLineExtensionAmount

            // Descuentos = global + líneas
            const Descuentos = AllowanceTotalAmount

            // Valor venta = sub total - descuentos
            const ValorVenta = SubTotalVentas - Descuentos

            // Importe total = valor venta + impuestos + cargos - anticipos
            const ImporteTotal =
                ValorVenta + totalTaxAmountInvoice + ChargeTotalAmount - prepaidAmount

            // Guardar resultados
            this.vista.totals = {
                sub_total_ventas: SubTotalVentas,
                anticipos: prepaidAmount,
                descuentos: Descuentos,
                valor_venta: ValorVenta,
                isc: aggregatedTaxes.isc || 0,
                igv: aggregatedTaxes.igv || 0,
                icbper: aggregatedTaxes.icbper || 0,
                otros_cargos: ChargeTotalAmount,
                otros_ributos: (aggregatedTaxes.ivap || 0) + (aggregatedTaxes.otros || 0),
                importe_total: ImporteTotal,
            }

            this.calcularPorPagar()
        },
        sumarUno(item) {
            if (item.cantidad > item.cantidadMax) {
                item.cantidad = item.cantidadMax
                return jmsg('warning', 'Cantidad no disponible')
            }

            this.calculateInvoiceTotals()
        },

        // calcularUno(a) {
        //     a.vu = a.igv_afectacion == '10' ? a.pu / (1 + a.igv_porcentaje / 100) : a.pu

        //     // --- DESCUENTO --- //
        //     if (a.descuento_tipo != null && a.descuento_valor != null && a.descuento_valor != 0) {
        //         if (a.descuento_tipo == 1) {
        //             a.descuento_vu =
        //                 a.igv_afectacion == '10'
        //                     ? a.descuento_valor / (1 + a.igv_porcentaje / 100)
        //                     : a.descuento_valor
        //         } else if (a.descuento_tipo == 2) {
        //             a.descuento_vu =
        //                 a.igv_afectacion == '10'
        //                     ? (a.pu * (a.descuento_valor / 100)) / (1 + a.igv_porcentaje / 100)
        //                     : a.pu * (a.descuento_valor / 100)
        //         }
        //     } else {
        //         a.descuento_vu = 0
        //     }

        //     a.mtoValorVenta = a.cantidad * (a.vu - a.descuento_vu)
        //     a.igv = a.igv_afectacion == '10' ? a.mtoValorVenta * (a.igv_porcentaje / 100) : 0
        //     a.total = a.mtoValorVenta + a.igv
        // },
        // calcularTotales() {
        //     this.vista.mtoOperGravadas = 0
        //     this.vista.mtoOperExoneradas = 0
        //     this.vista.mtoOperInafectas = 0
        //     this.vista.mtoIGV = 0
        //     this.vista.total_descuento = 0

        //     for (const a of this.vista.comprobante.comprobante_items) {
        //         if (a.igv_afectacion == '10') {
        //             this.vista.mtoOperGravadas += a.mtoValorVenta
        //             this.vista.mtoIGV += a.igv
        //         } else if (a.igv_afectacion == '20') {
        //             this.vista.mtoOperExoneradas += a.mtoValorVenta
        //         } else if (a.igv_afectacion == '30') {
        //             this.vista.mtoOperInafectas += a.mtoValorVenta
        //         }

        //         this.vista.total_descuento += a.descuento_vu * a.cantidad
        //     }

        //     this.vista.valorVenta =
        //         this.vista.mtoOperGravadas +
        //         this.vista.mtoOperExoneradas +
        //         this.vista.mtoOperInafectas
        //     this.vista.mtoImpVenta = this.vista.valorVenta + this.vista.mtoIGV
        // },
        // sumarItems() {
        //     // for (const a of this.vista.comprobante.comprobante_items) this.calcularUno(a)

        //     // this.calcularTotales()
        // },

        setDescuentoTipo(item) {
            item.descuento_valor = null
            item.descuento_base = null
            item.descuento_factor = null
            item.descuento_total = null

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
            this.vista.comprobante.comprobante_items[i].igv_afectacion =
                item.igv_afectacion == '10' ? '12' : '10'

            this.vista.comprobante.comprobante_items[i].descuento_tipo = null
            this.vista.comprobante.comprobante_items[i].descuento_valor = null
            this.vista.comprobante.comprobante_items[i].descuento_base = null
            this.vista.comprobante.comprobante_items[i].descuento_factor = null
            this.vista.comprobante.comprobante_items[i].descuento_total = null
            this.vista.comprobante.comprobante_items[i].descuento_vu = null

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
            const props = ['fecha', 'doc_tipo', 'socio', 'pago_condicion']

            if (incompleteData(this.vista.comprobante, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            if (this.vista.comprobante.doc_tipo == '01') {
                if (['1', '4', '7'].includes(this.vista.socio.doc_tipo)) {
                    jmsg('error', 'El cliente debe tener RUC')
                    return true
                }
            }

            if (this.vista.comprobante.doc_tipo == '03') {
                if (this.vista.socio.doc_numero == '00000000') {
                    jmsg('error', 'El cliente debe tener un DNI válido')
                    return true
                }

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

            this.vista.comprobante.sub_total_ventas = this.vista.totals.sub_total_ventas
            this.vista.comprobante.anticipos = this.vista.totals.anticipos
            this.vista.comprobante.descuentos = this.vista.totals.descuentos
            this.vista.comprobante.valor_venta = this.vista.totals.valor_venta
            this.vista.comprobante.isc = this.vista.totals.isc
            this.vista.comprobante.igv = this.vista.totals.igv
            this.vista.comprobante.icbper = this.vista.totals.icbper
            this.vista.comprobante.otros_cargos = this.vista.totals.otros_cargos
            this.vista.comprobante.otros_tributos = this.vista.totals.otros_tributos
            this.vista.comprobante.monto = this.vista.totals.importe_total
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

<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>
                Emitir comprobante - Pedido N° {{ vista.comprobante.transaccion1.venta_codigo }}
                {{ atencion }}
            </strong>
            <!-- ASD {{ vista.comprobante.transaccion1 }} -->

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
                    @click="grabar(true)"
                    v-if="useAuth.verifyPermiso('vPedidos:generarComprobante')"
                />
            </div>
        </div>

        <div class="comanda">
            <div class="left">
                <div class="card datos">
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
                        :lista="vista.comprobante_tipos || []"
                        mostrar="tipo_serie"
                        :loaded="vista.comprobanteTiposLoaded"
                        @reload="loadComprobanteTipos"
                        style="grid-column: 1/5"
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

                <div class="card totales" v-if="vista.totals">
                    <span>Ope. gravadas:</span>
                    <p>{{ redondear(vista.totals.MNT_TOT_GRAVADO) }}</p>

                    <template v-if="false">
                        <span>Ope. exoneradas:</span>
                        <p>{{ redondear(vista.totals.MNT_TOT_EXONERADO) }}</p>

                        <span>Ope. inafectas:</span>
                        <p>{{ redondear(vista.totals.MNT_TOT_INAFECTO) }}</p>
                    </template>

                    <span>Ope. gratuitas:</span>
                    <p>{{ redondear(vista.totals.MNT_TOT_GRATUITO) }}</p>

                    <span>Descuentos:</span>
                    <p>{{ redondear(vista.totals.MNT_TOT_DESCUENTO) }}</p>

                    <span>IGV:</span>
                    <p>{{ redondear(vista.totals.MNT_TOT_TRIB_IGV) }}</p>

                    <template v-if="false">
                        <span>ISC:</span>
                        <p>{{ redondear(vista.totals.MNT_TOT_TRIB_ISC) }}</p>

                        <span>ICBPER:</span>
                        <p>{{ redondear(vista.totals.MNT_IMPUESTO_BOLSAS) }}</p>
                    </template>

                    <strong>Importe total:</strong>
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
                <div class="card">
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
                            <template
                                v-if="codigosAfectacionGratuitas.includes(item.igv_afectacion)"
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
                </div>

                <div class="card container-pagos">
                    <div class="head">
                        Métodos de pago

                        <p>
                            <small>Por pagar:</small>
                            {{ redondear(vista.porPagar) }}
                        </p>

                        <!-- <p>
                            <small>Vuelto:</small>
                            {{ redondear(vista.vuelto) }}
                        </p> -->
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
            {
                id: 'nombre',
                prop: 'articulo1.nombre',
                width: '15rem',
                title: 'Producto',
                show: true,
            },
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
    computed: {
        atencion() {
            if (this.vista.comprobante.transaccion1.venta_canal == 1) {
                return `(${this.vista.comprobante.transaccion1.venta_mesa1.salon1.nombre} - ${this.vista.comprobante.transaccion1.venta_mesa1.nombre})`
            } else if (this.vista.comprobante.transaccion1.venta_canal == 2) {
                return '(PARA LLEVAR)'
            } else if (this.vista.comprobante.transaccion1.venta_canal == 3) {
                return '(DELIVERY)'
            } else {
                return ''
            }
        },
    },
    async created() {
        this.vista = this.useVistas.vEmitirComprobante

        // this.sumarItems()
        await this.loadDatosSistema()
        await this.loadPagoMetodos()
        this.calculateInvoiceTotals()

        await this.loadComprobanteTipos()
        if (this.vista.comprobante_tipos && this.vista.comprobante_tipos.length > 0) {
            const comprobante_tipo_estandar = this.vista.comprobante_tipos.find(
                (a) => a.estandar == true,
            )
            this.vista.comprobante.doc_tipo = comprobante_tipo_estandar?.id
        }
    },
    methods: {
        async loadDatosSistema() {
            const qry = ['pago_condiciones']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
        async loadComprobanteTipos() {
            const qry = {
                fltr: {
                    activo: { op: 'Es', val: true },
                    'sucursal_comprobante_tipos.sucursal': {
                        op: 'Es',
                        val: this.useAuth.sucursal.id,
                    },
                    'sucursal_comprobante_tipos.estado': { op: 'Es', val: true },
                },
                cols: ['tipo', 'serie', 'tipo_serie', 'estandar'],
                incl: ['sucursal_comprobante_tipos'],
                ordr: [['nombre', 'asc']],
            }

            this.vista.comprobante_tipos = []
            this.useAuth.loading = { show: true, text: 'Cargando...' }
            this.vista.comprobanteTiposLoaded = false
            const res = await get(`${urls.comprobante_tipos}?qry=${JSON.stringify(qry)}`)
            this.vista.comprobanteTiposLoaded = true
            this.useAuth.loading = { show: false, text: '' }

            if (res.code != 0) return

            this.vista.comprobante_tipos = res.data
        },
        async loadPagoMetodos() {
            const qry = {
                fltr: {
                    activo: { op: 'Es', val: true },
                    'sucursal_pago_metodos.sucursal': { op: 'Es', val: this.useAuth.sucursal.id },
                    'sucursal_pago_metodos.estado': { op: 'Es', val: true },
                },
                cols: ['nombre', 'color'],
                incl: ['sucursal_pago_metodos'],
                ordr: [['nombre', 'asc']],
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

            this.vista.spinSocios = true
            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
            this.vista.spinSocios = false

            if (res.code !== 0) return

            this.vista.socios = res.data
        },
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

            const afectacionMap = {
                10: '12',
                12: '10',
                20: '21',
                21: '20',
                30: '37',
                37: '30',
            }

            const newAfectacion = afectacionMap[item.igv_afectacion]
            this.vista.comprobante.comprobante_items[i].igv_afectacion = newAfectacion

            this.vista.comprobante.comprobante_items[i].descuento_tipo = null
            this.vista.comprobante.comprobante_items[i].descuento_valor = null
            // this.vista.comprobante.comprobante_items[i].descuento_base = null
            // this.vista.comprobante.comprobante_items[i].descuento_factor = null
            // this.vista.comprobante.comprobante_items[i].descuento_total = null
            // this.vista.comprobante.comprobante_items[i].descuento_vu = null

            this.calculateInvoiceTotals()
        },
        quitarArticulo(item) {
            this.vista.comprobante.comprobante_items.splice(item.i, 1)

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

            const elegido = this.vista.comprobante_tipos.find(
                (a) => a.id == this.modal.comprobante.doc_tipo_nuevo,
            )

            if (elegido.tipo == '01') {
                if (['0', '1', '4', '7'].includes(this.vista.socio.doc_tipo)) {
                    jmsg('error', 'El cliente debe tener RUC')
                    return true
                }

                if (this.vista.socio.doc_numero == this.useAuth.empresa.ruc) {
                    jmsg('error', 'El cliente no puede ser el mismo que la empresa')
                    return true
                }
            }

            if (elegido.tipo == '03') {
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
                    // 'nombre',
                    // 'unidad',
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

                if (redondear(this.vista.vuelto) > 0) {
                    jmsg('warning', 'Importes de pago exceden al total')
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
        async grabar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            console.log(this.vista.comprobante)
        },
        async grabar1(print) {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(urls.comprobantes, this.vista.comprobante)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            if (print == true) await this.imprimir(res.data)

            this.useAuth.socket.emit('vEmitirComprobante:grabar', res.data_transaccion)
            if (this.vista.comprobante.transaccion1.venta_canal == '4') {
                this.useVistas.closePestana('vEmitirComprobante', 'vPos')
                this.useVistas.vPos.initPedido()
            } else {
                this.useVistas.closePestana('vEmitirComprobante', 'vPedidos')
            }

            this.vista.comprobante.transaccion1.venta_canal = null
        },
        async imprimir(data) {
            const send = {
                ...data,
                impresora: {
                    tipo: this.useAuth.usuario.impresora_caja.impresora_tipo,
                    nombre: this.useAuth.usuario.impresora_caja.impresora,
                },
                subdominio: this.useAuth.empresa.subdominio,
            }

            this.useAuth.socket.emit('vEmitirComprobante:imprimir', send)
        },

        runMethod(method, item) {
            this[method](item)
        },
        regresar() {
            if (this.vista.comprobante.transaccion1.venta_canal == '4') {
                this.useVistas.closePestana('vEmitirComprobante', 'vPos')
            } else {
                this.useVistas.closePestana('vEmitirComprobante', 'vPedidos')
            }

            this.vista.comprobante.transaccion1.venta_canal = null
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
    gap: 1rem;

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
            // background-color: var(--bg-color2);
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

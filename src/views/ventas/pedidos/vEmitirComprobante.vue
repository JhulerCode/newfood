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

                <div class="totales">
                    <span>Ope. gravadas:</span>
                    <p>{{ redondear(vista.mtoOperGravadas) }}</p>

                    <span>Ope. exoneradas:</span>
                    <p>{{ redondear(vista.mtoOperExoneradas) }}</p>

                    <span>Ope. inafectas:</span>
                    <p>{{ redondear(vista.mtoOperInafectas) }}</p>

                    <span>Subtotal:</span>
                    <p>{{ redondear(vista.valorVenta) }}</p>

                    <span>Impuesto:</span>
                    <p>{{ redondear(vista.mtoIGV) }}</p>

                    <strong>Total</strong>
                    <strong class="total">
                        {{ redondear(vista.mtoImpVenta) }}
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
                        <div class="item_descuento">
                            <JdSelect
                                v-model="item.descuento_tipo"
                                :lista="descuento_tipos"
                                mostrar="codigo"
                                @elegir="setDescuentoTipo(item)"
                            />

                            <JdInput
                                tipo="number"
                                :toRight="true"
                                v-model="item.descuento_valor"
                                @input="setDescuentoValor(item)"
                            />
                            <!-- {{ item.vu_desc }} -->
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
import { JdTable, JdButton, JdInput, JdSelect, JdSelectQuery } from 'jd-components'

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
                width: '15rem',
                title: 'Descuento',
                slot: 'colDescuento',
                toRight: true,
                show: true,
            },
            {
                id: 'mtoValorVenta',
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

        this.sumarItems()

        await this.loadDatosSistema()

        await this.loadPagoComprobantes()
        const asd = this.vista.pago_comprobantes.find((a) => a.estandar == true)
        this.vista.comprobante.doc_tipo = asd.id

        await this.loadPagoMetodos()
        this.calcularPorPagar()
    },
    methods: {
        async loadDatosSistema() {
            const qry = ['pago_condiciones']
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

        calcularUno(item) {
            item.vu =
                item.igv_afectacion == '10' ? item.pu / (1 + item.igv_porcentaje / 100) : item.pu

            // --- DESCUENTO --- //
            if (
                item.descuento_tipo != null &&
                item.descuento_valor != null &&
                item.descuento_valor != 0
            ) {
                if (item.descuento_tipo == 1) {
                    item.vu_desc =
                        item.igv_afectacion == '10'
                            ? item.descuento_valor / (1 + item.igv_porcentaje / 100)
                            : item.descuento_valor
                } else if (item.descuento_tipo == 2) {
                    item.vu_desc =
                        item.igv_afectacion == '10'
                            ? (item.cantidad * item.pu * (item.descuento_valor / 100)) /
                              (1 + item.igv_porcentaje / 100)
                            : item.cantidad * item.pu * (item.descuento_valor / 100)
                }
            } else {
                item.vu_desc = 0
            }

            item.mtoValorVenta = item.cantidad * item.vu - item.vu_desc
            item.igv =
                item.igv_afectacion == '10' ? item.mtoValorVenta * (item.igv_porcentaje / 100) : 0
            item.total = item.mtoValorVenta + item.igv
        },
        calcularTotales() {
            this.vista.mtoOperGravadas = 0
            this.vista.mtoOperExoneradas = 0
            this.vista.mtoOperInafectas = 0
            this.vista.mtoIGV = 0

            for (const a of this.vista.comprobante.comprobante_items) {
                if (a.igv_afectacion == '10') {
                    this.vista.mtoOperGravadas += a.mtoValorVenta
                    this.vista.mtoIGV += a.igv
                } else if (a.igv_afectacion == '20') {
                    this.vista.mtoOperExoneradas += a.mtoValorVenta
                } else if (a.igv_afectacion == '30') {
                    this.vista.mtoOperInafectas += a.mtoValorVenta
                }
            }

            this.vista.valorVenta =
                this.vista.mtoOperGravadas +
                this.vista.mtoOperExoneradas +
                this.vista.mtoOperInafectas
            this.vista.mtoImpVenta = this.vista.valorVenta + this.vista.mtoIGV
        },
        sumarUno(item) {
            if (item.cantidad > item.cantidadMax) {
                item.cantidad = item.cantidadMax
                return jmsg('warning', 'Cantidad no disponible')
            }

            this.calcularUno(item)

            this.calcularTotales()
        },
        sumarItems() {
            for (const a of this.vista.comprobante.comprobante_items) this.calcularUno(a)

            this.calcularTotales()
        },

        setDescuentoTipo(item) {
            item.descuento_valor = null

            this.sumarUno(item)
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

            this.sumarUno(item)
        },
        setCortesia(item) {
            const i = this.vista.comprobante.comprobante_items.findIndex(
                (a) => a.articulo == item.articulo,
            )

            this.vista.comprobante.comprobante_items[i].cortesia =
                !this.vista.comprobante.comprobante_items[i].cortesia

            if (this.vista.comprobante.comprobante_items[i].cortesia == true) {
                this.vista.comprobante.comprobante_items[i].descuento_tipo = 1
                this.vista.comprobante.comprobante_items[i].descuento_valor = redondear(item.total)
            } else {
                this.vista.comprobante.comprobante_items[i].descuento_tipo = null
                this.vista.comprobante.comprobante_items[i].descuento_valor = null
            }

            this.sumarUno(this.vista.comprobante.comprobante_items[i])
            this.calcularPorPagar()
        },
        quitarArticulo(item) {
            const i = this.vista.comprobante.comprobante_items.findIndex(
                (a) => a.articulo == item.articulo,
            )
            this.vista.comprobante.comprobante_items.splice(i, 1)

            this.sumarItems()
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
                item.monto = redondear(this.vista.mtoImpVenta, 2)
            }

            this.calcularPorPagar()
        },
        calcularPorPagar() {
            let pagos_monto = 0

            for (const a of this.vista.pago_metodos) {
                if (a.monto) pagos_monto += Number(a.monto)
            }

            if (pagos_monto == 0) {
                this.vista.porPagar = this.vista.mtoImpVenta
                this.vista.vuelto = 0
            } else if (pagos_monto <= this.vista.mtoImpVenta) {
                this.vista.porPagar = this.vista.mtoImpVenta - pagos_monto
                this.vista.vuelto = 0
            } else {
                this.vista.porPagar = 0
                this.vista.vuelto = pagos_monto - this.vista.mtoImpVenta
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

            this.vista.comprobante.total_gravada = redondear(this.vista.mtoOperGravadas, 2)
            this.vista.comprobante.total_exonerada = redondear(this.vista.mtoOperExoneradas, 2)
            this.vista.comprobante.total_inafecta = redondear(this.vista.mtoOperInafectas, 2)
            this.vista.comprobante.total_igv = redondear(this.vista.mtoIGV, 2)
            this.vista.comprobante.monto = redondear(this.vista.mtoImpVenta, 2)
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
        grid-template-rows: auto 11.5rem;
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
</style>

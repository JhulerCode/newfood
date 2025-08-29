<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>
                Emitir comprobante - Pedido N° {{ transaccion.pedido.codigo }}
                <template v-if="transaccion.pedido.tipo == 1">
                    ({{ transaccion.ambiente1.nombre }} - {{ transaccion.mesa1.nombre }})
                </template>
                <template v-else-if="transaccion.pedido.tipo == 2"> (PARA LLEVAR)</template>
                <template v-else-if="transaccion.pedido.tipo == 3"> (DELIVERY)</template>
            </strong>

            <div class="buttons">
                <JdButton text="Grabar" title="Grabar" @click="grabar()" />
                <JdButton text="Grabar e imprimir" title="Grabar e imprimir" backColor="primary-color"
                    color="text-color3" />
            </div>
        </div>

        <div class="container">
            <div class="left">
                <div class="datos" v-if="transaccion.comprobante">
                    <JdSelect label="Tipo comprobante" :nec="true" v-model="transaccion.comprobante.doc_tipo"
                        :lista="documentos_tributarios_venta" style="grid-column: 1/4;" />

                    <div style="grid-column: 1/5;" class="dato-cliente">
                        <JdSelectQuery label="Cliente" :nec="true" v-model="transaccion.socio" :spin="spinSocios"
                            :lista="vista.socios || []" mostrar="nombre_completo" @search="loadSocios" @elegir="setSocio"
                            style="grid-column: 1/5;" v-if="reloadSocio == false" />

                        <JdButton icon="fa-solid fa-user-plus" backColor="morado" color="text-color3" title="Crear cliente"
                            @click="nuevoSocio()" />
                    </div>

                    <JdSelect label="Moneda" v-model="transaccion.moneda" :lista="monedas || []" @elegir="setTipoCambio"
                        :disabled="true" style="grid-column: 1/4;" />

                    <div style="grid-column: 4/5;">
                        <small>TC: {{ transaccion.tipo_cambio }}</small>
                    </div>

                    <JdSelect label="Caja" v-model="transaccion.caja" :lista="[{ ...useAuth.usuario.caja1 }]"
                        :disabled="true" style="grid-column: 1/4;" />
                </div>

                <div class="totales">
                    <span>Ope. gravadas:</span>
                    <p>{{ redondear(mtoOperGravadas) }}</p>

                    <span>Ope. exoneradas:</span>
                    <p>{{ redondear(mtoOperExoneradas) }}</p>

                    <span>Ope. inafectas:</span>
                    <p>{{ redondear(mtoOperInafectas) }}</p>

                    <span>Subtotal:</span>
                    <p>{{ redondear(valorVenta) }}</p>

                    <span>Impuesto:</span>
                    <p>{{ redondear(mtoIGV) }}</p>

                    <strong>Total</strong>
                    <strong class="total">
                        {{ getItemFromArray(transaccion.moneda, monedas, 'simbolo') }} {{ redondear(mtoImpVenta) }}
                    </strong>
                </div>
            </div>

            <div class="right">
                <JdTable :columns="columnsArticulos" :datos="transaccion.transaccion_items || []" height="100%"
                    :columnsResizable="true" class="pedido-items" @onInput="(action, a) => this[action](a)">

                    <template v-slot:colNombre="{ item }">
                        <div>
                            {{ item.nombre }}

                            <ul v-if="item.is_combo" class="combo_items">
                                <li v-for="(a, i) in item.combo_articulos" :key="i">
                                    <small>- ({{ a.cantidad }}) {{ a.nombre }}</small>
                                </li>
                            </ul>
                        </div>
                    </template>

                    <template v-slot:colPrecio="{ item }">
                        {{ redondear(item.pu) }}
                    </template>

                    <template v-slot:colDescuento="{ item }">
                        <div class="item_descuento">
                            <JdSelect v-model="item.descuento_tipo" :lista="descuento_tipos" mostrar="codigo"
                                @elegir="setDescuentoTipo(item)" />
                            <JdInputText tipo="number" :toRight="true" v-model="item.descuento_valor"
                                @input="setDescuentoValor(item)" />
                        </div>
                    </template>

                    <template v-slot:colSubtotal="{ item }">
                        {{ redondear(item.mtoValorVenta) }}
                    </template>

                    <template v-slot:colTotal="{ item }">
                        {{ redondear(item.total) }}
                    </template>

                    <template v-slot:colActions="{ item }">
                        <div class="botones">
                            <JdButton :small="true" icon="fa-regular fa-handshake" backColor="celeste" color="text-color3"
                                :title="item.cortesia ? 'Quitar cortesia' : 'Cortesia'" @click="setCortesia(item)" />

                            <JdButton :small="true" icon="fa-solid fa-trash-can" backColor="rojo" color="text-color3"
                                title="Quitar" @click="quitarArticulo(item)" />
                        </div>
                    </template>

                </JdTable>

                <div class="pago">
                    <div class="head">
                        Pago
                    </div>

                    <div class="cuerpo" v-if="transaccion.comprobante">
                        <div>
                            <JdToogleSwitch label="¿El cliente pagará luego?" v-model="transaccion.comprobante.credito"
                                class="mrg-btm1" />

                            <div class="agregar" v-if="!transaccion.comprobante.credito">
                                <JdSelect label="Método" :nec="true" v-model="newPago.id" :lista="vista.pago_metodos" />

                                <div class="txt-monto">
                                    <JdInputText label="Monto" :nec="true" tipo="number" v-model="newPago.monto" />

                                    <JdButton :small="true" icon="fa-regular fa-hand-point-left" title="Exacto"
                                        backColor="verde" color="text-color3" @click="pagoExacto()" />
                                </div>

                                <div class="botones">
                                    <JdButton text="Agregar" @click="agregarPago()" />
                                </div>
                            </div>
                        </div>

                        <div class="right">
                            <div class="por_pagar">
                                <span>Por pagar:</span>
                                <p>{{ redondear(porPagar) }}</p>
                                <span>Vuelto:</span>
                                <p>{{ redondear(vuelto) }}</p>
                            </div>

                            <JdTable :columns="columnsPagos" :datos="transaccion.pagos || []" height="100%"
                                :columnsResizable="true" class="pedido-items" v-if="!transaccion.comprobante.credito">

                                <template v-slot:colActions="{ item }">
                                    <JdButton :small="true" icon="fa-solid fa-trash-can" backColor="rojo"
                                        color="text-color3" title="Eliminar" @click="quitarPago(item)" />
                                </template>
                            </JdTable>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <mSocio v-if="useModals.show.mSocio" />
</template>

<script>
import JdButton from '@/components/inputs/JdButton.vue'
import JdSelect from '@/components/inputs/JdSelect.vue'
import JdSelectQuery from '@/components/inputs/JdSelectQuery.vue'
import JdTable from '@/components/JdTable.vue'
import JdInputText from '@/components/inputs/JdInputText.vue'
import JdToogleSwitch from '@/components/inputs/JdToogleSwitch.vue'

import mSocio from '@/views/u/compras/proveedores/mSocio.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post } from '@/utils/crud'
import { redondear, getItemFromArray, incompleteData, numeroATexto } from '@/utils/mine'
import { jmsg } from '@/utils/swal'
import { monedas } from '@/data/monedas'

import { documentos_tributarios_venta } from '@/data/documentos_tributarios'
import { pago_condiciones } from '@/data/pago_condiciones'
import { ubigeo } from '@/data/ubigeo'

export default {
    components: {
        JdButton,
        JdInputText,
        JdSelect,
        JdSelectQuery,
        JdTable,
        JdToogleSwitch,
        mSocio,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        documentos_tributarios_venta,
        redondear,
        getItemFromArray,
        monedas,
        pago_condiciones,

        vista: {},
        transaccion: {},
        spinSocios: false,

        newPago: {},
        porPagar: 0,
        vuelto: 0,

        descuento_tipos: [
            { 'id': 1, 'nombre': 'MONTO', codigo: 'M' },
            { 'id': 2, 'nombre': 'PORCENTAJE', codigo: '%' },
        ],

        mtoOperGravadas: 0,
        mtoOperExoneradas: 0,
        mtoOperInafectas: 0,
        mtoIGV: 0,
        valorVenta: 0,
        mtoImpVenta: 0,

        reloadSocio: false,

        columnsArticulos: [
            { width: '100%', title: 'Artículo', slot: 'colNombre' },
            { width: '5rem', title: 'Cantidad', prop: 'cantidad', inputType: 'number', oninput: 'sumarDirecto', toRight: true },
            { width: '5rem', title: 'Precio', slot: 'colPrecio', toRight: true },
            { width: '10rem', title: 'Descuento', slot: 'colDescuento', toRight: true },
            { width: '7rem', title: 'Subtotal', slot: 'colSubtotal', toRight: true },
            { width: '5rem', title: 'Importe', slot: 'colTotal', toRight: true },
            { width: '5rem', title: '', slot: 'colActions' },
        ],

        columnsPagos: [
            { width: '100%', title: 'Método de pago', prop: 'nombre' },
            { width: '5rem', title: 'Monto', prop: 'monto', toRight: true },
            { width: '3rem', title: '', slot: 'colActions' },
        ],
    }),
    async created() {
        this.vista = this.useVistas.getVista('vEmitirComprobante')

        this.transaccion = this.vista.transaccion

        this.sumarItems()
        this.calcularPorPagar()

        if (!this.vista.pagoMetodosLoaded) {
            await this.loadPagoMetodos()
        }

        if (this.vista.socio && this.vista.socio.id) {
            this.vista.socios = [this.vista.socio]
        }

        if (this.transaccion.socio == null) {
            this.setSocioGeneral()
        }
        else {
            this.useAuth.loading = { show: true, text: 'Cargando...' }
            const res = await get(`${urls.socios}/uno/${this.transaccion.socio}`)
            this.useAuth.loading = { show: false, text: '' }

            if (res.code !== 0) jmsg('warning', 'Selecciona un cliente registrado')

            this.setSocio(res.data)

            this.reloadSocio = true
            this.transaccion.socio = res.data.id
            this.$nextTick(() => this.reloadSocio = false)
            this.vista.socio = res.data
        }
    },
    methods: {
        setTipoCambio(item) {
            this.transaccion.tipo_cambio = getItemFromArray(item.id, monedas, 'tipo_cambio')
        },

        quitarArticulo(item) {
            const i = this.transaccion.transaccion_items.findIndex(a => a.articulo == item.articulo)
            this.transaccion.transaccion_items.splice(i, 1)

            this.sumarItems()
            this.calcularPorPagar()
        },
        sumarItems() {
            for (const a of this.transaccion.transaccion_items) this.sumar(a)
        },
        sumarDirecto(item) {
            if (item.cantidad > item.cantidadMax) {
                jmsg('warning', 'La cantidad no puede ser mayor a lo que fue pedido')
                item.cantidad = item.cantidadMax
            }

            this.sumar(item)
            this.calcularPorPagar()
        },
        sumar(item) {
            item.vu = item.igv_afectacion == '10' ? item.pu / (1 + item.igv_porcentaje) : item.pu

            if (item.descuento_tipo != null && item.descuento_valor != null && item.descuento_valor != 0) {
                if (item.descuento_tipo == 1) {
                    item.desc = item.igv_afectacion == '10' ?
                        item.descuento_valor / (1 + item.igv_porcentaje) :
                        item.descuento_valor
                }
                else if (item.descuento_tipo == 2) {
                    item.desc = item.igv_afectacion == '10' ?
                        (item.cantidad * item.pu) * (item.descuento_valor / 100) / (1 + item.igv_porcentaje) :
                        (item.cantidad * item.pu) * (item.descuento_valor / 100)
                }
            }
            else {
                item.desc = 0
            }

            item.mtoValorVenta = (item.cantidad * item.vu) - item.desc
            item.igv = item.igv_afectacion == '10' ? item.mtoValorVenta * item.igv_porcentaje : 0
            item.total = item.mtoValorVenta + item.igv

            this.sumarTodo()
        },
        sumarTodo() {
            this.mtoOperGravadas = 0
            this.mtoOperExoneradas = 0
            this.mtoOperInafectas = 0
            this.mtoIGV = 0

            for (const a of this.transaccion.transaccion_items) {
                if (a.igv_afectacion == '10') {
                    this.mtoOperGravadas += a.mtoValorVenta
                    this.mtoIGV += a.igv
                }
                else if (a.igv_afectacion == '20') {
                    this.mtoOperExoneradas += a.mtoValorVenta
                }
                else if (a.igv_afectacion == '30') {
                    this.mtoOperInafectas += a.mtoValorVenta
                }
            }

            this.valorVenta = this.mtoOperGravadas + this.mtoOperExoneradas + this.mtoOperInafectas
            this.mtoImpVenta = this.valorVenta + this.mtoIGV
        },


        async loadPagoMetodos() {
            const filtros = { activo: true }
            this.useAuth.loading = { show: true, text: 'Cargando...' }
            const res = await get(`${urls.pago_metodos}?filtros=${JSON.stringify(filtros)}`)
            this.useAuth.loading = { show: false, text: '' }
            this.vista.pagoMetodosLoaded = true

            if (res.code != 0) return

            this.vista.pago_metodos = res.data
        },
        agregarPago() {
            if (this.newPago.id == null) return jmsg('warning', 'Selecciona el método de pago')
            if (this.newPago.monto == null || this.newPago.monto == 0) return jmsg('warning', 'Ingrese el monto')

            const i = this.transaccion.pagos.findIndex(a => a.id == this.newPago.id)

            if (i !== -1) return jmsg('warning', 'El método de pago ya está agregado')

            this.transaccion.pagos.push({
                ...this.newPago,
                nombre: getItemFromArray(this.newPago.id, this.vista.pago_metodos),
                moneda: 1,
                operacion: this.useAuth.usuario.empresa1.caja_operaciones[0].id
            })

            this.newPago.id = null
            this.newPago.monto = null
            this.calcularPorPagar()
        },
        pagoExacto() {
            this.newPago.monto = redondear(this.mtoImpVenta, 2)
        },
        quitarPago(item) {
            const i = this.transaccion.pagos.findIndex(a => a.id == item.id)
            this.transaccion.pagos.splice(i, 1)

            this.calcularPorPagar()
        },
        calcularPorPagar() {
            let pagos_monto = 0

            for (const a of this.transaccion.pagos) {
                pagos_monto += a.monto
            }

            if (pagos_monto == 0) {
                this.porPagar = this.mtoImpVenta
                this.vuelto = 0
            }
            else if (pagos_monto <= this.mtoImpVenta) {
                this.porPagar = this.mtoImpVenta - pagos_monto
                this.vuelto = 0
            }
            else {
                this.porPagar = 0
                this.vuelto = pagos_monto - this.mtoImpVenta
            }
        },


        setDescuentoTipo(item) {
            item.descuento_valor = null

            this.sumar(item)
        },
        setDescuentoValor(item) {
            if (item.descuento_tipo == 1) {
                if (item.descuento_valor > (item.pu * item.cantidad)) {
                    jmsg('warning', 'El descuento no puede ser mayor al importe')
                    item.descuento_valor = null
                }
            }
            else if (item.descuento_tipo == 2) {
                if (item.descuento_valor > 100) {
                    jmsg('warning', 'El descuento no puede ser mayor a 100%')
                    item.descuento_valor = null
                }
            }

            this.sumar(item)
        },
        setCortesia(item) {
            item.cortesia = !item.cortesia

            if (item.cortesia == true) {
                item.descuento_tipo = 1
                item.descuento_valor = item.total
            }
            else {
                item.descuento_tipo = null
                item.descuento_valor = null
            }

            this.sumar(item)
            this.calcularPorPagar()
        },


        async loadSocios(txtBuscar) {
            if (!txtBuscar) {
                this.vista.socios.length = 0
                return
            }

            const filtros = {
                tipo: 2,
                activo: true,
                nombre: txtBuscar,
            }

            this.spinSocios = true
            const res = await get(`${urls.socios}?filtros=${JSON.stringify(filtros)}`)
            this.spinSocios = false

            if (res.code !== 0) return

            this.vista.socios = res.data
        },
        setSocio(item) {
            this.vista.socio = item
        },
        async setSocioGeneral() {
            this.useAuth.loading = { show: true, text: 'Cargando...' }
            await this.loadSocios('00000000')
            this.useAuth.loading = { show: false, text: '' }

            this.reloadSocio = true
            this.transaccion.socio = this.vista.socios[0].id
            this.$nextTick(() => this.reloadSocio = false)
            this.vista.socio = this.vista.socios[0]
        },


        async grabar1() {
            if (this.checkDatos()) return
            this.shapeDatos()

            console.log(this.transaccion)
        },
        async grabar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.loading = { show: true, text: 'Grabando...' }
            const res = await post(`${urls.transacciones}/vender`, this.transaccion)
            this.useAuth.loading = { show: false, text: '' }

            if (res.code != 0) return

            const vistaPedidos = this.useVistas.getVista('vClientePedidos')

            if (vistaPedidos) {
                vistaPedidos.reload = true
            }

            this.useVistas.closePestana('vEmitirComprobante', 'vClientePedidos')
        },
        checkDatos() {
            const props = [
                'tipo', 'socio', 'moneda', 'tipo_cambio', 'pago_condicion',
            ]

            if (incompleteData(this.transaccion, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            if (this.transaccion.transaccion_items.length == 0) {
                jmsg('warning', 'Debe agregar al menos un artículo')
                return true
            }

            for (const a of this.transaccion.transaccion_items) {
                const props1 = [
                    'articulo', 'cantidad', 'pu',
                    'unidad', 'nombre', 'igv', 'igv_afectacion',
                ]

                if (incompleteData(a, props1)) {
                    jmsg('warning', 'Ingrese los datos necesarios de cada articulo')
                    return true
                }

                if (a.cantidad == 0) {
                    jmsg('warning', 'Lo cantidad en cada articulo no puede ser cero')
                    return true
                }
            }

            if (this.transaccion.comprobante.credito == false) {
                if (this.porPagar > 0) {
                    jmsg('warning', 'Importes de pago insuficientes')

                    return true
                }
            }

            return false
        },
        shapeDatos() {
            this.transaccion.fecha = new Date()
            this.transaccion.monto = redondear(this.mtoImpVenta, 2)
            // this.transaccion.almacen = this.useAuth.usuario.almacen
            // this.transaccion.caja = this.useAuth.usuario.caja
            // this.transaccion.caja_apertura = this.vista.cajas.find(a => a.id == this.transaccion.caja).caja_aperturas[0].id

            for (const a of this.transaccion.transaccion_items) {
                if (a.desc != 0) {
                    a.descuentos = [{
                        codTipo: '00',
                        montoBase: a.desc,
                        factor: 1,
                        monto: a.desc,
                    }]
                }
                else {
                    a.descuentos = null
                }
            }

            if (this.transaccion.comprobante.credito == true) {
                this.transaccion.pagos = []
            }


            // ----- PARA COMPROBANTE ----- //
            const details = this.transaccion.transaccion_items.map(a => ({
                codProducto: a.articulo,
                unidad: a.unidad,
                descripcion: a.nombre,
                cantidad: a.cantidad,

                mtoValorUnitario: ['10', '20', '30'].includes(a.igv_afectacion) ? a.vu : 0,
                mtoValorGratuito: ['10', '20', '30'].includes(a.igv_afectacion) ? 0 : a.vu,
                mtoValorVenta: a.mtoValorVenta,
                mtoBaseIgv: a.cantidad * a.vu,

                porcentajeIgv: a.igv_porcentaje * 100,
                igv: a.igv,
                tipAfeIgv: a.igv_afectacion,

                totalImpuestos: a.igv_porcentaje * 100 * a.cantidad,
                mtoPrecioUnitario: ['10', '20', '30'].includes(a.igv_afectacion) ? a.pu : 0,

                descuentos: a.descuentos,
            }))

            this.transaccion.comprobante = {
                ublVersion: '2.1',
                tipoOperacion: '0101',
                tipoDoc: this.transaccion.comprobante.doc_tipo,
                serie: '',
                correlativo: '',
                fechaEmision: this.transaccion.fecha,

                formaPago: {
                    moneda: getItemFromArray(this.transaccion.moneda, monedas, 'codigo'),
                    tipo: getItemFromArray(this.transaccion.pago_condicion, pago_condiciones)
                },
                tipoMoneda: getItemFromArray(this.transaccion.moneda, monedas, 'codigo'),
                company: {
                    ruc: this.useAuth.usuario.empresa1.ruc,
                    razonSocial: this.useAuth.usuario.empresa1.razon_social,
                    nombreComercial: this.useAuth.usuario.empresa1.nombre_comercial,
                    address: {
                        direccion: this.useAuth.usuario.empresa1.direccion_fiscal,
                        departamento: getItemFromArray(this.useAuth.usuario.empresa1.ubigeo, ubigeo, 'departamento'),
                        provincia: getItemFromArray(this.useAuth.usuario.empresa1.ubigeo, ubigeo, 'provincia'),
                        distrito: getItemFromArray(this.useAuth.usuario.empresa1.ubigeo, ubigeo, 'distrito'),
                        ubigueo: this.useAuth.usuario.empresa1.ubigeo
                    }
                },

                mtoOperGravadas: this.mtoOperGravadas,
                mtoOperExoneradas: this.mtoOperExoneradas,
                mtoOperInafectas: this.mtoOperInafectas,
                mtoOperGratuitas: this.mtoOperGratuitas,

                mtoIGV: this.mtoIGV,
                mtoIGVGratuitas: this.mtoIGVGratuitas,

                totalImpuestos: this.mtoIGV,

                valorVenta: this.valorVenta,
                subTotal: this.mtoImpVenta,
                mtoImpVenta: this.mtoImpVenta,

                details,
                legends: [
                    {
                        code: "1000",
                        value: numeroATexto(this.mtoImpVenta)
                    },
                ],

                ...this.transaccion.comprobante,
                pagado: !this.transaccion.comprobante.credito,
                estado: 1,
            }

            // ----- ASIGNAR DATOS DEL CLIENTE ----- //
            this.transaccion.comprobante.client = {
                tipoDoc: this.vista.socio.doc_tipo,
                numDoc: this.vista.socio.doc_numero,
                rznSocial: this.vista.socio.doc_tipo == 1 ? `${this.vista.socio.nombres} ${this.vista.socio.apellidos}` : this.vista.socio.nombres,
                address: {
                    direccion: this.vista.socio.direccion,
                    departamento: getItemFromArray(this.vista.socio.ubigeo, ubigeo, 'departamento'),
                    provincia: getItemFromArray(this.vista.socio.ubigeo, ubigeo, 'provincia'),
                    distrito: getItemFromArray(this.vista.socio.ubigeo, ubigeo, 'distrito'),
                    ubigueo: this.vista.socio.ubigeo
                }
            }
        },

        nuevoSocio() {
            const item = { tipo: 2, doc_tipo: 1, activo: true }

            this.useModals.setModal('mSocio', 'Nuevo cliente', true, 1, item)
        },
    }
}
</script>

<style lang="scss" scoped>
.container {
    height: 100%;
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

    >.right {
        display: grid;
        grid-template-rows: 1fr auto;
        gap: 2rem;

        .pedido-items {
            .item_descuento {
                display: flex;
            }
        }

        .pago {
            height: 14rem;
            overflow-y: hidden;
            border: var(--border);
            display: grid;
            grid-template-rows: auto 1fr;
            border-radius: 0.3rem;

            .head {
                background-color: var(--bg-color2);
                padding: 0.5rem;
            }

            .cuerpo {
                padding: 1rem;
                display: grid;
                grid-template-columns: 50% 50%;
                overflow-y: hidden;

                .agregar {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                    margin-right: 2rem;

                    .txt-monto {
                        display: flex;
                        gap: 0.5rem;
                    }
                }

                .right {
                    display: grid;
                    grid-template-rows: auto 1fr;
                    gap: 1rem;
                    overflow-y: hidden;

                    .por_pagar {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        align-items: center;
                        padding: 0.5rem;
                        background-color: var(--bg-color2);
                        border-radius: 0.3rem;

                        p {
                            font-size: 1.5rem;
                        }
                    }
                }
            }
        }
    }
}
</style>
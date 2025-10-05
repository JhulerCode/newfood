<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>
                <template v-if="vista.mode == 1">Nuevo pedido</template>
                <template v-if="vista.mode == 2">Añadir al pedido N°</template>
                {{ vista.pedido.venta_codigo }} {{ atencion }}
            </strong>

            <div class="buttons">
                <JdButton
                    text="Regresar"
                    icon="fa-solid fa-arrow-left"
                    tipo="2"
                    @click="regresar()"
                />

                <template v-if="vista.mode == 1 && useAuth.verifyPermiso('vPedidos:crear')">
                    <JdButton text="Grabar" tipo="2" @click="crear()" />
                    <JdButton text="Grabar e imprimir" @click="crear(true)" />
                </template>

                <template v-if="vista.mode == 2 && useAuth.verifyPermiso('vPedidos:addProductos')">
                    <JdButton text="Grabar" tipo="2" @click="addProductos()" />
                    <JdButton text="Grabar e imprimir" @click="addProductos(true)" />
                </template>
            </div>
        </div>

        <div class="comanda">
            <div class="left">
                <div class="container-categorias">
                    <div>
                        <strong>Categorias:</strong>
                    </div>
                    <select
                        v-model="vista.categoria"
                        @change="loadArticulos()"
                        class="select-categoria"
                        v-if="isSmallScreen"
                    >
                        <option :value="null" v-if="this.vista.mode != 3">TODOS</option>
                        <option v-for="(a, i) in vista.categorias" :key="i" :value="a.id">
                            {{ a.nombre }}
                        </option>
                    </select>

                    <ul class="categorias" v-else>
                        <li
                            class="categoria max-1line"
                            :class="{ 'categoria-selected': vista.categoria == null }"
                            @click="((vista.categoria = null), loadArticulos())"
                            v-if="this.vista.mode != 3"
                        >
                            TODOS
                        </li>

                        <li
                            v-for="(a, i) in vista.categorias || []"
                            :key="i"
                            class="categoria max-1line"
                            :style="{ backgroundColor: a.color }"
                            :class="{ 'categoria-selected': a.id == vista.categoria }"
                            @click="((vista.categoria = a.id), loadArticulos())"
                        >
                            {{ a.nombre }}
                        </li>
                    </ul>
                </div>

                <div class="container-articulos">
                    <div class="nombre">
                        <JdInput
                            icon="fa-solid fa-magnifying-glass"
                            type="search"
                            placeholder="Buscar por nombre..."
                            v-model="vista.txtBuscarArticulo"
                        />
                    </div>

                    <ul class="articulos">
                        <li
                            v-for="(a, i) in articulosFiltered || []"
                            :key="i"
                            class="articulo"
                            @click="addArticulo(a)"
                            :title="a.nombre"
                        >
                            <div class="articulo-foto">
                                <img :src="a.foto_url" v-if="a.foto_url" />
                                <img
                                    src="https://static.vecteezy.com/system/resources/previews/022/059/000/non_2x/no-image-available-icon-vector.jpg"
                                    alt="no-image"
                                    v-else
                                />
                            </div>

                            <div class="articulo-name max-2lines">
                                {{ a.nombre }}
                            </div>

                            <div class="articulo-precio" v-if="a.precio_venta">
                                {{ redondear(showPrecio(a)) }}
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            <div
                class="right"
                :style="{
                    'grid-template-rows': `${vista.mode != 2 ? 'auto 1fr auto' : '1fr auto'}`,
                }"
            >
                <ul class="pedido-head" v-if="vista.mode != 2">
                    <li @click="vista.detalle = 1" :class="{ activo: vista.detalle == 1 }">
                        Pedido
                    </li>
                    <li @click="vista.detalle = 2" :class="{ activo: vista.detalle == 2 }">
                        Detalles
                    </li>
                </ul>

                <template v-if="vista.detalle == 1">
                    <JdTable
                        :columns="columns"
                        :datos="vista.pedido.transaccion_items || []"
                        height="100%"
                        :columnsResizable="true"
                        :seeker="false"
                        :colAct="true"
                        :colNro="false"
                        :download="false"
                        class="pedido-items"
                        @onInput="runMethod"
                    >
                        <template v-slot:cAction="{ item }">
                            <JdButton
                                title="Quitar"
                                icon="fa-solid fa-trash-can"
                                tipo="2"
                                :small="true"
                                @click="quitar(item)"
                                v-if="vista.mode != 3"
                            />
                        </template>

                        <template v-slot:cNombre="{ item }">
                            <div class="nombre">
                                <p @click="openNotas(item)">
                                    {{ item.articulo1.nombre }}
                                </p>
                                <ul v-if="item.is_combo" class="combo_items">
                                    <li v-for="(a, i) in item.combo_articulos" :key="i">
                                        <small>- ({{ a.cantidad }}) {{ a.articulo1.nombre }}</small>
                                    </li>
                                </ul>
                            </div>
                        </template>

                        <template v-slot:cCantidad="{ item }">
                            <div class="cantidad" v-if="vista.mode != 3">
                                <ul>
                                    <li @click="sumarRestar(1, item)">
                                        <i class="fa-solid fa-plus"></i>
                                    </li>
                                    <li @click="sumarRestar(2, item)">
                                        <i class="fa-solid fa-minus"></i>
                                    </li>
                                </ul>

                                <JdInput
                                    tipo="number"
                                    v-model="item.cantidad"
                                    :toRight="true"
                                    @input="sumarUno(item)"
                                />
                            </div>

                            <template v-else>
                                {{ item.cantidad }}
                            </template>
                        </template>

                        <template v-slot:cPu="{ item }">
                            <template v-if="item.descuento_tipo">
                                {{ item.pu_desc }}
                            </template>

                            <template v-else>
                                {{ item.pu }}
                            </template>
                        </template>
                    </JdTable>
                </template>

                <div class="pedido-detalles" v-if="vista.detalle == 2">
                    <div
                        v-if="vista.pedido.venta_canal == 2 || vista.pedido.venta_canal == 3"
                        class="dato-cliente"
                    >
                        <JdSelectQuery
                            icon="fa-solid fa-magnifying-glass"
                            placeholder="Buscar cliente"
                            v-model="vista.pedido.socio"
                            :spin="vista.spinSocios"
                            :lista="vista.socios || []"
                            mostrar="doc_nombres"
                            @search="loadSocios"
                            @elegir="setSocio"
                        />

                        <JdButton
                            icon="fa-solid fa-user-plus"
                            title="Nuevo socio"
                            tipo="2"
                            :small="true"
                            @click="nuevoSocio()"
                        />
                    </div>

                    <JdInput
                        label="Nombres"
                        :nec="true"
                        v-model="vista.pedido.venta_socio_datos.nombres"
                    />

                    <template v-if="vista.pedido.venta_canal == 3">
                        <JdInput
                            label="Teléfono"
                            :nec="true"
                            v-model="vista.pedido.venta_socio_datos.telefono"
                        />
                        <JdInput
                            label="Dirección"
                            :nec="true"
                            v-model="vista.pedido.venta_socio_datos.direccion"
                        />
                        <JdSelect
                            label="Repartidor"
                            v-model="vista.pedido.repartidor"
                            :lista="vista.colaboradores || []"
                            mostrar="nombres_apellidos"
                        />
                        <JdSelect
                            label="Método de pago"
                            :nec="true"
                            v-model="vista.pedido.venta_pago_metodo"
                            :lista="vista.pago_metodos || []"
                        />
                    </template>

                    <JdInput label="Observación" v-model="vista.pedido.observacion" />
                </div>

                <div class="pedido-foot">
                    <div class="pedido-total">
                        <span>Total (S/)</span>
                        <p>{{ redondear(vista.mtoImpVenta) }}</p>
                    </div>

                    <template
                        v-if="
                            vista.pedido.venta_canal == 3 &&
                            vista.pedido.venta_pago_metodo ==
                                `${useAuth.usuario.empresa.subdominio}-EFECTIVO`
                        "
                    >
                        <div class="pedido-paga">
                            <span>Paga con</span>
                            <JdInput
                                v-model="vista.pedido.venta_pago_con"
                                type="number"
                                class="input-paga"
                                :toRight="true"
                            />
                        </div>

                        <div class="pedido-total">
                            <span>Vuelto</span>
                            <p>
                                {{
                                    redondear(
                                        (vista.pedido.venta_pago_con || 0) - vista.mtoImpVenta,
                                    )
                                }}
                            </p>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </div>

    <mPedidoItemNota v-if="useModals.show.mPedidoItemNota" />
    <mSocio @created="setSocioCreated" v-if="useModals.show.mSocio" />
</template>

<script>
import { JdTable, JdButton, JdInput, JdSelect, JdSelectQuery } from '@jhuler/components'

import mPedidoItemNota from '@/views/ventas/pedidos/mPedidoItemNota.vue'
import mSocio from '@/views/compras/proveedores/mSocio.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch } from '@/utils/crud'
import { jmsg } from '@/utils/swal'
import { getItemFromArray, redondear, incompleteData, genId } from '@/utils/mine'
import dayjs from 'dayjs'

export default {
    components: {
        JdInput,
        JdButton,
        JdTable,
        JdSelect,
        JdSelectQuery,
        mPedidoItemNota,
        mSocio,
    },
    data: () => ({
        useModals: useModals(),
        useAuth: useAuth(),
        useVistas: useVistas(),
        redondear,
        getItemFromArray,
        urls: urls,

        vista: {},

        columns: [
            { id: 'articulo', width: '13rem', title: 'Producto', slot: 'cNombre', show: true },
            { id: 'cantidad', width: '5rem', title: 'Cantidad', slot: 'cCantidad', show: true },
            { id: 'pu', width: '4rem', title: 'Pu', slot: 'cPu', show: true, toRight: true },
            {
                id: 'total',
                title: 'Importe',
                format: 'decimal',
                toRight: true,
                width: '5rem',
                show: true,
            },
        ],
    }),
    computed: {
        articulosFiltered() {
            if (this.vista.txtBuscarArticulo == null) return this.vista.articulos

            const term = this.vista.txtBuscarArticulo.toLowerCase()
            return this.vista.articulos.filter((a) => a.nombre.toLowerCase().includes(term))
        },
        isSmallScreen() {
            if (this.vista.screenWidth == null) return false
            return this.vista.screenWidth < 1000
        },
        atencion() {
            if (this.vista.pedido.venta_canal == 1) {
                return `(${this.vista.pedido.venta_mesa1.salon1.nombre} - ${this.vista.pedido.venta_mesa1.nombre})`
            } else {
                return this.vista.pedido.venta_canal == 2 ? '(PARA LLEVAR)' : '(DELIVERY)'
            }
        },
    },
    async created() {
        this.vista = this.useVistas.vComanda
        this.vista.detalle = 1
        this.handleResize()

        this.sumarItems()

        if (this.vista.pedido.venta_canal == 3) {
            await this.loadColaboradores()
            await this.loadPagoMetodos()
        }

        if (this.vista.mode != 3) {
            await this.loadCategorias()
            this.loadArticulos()
        }
    },
    mounted() {
        window.addEventListener('resize', this.handleResize)
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.handleResize)
    },
    methods: {
        async loadColaboradores() {
            const qry = {
                fltr: {
                    cargo: { op: 'Es', val: 'REPARTIDOR' },
                    activo: { op: 'Es', val: true },
                },
                cols: ['nombres', 'apellidos', 'nombres_apellidos'],
            }

            this.vista.colaboradores = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.colaboradores}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.colaboradores = res.data
        },
        async loadPagoMetodos() {
            const qry = {
                fltr: { activo: { op: 'Es', val: true } },
                cols: ['nombre'],
            }

            this.vista.pago_metodos = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.pago_metodos}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.pago_metodos = res.data
        },
        async loadCategorias() {
            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: '2' },
                    activo: { op: 'Es', val: true },
                },
                cols: ['nombre', 'color'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_categorias}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.categorias = res.data
        },
        async loadArticulos() {
            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: '2' },
                    activo: { op: 'Es', val: true },
                },
                cols: [
                    'nombre',
                    'precio_venta',
                    'has_receta',
                    'is_combo',
                    'igv_afectacion',
                    'precios_semana',
                    'foto_path',
                    'foto_url',
                ],
                incl: ['receta_insumos', 'combo_articulos', 'produccion_area1'],
            }

            if (this.vista.categoria != null) {
                qry.fltr.categoria = { op: 'Es', val: this.vista.categoria }
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.articulos = res.data
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

        setSocio(item) {
            if (item) {
                this.vista.pedido.venta_socio_datos = {
                    doc_tipo: item.doc_tipo,
                    doc_numero: item.doc_numero,
                    doc_nombres: item.doc_nombres,
                    nombres: item.nombres,
                    telefono: item.telefono,
                    direccion: item.direccion,
                    referencia: item.referencia,
                }
            } else {
                this.vista.pedido.venta_socio_datos = {}
            }
        },
        nuevoSocio() {
            const send = { tipo: 2, activo: true }

            this.useModals.setModal('mSocio', 'Nuevo cliente', 1, send)
        },
        setSocioCreated(item) {
            this.vista.socios = [item]
            this.vista.pedido.socio = item.id

            this.setSocio(item)
        },
        showPrecio(item) {
            const numeroDiaSemana = dayjs().day()
            const promocion_hoy = item.precios_semana.find((a) => a.id == numeroDiaSemana)

            return promocion_hoy.pu ? promocion_hoy.pu : item.precio_venta
        },

        async addArticulo(item) {
            const i = this.vista.pedido.transaccion_items.findIndex((a) => a.articulo == item.id)

            if (i === -1) {
                this.vista.pedido.transaccion_items.push({
                    articulo: item.id,
                    articulo1: {
                        nombre: item.nombre,
                        unidad: item.unidad,
                        produccion_area1: item.produccion_area1,
                    },

                    cantidad: 1,

                    pu: this.showPrecio(item),
                    igv_afectacion: item.igv_afectacion,
                    igv_porcentaje:
                        item.igv_afectacion == '10'
                            ? this.useAuth.usuario.empresa.igv_porcentaje
                            : 0,

                    observacion: '',

                    has_receta: item.has_receta,
                    receta_insumos: item.receta_insumos,
                    is_combo: item.is_combo,
                    combo_articulos: item.combo_articulos,

                    importe: 1 * item.precio_venta,
                })

                this.sumarItems()
            } else {
                this.sumarRestar(1, this.vista.pedido.transaccion_items[i])
            }
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
            this.vista.mtoOperGravadas = 0
            this.vista.mtoOperExoneradas = 0
            this.vista.mtoOperInafectas = 0
            this.vista.mtoIGV = 0

            for (const a of this.vista.pedido.transaccion_items) {
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
            this.calcularUno(item)

            this.calcularTotales()
        },
        sumarItems() {
            for (const a of this.vista.pedido.transaccion_items) this.calcularUno(a)

            this.calcularTotales()
        },
        sumarRestar(key, item) {
            if (key == 1) {
                item.cantidad++
            } else {
                if (item.cantidad == 1) return
                item.cantidad--
            }

            this.sumarUno(item)
        },
        quitar(item) {
            this.vista.pedido.transaccion_items.splice(item.i, 1)

            this.sumarItems()
        },
        openNotas(item) {
            this.useModals.setModal('mPedidoItemNota', 'Notas', null, item)
        },

        checkDatos() {
            if (this.vista.pedido.transaccion_items.length == 0) {
                jmsg('warning', 'Agregue al menos 1 artículo')
                return true
            }

            if (this.vista.pedido.venta_canal == 2 || this.vista.pedido.venta_canal == 3) {
                if (incompleteData(this.vista.pedido.venta_socio_datos, ['nombres'])) {
                    jmsg('warning', 'Ingrese los datos del cliente en Detalles')
                    return true
                }
            }

            if (this.vista.pedido.venta_canal == 3) {
                if (
                    incompleteData(this.vista.pedido.venta_socio_datos, ['direccion', 'telefono'])
                ) {
                    jmsg('warning', 'Ingrese los datos del cliente en Detalles')
                    return true
                }

                if (incompleteData(this.vista.pedido, ['venta_pago_metodo'])) {
                    jmsg('warning', 'Ingrese el método de pago en Detalles')
                    return true
                }

                if (
                    this.vista.pedido.venta_pago_metodo ==
                        `${this.useAuth.usuario.empresa.subdominio}-EFECTIVO` &&
                    this.vista.pedido.venta_pago_con < this.vista.pedido.monto
                ) {
                    jmsg('warning', 'Monto de pago no es suficiente')
                    return true
                }
            }
        },
        shapeDatos() {
            this.vista.pedido.fecha = dayjs().format('YYYY-MM-DD')
            this.vista.pedido.venta_codigo = genId()
            this.vista.pedido.monto = this.vista.mtoImpVenta

            if (
                this.vista.pedido.venta_pago_metodo !=
                `${this.useAuth.usuario.empresa.subdominio}-EFECTIVO`
            ) {
                this.vista.pedido.venta_pago_con = null
            }
        },
        async crear1() {
            if (this.checkDatos()) return
            this.shapeDatos()

            console.log(this.vista.pedido)
        },
        async crear(print) {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await post(urls.transacciones, this.vista.pedido)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useAuth.socket.emit('vComanda:crear', {
                empresa: this.useAuth.usuario.empresa.id,
                data: res.data,
            })

            if (print == true) this.imprimir(res.data)

            this.useVistas.closePestana('vComanda', 'vPedidos')
        },
        async addProductos(print) {
            if (this.checkDatos()) return
            this.vista.pedido.monto = this.vista.mtoImpVenta

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await patch(`${urls.transacciones}/add-productos`, this.vista.pedido)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useAuth.socket.emit('vComanda:crear', {
                empresa: this.useAuth.usuario.empresa.id,
                data: res.data,
            })

            if (print == true) this.imprimir(res.data)

            this.useVistas.closePestana('vComanda', 'vPedidos')
        },
        imprimir(data) {
            console.log(data)
            let atencion = ''

            if (data.venta_canal == 1) {
                atencion = `${data.venta_mesa1.salon1.nombre} - ${data.venta_mesa1.nombre}`
            } else if (data.venta_canal == 2) {
                atencion = 'PARA LLEVAR'
            } else if (data.venta_canal == 3) {
                atencion = 'DELIVERY'
            }
            const send = {
                createdAt: data.createdAt,
                atencion,
                venta_codigo: data.venta_codigo,
                is_reprint: false,
                productos: this.vista.pedido.transaccion_items,
                subdominio: this.useAuth.usuario.empresa.subdominio,
            }

            this.useAuth.socket.emit('vComanda:imprimir', {
                empresa: this.useAuth.usuario.empresa.id,
                data: send,
            })

            // const uriEncoded = `http://${this.useAuth.usuario.empresa.pc_principal_ip}/imprimir/comanda.php?data=${encodeURIComponent(JSON.stringify(send))}`
            // console.log(uriEncoded)
            // const nuevaVentana = window.open(
            //     uriEncoded,
            //     '_blank',
            //     'width=1,height=1,top=0,left=0,scrollbars=no,toolbar=no,location=no,status=no,menubar=no',
            // )

            // setTimeout(() => {
            //     nuevaVentana.close()
            // }, 500)
        },

        runMethod(method, item) {
            this[method](item)
        },
        regresar() {
            this.useVistas.closePestana('vComanda', 'vPedidos')
        },

        handleResize() {
            this.vista.screenWidth = window.innerWidth
        },
    },
}
</script>

<style lang="scss" scoped>
.comanda {
    height: 100%;
    overflow: hidden;
    display: grid;
    grid-template-columns: 1fr 30rem;
    gap: 1rem;

    .left {
        display: grid;
        grid-template-columns: 12rem 1fr;
        gap: 1rem;
        overflow: hidden;

        .container-categorias {
            height: 100%;
            display: grid;
            grid-template-rows: auto 1fr;
            overflow: hidden;
            gap: 0.5rem;

            select {
                border-radius: 0.2rem;
                border: var(--border);
            }

            .categorias {
                overflow-y: auto;

                .categoria {
                    padding: 0.5rem;
                    font-size: 0.9rem;
                    height: fit-content;
                    border-radius: 0.3rem;
                    cursor: pointer;
                    margin-bottom: 0.5rem;
                }
            }

            .categoria-selected {
                font-weight: bold;
                // border: 1px solid var(--amarillo);
                // box-shadow: 0 0 0.5rem var(--shadow-color);
            }
        }

        .container-articulos {
            height: 100%;
            display: grid;
            grid-template-rows: auto 1fr;
            overflow: hidden;
            gap: 0.5rem;
            border-radius: 0 0.5rem 0.5rem 0;
            background-color: var(--bg-color2);

            .nombre {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .articulos {
                height: 100%;
                overflow-y: auto;
                overflow-x: hidden;
                display: flex;
                flex-wrap: wrap;
                align-content: flex-start;
                gap: 0.5rem;
                padding: 1rem;

                .articulo {
                    height: 10rem;
                    width: 10rem;
                    background-color: var(--bg-color);
                    position: relative;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    overflow-x: hidden;

                    .articulo-foto {
                        height: 7rem;
                        overflow: hidden;
                        display: flex;
                        justify-content: center;
                        align-items: center;

                        img {
                            max-width: calc(100% - 0.5rem);
                            max-height: calc(100% - 0.5rem);
                            object-fit: cover;
                        }
                    }

                    .articulo-name {
                        font-size: 1.1rem;
                        height: 3rem;
                        padding: 0rem 0.3rem 0.3rem 0.3rem;
                    }

                    .articulo-precio {
                        position: absolute;
                        padding: 0.3rem 0.5rem;
                        color: white;
                        background-color: var(--verde);
                        top: 0.2rem;
                        right: 0.2rem;
                        border-radius: 0.3rem;
                        width: 5rem;
                        text-align: center;
                        font-size: 0.9rem;
                        // box-shadow: 0 0 1rem var(--shadow-color);
                    }

                    &:hover {
                        // border: 2px solid var(--amarillo);
                        // background-color: var(--amarillo);
                        box-shadow: 0 0 0.8rem var(--amarillo);
                    }
                }
            }
        }
    }

    .right {
        height: 100%;
        display: grid;
        // grid-template-rows: auto 1fr auto;
        overflow: hidden;
        gap: 0.5rem;

        .pedido-head {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            align-items: center;
            text-align: center;
            border: var(--border);
            border-radius: 0.3rem;

            li {
                padding: 0.5rem;
                cursor: pointer;
            }

            .activo {
                background-color: var(--bg-color2);
            }
        }

        .pedido-items {
            .nombre {
                white-space: wrap;

                p {
                    cursor: pointer;
                }
            }

            .cantidad {
                display: grid;
                grid-template-columns: auto 1fr;

                ul {
                    display: grid;
                    grid-template-rows: 1rem 1rem;

                    li {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border-radius: 0.2rem;
                        padding: 0 0.3rem;
                        cursor: pointer;

                        * {
                            font-weight: bold;
                            font-size: 0.7rem;
                            color: white;
                        }
                    }

                    li:first-child {
                        background-color: var(--verde);
                    }

                    li:last-child {
                        background-color: var(--rojo);
                    }
                }
            }
        }

        .pedido-detalles {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.5rem;
            height: fit-content;
            overflow-y: auto;

            .dato-cliente {
                display: flex;
                gap: 0.5rem;
            }
        }

        .pedido-foot {
            background-color: var(--bg-color2);
            padding: 0.5rem;
            border-radius: 0.3rem;

            span {
                font-size: 0.9rem;
            }

            p {
                font-size: 1.5rem;
            }

            .pedido-total {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .pedido-paga {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                align-items: center;

                .input-paga {
                    grid-column: 4/5;
                }
            }
        }
    }
}

@media (max-width: 1016px) {
    .comanda {
        .left {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;

            .container-categorias {
                height: fit-content;
            }
        }
    }
}

@media (max-width: 540px) {
    .comanda {
        grid-template-columns: 1fr !important;
        grid-template-rows: 1fr 1fr;

        .right {
            .pedido-detalles {
                height: auto;
                overflow-y: auto;
            }
        }
    }
}
</style>

<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Nuevo pedido</strong>

            <div class="buttons">
                <JdButton text="Empezar nuevo" tipo="2" @click="nuevo()" />
                <JdButton text="Continuar" icon="fa-solid fa-arrow-right" @click="continuar()" />
                <!-- <JdButton text="Grabar e imprimir" @click="crear(true)" /> -->
            </div>
        </div>

        <div class="comanda">
            <!-- <div class="left"> -->
            <div class="card container-categorias">
                <div v-if="isSmallScreen" class="container-header">
                    <JdSelect v-model="vista.categoria" :lista="vista.categorias || []" />

                    <JdButton
                        title="Recargar"
                        icon="fa-solid fa-rotate-right"
                        tipo="2"
                        @click="loadCategorias"
                    />
                </div>

                <template v-else>
                    <div class="container-header">
                        <strong>Categorias:</strong>
                        <JdButton
                            title="Recargar"
                            icon="fa-solid fa-rotate-right"
                            tipo="2"
                            @click="loadCategorias"
                        />
                    </div>

                    <ul class="categorias">
                        <li
                            v-for="(a, i) in vista.categorias || []"
                            :key="i"
                            class="categoria-li"
                            @click="vista.categoria = a.id"
                        >
                            <!-- <div v-if="a.id == vista.categoria">ASD</div> -->
                            <i class="fa-solid fa-caret-right" v-if="a.id == vista.categoria"></i>
                            <div
                                class="categoria-box max-1line"
                                :style="{ backgroundColor: a.color }"
                                :class="{ 'categoria-selected': a.id == vista.categoria }"
                            >
                                {{ a.nombre }}
                            </div>
                        </li>
                    </ul>
                </template>
            </div>

            <div class="container-articulos">
                <div class="container-buscar">
                    <JdInput
                        icon="fa-solid fa-magnifying-glass"
                        type="search"
                        placeholder="Buscar por nombre..."
                        v-model="vista.txtBuscarArticulo"
                    />

                    <JdInput
                        ref="codigoBarraInput"
                        icon="fa-solid fa-barcode"
                        placeholder="Escanear codigo"
                        v-model="codigoBarra"
                        :disabled="buscandoCodigoBarra"
                        @keydown.enter="buscarPorCodigoBarra"
                    />

                    <JdButton
                        title="Recargar"
                        icon="fa-solid fa-rotate-right"
                        tipo="2"
                        @click="loadArticulos"
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
            <!-- </div> -->

            <div class="card container-resumen" style="grid-template-rows: 1fr auto">
                <JdTable
                    :columns="columns"
                    :datos="vista.pedido?.transaccion_items || []"
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
                        <div class="cantidad">
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

                <div class="pedido-foot">
                    <div class="pedido-total">
                        <span>Total (S/)</span>
                        <p>{{ redondear(vista.mtoImpVenta) }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <mPedidoItemNota v-if="useModals.show.mPedidoItemNota" />
    <mSocio @created="setSocioCreated" v-if="useModals.show.mSocio" />
</template>

<script>
import { JdTable, JdButton, JdInput, JdSelect } from '@jhuler/components'

import mPedidoItemNota from '@/views/ventas/pedidos/mPedidoItemNota.vue'
import mSocio from '@/views/compras/proveedores/mSocio.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get } from '@/utils/crud'
import { jmsg, jqst } from '@/utils/swal'
import { getItemFromArray, redondear, incompleteData, genId } from '@/utils/mine'
import dayjs from 'dayjs'

export default {
    components: {
        JdInput,
        JdButton,
        JdTable,
        JdSelect,
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
        codigoBarra: null,
        buscandoCodigoBarra: false,

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
            const { txtBuscarArticulo, categoria, articulos } = this.vista

            if (!articulos) return []

            if (!txtBuscarArticulo && categoria == 'TODOS') return articulos

            const term = txtBuscarArticulo ? txtBuscarArticulo.toLowerCase() : ''

            return articulos.filter((a) => {
                const coincideTexto = term === '' || a.nombre.toLowerCase().includes(term)
                const coincideCategoria = categoria == 'TODOS' || a.categoria == categoria
                return coincideTexto && coincideCategoria
            })
        },

        isSmallScreen() {
            if (this.vista.screenWidth == null) return false
            return this.vista.screenWidth < 1000
        },
        atencion() {
            if (this.vista.pedido.venta_canal == 1) {
                return `(${this.vista.pedido.venta_mesa1.salon1.nombre} - ${this.vista.pedido.venta_mesa1.nombre})`
            } else if (this.vista.pedido.venta_canal == 2) {
                return '(PARA LLEVAR)'
            } else if (this.vista.pedido.venta_canal == 3) {
                return '(DELIVERY)'
            } else {
                return ''
            }
        },
    },
    async created() {
        this.vista = this.useVistas.vPos
        this.vista.loadCategorias = this.loadCategorias
        this.vista.loadArticulos = this.loadArticulos
        this.vista.initPedido = this.initPedido
        this.handleResize()

        if (this.vista.pedido == null) this.initPedido()
        this.sumarItems()

        if (this.vista.categoriasLoaded != true) {
            await this.loadCategorias()
            this.vista.categoria = 'TODOS'
        }
        if (this.vista.articulosLoaded != true) await this.loadArticulos()
    },
    mounted() {
        window.addEventListener('resize', this.handleResize)
        this.focusCodigoBarra()
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.handleResize)
    },
    methods: {
        async loadCategorias() {
            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: '2' },
                    activo: { op: 'Es', val: true },
                },
                cols: ['nombre', 'color'],
                ordr: [['nombre', 'ASC']],
            }

            this.vista.categoriasLoaded = false
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_categorias}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.categoriasLoaded = true
            this.vista.categorias = res.data
            this.vista.categorias.unshift({
                id: 'TODOS',
                nombre: 'TODOS',
                color: 'var(--bg-color2)',
            })
        },
        async loadArticulos() {
            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: '2' },
                    'sucursal_articulos.sucursal': { op: 'Es', val: this.useAuth.sucursal.id },
                    'sucursal_articulos.estado': { op: 'Es', val: true },
                },
                cols: [
                    'nombre',
                    'precio_venta',
                    'has_receta',
                    'is_combo',
                    'igv_afectacion',
                    'codigo_barra',
                    'precios_semana',
                    'foto_path',
                    'foto_url',
                    'categoria',
                ],
                incl: ['receta_insumos', 'combo_articulos', 'sucursal_articulos'],
                iccl: {
                    combo_articulos: {
                        incl: ['articulo1'],
                    },
                    sucursal_articulos: {
                        incl: ['impresion_area1'],
                    },
                },
            }

            this.vista.articulosLoaded = false
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.articulosLoaded = true
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

        initPedido() {
            this.vista.pedido = {
                tipo: 2,
                venta_canal: 4,
                socio: this.useAuth.empresa.clientes_varios.id,
                venta_socio_datos: { ...this.useAuth.empresa.clientes_varios },
                pago_condicion: 1,
                estado: 1,
                venta_entregado: false,
                transaccion_items: [],
            }
        },
        async nuevo() {
            const hasItems = this.vista.pedido?.transaccion_items?.length > 0
            if (hasItems) {
                const resQst = await jqst('¿Está seguro de empezar un nuevo pedido?')
                if (resQst.isConfirmed == false) return
            }

            this.codigoBarra = null
            this.initPedido()
            this.sumarItems()
            this.focusCodigoBarra()
        },
        showPrecio(item) {
            const numeroDiaSemana = dayjs().day()
            const promocion_hoy = (item.precios_semana || []).find((a) => a.id == numeroDiaSemana)

            return promocion_hoy?.pu ? promocion_hoy.pu : item.precio_venta
        },
        getSucursalArticulo(item) {
            if (Array.isArray(item.sucursal_articulos)) return item.sucursal_articulos[0] || {}

            return item.sucursal1 || {}
        },

        async buscarPorCodigoBarra() {
            const codigo = String(this.codigoBarra || '').trim()
            if (!codigo) {
                this.focusCodigoBarra()
                return
            }

            const i = this.vista.pedido.transaccion_items.findIndex(
                (a) => a.codigo_barra == codigo || a.articulo1?.codigo_barra == codigo,
            )
            if (i !== -1) {
                this.codigoBarra = null
                this.sumarRestar(1, this.vista.pedido.transaccion_items[i])
                this.focusCodigoBarra()
                return
            }

            const articuloLocal = (this.vista.articulos || []).find((a) => a.codigo_barra == codigo)
            if (articuloLocal) {
                this.codigoBarra = null
                await this.addArticulo(articuloLocal, true)
                return
            }

            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: '2' },
                    activo: { op: 'Es', val: true },
                    codigo_barra: { op: 'Es', val: codigo },
                    'sucursal_articulos.sucursal': { op: 'Es', val: this.useAuth.sucursal.id },
                    'sucursal_articulos.estado': { op: 'Es', val: true },
                },
                cols: [
                    'nombre',
                    'precio_venta',
                    'has_receta',
                    'is_combo',
                    'igv_afectacion',
                    'codigo_barra',
                    'precios_semana',
                    'foto_path',
                    'foto_url',
                    'categoria',
                ],
                incl: ['receta_insumos', 'combo_articulos', 'sucursal_articulos'],
                iccl: {
                    combo_articulos: {
                        incl: ['articulo1'],
                    },
                    sucursal_articulos: {
                        incl: ['impresion_area1'],
                    },
                },
            }

            this.buscandoCodigoBarra = true
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            this.buscandoCodigoBarra = false
            this.codigoBarra = null

            if (res.code !== 0) {
                this.focusCodigoBarra()
                return
            }

            if (!res.data.length) {
                jmsg('warning', 'Articulo no encontrado')
                this.focusCodigoBarra()
                return
            }

            await this.addArticulo(res.data[0], true)
        },
        async addArticulo(item, fromScanner = false) {
            const i = this.vista.pedido.transaccion_items.findIndex((a) => a.articulo == item.id)
            const sucursal_articulo = this.getSucursalArticulo(item)
            const pu = this.showPrecio(item)

            if (i === -1) {
                this.vista.pedido.transaccion_items.push({
                    articulo: item.id,
                    codigo_barra: item.codigo_barra,
                    nombre: item.nombre,
                    unidad: item.unidad,
                    articulo1: {
                        nombre: item.nombre,
                        unidad: item.unidad,
                        codigo_barra: item.codigo_barra,
                        impresion_area1: sucursal_articulo.impresion_area1,
                    },

                    cantidad: 1,

                    pu,
                    igv_afectacion: item.igv_afectacion,
                    igv_porcentaje:
                        item.igv_afectacion == '10' ? this.useAuth.empresa.igv_porcentaje : 0,

                    observacion: '',

                    has_receta: item.has_receta,
                    receta_insumos: item.receta_insumos,
                    is_combo: item.is_combo,
                    combo_articulos: item.combo_articulos,

                    importe: pu,
                })

                this.sumarItems()
            } else {
                this.sumarRestar(1, this.vista.pedido.transaccion_items[i])
            }

            if (fromScanner) this.codigoBarra = null
            this.focusCodigoBarra()
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
                jmsg('warning', 'Agregue al menos 1 producto')
                return true
            }

            for (const a of this.vista.pedido.transaccion_items) {
                if (incompleteData(a, ['cantidad'])) {
                    jmsg('warning', 'Cada producto debe tener una cantidad')
                    return true
                }
            }
        },
        shapeDatos() {
            // this.vista.pedido.fecha = dayjs().format('YYYY-MM-DD')
            this.vista.pedido.venta_codigo = genId()
            // this.vista.pedido.monto = this.vista.mtoImpVenta
        },
        // async crear1() {
        //     if (this.checkDatos()) return
        //     this.shapeDatos()

        //     console.log(this.vista.pedido)
        // },
        async continuar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            const send = {
                comprobante: {
                    socio: this.vista.pedido.socio,
                    pago_condicion: this.vista.pedido.pago_condicion,
                    estado: 1,
                    fecha_emision: dayjs().format('YYYY-MM-DD'),

                    comprobante_items: this.vista.pedido.transaccion_items,

                    transaccion1: {
                        tipo: this.vista.pedido.tipo,
                        venta_canal: this.vista.pedido.venta_canal,
                        venta_codigo: this.vista.pedido.venta_codigo,
                    },
                },
                socio: { id: this.vista.pedido.socio, ...this.vista.pedido.venta_socio_datos },
                socios: [{ id: this.vista.pedido.socio, ...this.vista.pedido.venta_socio_datos }],
            }
            this.useVistas.showVista('vEmitirComprobante', 'Emitir comprobante', send)
        },

        runMethod(method, item) {
            this[method](item)
        },
        regresar() {
            // this.useVistas.closePestana('vPos', 'vPedidos')
            this.useVistas.showVista('vPedidos', 'ASD')
        },

        handleResize() {
            this.vista.screenWidth = window.innerWidth
        },
        focusCodigoBarra() {
            this.$nextTick(() => {
                const component = this.$refs.codigoBarraInput
                const input = component?.$el?.querySelector?.('input')

                input?.focus()
                input?.select?.()
            })
        },
    },
}
</script>

<style lang="scss" scoped>
.comanda {
    height: 100%;
    overflow: hidden;
    display: grid;
    grid-template-columns: 12rem 1fr 30rem;
    gap: 1rem;

    // .left {
    //     display: grid;
    //     grid-template-columns: 12rem 1fr;
    //     gap: 1rem;
    //     overflow: hidden;

    .container-categorias {
        height: 100%;
        display: grid;
        grid-template-rows: auto 1fr;
        overflow: hidden;
        // gap: 0.5rem;

        .container-header {
            display: flex;
            justify-content: space-between;
            gap: 0.5rem;
        }

        .categorias {
            overflow-y: auto;
            margin-top: 0.5rem;

            .categoria-li {
                display: flex;
                align-items: center;
                gap: 0.5rem;

                .categoria-box {
                    padding: 0.5rem;
                    font-size: 0.9rem;
                    height: fit-content;
                    border-radius: 0.3rem;
                    cursor: pointer;
                    margin-bottom: 0.5rem;
                    width: 100%;
                }
            }

            // .categoria-selected {
            //     font-weight: bold;
            //     // border: 1px solid var(--amarillo);
            //     // box-shadow: 0 0 0.5rem var(--shadow-color);
            // }
        }
    }

    .container-articulos {
        height: 100%;
        display: grid;
        grid-template-rows: auto 1fr;
        overflow: hidden;
        gap: 0.5rem;
        // border-radius: 0 0.5rem 0.5rem 0;
        background-color: var(--bg-color2);

        .container-buscar {
            display: grid;
            grid-template-columns: 2fr 1fr auto;
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
            // padding: 1rem;

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
    // }

    .container-resumen {
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

@media (max-width: 540px) {
    .vista-fill {
        height: initial;
        display: initial;
        flex-direction: initial;
        overflow: auto;
    }

    .comanda {
        grid-template-columns: 1fr !important;
        grid-template-rows: auto 1fr 1fr !important;

        .right {
            .pedido-detalles {
                height: auto;
                overflow-y: auto;
            }
        }
    }
}
</style>

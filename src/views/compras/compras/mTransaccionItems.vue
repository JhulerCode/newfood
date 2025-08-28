<template>
    <div class="pedido-items">
        <div class="agregar" v-if="modal.mode != 3">
            <JdSelectQuery
                icon="fa-solid fa-magnifying-glass"
                placeholder="Busca artículos"
                v-model="nuevo"
                :spin="spinArticulos"
                :lista="modal.articulos"
                @search="searchArticulos"
                @elegir="addArticulo"
            />
        </div>

        <JdTable
            name="mTransaccionItems"
            :columns="columns"
            :datos="modal.transaccion.transaccion_items || []"
            :colAct="modal.mode != 3"
            :download="false"
            :seeker="false"
            minHeight="10rem"
            maxHeight="30rem"
            width="60rem"
            :inputsDisabled="modal.mode == 3"
            @onInput="(action, a) => this[action](a)"
            @onChange="(action, a) => this[action](a)"
            class="jdTable"
        >
            <template v-slot:cAction="{ item }">
                <JdButton
                    :small="true"
                    tipo="2"
                    icon="fa-solid fa-trash-can"
                    title="Eliminar"
                    @click="quitar(item)"
                />
            </template>
        </JdTable>
    </div>
</template>

<script>
import JdSelectQuery from '@/components/inputs/JdSelectQuery.vue'
import JdButton from '@/components/inputs/JdButton.vue'
import JdTable from '@/components/JdTable.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch, delet } from '@/utils/crud'
import { jmsg, jqst } from '@/utils/swal'

export default {
    components: {
        JdSelectQuery,
        JdButton,
        JdTable,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},

        spinArticulos: false,
        nuevo: null,

        columns: [
            {
                id: 'nombre',
                title: 'Artículo',
                prop: 'articulo1.nombre',
                width: '20rem',
                show: true,
                sort: true,
            },
            {
                id: 'unidad',
                title: 'Unidad',
                prop: 'articulo1.unidad',
                width: '5rem',
                show: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                type: 'number',
                input: true,
                width: '6rem',
                show: true,
                oninput: 'sumarUno',
                onchange: 'modificar',
            },
            {
                id: 'pu',
                title: 'Precio unitario',
                type: 'number',
                input: true,
                width: '6rem',
                show: true,
                oninput: 'sumarUno',
                onchange: 'modificar',
            },
            {
                id: 'mtoValorVenta',
                title: 'Subtotal',
                format: 'decimal',
                width: '7rem',
                show: true,
                toRight: true,
            },
            {
                id: 'igv',
                title: 'Impuesto',
                format: 'decimal',
                width: '7rem',
                show: true,
                toRight: true,
            },
            {
                id: 'total',
                title: 'Importe',
                format: 'decimal',
                width: '7rem',
                show: true,
                toRight: true,
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mTransaccion

        // this.showColumns()
        this.loadEmpresa()
        this.sumarItems()
    },
    methods: {
        // showColumns() {
        //     if (this.modal.transaccion.tipo == 1) {
        //         this.columns[2].show = false
        //         // this.columns[6].show = false
        //     } else {
        //         this.columns[3].show = false
        //         this.columns[4].show = false
        //         // this.columns[7].show = false
        //     }
        // },

        async searchArticulos(txtBuscar) {
            if (!txtBuscar) {
                this.modal.articulos.length = 0
                return
            }

            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: this.modal.transaccion.tipo == 1 ? '1' : '2' },
                    activo: { op: 'Es', val: true },
                    nombre: { op: 'Contiene', val: txtBuscar },
                },
                cols: ['nombre', 'unidad', 'precio_venta', 'igv_afectacion'],
            }

            this.spinArticulos = true
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            this.spinArticulos = false

            if (res.code !== 0) return

            this.modal.articulos = JSON.parse(JSON.stringify(res.data))
        },
        async addArticulo(item) {
            if (this.nuevo == null) return
            this.nuevo = null
            this.modal.articulos = []

            const i = this.modal.transaccion.transaccion_items.findIndex(
                (a) => a.articulo == item.id,
            )
            if (i !== -1) return jmsg('warning', 'El artículo ya fue agregado')

            const send = {
                articulo: item.id,
                articulo1: {
                    nombre: item.nombre,
                    unidad: item.unidad,
                    has_fv: item.has_fv,
                },

                cantidad: null,

                pu: null,
                igv_afectacion: item.igv_afectacion,
                igv_porcentaje: item.igv_afectacion == '10' ? this.modal.empresa.igv_porcentaje : 0,

                mtoValorVenta: 0,
                igv: 0,
                total: 0,
            }

            if (this.modal.mode == 2) {
                send.tipo = this.modal.transaccion.tipo
                send.fecha = this.modal.transaccion.fecha
                send.transaccion = this.modal.transaccion.id

                this.useAuth.setLoading(true, 'Agregando...')
                const res = await post(urls.transaccion_items, send, 'Agregado con éxito')
                this.useAuth.setLoading(false)

                if (res.code != 0) return

                send.id = res.data.id
                send.cantidad_anterior = 0
            }

            this.modal.transaccion.transaccion_items.push(send)
        },

        calcularUno(item) {
            if (item.lote_padre) {
                if (item.cantidad > item.stock) {
                    jmsg('warning', 'La cantidad ingresada es mayor al stock del lote')
                    item.cantidad = item.stock
                    return
                }
            }

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

            for (const a of this.modal.transaccion.transaccion_items) {
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
        sumarUno(item) {
            this.calcularUno(item)

            this.calcularTotales()
        },
        sumarItems() {
            for (const a of this.modal.transaccion.transaccion_items) this.calcularUno(a)

            this.calcularTotales()
        },

        async modificar(item) {
            if (this.modal.mode != 2) return

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.transaccion_items, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            item.cantidad_anterior = item.cantidad
        },

        async quitar(item) {
            if (this.modal.mode == 2) {
                const qst = await jqst('¿Está seguro de eliminar?')
                if (!qst.isConfirmed) return

                this.useAuth.setLoading(true, 'Eliminando...')
                const res = await delet(urls.transaccion_items, item)
                this.useAuth.setLoading(false)

                if (res.code != 0) return
            }

            this.modal.transaccion.transaccion_items.splice(item.i, 1)

            this.calcularTotales()
        },

        async loadEmpresa() {
            const qry = {
                fltr: {},
                cols: ['igv_porcentaje'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.empresa}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.empresa = res.data
        },
    },
}
</script>

<style scoped>
.agregar {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 0.5rem;
    margin-bottom: 1rem;
}
</style>

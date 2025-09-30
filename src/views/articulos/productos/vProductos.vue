<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Productos</strong>

            <div class="buttons">
                <input
                    type="file"
                    ref="excel"
                    accept=".xlsx, .xls, .csv"
                    hidden
                    @change="importar"
                />

                <JdButton
                    icon="fa-solid fa-file-excel"
                    text="Importar"
                    tipo="2"
                    @click="this.$refs.excel.click()"
                    v-if="useAuth.verifyPermiso('vProductos:crearBulk')"
                />

                <JdButton
                    text="Nuevo"
                    title="Crear nuevo"
                    @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vProductos:crear')"
                />
            </div>
        </div>

        <JdTable
            :name="tableName"
            :columns="columns"
            :datos="vista.articulos || []"
            :colAct="true"
            :configRowSelect="true"
            :configFiltros="openConfigFiltros"
            :reload="loadArticulos"
            :actions="tableActions"
            @actionClick="runMethod"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
            ref="jdtable"
        >
        </JdTable>
        <!-- :configCols="true" -->
    </div>

    <mImportarArticulos v-if="useModals.show.mImportarArticulos" />
    <mArticulo v-if="useModals.show.mArticulo" />
    <mKardex v-if="useModals.show.mKardex" />
    <mAjusteStock v-if="useModals.show.mAjusteStock" />
    <mArticuloReceta v-if="useModals.show.mArticuloReceta" />
    <mArticuloPreciosSemana v-if="useModals.show.mArticuloPreciosSemana" />

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
    <mEditar v-if="useModals.show.mEditar" @updated="updatedBulk" />
</template>

<script>
import { JdTable, JdButton, mConfigCols, mConfigFiltros, mEditar } from '@jhuler/components'

import mImportarArticulos from '@/views/articulos/mImportarArticulos.vue'
import mArticulo from '@/views/articulos/mArticulo.vue'
import mKardex from '@/views/articulos/mKardex.vue'
import mAjusteStock from '@/views/articulos/mAjusteStock.vue'
import mArticuloReceta from '@/views/articulos/productos/mArticuloReceta.vue'
import mArticuloPreciosSemana from '@/views/articulos/productos/mArticuloPreciosSemana.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { tryOficialExcel } from '@/utils/mine'
import { jqst, jmsg } from '@/utils/swal'
import dayjs from 'dayjs'

export default {
    components: {
        JdButton,
        JdTable,

        mConfigCols,
        mConfigFiltros,
        mEditar,

        mImportarArticulos,
        mArticulo,
        mKardex,
        mAjusteStock,
        mArticuloReceta,
        mArticuloPreciosSemana,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vProductos',
        columns: [
            {
                id: 'id',
                title: 'id',
                type: 'text',
                width: '5rem',
                show: false,
                seek: false,
                sort: false,
            },
            {
                id: 'foto_url',
                title: 'Foto',
                filtrable: false,
                format: 'img',
                width: '5rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'nombre',
                title: 'Nombre',
                type: 'text',
                width: '25rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'precio_venta',
                title: 'Precio de venta',
                type: 'number',
                editable: true,
                format: 'decimal',
                toRight: true,
                width: '5rem',
                show: true,
                seek: false,
                sort: true,
            },
            {
                id: 'stock',
                title: 'Stock',
                toRight: true,
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'activo',
                title: 'Estado',
                prop: 'activo1.nombre',
                type: 'select',
                editable: true,
                format: 'yesno',
                width: '8rem',
                show: true,
                seek: false,
                sort: true,
            },
            {
                id: 'categoria',
                title: 'Categoría',
                prop: 'categoria1.nombre',
                type: 'select',
                editable: true,
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'produccion_area',
                title: 'Área de producción',
                prop: 'produccion_area1.nombre',
                type: 'select',
                editable: true,
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            // {
            //     id: 'valor',
            //     title: 'Valor',
            //     format: 'decimal',
            //     toRight: true,
            //     width: '10rem',
            //     show: false,
            //     seek: true,
            //     sort: true,
            // },
            {
                id: 'has_receta',
                title: 'Es transformado?',
                prop: 'has_receta1.nombre',
                type: 'select',
                editable: true,
                format: 'yesno',
                width: '8rem',
                show: true,
                seek: false,
                sort: true,
            },
            {
                id: 'igv_afectacion',
                title: 'Tributo',
                prop: 'igv_afectacion1.nombre',
                type: 'select',
                editable: true,
                width: '10rem',
                show: true,
                seek: false,
                sort: true,
            },
        ],
        tableActions: [
            {
                icon: 'fa-solid fa-pen-to-square',
                text: 'Editar',
                action: 'editarBulk',
                permiso: 'vProductos:editarBulk',
            },
            {
                icon: 'fa-solid fa-trash-can',
                text: 'Eliminar',
                action: 'eliminarBulk',
                permiso: 'vProductos:eliminarBulk',
            },
        ],
        tableRowOptions: [
            {
                label: 'Editar',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editar',
                permiso: 'vProductos:editar',
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash-can',
                action: 'eliminar',
                permiso: 'vProductos:eliminar',
            },
            {
                label: 'Clonar',
                icon: 'fa-solid fa-copy',
                action: 'clonar',
                permiso: 'vProductos:clonar',
            },
            {
                label: 'Receta',
                icon: 'fa-solid fa-flask',
                action: 'showReceta',
                permiso: 'vProductos:listarReceta',
                ocultar: { has_receta: false },
            },
            {
                label: 'Ver kardex',
                icon: 'fa-solid fa-table-list',
                action: 'verKardex',
                permiso: 'vProductos:kardex',
                ocultar: { has_receta: true },
            },
            {
                label: 'Ajuste stock',
                icon: 'fa-solid fa-wrench',
                action: 'ajusteStock',
                permiso: 'vProductos:ajusteStock',
                ocultar: { has_receta: true },
            },
            {
                label: 'Precios por día',
                icon: 'fa-solid fa-tags',
                action: 'openPreciosSemana',
                permiso: 'vProductos:editar',
            },
        ],
    }),
    async created() {
        this.vista = this.useVistas.vProductos
        this.useAuth.setColumns(this.tableName, this.columns)
        this.columns[1].host = urls.uploads

        this.verifyRowSelectIsActive()

        if (this.vista.loaded) return
        if (this.useAuth.verifyPermiso('vProductos:listar') == true) this.loadArticulos()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {
                    tipo: { op: 'Es', val: '2' },
                    is_combo: { op: 'Es', val: false },
                },
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadArticulos() {
            this.setQuery()

            this.vista.articulos = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.articulos = res.data
        },
        verifyRowSelectIsActive() {
            if (this.vista.articulos && this.vista.articulos.some((a) => a.selected)) {
                setTimeout(() => {
                    this.$refs['jdtable'].toogleSelectItems()
                }, 0)
            }
        },

        nuevo() {
            const item = {
                tipo: '2',
                igv_afectacion: 10,
                unidad: 'NIU',

                has_receta: false,
                activo: true,

                is_combo: false,
            }

            this.useModals.setModal('mArticulo', 'Nuevo producto', 1, item)
        },
        importar(event) {
            this.useAuth.setLoading(true, 'Cargando archivo...')

            const file = event.target.files[0]
            const reader = new FileReader()

            reader.onload = async () => {
                const headers = ['Nombre', 'Categoria', 'Unidad', 'Tributo']
                const res = await tryOficialExcel(this.$refs.excel, file, reader, headers)

                if (res.code != 0) {
                    this.useAuth.setLoading(false)
                    return jmsg('error', res.msg)
                }

                await this.loadDatosSistema()
                const igv_afectacionesMap = this.vista.igv_afectaciones.reduce(
                    (obj, a) => ((obj[a.id] = a), obj),
                    {},
                )

                await this.loadCategorias()
                const categoriasMap = this.vista.articulo_categorias.reduce(
                    (obj, a) => ((obj[a.nombre] = a), obj),
                    {},
                )

                for (const a of res.data) {
                    if (categoriasMap[a.Categoria]) {
                        a.Categoria1 = categoriasMap[a.Categoria]
                        a.Categoria = categoriasMap[a.Categoria].id
                    } else {
                        a.Categoria = null
                    }

                    if (igv_afectacionesMap[a.Tributo]) {
                        a.Tributo = igv_afectacionesMap[a.Tributo].id
                        a.Tributo1 = { ...igv_afectacionesMap[a.Tributo] }
                    } else {
                        a.Tributo = null
                    }
                }

                this.useAuth.setLoading(false)

                const send = {
                    tipo: 2,
                    articulos: res.data,
                }
                this.useModals.setModal(
                    'mImportarArticulos',
                    'Importar productos',
                    null,
                    send,
                    true,
                )
            }
            reader.readAsArrayBuffer(file)
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()
            await this.loadCategorias()
            await this.loadProduccionAreas()

            const cols = this.columns.filter((a) => a.id != 'stock')
            cols.find((a) => a.id == 'activo').lista = this.vista.activo_estados
            cols.find((a) => a.id == 'igv_afectacion').lista = this.vista.igv_afectaciones
            cols.find((a) => a.id == 'categoria').lista = this.vista.articulo_categorias
            cols.find((a) => a.id == 'produccion_area').lista = this.vista.produccion_areas

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadArticulos,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async eliminarBulk() {
            const ids = this.vista.articulos.filter((a) => a.selected).map((b) => b.id)

            const resQst = await jqst(`¿Está seguro de eliminar ${ids.length} registros?`)
            if (resQst.isConfirmed == false) return

            const send = { id: 'bulk', ids }
            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(`${urls.articulos}/bulk`, send)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.articulos = this.vista.articulos.filter((a) => !a.selected)
            this.$refs['jdtable'].toogleSelectItems()
        },
        async editarBulk() {
            await this.loadDatosSistema()
            await this.loadCategorias()

            const cols = this.columns.filter((a) => a.editable == true)
            cols.find((a) => a.id == 'unidad').lista = this.vista.unidades
            // cols.find((a) => a.id == 'has_fv').lista = this.vista.estados
            cols.find((a) => a.id == 'activo').lista = this.vista.activo_estados
            cols.find((a) => a.id == 'igv_afectacion').lista = this.vista.igv_afectaciones
            cols.find((a) => a.id == 'categoria').lista = this.vista.articulo_categorias

            const ids = this.vista.articulos.filter((a) => a.selected).map((b) => b.id)

            const send = {
                uri: 'articulos',
                nuevo: {},
                cols,
                ids,
            }

            this.useModals.setModal('mEditar', `Editar ${ids.length} registros`, null, send, true)
        },
        updatedBulk(item) {
            for (const a of this.vista.articulos) {
                if (!item.ids.includes(a.id)) continue

                a.selected = false
                a[item.prop] = item.val
                if (item.val1) a[`${item.prop}1`] = item.val1
            }

            this.$refs['jdtable'].toogleSelectItems()
        },

        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulos}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mArticulo', 'Editar producto', 2, res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.articulos, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vProductos', 'articulos', item)
        },
        async clonar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulos}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const send = {
                ...res.data,
                id: null,
            }

            this.useModals.setModal('mArticulo', 'Nuevo producto', 1, send)
        },
        async showReceta(item) {
            const send = {
                id: item.id,
            }

            this.useModals.setModal('mArticuloReceta', `Receta - ${item.nombre}`, null, send)
        },
        async verKardex(item) {
            const send = {
                articulo: {
                    id: item.id,
                    nombre: item.nombre,
                    unidad: item.unidad,
                },
            }

            this.useModals.setModal('mKardex', 'Kardex de artículo', null, send, true)
        },
        async ajusteStock(item) {
            const send = {
                transaccion: {
                    fecha: dayjs().format('YYYY-MM-DD'),
                    articulo: item.id,
                    estado: 1,
                },
                articulo1: {
                    igv_afectacion: item.igv_afectacion,
                    has_fv: item.has_fv,
                },
                articulos: [{ id: item.id, nombre: item.nombre }],
                articulo_tipo: 2,
                // is_nuevo_lote: false,
            }

            this.useModals.setModal('mAjusteStock', 'Ajuste de stock', null, send, true)
        },
        async openPreciosSemana(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulos}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mArticuloPreciosSemana', 'Precios por día', null, res.data)
        },

        async loadCategorias() {
            const qry = {
                fltr: { tipo: { op: 'Es', val: '2' }, activo: { op: 'Es', val: true } },
            }

            this.vista.articulo_categorias = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_categorias}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.articulo_categorias = res.data
        },
        async loadProduccionAreas() {
            const qry = {
                fltr: { activo: { op: 'Es', val: true } },
                cols: ['nombre'],
            }

            this.vista.produccion_areas = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.produccion_areas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.produccion_areas = res.data
        },
        async loadDatosSistema() {
            const qry = ['igv_afectaciones', 'unidades', 'activo_estados']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
    },
}
</script>

<style lang="scss" scoped></style>

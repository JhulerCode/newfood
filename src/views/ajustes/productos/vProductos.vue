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

        <div class="card">
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
            />
        </div>
    </div>

    <mImportarArticulos v-if="useModals.show.mImportarArticulos" />
    <mArticulo v-if="useModals.show.mArticulo" />
    <mArticuloReceta v-if="useModals.show.mArticuloReceta" />
    <mArticuloPreciosSemana v-if="useModals.show.mArticuloPreciosSemana" />
    <mRelacionadoSucursales v-if="useModals.show.mRelacionadoSucursales" />

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
    <mEditar v-if="useModals.show.mEditar" @updated="updatedBulk" />
</template>

<script>
import { JdTable, JdButton, mConfigCols, mConfigFiltros, mEditar } from '@jhuler/components'

import mImportarArticulos from '@/views/ajustes/insumos/mImportarArticulos.vue'
import mArticulo from '@/views/ajustes/insumos/mArticulo.vue'
import mArticuloReceta from '@/views/ajustes/productos/mArticuloReceta.vue'
import mArticuloPreciosSemana from '@/views/ajustes/productos/mArticuloPreciosSemana.vue'
import mRelacionadoSucursales from '@/views/ajustes/comprobante_tipos/mRelacionadoSucursales.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { tryOficialExcel } from '@/utils/mine'
import { jqst, jmsg } from '@/utils/swal'

export default {
    components: {
        JdButton,
        JdTable,

        mConfigCols,
        mConfigFiltros,
        mEditar,

        mImportarArticulos,
        mArticulo,
        mArticuloReceta,
        mArticuloPreciosSemana,
        mRelacionadoSucursales,
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
            // {
            //     id: 'foto_url',
            //     title: 'Foto',
            //     filtrable: false,
            //     format: 'img',
            //     width: '5rem',
            //     show: true,
            //     seek: true,
            //     sort: true,
            // },
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
            // {
            //     id: 'stock',
            //     title: 'Stock',
            //     toRight: true,
            //     filtrable: false,
            //     width: '8rem',
            //     show: true,
            //     seek: true,
            //     sort: true,
            // },
            // {
            //     id: 'activo',
            //     title: 'Estado',
            //     prop: 'activo1.nombre',
            //     type: 'select',
            //     editable: true,
            //     format: 'yesno',
            //     width: '8rem',
            //     show: true,
            //     seek: false,
            //     sort: true,
            // },
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
            // {
            //     id: 'produccion_area',
            //     title: 'Área de impresión',
            //     prop: 'produccion_area1.nombre',
            //     type: 'select',
            //     editable: true,
            //     width: '10rem',
            //     show: true,
            //     seek: true,
            //     sort: true,
            // },
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
                label: 'Precios por día',
                icon: 'fa-solid fa-tags',
                action: 'openPreciosSemana',
                permiso: 'vProductos:editar',
            },
            {
                label: 'Sucursales',
                icon: 'fa-solid fa-shop',
                action: 'editarSucursales',
                permiso: 'vSucursales:editar',
            },
        ],
    }),
    async created() {
        this.vista = this.useVistas.vProductos
        this.useAuth.setColumns(this.tableName, this.columns)
        this.columns[1].host = urls.uploads
        this.hideColumns()

        this.verifyRowSelectIsActive()

        if (this.vista.loaded) return
        if (this.useAuth.verifyPermiso('vProductos:listar') == true) this.loadArticulos()
    },
    methods: {
        hideColumns() {
            if (this.useAuth.empresa.tipo == 2) {
                this.columns[7].show = false
                this.columns[8].show = false
            }
        },
        setQuery() {
            this.vista.qry = {
                fltr: {
                    tipo: { op: 'Es', val: '2' },
                    is_combo: { op: 'Es', val: false },
                    'sucursal_articulos.sucursal': { op: 'Es', val: this.useAuth.sucursal.id },
                    'sucursal_articulos.estado': { op: 'Es', val: true },
                },
                incl: ['categoria1', 'produccion_area1', 'sucursal_articulos'],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
            this.vista.qry.cols.push('unidad')
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
                const headers = [
                    'Nombre',
                    'Categoria',
                    'Tributo',
                    'Es transformado?',
                    'Precio de venta',
                    'Área de impresión',
                ]
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

                await this.loadProduccionAreas()
                const produccion_areasMap = this.vista.produccion_areas.reduce(
                    (obj, a) => ((obj[a.nombre] = a), obj),
                    {},
                )

                for (const a of res.data) {
                    a.nombre = a.Nombre
                    a.has_receta = a['Es transformado?'] == 'SI' ? true : false
                    a.precio_venta = a['Precio de venta']

                    a.categoria1 = categoriasMap[a.Categoria]
                    a.categoria = a.categoria1?.id

                    a.tributo1 = igv_afectacionesMap[a.Tributo]
                    a.tributo = a.tributo1?.id

                    a.produccion_area1 = { ...produccion_areasMap[a['Área de impresión']] }
                    a.produccion_area = a.produccion_area1?.id
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

            for (const a of this.columns) {
                if (a.id == 'activo') a.lista = this.vista.activo_estados
                if (a.id == 'igv_afectacion') a.lista = this.vista.igv_afectaciones
                if (a.id == 'has_receta') a.lista = this.vista.estados
                if (a.id == 'categoria') a.reload = this.loadCategorias
                if (a.id == 'produccion_area') a.reload = this.loadProduccionAreas
            }
            const cols = this.columns

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

            for (const a of this.columns) {
                if (a.id == 'activo') a.lista = this.vista.activo_estados
                if (a.id == 'categoria') a.reload = this.loadCategorias
                if (a.id == 'produccion_area') a.reload = this.loadProduccionAreas
                if (a.id == 'has_receta') a.lista = this.vista.estados
                if (a.id == 'igv_afectacion') a.lista = this.vista.igv_afectaciones
            }
            const cols = this.columns

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
        async openPreciosSemana(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulos}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mArticuloPreciosSemana', 'Precios por día', null, res.data)
        },
        editarSucursales(item) {
            const send = {
                item,
                url: 'sucursal_articulos',
                column: 'articulo',
            }

            this.useModals.setModal('mRelacionadoSucursales', `${item.nombre} - sucursales`, 2, send, true)
        },

        async loadCategorias() {
            const qry = {
                fltr: { tipo: { op: 'Es', val: '2' }, activo: { op: 'Es', val: true } },
                cols: ['nombre'],
                ordr: [['nombre', 'ASC']],
            }

            this.vista.articulo_categorias = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_categorias}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.articulo_categorias = res.data
            return res.data
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
            return res.data
        },
        async loadDatosSistema() {
            const qry = ['igv_afectaciones', 'unidades', 'activo_estados', 'estados']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
    },
}
</script>

<style lang="scss" scoped></style>

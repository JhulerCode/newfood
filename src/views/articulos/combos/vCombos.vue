<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Combos</strong>

            <div class="buttons">
                <input
                    type="file"
                    ref="excel"
                    accept=".xlsx, .xls, .csv"
                    hidden
                    @change="importar"
                />

                <input
                    type="file"
                    ref="excel"
                    accept=".xlsx, .xls, .csv"
                    hidden
                    @change="importarComponentes"
                />

                <JdButton
                    icon="fa-solid fa-file-excel"
                    text="Importar"
                    tipo="2"
                    @click="this.$refs.excel.click()"
                    v-if="useAuth.verifyPermiso('vCombos:crearBulk')"
                />

                <JdButton
                    icon="fa-solid fa-file-excel"
                    text="Importar componentes"
                    tipo="2"
                    @click="this.$refs.excel.click()"
                    v-if="useAuth.verifyPermiso('vCombos:crearComponentesBulk')"
                />

                <JdButton
                    text="Nuevo"
                    title="Crear nuevo"
                    @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vCombos:crear')"
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
    <mImportarComboComponentes v-if="useModals.show.mImportarComboComponentes" />
    <mCombo v-if="useModals.show.mCombo" />
    <mKardex v-if="useModals.show.mKardex" />
    <mArticuloPreciosSemana v-if="useModals.show.mArticuloPreciosSemana" />

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
    <mEditar v-if="useModals.show.mEditar" @updated="updatedBulk" />
</template>

<script>
import { JdTable, JdButton, mConfigCols, mConfigFiltros, mEditar } from '@jhuler/components'

import mImportarArticulos from '@/views/articulos/mImportarArticulos.vue'
import mCombo from '@/views/articulos/combos/mCombo.vue'
import mKardex from '@/views/articulos/mKardex.vue'
import mArticuloPreciosSemana from '@/views/articulos/productos/mArticuloPreciosSemana.vue'
import mImportarComboComponentes from '@/views/articulos/mImportarComboComponentes.vue'

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
        mImportarComboComponentes,
        mCombo,
        mKardex,
        mArticuloPreciosSemana,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vCombos',
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
                width: '8rem',
                show: true,
                seek: false,
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
                title: 'Área de impresión',
                prop: 'produccion_area1.nombre',
                type: 'select',
                editable: true,
                width: '10rem',
                show: true,
                seek: true,
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
                permiso: 'vCombos:editarBulk',
            },
            {
                icon: 'fa-solid fa-trash-can',
                text: 'Eliminar',
                action: 'eliminarBulk',
                permiso: 'vCombos:eliminarBulk',
            },
        ],
        tableRowOptions: [
            {
                label: 'Editar',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editar',
                permiso: 'vCombos:editar',
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash-can',
                action: 'eliminar',
                permiso: 'vCombos:eliminar',
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
        this.vista = this.useVistas.vCombos
        this.useAuth.setColumns(this.tableName, this.columns)
        this.columns[1].host = urls.uploads
        this.hideColumns()

        this.verifyRowSelectIsActive()

        if (this.vista.loaded) return
        if (this.useAuth.verifyPermiso('vCombos:listar') == true) this.loadArticulos()
    },
    methods: {
        hideColumns() {
            if (this.useAuth.empresa.tipo == 2) {
                this.columns[6].show = false
            }
        },
        setQuery() {
            this.vista.qry = {
                fltr: {
                    tipo: { op: 'Es', val: '2' },
                    is_combo: { op: 'Es', val: true },
                },
                incl: ['produccion_area1', 'categoria1'],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
            this.vista.qry.cols.push('is_combo')
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
                tipo: 2,
                igv_afectacion: 10,
                unidad: 'NIU',

                // has_receta: false,
                activo: true,

                is_combo: true,
                combo_articulos: [],
            }

            this.useModals.setModal('mCombo', 'Nuevo Combo', 1, item)
        },
        importar(event) {
            this.useAuth.setLoading(true, 'Cargando archivo...')

            const file = event.target.files[0]
            const reader = new FileReader()

            reader.onload = async () => {
                const headers = [
                    'Nombre',
                    'Categoría',
                    'Tributo',
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
                    if (categoriasMap[a.Categoría]) {
                        a.categoria = categoriasMap[a.Categoría].id
                        a.categoria1 = categoriasMap[a.Categoría]
                    } else {
                        a.categoria = null
                    }

                    if (igv_afectacionesMap[a.Tributo]) {
                        a.tributo = igv_afectacionesMap[a.Tributo].id
                        a.tributo1 = { ...igv_afectacionesMap[a.Tributo] }
                    } else {
                        a.tributo = null
                    }

                    if (produccion_areasMap[a['Área de impresión']]) {
                        a.produccion_area = produccion_areasMap[a['Área de impresión']].id
                        a.produccion_area1 = { ...produccion_areasMap[a['Área de impresión']] }
                    } else {
                        a.produccion_area = null
                    }

                    a.nombre = a.Nombre
                    a.precio_venta = a['Precio de venta']
                    a.is_combo = true
                }

                this.useAuth.setLoading(false)

                const send = {
                    tipo: 2,
                    is_combo: true,
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
        importarComponentes(event) {
            this.useAuth.setLoading(true, 'Cargando archivo...')

            const file = event.target.files[0]
            const reader = new FileReader()

            reader.onload = async () => {
                const headers = ['Combo', 'Componente', 'Cantidad']
                const res = await tryOficialExcel(this.$refs.excel, file, reader, headers)

                if (res.code != 0) {
                    this.useAuth.setLoading(false)
                    return jmsg('error', res.msg)
                }

                await this.loadProductos()
                const productosMap = this.vista.productos.reduce(
                    (obj, a) => ((obj[a.nombre] = a), obj),
                    {},
                )

                for (const a of res.data) {
                    if (productosMap[a.Combo]) {
                        a.articulo_principal = productosMap[a.Combo].id
                        a.articulo_principal1 = { ...productosMap[a.Combo] }
                    } else {
                        a.articulo_principal = null
                    }

                    if (productosMap[a.Componente]) {
                        a.articulo = productosMap[a.Componente].id
                        a.articulo1 = { ...productosMap[a.Componente] }
                    } else {
                        a.articulo = null
                    }

                    a.cantidad = a.Cantidad
                }

                this.useAuth.setLoading(false)

                const send = {
                    tipo: 2,
                    articulos: res.data,
                }
                this.useModals.setModal(
                    'mImportarComboComponentes',
                    'Importar componentes de combos',
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

            for (const a of this.columns) {
                if (a.id == 'activo') a.lista = this.vista.activo_estados
                if (a.id == 'categoria') a.reload = this.loadCategorias
                if (a.id == 'produccion_area') a.reload = this.loadProduccionAreas
                if (a.id == 'igv_afectacion') a.lista = this.vista.igv_afectaciones
            }
            const cols = this.columns.filter((a) => a.editable == true)

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
            const qry = {
                incl: ['combo_articulos'],
                iccl: {
                    combo_articulos: {
                        incl: ['articulo1'],
                    },
                },
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulos}/uno/${item.id}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mCombo', 'Editar combo', 2, res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.articulos, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vCombos', 'articulos', item)
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
                fltr: {
                    tipo: { op: 'Es', val: '2' },
                    activo: { op: 'Es', val: true },
                },
                cols: ['nombre'],
                order: [['nombre', 'ASC']],
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

            this.vista.articulo_categorias = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.produccion_areas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.produccion_areas = res.data
            return res.data
        },
        async loadProductos() {
            this.vista.qry = {
                fltr: {
                    tipo: { op: 'Es', val: '2' },
                },
                cols: ['nombre'],
            }

            this.vista.productos = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.productos = res.data
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

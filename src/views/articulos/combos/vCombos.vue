<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Combos</strong>

            <div class="buttons">
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
            :configCols="true"
            :configFiltros="openConfigFiltros"
            :reload="loadArticulos"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
            ref="jdtable"
        >
        </JdTable>
    </div>

    <mImportarArticulos v-if="useModals.show.mImportarArticulos" />
    <mCombo v-if="useModals.show.mCombo" />
    <mKardex v-if="useModals.show.mKardex" />
    <mAjusteStock v-if="useModals.show.mAjusteStock" />

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
    <mEditar v-if="useModals.show.mEditar" @updated="updatedBulk" />
</template>

<script>
import JdButton from '@/components/inputs/JdButton.vue'
import JdTable from '@/components/JdTable.vue'

import mConfigCols from '@/components/mConfigCols.vue'
import mConfigFiltros from '@/components/mConfigFiltros.vue'
import mEditar from '@/components/mEditar.vue'

import mImportarArticulos from '@/views/articulos/mImportarArticulos.vue'
import mCombo from '@/views/articulos/combos/mCombo.vue'
import mKardex from '@/views/articulos/mKardex.vue'
import mAjusteStock from '@/views/articulos/mAjusteStock.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    components: {
        JdButton,
        JdTable,

        mConfigCols,
        mConfigFiltros,
        mEditar,

        mImportarArticulos,
        mCombo,
        mKardex,
        mAjusteStock,
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
                title: 'Área de producción',
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
        ],
    }),
    async created() {
        this.vista = this.useVistas.vCombos
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return
        if (this.useAuth.verifyPermiso('vCombos:listar') == true) this.loadArticulos()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {
                    tipo: { op: 'Es', val: '2' },
                    is_combo: { op: 'Es', val: true },
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
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulos}/uno/${item.id}`)
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

        async loadCategorias() {
            const qry = {
                fltr: { tipo: { op: 'Es', val: '1' }, activo: { op: 'Es', val: true } },
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

            this.vista.articulo_categorias = []
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

<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Insumos</strong>

            <div class="buttons"></div>
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

    <mArticulo v-if="useModals.show.mArticulo" />
    <mKardex v-if="useModals.show.mKardex" />
    <mAjusteStock v-if="useModals.show.mAjusteStock" />

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
    <mEditar v-if="useModals.show.mEditar" @updated="updatedBulk" />
</template>

<script>
import { JdTable, mConfigCols, mConfigFiltros, mEditar } from '@jhuler/components'

import mArticulo from '@/views/ajustes/insumos/mArticulo.vue'
import mKardex from '@/views/inventario/mKardex.vue'
import mAjusteStock from '@/views/inventario/mAjusteStock.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'
import dayjs from 'dayjs'

export default {
    components: {
        JdTable,

        mConfigCols,
        mConfigFiltros,
        mEditar,

        mArticulo,
        mKardex,
        mAjusteStock,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vInventarioInsumos',
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
                id: 'unidad',
                title: 'Unidad',
                type: 'select',
                editable: true,
                width: '5rem',
                show: true,
                seek: false,
                sort: true,
            },
            {
                id: 'stock',
                title: 'Stock',
                toRight: true,
                filtrable: false,
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
                label: 'Ver kardex',
                icon: 'fa-solid fa-table-list',
                action: 'verKardex',
                permiso: 'vInventarioInsumos:kardex',
            },
            {
                label: 'Ajuste stock',
                icon: 'fa-solid fa-wrench',
                action: 'ajusteStock',
                permiso: 'vInventarioInsumos:ajusteStock',
            },
        ],
    }),
    async created() {
        this.vista = this.useVistas.vInventarioInsumos
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return
        if (this.useAuth.verifyPermiso('vInventarioInsumos:listar') == true) this.loadArticulos()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: { tipo: { op: 'Es', val: '1' } },
                incl: ['categoria1'],
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

        async openConfigFiltros() {
            await this.loadDatosSistema()

            for (const a of this.columns) {
                if (a.id == 'unidad') a.lista = this.vista.unidades
                if (a.id == 'activo') a.lista = this.vista.activo_estados
                if (a.id == 'igv_afectacion') a.lista = this.vista.igv_afectaciones
                if (a.id == 'categoria') a.reload = this.loadCategorias
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
                },
                articulo1: {
                    igv_afectacion: item.igv_afectacion,
                    has_fv: item.has_fv,
                },
                articulos: [{ id: item.id, nombre: item.nombre }],
                articulo_tipo: 1,
                // is_nuevo_lote: false,
            }

            this.useModals.setModal('mAjusteStock', 'Ajuste de stock', null, send, true)
        },

        async loadCategorias() {
            const qry = {
                fltr: { tipo: { op: 'Es', val: '1' }, activo: { op: 'Es', val: true } },
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

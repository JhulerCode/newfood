<template>
    <JdModal modal="mSucursalArticulos">
        <JdTable
            :columns="columns"
            :datos="modal.articulos || []"
            :configRowSelect="true"
            :reload="loadArticulos"
            :download="false"
            :actions="tableActions"
            @actionClick="runMethod"
            ref="jdtable"
        >
            <template v-slot:cEstado="{ item }">
                <JdSelect
                    :nec="true"
                    :lista="modal.activo_estados || []"
                    v-model="item.estado"
                    :disabled="modal.mode == 3"
                    @elegir="modificar(item)"
                />
            </template>

            <template v-slot:cImpresionArea="{ item }">
                <JdSelect
                    :nec="true"
                    :lista="modal.impresion_areas || []"
                    v-model="item.impresion_area"
                    :disabled="modal.mode == 3"
                    @elegir="modificar(item)"
                />
            </template>
        </JdTable>
    </JdModal>

    <mEditar v-if="useModals.show.mEditar" @updated="updatedBulk" />
</template>

<script>
import { JdModal, JdTable, JdSelect, mEditar } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, patch } from '@/utils/crud'

export default {
    components: {
        JdModal,
        JdTable,
        JdSelect,
        mEditar,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        colaborador: {},

        columns: [
            {
                id: 'articulo1.categoria',
                title: 'Categoria',
                prop: 'articulo1.categoria1.nombre',
                width: '15rem',
                show: true,
                sort: true,
                seek: true,
            },
            {
                id: 'articulo1.nombre',
                title: 'Producto',
                prop: 'articulo1.nombre',
                width: '25rem',
                show: true,
                sort: true,
                seek: true,
            },
            {
                id: 'articulo1.unidad',
                title: 'Unidad',
                prop: 'articulo1.unidad',
                width: '6rem',
                show: true,
                sort: true,
            },
            {
                id: 'estado',
                title: 'Estado',
                type: 'select',
                editable: true,
                slot: 'cEstado',
                width: '10rem',
                show: true,
                sort: true,
            },
            {
                id: 'impresion_area',
                title: 'Área de impresión',
                type: 'select',
                editable: true,
                slot: 'cImpresionArea',
                width: '15rem',
                show: true,
                sort: true,
            },
        ],
        tableActions: [
            {
                icon: 'fa-solid fa-pen-to-square',
                text: 'Editar',
                action: 'editarBulk',
                permiso: 'vSucursales:editar',
            },
        ],
    }),
    async created() {
        this.modal = this.useModals.mSucursalArticulos

        if (this.modal.tipo == 1) {
            this.columns[4].show = false
        }

        await this.loadDatosSistema()
        await this.loadImpresionAreas()
        this.loadArticulos()
    },
    methods: {
        async loadDatosSistema() {
            const qry = ['activo_estados']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
        },
        async loadArticulos() {
            const qry = {
                fltr: {
                    sucursal: { op: 'Es', val: this.modal.item.id },
                    'articulo1.tipo': { op: 'Es', val: this.modal.tipo },
                },
                incl: ['articulo1'],
                cols: ['estado', 'impresion_area'],
                ordr: [['articulo1', 'nombre', 'ASC']],
                iccl: {
                    articulo1: {
                        incl: ['categoria1'],
                    },
                },
            }

            this.modal.articulos = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.sucursal_articulos}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.articulos = res.data
        },
        async loadImpresionAreas() {
            const qry = {
                fltr: {
                    sucursal: { op: 'Es', val: this.modal.item.id },
                },
                cols: ['nombre'],
                ordr: [['nombre', 'ASC']],
            }

            this.modal.impresion_areas = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.produccion_areas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.impresion_areas = res.data
            return res.data
        },
        runMethod(method, item) {
            this[method](item)
        },
        async editarBulk() {
            for (const a of this.columns) {
                if (a.id == 'estado') a.lista = this.modal.activo_estados
                if (a.id == 'impresion_area') a.lista = this.modal.impresion_areas
            }

            const cols = this.columns.filter(
                (a) => ['estado', 'impresion_area'].includes(a.id) && a.show != false,
            )
            const ids = this.modal.articulos.filter((a) => a.selected).map((b) => b.id)

            const send = {
                uri: 'sucursal_articulos',
                nuevo: {},
                cols,
                ids,
            }

            this.useModals.setModal('mEditar', `Editar ${ids.length} registros`, null, send, true)
        },
        updatedBulk(item) {
            for (const a of this.modal.articulos) {
                if (!item.ids.includes(a.id)) continue

                a.selected = false
                a[item.prop] = item.val
                if (item.val1) a[`${item.prop}1`] = item.val1
            }

            this.$refs['jdtable'].toogleSelectItems()
        },
        async modificar(item) {
            const send = {
                id: item.id,
                estado: item.estado,
                impresion_area: item.impresion_area,
            }

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.sucursal_articulos, send)
            this.useAuth.setLoading(false)

            if (res.code != 0) return
        },
    },
}
</script>

<template>
    <JdModal modal="mSucursalArticulos">
        <JdTable
            :columns="columns"
            :datos="modal.articulos || []"
            :reload="loadArticulos"
            :download="false"
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
</template>

<script>
import { JdModal, JdTable, JdSelect } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, patch } from '@/utils/crud'

export default {
    components: {
        JdModal,
        JdTable,
        JdSelect,
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
                slot: 'cEstado',
                width: '10rem',
                show: true,
                sort: true,
            },
            {
                id: 'impresion_area',
                title: 'Área de impresión',
                slot: 'cImpresionArea',
                width: '15rem',
                show: true,
                sort: true,
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

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
        ],
    }),
    async created() {
        this.modal = this.useModals.mSucursalArticulos

        await this.loadDatosSistema()
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
                cols: ['estado'],
                ordr: [['articulo1', 'nombre', 'ASC']],
            }

            this.modal.articulos = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.sucursal_articulos}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.articulos = res.data
        },
        async modificar(item) {
            const send = {
                id: item.id,
                estado: item.estado,
            }

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.sucursal_articulos, send)
            this.useAuth.setLoading(false)

            if (res.code != 0) return
        },
    },
}
</script>

<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Áreas de impresión</strong>

            <div class="buttons">
                <JdButton
                    text="Nuevo"
                    title="Crear nuevo"
                    @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vProduccionAreas:crear')"
                />
            </div>
        </div>

        <JdTable
            :name="tableName"
            :columns="columns"
            :datos="vista.produccion_areas || []"
            :colAct="true"
            :reload="loadCajas"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
        >
        </JdTable>
    </div>

    <mProduccionArea v-if="useModals.show.mProduccionArea" />
</template>

<script>
import { JdButton, JdTable } from '@jhuler/components'

import mProduccionArea from './mProduccionArea.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    components: {
        JdButton,
        JdTable,

        mProduccionArea,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vProduccionAreas',
        columns: [
            {
                id: 'sucursal',
                title: 'Sucursal',
                prop: 'sucursal1.codigo',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'nombre',
                title: 'Nombre',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'impresora_tipo',
                title: 'Tipo de impresora',
                prop: 'impresora_tipo1.nombre',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'impresora',
                title: 'Impresora',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'activo',
                title: 'Estado',
                prop: 'activo1.nombre',
                format: 'yesno',
                width: '6rem',
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
                permiso: 'vProduccionAreas:editar',
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash',
                action: 'eliminar',
                permiso: 'vProduccionAreas:eliminar',
                ocultar: { nombre: 'CAJA' },
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vProduccionAreas
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vProduccionAreas:listar') == true) this.loadCajas()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['sucursal1'],
                ordr: [['nombre', 'ASC']],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadCajas() {
            this.setQuery()

            this.vista.produccion_areas = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.produccion_areas}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.produccion_areas = res.data
        },

        nuevo() {
            const item = { activo: true }

            this.useModals.setModal('mProduccionArea', 'Nueva área de impresión', 1, item)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.produccion_areas}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mProduccionArea', 'Editar área de impresión', 2, res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.produccion_areas, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vProduccionAreas', 'produccion_areas', item)
        },
    },
}
</script>

<style lang="scss" scoped></style>

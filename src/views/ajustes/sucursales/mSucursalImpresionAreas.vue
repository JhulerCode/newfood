<template>
    <JdModal modal="mSucursalImpresionAreas">
        <div class="mrg-btm1">
            <JdButton
                text="Nuevo"
                title="Crear nuevo"
                @click="nuevo()"
                v-if="useAuth.verifyPermiso('vImpresionAreas:crear')"
            />
        </div>

        <JdTable
            :columns="columns"
            :datos="modal.impresion_areas || []"
            :colAct="true"
            :reload="loadImpresionAreas"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
        />
    </JdModal>

    <mSucursalImpresionArea
        v-if="useModals.show.mSucursalImpresionArea"
        @creado="creado"
        @modificado="modificado"
    />
</template>

<script>
import { JdModal, JdTable, JdButton } from '@jhuler/components'
import mSucursalImpresionArea from './mSucursalImpresionArea.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdTable,
        JdButton,

        mSucursalImpresionArea,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        colaborador: {},

        columns: [
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
                permiso: 'vImpresionAreas:editar',
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash',
                action: 'eliminar',
                permiso: 'vImpresionAreas:eliminar',
                ocultar: { nombre: 'CAJA' },
            },
        ],
    }),
    async created() {
        this.modal = this.useModals.mSucursalImpresionAreas

        // await this.loadDatosSistema()
        this.loadImpresionAreas()
    },
    methods: {
        // async loadDatosSistema() {
        //     const qry = ['activo_estados']
        //     const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

        //     if (res.code != 0) return

        //     Object.assign(this.modal, res.data)
        // },
        setQuery() {
            this.modal.qry = {
                fltr: {
                    sucursal: { op: 'Es', val: this.modal.sucursal },
                },
                ordr: [['nombre', 'ASC']],
            }

            this.useAuth.updateQuery(this.columns, this.modal.qry)
        },
        async loadImpresionAreas() {
            this.setQuery()

            this.modal.impresion_areas = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.produccion_areas}?qry=${JSON.stringify(this.modal.qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.impresion_areas = res.data
        },

        nuevo() {
            const item = { sucursal: this.modal.sucursal, activo: true }

            this.useModals.setModal('mSucursalImpresionArea', 'Nueva área de impresión', 1, item)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.produccion_areas}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal(
                'mSucursalImpresionArea',
                'Editar área de impresión',
                2,
                JSON.parse(JSON.stringify(res.data)),
            )
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.produccion_areas, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const i = this.modal.impresion_areas.findIndex((i) => i.id == item.id)
            this.modal.impresion_areas.splice(i, 1)
        },

        modificado(item) {
            const i = this.modal.impresion_areas.findIndex((i) => i.id == item.id)
            this.modal.impresion_areas.splice(i, 1, item)
        },
        creado(item) {
            this.modal.impresion_areas.push(item)
        },
    },
}
</script>

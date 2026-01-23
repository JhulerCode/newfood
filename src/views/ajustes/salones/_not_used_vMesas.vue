<template>
    <JdTable
        :name="tableName"
        :columns="columns"
        :datos="mesas || []"
        :colAct="true"
        :seeker="false"
        :reload="loadMesas"
        :rowOptions="tableRowOptions"
        @rowOptionSelected="runMethod"
        v-if="salon?.id"
    >
    </JdTable>

    <div v-else>
        <p>Agrega o selecciona un salón</p>
        <p>
            Debes agregar o seleccionar un salón para poder agregar, modificar o visualizar sus
            mesas
        </p>
    </div>
    <mMesa v-if="useModals.show.mMesa" />
</template>

<script>
import { JdTable } from '@jhuler/components'

import mMesa from './mMesa.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    components: {
        JdTable,

        mMesa,
    },
    props: {
        salon: { type: Object },
        mesas: { type: Array },
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vMesas',
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
                id: 'activo',
                title: 'Estado',
                prop: 'activo1.nombre',
                format: 'yesno',
                width: '6rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
        tableRowOptions: [
            {
                label: 'Editar',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editar',
                permiso: 'vSalones:editarMesas',
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash',
                action: 'eliminar',
                permiso: 'vSalones:eliminarMesas',
            },
        ],
    }),
    created() {
        // this.vista = this.useVistas.vMesas
        // this.useAuth.setColumns(this.tableName, this.columns)
        // if (this.vista.loaded) return
        // if (this.useAuth.verifyPermiso('vMesas:listar') == true) this.loadMesas()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {},
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadMesas() {
            this.setQuery()

            this.vista.mesas = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.mesas}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.mesas = res.data
        },

        nuevo() {
            const item = { activo: true }

            this.useModals.setModal('mMesa', 'Nueva mesa', 1, item)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.mesas}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mMesa', 'Editar mesa', 2, res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.mesas, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vMesas', 'mesas', item)
        },
    },
}
</script>

<style lang="scss" scoped></style>

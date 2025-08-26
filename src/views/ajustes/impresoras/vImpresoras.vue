<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Impresoras</strong>

            <div class="buttons">
                <JdButton
                    text="Nuevo"
                    title="Crear nuevo"
                    @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vImpresoras:crear')"
                />
            </div>
        </div>

        <JdTable
            :name="tableName"
            :columns="columns"
            :datos="vista.impresoras || []"
            :colAct="true"
            :reload="loadImpresoras"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
        >
        </JdTable>
    </div>

    <mImpresora v-if="useModals.show.mImpresora" />
</template>

<script>
import JdButton from '@/components/inputs/JdButton.vue'
import JdTable from '@/components/JdTable.vue'

import mImpresora from './mImpresora.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    components: {
        JdButton,
        JdTable,

        mImpresora,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vImpresoras',
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
                permiso: 'vImpresoras:editar',
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash',
                action: 'eliminar',
                permiso: 'vImpresoras:eliminar',
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vImpresoras
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vImpresoras:listar') == true) this.loadImpresoras()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {},
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadImpresoras() {
            this.setQuery()

            this.vista.impresoras = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.impresoras}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.impresoras = res.data
        },

        nuevo() {
            const item = { activo: true }

            this.useModals.setModal('mImpresora', 'Nueva impresora', 1, item)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.impresoras}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mImpresora', 'Editar impresora', 2, res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.impresoras, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vImpresoras', 'impresoras', item)
        },
    },
}
</script>

<style lang="scss" scoped></style>

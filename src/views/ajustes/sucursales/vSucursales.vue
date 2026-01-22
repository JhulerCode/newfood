<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Sucursales</strong>

            <div class="buttons">
                <JdButton
                    text="Nuevo"
                    title="Crear nuevo"
                    @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vSucursales:crear')"
                />
            </div>
        </div>

        <JdTable
            :name="tableName"
            :columns="columns"
            :datos="vista.sucursales || []"
            :colAct="true"
            :reload="loadSucursales"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
        >
        </JdTable>
    </div>

    <mSucursal v-if="useModals.show.mSucursal" />
    <mSucursalComprobanteTipos v-if="useModals.show.mSucursalComprobanteTipos" />
    <mSucursalPagoMetodos v-if="useModals.show.mSucursalPagoMetodos" />
</template>

<script>
import { JdButton, JdTable } from '@jhuler/components'

import mSucursal from './mSucursal.vue'
import mSucursalComprobanteTipos from './mSucursalComprobanteTipos.vue'
import mSucursalPagoMetodos from './mSucursalPagoMetodos.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    components: {
        JdButton,
        JdTable,

        mSucursal,
        mSucursalComprobanteTipos,
        mSucursalPagoMetodos,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vSucursales',
        columns: [
            {
                id: 'codigo',
                title: 'Código',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'direccion',
                title: 'Dirección',
                width: '15rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'telefono',
                title: 'Teléfono',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'correo',
                title: 'Correo',
                width: '15rem',
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
                permiso: 'vSucursales:editar',
            },
            {
                label: 'Tipos de comprobante',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editarComprobanteTipos',
                permiso: 'vSucursales:editar',
            },
            {
                label: 'Métodos de pago',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editarPagoMetodos',
                permiso: 'vSucursales:editar',
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash',
                action: 'eliminar',
                permiso: 'vSucursales:eliminar',
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vSucursales
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vSucursales:listar') == true) this.loadSucursales()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {},
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadSucursales() {
            this.setQuery()

            this.vista.sucursales = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.sucursales}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.sucursales = res.data
        },

        nuevo() {
            const item = { activo: true }

            this.useModals.setModal('mSucursal', 'Nueva sucursal', 1, item)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.sucursales}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mSucursal', 'Editar sucursal', 2, res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.sucursales, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vSucursales', 'sucursales', item)
        },

        editarComprobanteTipos(item) {
            this.useModals.setModal('mSucursalComprobanteTipos', `${item.codigo} - Tipos de comprobante`, 2, item)
        },
        editarPagoMetodos(item) {
            this.useModals.setModal('mSucursalPagoMetodos', `${item.codigo} - Métodos de pago`, 2, item)
        },
    },
}
</script>

<style lang="scss" scoped></style>

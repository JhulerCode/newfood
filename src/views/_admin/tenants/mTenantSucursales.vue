<template>
    <JdModal modal="mTenantSucursales">
        <div class="container-sucursales">
            <div class="head">
                <strong>{{ empresa.razon_social || empresa.nombre_comercial }}</strong>

                <JdButton
                    text="Nueva sucursal"
                    @click="nuevo"
                    v-if="useAuth.verifyPermiso('vTenantSucursales:crear')"
                />
            </div>

            <JdTable
                :columns="columns"
                :datos="sucursales"
                :colAct="true"
                :download="false"
                :reload="loadSucursales"
                :rowOptions="table_row_options"
                @rowOptionSelected="runMethod"
            />
        </div>
    </JdModal>

    <mSucursal v-if="useModals.show.mSucursal" @updated="loadSucursales" />
</template>

<script>
import { JdModal, JdTable, JdButton } from '@jhuler/components'

import mSucursal from '@/views/ajustes/sucursales/mSucursal.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'

import { urls, get, patch, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdTable,
        JdButton,
        mSucursal,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),

        empresa: {},
        sucursales: [],
        columns: [
            {
                id: 'codigo',
                title: 'Codigo',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'direccion',
                title: 'Direccion',
                width: '18rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'telefono',
                title: 'Telefono',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'correo',
                title: 'Correo',
                width: '12rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'activo',
                title: 'Estado',
                prop: 'activo1.nombre',
                format: 'yesno',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'fecha_fin',
                title: 'Fecha fin',
                format: 'date',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'anydesk_id',
                title: 'AnyDesk ID',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
        table_row_options: [
            {
                label: 'Editar',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editar',
                permiso: 'vTenantSucursales:editar',
            },
            {
                label: 'Activar / desactivar',
                icon: 'fa-solid fa-toggle-on',
                action: 'cambiarEstado',
                permiso: 'vTenantSucursales:editar',
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash-can',
                action: 'eliminar',
                permiso: 'vTenantSucursales:eliminar',
            },
        ],
    }),
    created() {
        this.empresa = this.useModals.mTenantSucursales.item || {}
        this.loadSucursales()
    },
    methods: {
        getUrl() {
            return `${urls.sucursales}/empresas/${this.empresa.id}`
        },
        async loadSucursales() {
            const qry = {
                cols: [
                    'codigo',
                    'direccion',
                    'telefono',
                    'correo',
                    'activo',
                    'fecha_fin',
                    'anydesk_id',
                ],
                ordr: [['codigo', 'ASC']],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${this.getUrl()}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.sucursales = res.data
        },
        nuevo() {
            const item = {
                codigo: '',
                direccion: '',
                telefono: '',
                correo: '',
                activo: true,
                fecha_fin: null,
                anydesk_id: '',
            }

            this.useModals.setModal(
                'mSucursal',
                'Nueva sucursal',
                1,
                { empresa: this.empresa, item },
                true,
            )
        },
        editar(item) {
            this.useModals.setModal(
                'mSucursal',
                'Editar sucursal',
                2,
                { empresa: this.empresa, item: { ...item } },
                true,
            )
        },
        async cambiarEstado(item) {
            const accion = item.activo ? 'desactivar' : 'activar'
            const res_qst = await jqst(`Esta seguro de ${accion} esta sucursal?`)
            if (res_qst.isConfirmed == false) return

            const send = {
                id: item.id,
                activo: !item.activo,
            }

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(`${this.getUrl()}/estado`, send, false)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const index = this.sucursales.findIndex((sucursal) => sucursal.id == item.id)
            if (index >= 0) this.sucursales.splice(index, 1, res.data)
        },
        async eliminar(item) {
            const res_qst = await jqst('¿Está seguro de eliminar?')
            if (res_qst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(this.getUrl(), item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.sucursales = this.sucursales.filter((sucursal) => sucursal.id != item.id)
        },
        runMethod(method, item) {
            this[method](item)
        },
    },
}
</script>

<style lang="scss" scoped>
.container-sucursales {
    display: grid;
    gap: 1rem;
    min-width: min(90vw, 60rem);
}

.head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}
</style>

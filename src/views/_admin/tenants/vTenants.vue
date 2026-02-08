<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Tenants</strong>

            <div class="buttons">
                <JdButton
                    text="Nuevo"
                    @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vTenants:crear')"
                />
            </div>
        </div>

        <div class="card">
            <JdTable
                :name="tableName"
                :columns="columns"
                :datos="vista.tenantes || []"
                :colAct="true"
                :reload="loadTenants"
                :rowOptions="tableRowOptions"
                @rowOptionSelected="runMethod"
            />
        </div>
    </div>

    <mTenant v-if="useModals.show.mTenant" />
</template>

<script>
import { JdTable, JdButton } from '@jhuler/components'

import mTenant from '@/views/_admin/tenants/mTenant.vue'

import { useModals } from '@/pinia/modals'
import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    components: {
        JdTable,
        JdButton,

        mTenant,
    },
    data: () => ({
        useModals: useModals(),
        useAuth: useAuth(),
        useVistas: useVistas(),

        vista: {},

        tableName: 'vTenants',
        columns: [
            {
                id: 'ruc',
                title: 'RUC',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'razon_social',
                title: 'Razón social',
                width: '20rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'nombre_comercial',
                title: 'Nombre comercial',
                width: '15rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'subdominio',
                title: 'Subdominio',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'domicilio_fiscal',
                title: 'Domicilio fiscal',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'ubigeo',
                title: 'Ubigeo',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'igv_porcentaje',
                title: 'IGV (%)',
                width: '10rem',
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
                type: 'select',
                editable: true,
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
        tableRowOptions: [
            {
                label: 'Ver',
                icon: 'fa-regular fa-folder-open',
                action: 'ver',
                permiso: 'vTenants:ver',
            },
            {
                label: 'Editar',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editar',
                permiso: 'vTenants:editar',
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash-can',
                action: 'eliminar',
                permiso: 'vTenants:eliminar',
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vTenants
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return
        if (this.useAuth.verifyPermiso('vTenants:listar') == true) this.loadTenants()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {
                    subdominio: { op: 'No es', val: 'admin' },
                },
                ordr: [['razon_social', 'ASC']],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadTenants() {
            this.setQuery()

            this.vista.tenantes = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.empresas}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.tenantes = res.data
        },

        nuevo() {
            const item = {
                tipo: 1,
                doc_tipo: 6,
                activo: true,
            }

            this.useModals.setModal('mTenant', 'Nuevo tenant', 1, item)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async ver(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.empresas}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const send = {
                item: res.data,
                precio_listas: [{ ...res.data.precio_lista1 }],
            }

            this.useModals.setModal('mTenant', 'Ver proveedor', 3, send, true)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.empresas}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mTenant', 'Editar proveedor', 2, res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.empresas, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vTenants', 'tenantes', item)
        },
    },
}
</script>

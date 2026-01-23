<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Métodos de pago</strong>

            <div class="buttons">
                <JdButton
                    text="Nuevo"
                    title="Crear nuevo"
                    @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vPagoMetodos:crear')"
                />
            </div>
        </div>

        <div class="card">
            <JdTable
                :name="tableName"
                :columns="columns"
                :datos="vista.pago_metodos || []"
                :colAct="true"
                :reload="loadPagoMetodos"
                :rowOptions="tableRowOptions"
                @rowOptionSelected="runMethod"
            />
        </div>
    </div>

    <mPagoMetodo v-if="useModals.show.mPagoMetodo" />
    <mPagoMetodoLocales v-if="useModals.show.mPagoMetodoLocales" />
</template>

<script>
import { JdTable, JdButton } from '@jhuler/components'

import mPagoMetodo from './mPagoMetodo.vue'
import mPagoMetodoLocales from './mPagoMetodoLocales.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    components: {
        JdButton,
        JdTable,

        mPagoMetodo,
        mPagoMetodoLocales,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vPagoMetodos',
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
                id: 'color',
                title: 'Color',
                format: 'color',
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
                permiso: 'vPagoMetodos:editar',
                ocultar: { id: `${useAuth().empresa.subdominio}-EFECTIVO` },
            },
            {
                label: 'Locales',
                icon: 'fa-solid fa-shop',
                action: 'editarLocales',
                permiso: 'vPagoMetodos:editar',
                ocultar: { id: `${useAuth().empresa.subdominio}-EFECTIVO` },
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash',
                action: 'eliminar',
                permiso: 'vPagoMetodos:eliminar',
                ocultar: { id: `${useAuth().empresa.subdominio}-EFECTIVO` },
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vPagoMetodos
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vPagoMetodos:listar') == true) this.loadPagoMetodos()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {},
                ordr: [['nombre', 'ASC']],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadPagoMetodos() {
            this.setQuery()

            this.vista.pago_metodos = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.pago_metodos}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.pago_metodos = res.data
        },

        nuevo() {
            const item = { activo: true }

            this.useModals.setModal('mPagoMetodo', 'Nuevo método de pago', 1, item)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.pago_metodos}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mPagoMetodo', 'Editar comprobante de pago', 2, res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.pago_metodos, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vPagoMetodos', 'pago_metodos', item)
        },

        editarLocales(item) {
            this.useModals.setModal('mPagoMetodoLocales', `${item.nombre} - locales`, 2, item)
        },
    },
}
</script>

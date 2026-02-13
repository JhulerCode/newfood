<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Tipos de comprobante</strong>

            <div class="buttons">
                <JdButton
                    text="Nuevo"
                    title="Crear nuevo"
                    @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vComprobanteTipos:crear')"
                />
            </div>
        </div>

        <div class="card">
            <JdTable
                :name="tableName"
                :columns="columns"
                :datos="vista.comprobante_tipos || []"
                :colAct="true"
                :reload="loadPagoComprobantes"
                :rowOptions="tableRowOptions"
                @rowOptionSelected="runMethod"
            />
        </div>
    </div>

    <mComprobanteTipo v-if="useModals.show.mComprobanteTipo" />
    <mRelacionadoSucursales v-if="useModals.show.mRelacionadoSucursales" />
</template>

<script>
import { JdTable, JdButton } from '@jhuler/components'

import mComprobanteTipo from './mComprobanteTipo.vue'
import mRelacionadoSucursales from '@/views/ajustes/comprobante_tipos/mRelacionadoSucursales.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    components: {
        JdButton,
        JdTable,

        mComprobanteTipo,
        mRelacionadoSucursales,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vComprobanteTipos',
        columns: [
            {
                id: 'tipo',
                title: 'Nombre',
                prop: 'tipo1.nombre',
                type: 'text',
                width: '12rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'serie',
                title: 'Serie',
                type: 'text',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'numero',
                title: 'Empieza en',
                type: 'text',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'correlativo',
                title: 'Correlativo',
                type: 'text',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'activo',
                title: 'Estado',
                prop: 'activo1.nombre',
                type: 'select',
                format: 'yesno',
                width: '6rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'estandar',
                title: 'Por defecto?',
                prop: 'estandar1.nombre',
                type: 'select',
                format: 'yesno',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
        tableRowOptions: [
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-pen-to-square',
                action: 'eliminar',
                permiso: 'vComprobanteTipos:eliminar',
            },
            {
                label: 'Sucursales',
                icon: 'fa-solid fa-shop',
                action: 'editarSucursales',
                permiso: 'vSucursales:editar',
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vComprobanteTipos
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vComprobanteTipos:listar') == true)
            this.loadPagoComprobantes()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {},
                ordr: [['serie', 'ASC']],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadPagoComprobantes() {
            this.setQuery()

            this.vista.comprobante_tipos = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.comprobante_tipos}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.comprobante_tipos = res.data
        },

        nuevo() {
            const item = { activo: true, estandar: false }

            this.useModals.setModal('mComprobanteTipo', 'Nuevo tipo de comprobante', 1, item)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.comprobante_tipos, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vComprobanteTipos', 'comprobante_tipos', item)
        },

        editarSucursales(item) {
            const send = {
                item,
                url: 'sucursal_comprobante_tipos',
                column: 'comprobante_tipo',
            }
            this.useModals.setModal(
                'mRelacionadoSucursales',
                `${item.tipo1?.nombre} (${item.serie}) - sucursales`,
                2,
                send,
                true,
            )
        },
    },
}
</script>

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
</template>

<script>
import { JdTable, JdButton } from '@jhuler/components'

import mComprobanteTipo from './mComprobanteTipo.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'

export default {
    components: {
        JdButton,
        JdTable,

        mComprobanteTipo,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vComprobanteTipos',
        columns: [
            {
                id: 'nombre',
                title: 'Nombre',
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
                title: 'Número',
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

        runMethod(method, item) {
            this[method](item)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.comprobante_tipos}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mComprobanteTipo', 'Editar método de pago', 2, res.data)
        },
    },
}
</script>

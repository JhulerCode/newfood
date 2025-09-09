<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Comprobantes de pago</strong>

            <div class="buttons">
                <JdButton
                    text="Nuevo"
                    title="Crear nuevo"
                    @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vPagoComprobantes:crear')"
                />
            </div>
        </div>

        <JdTable
            :name="tableName"
            :columns="columns"
            :datos="vista.pago_comprobantes || []"
            :colAct="true"
            :reload="loadPagoComprobantes"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
        >
        </JdTable>
    </div>

    <mPagoComprobante v-if="useModals.show.mPagoComprobante" />
</template>

<script>
import { JdButton, JdTable } from '@jhuler/components'

import mPagoComprobante from './mPagoComprobante.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'

export default {
    components: {
        JdButton,
        JdTable,

        mPagoComprobante,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vPagoComprobantes',
        columns: [
            {
                id: 'nombre',
                title: 'Nombre',
                type: 'text',
                width: '10rem',
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
                label: 'Editar',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editar',
                permiso: 'vPagoComprobantes:editar',
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vPagoComprobantes
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vPagoComprobantes:listar') == true)
            this.loadPagoComprobantes()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {},
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadPagoComprobantes() {
            this.setQuery()

            this.vista.pago_comprobantes = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.pago_comprobantes}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.pago_comprobantes = res.data
        },



        runMethod(method, item) {
            this[method](item)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.pago_comprobantes}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mPagoComprobante', 'Editar método de pago', 2, res.data)
        },
    },
}
</script>

<style lang="scss" scoped></style>

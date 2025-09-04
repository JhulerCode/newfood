<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Caja chica</strong>

            <div class="buttons"></div>
        </div>

        <JdTable
            :name="tableName"
            :columns="columns"
            :datos="vista.caja_aperturas || []"
            :colAct="true"
            :configFiltros="openConfigFiltros"
            :reload="loadCajaAperturas"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
        >
        </JdTable>
    </div>

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
</template>

<script>
import JdTable from '@/components/JdTable.vue'

import mConfigCols from '@/components/mConfigCols.vue'
import mConfigFiltros from '@/components/mConfigFiltros.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'

export default {
    components: {
        JdTable,

        mConfigCols,
        mConfigFiltros,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vCajaAperturas',
        columns: [
            {
                id: 'createdBy',
                title: 'Aperturado por',
                prop: 'createdBy1.nombres_apellidos',
                type: 'select',
                width: '15rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'fecha_apertura',
                title: 'Fecha apertura',
                type: 'datetime',
                format: 'datetime',
                width: '12rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'monto_apertura',
                title: 'Monto apertura',
                type: 'number',
                format: 'currency',
                moneda: 'S/',
                width: '10rem',
                show: true,
                seek: false,
                sort: false,
            },
            {
                id: 'fecha_cierre',
                title: 'Fecha cierre',
                type: 'datetime',
                format: 'datetime',
                width: '12rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'monto_cierre',
                title: 'Monto cierre',
                type: 'number',
                format: 'currency',
                moneda: 'S/',
                width: '10rem',
                show: true,
                seek: false,
                sort: false,
            },
            {
                id: 'estado',
                title: 'Estado',
                type: 'select',
                prop: 'estado1.nombre',
                format: 'estado',
                width: '10rem',
                show: true,
                seek: false,
                sort: false,
            },
        ],
        tableRowOptions: [
            {
                id: 1,
                label: 'Ver resumen',
                icon: 'fa-solid fa-up-right-from-square',
                action: 'verResumen',
                permiso: 'vCajaAperturas:verResumen',
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vCajaAperturas
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return
        if (this.useAuth.verifyPermiso('vCajaAperturas:listar') == true) this.loadCajaAperturas()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['createdBy1']
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadCajaAperturas() {
            this.setQuery()

            this.vista.caja_aperturas = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.caja_aperturas}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.caja_aperturas = res.data
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()

            const cols = this.columns
            cols.find((a) => a.id == 'estado').lista = this.vista.caja_apertura_estados

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadCajaAperturas,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async verResumen(item) {
            const send = {
                caja_apertura: item,
                pasado: true,
            }
            this.useVistas.showVista('vCajaResumen', 'Caja resumen', send)
        },

        async loadDatosSistema() {
            const qry = ['caja_apertura_estados']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
    },
}
</script>

<style lang="scss" scoped></style>

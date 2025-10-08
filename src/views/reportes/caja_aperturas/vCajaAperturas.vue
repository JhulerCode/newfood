<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Aperturas de caja</strong>

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
import { JdTable, mConfigCols, mConfigFiltros } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'

import dayjs from 'dayjs'

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
                id: 'createdAt',
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
                id: 'updatedAt',
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
                label: 'Ver resumen',
                icon: 'fa-solid fa-up-right-from-square',
                action: 'verResumen',
                permiso: 'vCajaAperturas:verResumen',
            },
            {
                label: 'Imprimir resumen',
                icon: 'fa-solid fa-print',
                action: 'imprimirResumen',
                permiso: 'vCajaAperturas:imprimirResumen',
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vCajaAperturas
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return
        if (this.useAuth.verifyPermiso('vCajaAperturas:listar') == true) this.loadCajaAperturas()
    },
    methods: {
        initFiltros() {
            this.columns[0].op = 'Es posterior a'
            this.columns[0].val = dayjs().startOf('month').format('YYYY-MM-DD HH:mm:ss')
        },
        setQuery() {
            this.vista.qry = {
                fltr: {},
                incl: ['createdBy1'],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
            this.vista.qry.cols.push('fecha_apertura', 'fecha_cierre')
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
        async imprimirResumen(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.caja_aperturas}/resumen/${item.id}&true&undefined`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const {
                efectivo_ingresos_total,
                efectivo_egresos_total,
                comprobantes_aceptados_total,
                comprobantes_anulados_total,
                descuentos_total,
                venta_canales,
                venta_pago_metodos,
                venta_comprobantes,
            } = res.data

            const send = {
                impresora: {
                    tipo: this.useAuth.usuario.impresora_caja.impresora_tipo,
                    nombre: this.useAuth.usuario.impresora_caja.impresora,
                },
                caja_apertura: item,
                efectivo_ingresos_total,
                efectivo_egresos_total,
                comprobantes_aceptados_total,
                comprobantes_anulados_total,
                descuentos_total,
                venta_canales,
                venta_pago_metodos,
                venta_comprobantes,
                subdominio: this.useAuth.usuario.empresa.subdominio,
            }

            this.useAuth.socket.emit('vCajaAperturas:imprimirResumen', send)

            // const uriEncoded = `http://${this.useAuth.usuario.empresa.pc_principal_ip}/imprimir/caja_resumen.php?data=${encodeURIComponent(JSON.stringify(send))}`
            // console.log(uriEncoded)
            // const nuevaVentana = window.open(
            //     uriEncoded,
            //     '_blank',
            //     'width=1,height=1,top=0,left=0,scrollbars=no,toolbar=no,location=no,status=no,menubar=no',
            // )

            // setTimeout(() => {
            //     nuevaVentana.close()
            // }, 500)
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

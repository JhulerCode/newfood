<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Comprobantes</strong>

            <div class="buttons"></div>
        </div>

        <JdTable
            :name="tableName"
            :columns="columns"
            :datos="vista.comprobantes || []"
            :colAct="true"
            :configFiltros="openConfigFiltros"
            :reload="loadComprobantes"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
        >
            <template v-slot:cVenta_canal="{ item }">
                <template v-if="item.venta_canal == 1">
                    {{ item.venta_mesa1.salon1.nombre }} - {{ item.venta_mesa1.nombre }}
                </template>
                <template v-else>
                    {{ item.venta_canal1.nombre }}
                </template>
            </template>
        </JdTable>
    </div>

    <mComprobantePagos
        v-if="useModals.show.mComprobantePagos"
        @pagosModificados="actualizarPagos"
    />
    <mComprobanteCanjear v-if="useModals.show.mComprobanteCanjear" @canjeado="comprobanteCanjedo" />
    <mComprobanteCorreo v-if="useModals.show.mComprobanteCorreo" />

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />
    <mAnular v-if="useModals.show.mAnular" />
    <mPdfViewer v-if="useModals.show.mPdfViewer" />
</template>

<script>
import { JdTable, mConfigCols, mConfigFiltros, mAnular, mPdfViewer } from '@jhuler/components'

import mComprobantePagos from '@/views/reportes/comprobantes/mComprobantePagos.vue'
import mComprobanteCanjear from '@/views/reportes/comprobantes/mComprobanteCanjear.vue'
import mComprobanteCorreo from '@/views/reportes/comprobantes/mComprobanteCorreo.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'

import dayjs from 'dayjs'
import { saveAs } from 'file-saver'

export default {
    components: {
        JdTable,
        mAnular,
        mConfigCols,
        mConfigFiltros,
        mPdfViewer,

        mComprobantePagos,
        mComprobanteCanjear,
        mComprobanteCorreo,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),
        dayjs,

        vista: {},

        tableName: 'vReporteComprobantes',
        columns: [
            {
                id: 'fecha_emision',
                title: 'Fecha',
                type: 'date',
                format: 'date',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'doc_tipo',
                title: 'Tipo compr.',
                prop: 'doc_tipo1.nombre',
                type: 'select',
                width: '10rem',
                show: true,
                sort: true,
                seek: true,
            },
            {
                id: 'serie',
                title: 'Serie',
                type: 'text',
                width: '5rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'numero',
                title: 'Correlativo',
                type: 'text',
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'socio',
                title: 'Cliente',
                prop: 'socio1.nombres',
                type: 'select',
                mostrar: 'doc_nombres',
                width: '15rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'monto',
                title: 'Importe',
                type: 'number',
                format: 'currency',
                moneda: 'S/',
                width: '8rem',
                show: true,
                seek: false,
                sort: true,
            },
            {
                id: 'estado',
                title: 'Estado',
                type: 'select',
                prop: 'estado1.nombre',
                format: 'estado',
                width: '8rem',
                show: true,
                seek: false,
                sort: true,
            },
            {
                id: 'pago_condicion',
                title: 'Condición de pago',
                type: 'select',
                prop: 'pago_condicion1.nombre',
                width: '8rem',
                show: true,
                seek: false,
                sort: true,
            },
            {
                id: 'pagos_monto',
                title: 'Cobrado',
                type: 'number',
                format: 'currency',
                moneda: 'S/',
                width: '8rem',
                show: true,
                seek: false,
                sort: true,
            },
        ],
        tableRowOptions: [
            {
                label: 'Anular',
                icon: 'fa-solid fa-ban',
                action: 'anular',
                permiso: 'vReporteComprobantes:anular',
                ocultar: { estado: ['0', '4'] },
            },
            {
                label: 'Canjear',
                icon: 'fa-solid fa-left-right',
                action: 'canjear',
                permiso: 'vReporteComprobantes:canjear',
                ocultar: { estado: ['0', '4'], doc_tipo: '01' },
            },
            {
                label: 'Ver pagos',
                icon: 'fa-solid fa-up-right-from-square',
                action: 'verPagos',
                permiso: 'vReporteComprobantes:verPagos',
                ocultar: { estado: ['0', '4'], pagos_monto: 0 },
            },
            {
                label: 'Modificar pagos',
                icon: 'fa-solid fa-dollar-sign',
                action: 'editarPagos',
                permiso: 'vReporteComprobantes:editarPagos',
                ocultar: { estado: ['0', '4'], pagos_monto: 0 },
            },
            {
                label: 'Agregar pagos',
                icon: 'fa-solid fa-dollar-sign',
                action: 'agregarPagos',
                permiso: 'vReporteComprobantes:agregarPagos',
                ocultar: { estado: ['0', '4'], pagos_monto: { op: '>', val: 0 } },
            },
            {
                label: 'Enviar por email',
                icon: 'fa-regular fa-envelope',
                action: 'enviarCorreo',
                permiso: 'vReporteComprobantes:enviarCorreo',
            },
            {
                label: 'Imprimir',
                icon: 'fa-solid fa-print',
                action: 'imprimir',
                permiso: 'vReporteComprobantes:imprimir',
            },
            {
                label: 'Descargar PDF',
                icon: 'fa-regular fa-file-pdf',
                action: 'descargarPdf',
                permiso: 'vReporteComprobantes:descargarPdf',
            },
            {
                label: 'Descargar XML',
                icon: 'fa-solid fa-file-arrow-down',
                action: 'descargarXml',
                permiso: 'vReporteComprobantes:descargarXml',
                ocultar: { estado: 0, doc_tipo: 'NV' },
            },
            {
                label: 'Descargar CDR',
                icon: 'fa-solid fa-file-arrow-down',
                action: 'descargarCdr',
                permiso: 'vReporteComprobantes:descargarCdr',
                ocultar: { estado: 0, doc_tipo: 'NV' },
            },
            {
                label: 'Consultar estado',
                icon: 'fa-solid fa-question',
                action: 'consultarEstado',
                permiso: 'vReporteComprobantes:consultarEstado',
                ocultar: { doc_tipo: 'NV' },
            },
        ],
    }),
    async created() {
        this.vista = this.useVistas.vReporteComprobantes
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vReporteComprobantes:listar') == true)
            this.loadComprobantes()
    },
    methods: {
        initFiltros() {
            this.columns[0].op = 'Está dentro de'
            this.columns[0].val = dayjs().startOf('month').format('YYYY-MM-DD')
            this.columns[0].val1 = dayjs().format('YYYY-MM-DD')
        },
        setQuery() {
            this.vista.qry = {
                fltr: {},
                sqls: ['pagos_monto'],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
            this.vista.qry.cols.push('caja_apertura', 'empresa_datos')
        },
        async loadComprobantes() {
            this.setQuery()

            this.vista.comprobantes = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.comprobantes}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.comprobantes = res.data
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()
            await this.loadSocios()
            await this.loadPagoComprobantes()

            const cols = this.columns
            cols.find((a) => a.id == 'doc_tipo').lista = this.vista.pago_comprobantes
            cols.find((a) => a.id == 'socio').lista = this.vista.socios
            cols.find((a) => a.id == 'estado').lista = this.vista.comprobante_estados

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadComprobantes,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        anular(item) {
            const send = {
                url: 'comprobantes',
                vista: 'vReporteComprobantes',
                array: 'comprobantes',
                item,
            }

            this.useModals.setModal(
                'mAnular',
                `Anular comprobante N° ${item.serie} - ${item.numero}`,
                null,
                send,
                true,
            )
        },
        canjear(item) {
            const send = {
                comprobante: {
                    id: item.id,
                    fecha_emision: dayjs().format('YYYY-MM-DD'),
                    socio: null,
                    monto: item.monto,
                    doc_tipo: item.doc_tipo,
                },
            }

            this.useModals.setModal(
                'mComprobanteCanjear',
                `Canjear comprobante ${item.serie}-${item.numero}`,
                null,
                send,
                true,
            )
        },
        async verPagos(item) {
            const send = {
                comprobante: item,
                pagos: [],
            }

            this.useModals.setModal(
                'mComprobantePagos',
                `Pagos de ${item.serie} - ${item.numero}`,
                3,
                send,
                true,
            )
        },
        editarPagos(item) {
            const send = {
                comprobante: item,
            }

            this.useModals.setModal(
                'mComprobantePagos',
                `Editar pagos de ${item.serie} - ${item.numero}`,
                2,
                send,
                true,
            )
        },
        agregarPagos(item) {
            const send = {
                comprobante: item,
            }

            this.useModals.setModal(
                'mComprobantePagos',
                `Agregar pagos de ${item.serie} - ${item.numero}`,
                1,
                send,
                true,
            )
        },
        async enviarCorreo(item) {
            this.useModals.setModal(
                'mComprobanteCorreo',
                'Enviar comrpobante por email',
                null,
                item,
            )
        },
        async imprimir(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.comprobantes}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const send = {
                ...res.data,
                impresora: {
                    tipo: this.useAuth.usuario.impresora_caja.impresora_tipo,
                    nombre: this.useAuth.usuario.impresora_caja.impresora,
                },
                subdominio: this.useAuth.usuario.empresa.subdominio,
            }

            const uriEncoded = `http://${this.useAuth.usuario.empresa.pc_principal_ip}/imprimir/comprobante.php?data=${encodeURIComponent(JSON.stringify(send))}`
            console.log(uriEncoded)
            const nuevaVentana = window.open(
                uriEncoded,
                '_blank',
                'width=1,height=1,top=0,left=0,scrollbars=no,toolbar=no,location=no,status=no,menubar=no',
            )

            setTimeout(() => {
                nuevaVentana.close()
            }, 500)
        },
        async descargarPdf(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.comprobantes}/pdf/${item.id}`, true)
            this.useAuth.setLoading(false)

            this.vista.pdfUrl = URL.createObjectURL(res)
            this.useModals.setModal('mPdfViewer', 'Comprobante', null, this.vista.pdfUrl)
        },
        async descargarXml(item) {
            const send = {
                empresa_datos: item.empresa_datos,
                fecha_emision: item.fecha_emision,
                doc_tipo: item.doc_tipo,
                serie: item.serie,
                numero: item.numero,
                xml: true,
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.comprobantes}/xml?item=${JSON.stringify(send)}`, true)
            this.useAuth.setLoading(false)

            if (!res.code) {
                const xmlid = `${item.empresa_datos.ruc}-${item.doc_tipo}-${item.serie}-${item.numero}.xml`
                saveAs(res, xmlid)
            }
        },
        async descargarCdr(item) {
            const send = {
                empresa_datos: item.empresa_datos,
                fecha_emision: item.fecha_emision,
                doc_tipo: item.doc_tipo,
                serie: item.serie,
                numero: item.numero,
                cdr: true,
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.comprobantes}/xml?item=${JSON.stringify(send)}`, true)
            this.useAuth.setLoading(false)

            if (!res.code) {
                const xmlid = `R-${item.empresa_datos.ruc}-${item.doc_tipo}-${item.serie}-${item.numero}.xml`
                saveAs(res, xmlid)
            }
        },
        async consultarEstado(item) {
            const send = {
                empresa_datos: item.empresa_datos,
                fecha_emision: item.fecha_emision,
                doc_tipo: item.doc_tipo,
                serie: item.serie,
                numero: item.numero,
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.comprobantes}/estado/uno?item=${JSON.stringify(send)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return
        },

        actualizarPagos(item) {
            const i = this.vista.comprobantes.findIndex((a) => a.id == item.id)
            this.vista.comprobantes[i].pagos_monto = item.monto
        },
        comprobanteCanjedo(item) {
            const i = this.vista.comprobantes.findIndex((a) => a.id == item.id)
            this.vista.comprobantes[i].estado = 3
            this.vista.comprobantes[i].estado1 = { id: 3, nombre: 'CANJEADO' }
        },

        async loadDatosSistema() {
            const qry = ['pago_condicion', 'comprobante_estados']

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
        async loadSocios() {
            const qry = {
                fltr: { tipo: { op: 'Es', val: 2 }, activo: { op: 'Es', val: true } },
                cols: ['doc_numero', 'nombres', 'doc_nombres'],
            }

            this.vista.socios = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.vista.socios = res.data
        },
        async loadPagoComprobantes() {
            const qry = {
                fltr: { activo: { op: 'Es', val: true } },
                cols: ['nombre', 'estandar'],
            }

            this.vista.pago_comprobantes = []
            this.useAuth.loading = { show: true, text: 'Cargando...' }
            const res = await get(`${urls.pago_comprobantes}?qry=${JSON.stringify(qry)}`)
            this.useAuth.loading = { show: false, text: '' }

            if (res.code != 0) return

            this.vista.pago_comprobantes = res.data
        },
    },
}
</script>

<style lang="scss" scoped></style>

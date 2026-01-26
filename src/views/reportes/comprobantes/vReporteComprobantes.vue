<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Comprobantes</strong>

            <div class="buttons">
                <JdCheckBox label="Incluir detalle" v-model="vista.incluir_detalle" />
                <JdCheckBox label="Todos los sucursales" v-model="vista.sucursal_todos" />
            </div>
        </div>

        <div class="card">
            <JdTable
                :name="tableName"
                :columns="columns"
                :datos="vista.comprobantes || []"
                :configFiltros="openConfigFiltros"
                :reload="loadComprobantes"
                :colAct="true"
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
    </div>

    <mComprobante v-if="useModals.show.mComprobante" />
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
import {
    JdTable,
    JdCheckBox,
    mConfigCols,
    mConfigFiltros,
    mAnular,
    mPdfViewer,
} from '@jhuler/components'

import mComprobante from '@/views/reportes/comprobantes/mComprobante.vue'
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
        JdCheckBox,
        mAnular,
        mConfigCols,
        mConfigFiltros,
        mPdfViewer,

        mComprobante,
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
                prop: 'doc_tipo1.tipo1.nombre',
                type: 'select',
                mostrar: 'tipo_serie',
                width: '10rem',
                show: true,
                sort: true,
                seek: true,
            },
            {
                id: 'serie',
                title: 'Serie',
                type: 'text',
                filtrable: false,
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
                id: 'igv',
                title: 'Igv',
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
                id: 'comprobante_pagos_monto',
                title: 'Cobrado',
                type: 'number',
                format: 'currency',
                moneda: 'S/',
                width: '8rem',
                show: true,
                seek: false,
                sort: true,
            },
            {
                id: 'transaccion',
                title: 'Pedido',
                prop: 'transaccion1.venta_codigo',
                width: '12rem',
                filtrable: false,
                show: true,
                seek: false,
                sort: true,
            },
            {
                id: 'caja_apertura',
                title: 'Apertura de caja',
                prop: 'caja_apertura1.createdAt',
                format: 'datetime',
                width: '12rem',
                filtrable: false,
                show: true,
                seek: false,
            },
            {
                id: 'createdBy',
                title: 'Creado por',
                prop: 'createdBy1.nombres_apellidos',
                width: '12rem',
                filtrable: false,
                show: true,
                seek: false,
            },
            {
                id: 'createdAt',
                title: 'Fecha de creación',
                width: '12rem',
                format: 'datetime',
                filtrable: false,
                show: true,
                seek: false,
                sort: true,
            },
        ],
        tableRowOptions: [
            {
                label: 'Ver',
                icon: 'fa-regular fa-folder-open',
                action: 'ver',
                permiso: 'vReporteComprobantes:anular',
            },
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
                ocultar: { estado: ['0', '4'], comprobante_pagos_monto: 0 },
            },
            {
                label: 'Modificar pagos',
                icon: 'fa-solid fa-dollar-sign',
                action: 'editarPagos',
                permiso: 'vReporteComprobantes:editarPagos',
                ocultar: { estado: ['0', '4'], comprobante_pagos_monto: 0 },
            },
            {
                label: 'Agregar pagos',
                icon: 'fa-solid fa-dollar-sign',
                action: 'agregarPagos',
                permiso: 'vReporteComprobantes:agregarPagos',
                ocultar: { estado: ['0', '4'], comprobante_pagos_monto: { op: '>', val: 0 } },
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
            // {
            //     label: 'Descargar XML',
            //     icon: 'fa-solid fa-file-arrow-down',
            //     action: 'descargarXml',
            //     permiso: 'vReporteComprobantes:descargarXml',
            //     ocultar: { estado: 0, doc_tipo: 'NV' },
            // },
            // {
            //     label: 'Descargar CDR',
            //     icon: 'fa-solid fa-file-arrow-down',
            //     action: 'descargarCdr',
            //     permiso: 'vReporteComprobantes:descargarCdr',
            //     ocultar: { estado: 0, doc_tipo: 'NV' },
            // },
            // {
            //     label: 'Consultar estado',
            //     icon: 'fa-solid fa-question',
            //     action: 'consultarEstado',
            //     permiso: 'vReporteComprobantes:consultarEstado',
            //     ocultar: { doc_tipo: 'NV' },
            // },
        ],
    }),
    async created() {
        this.vista = this.useVistas.vReporteComprobantes
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        // if (this.useAuth.verifyPermiso('vReporteComprobantes:listar') == true)
        //     this.loadComprobantes()
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
                sqls: ['comprobante_pagos_monto'],
                incl: ['doc_tipo1', 'socio1', 'transaccion1', 'caja_apertura1', 'createdBy1'],
                iccl: {
                    caja_apertura1: {
                        cols: ['createdAt'],
                    },
                    transaccion1: {
                        cols: ['venta_codigo'],
                    },
                },
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
            this.vista.qry.cols.push('caja_apertura', 'empresa_datos', 'cliente_datos')
            if (this.vista.incluir_detalle) {
                this.vista.qry.incl.push('comprobante_items')
            }
            if (!this.vista.sucursal_todos) {
                this.vista.qry.fltr.sucursal = { op: 'Es', val: this.useAuth.sucursal.id }
            }
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
        async loadDatosSistema() {
            const qry = ['pago_condiciones', 'comprobante_estados']

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
            return res.data
        },
        async loadComprobanteTipos() {
            const qry = {
                fltr: {
                    activo: { op: 'Es', val: true },
                    'sucursal_comprobante_tipos.sucursal': {
                        op: 'Es',
                        val: this.useAuth.sucursal.id,
                    },
                    'sucursal_comprobante_tipos.estado': { op: 'Es', val: true },
                },
                cols: ['tipo', 'serie', 'tipo_serie', 'estandar'],
                incl: ['sucursal_comprobante_tipos'],
                ordr: [['nombre', 'asc']],
            }

            this.vista.comprobante_tipos = []
            this.useAuth.loading = { show: true, text: 'Cargando...' }
            this.vista.comprobanteTiposLoaded = false
            const res = await get(`${urls.comprobante_tipos}?qry=${JSON.stringify(qry)}`)
            this.vista.comprobanteTiposLoaded = true
            this.useAuth.loading = { show: false, text: '' }

            if (res.code != 0) return

            this.vista.comprobante_tipos = res.data
            return this.vista.comprobante_tipos
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()

            for (const a of this.columns) {
                if (a.id == 'doc_tipo') a.reload = this.loadComprobanteTipos
                if (a.id == 'socio') a.reload = this.loadSocios
                if (a.id == 'estado') a.lista = this.vista.comprobante_estados
                if (a.id == 'pago_condicion') a.lista = this.vista.pago_condiciones
            }
            const cols = this.columns

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
        async ver(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.comprobantes}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const send = {
                comprobante: { ...res.data },
                comprobante_estados: [{ ...res.data.estado1 }],
            }

            this.useModals.setModal('mComprobante', 'Comprobante', null, send, true)
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
                'Enviar comprobante por email',
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
                sucursal: this.useAuth.sucursal.id,
            }

            this.useAuth.socket.emit('vEmitirComprobante:imprimir', send)
        },
        async descargarPdf(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.comprobantes}/pdf/${item.id}`, true)
            this.useAuth.setLoading(false)

            const pdfUrl = URL.createObjectURL(res)
            this.useModals.setModal('mPdfViewer', 'Comprobante', null, pdfUrl)
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
            this.vista.comprobantes[i].comprobante_pagos_monto = item.monto
        },
        comprobanteCanjedo(item) {
            const i = this.vista.comprobantes.findIndex((a) => a.id == item.id)
            this.vista.comprobantes[i].estado = 4
            this.vista.comprobantes[i].estado1 = { id: 4, nombre: 'CANJEADO' }
        },
    },
}
</script>

<style lang="scss" scoped></style>

<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Comprobantes de la caja aperturada</strong>
        </div>

        <div class="card">
            <JdTable
                :name="tableName"
                :columns="columns"
                :datos="vista.comprobantes || []"
                :reload="loadComprobantes"
                :colAct="true"
                :rowOptions="tableRowOptions"
                @rowOptionSelected="runMethod"
            />
        </div>
    </div>

    <mComprobante v-if="useModals.show.mComprobante" />
    <mComprobantePagos
        v-if="useModals.show.mComprobantePagos"
        @pagosModificados="actualizarPagos"
    />
    <mComprobanteCanjear
        v-if="useModals.show.mComprobanteCanjear"
        @canjeado="comprobanteCanjeado"
    />
    <mComprobanteCorreo v-if="useModals.show.mComprobanteCorreo" />
    <mComprobanteWhatsapp v-if="useModals.show.mComprobanteWhatsapp" />

    <mAnular v-if="useModals.show.mAnular" />
    <mPdfViewer v-if="useModals.show.mPdfViewer" />
</template>

<script>
import { JdTable, mAnular, mPdfViewer } from '@jhuler/components'

import mComprobante from '@/views/reportes/comprobantes/mComprobante.vue'
import mComprobantePagos from '@/views/reportes/comprobantes/mComprobantePagos.vue'
import mComprobanteCanjear from '@/views/reportes/comprobantes/mComprobanteCanjear.vue'
import mComprobanteCorreo from '@/views/reportes/comprobantes/mComprobanteCorreo.vue'
import mComprobanteWhatsapp from '@/views/reportes/comprobantes/mComprobanteWhatsapp.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'
import { urls, get } from '@/utils/crud'
import { jmsg } from '@/utils/swal'
import dayjs from 'dayjs'

export default {
    components: {
        JdTable,
        mAnular,
        mPdfViewer,
        mComprobante,
        mComprobantePagos,
        mComprobanteCanjear,
        mComprobanteCorreo,
        mComprobanteWhatsapp,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},
        tableName: 'vCajaComprobantes',
        columns: [
            {
                id: 'fecha_emision',
                title: 'Fecha',
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
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'serie',
                title: 'Serie',
                width: '5rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'numero',
                title: 'Correlativo',
                width: '7rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'socio',
                title: 'Cliente',
                prop: 'socio1.nombres',
                width: '15rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'monto',
                title: 'Importe',
                format: 'currency',
                moneda: 'S/',
                width: '8rem',
                show: true,
                seek: false,
                sort: true,
            },
            {
                id: 'igv',
                title: 'IGV',
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
                prop: 'pago_condicion1.nombre',
                width: '10rem',
                show: true,
                seek: false,
                sort: true,
            },
            {
                id: 'comprobante_pagos_monto',
                title: 'Cobrado',
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
                show: true,
                seek: false,
                sort: true,
            },
            {
                id: 'createdBy',
                title: 'Creado por',
                prop: 'createdBy1.nombres_apellidos',
                width: '12rem',
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
                permiso: 'vCajaComprobantes:ver',
            },
            {
                label: 'Anular',
                icon: 'fa-solid fa-ban',
                action: 'anular',
                permiso: 'vCajaComprobantes:anular',
                ocultar: { estado: ['0', '4'] },
            },
            {
                label: 'Canjear',
                icon: 'fa-solid fa-left-right',
                action: 'canjear',
                permiso: 'vCajaComprobantes:canjear',
                ocultar: { estado: ['0', '4'], doc_tipo: '01' },
            },
            {
                label: 'Ver pagos',
                icon: 'fa-solid fa-up-right-from-square',
                action: 'verPagos',
                permiso: 'vCajaComprobantes:verPagos',
                ocultar: { estado: ['0', '4'], comprobante_pagos_monto: 0 },
            },
            {
                label: 'Editar pagos',
                icon: 'fa-solid fa-dollar-sign',
                action: 'editarPagos',
                permiso: 'vCajaComprobantes:editarPagos',
                ocultar: { estado: ['0', '4'], comprobante_pagos_monto: 0 },
            },
            {
                label: 'Agregar pagos',
                icon: 'fa-solid fa-dollar-sign',
                action: 'agregarPagos',
                permiso: 'vCajaComprobantes:agregarPagos',
                ocultar: { estado: ['0', '4'], comprobante_pagos_monto: { op: '>', val: 0 } },
            },
            {
                label: 'Enviar por email',
                icon: 'fa-regular fa-envelope',
                action: 'enviarCorreo',
                permiso: 'vCajaComprobantes:enviarCorreo',
            },
            {
                label: 'Enviar por whatsapp',
                icon: 'fa-brands fa-whatsapp',
                action: 'enviarWhatsapp',
                permiso: 'vCajaComprobantes:enviarWhatsapp',
            },
            {
                label: 'Imprimir',
                icon: 'fa-solid fa-print',
                action: 'imprimir',
                permiso: 'vCajaComprobantes:imprimir',
            },
            {
                label: 'Descargar PDF',
                icon: 'fa-regular fa-file-pdf',
                action: 'descargarPdf',
                permiso: 'vCajaComprobantes:descargarPdf',
            },
        ],
    }),
    async created() {
        this.vista = this.useVistas.vCajaComprobantes
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.useAuth.verifyPermiso('vCajaComprobantes:listar')) {
            this.loadComprobantes()
        }
    },
    methods: {
        async loadCajaApertura() {
            const qry = {
                fltr: {
                    estado: { op: 'Es', val: '1' },
                    sucursal: { op: 'Es', val: this.useAuth.sucursal.id },
                },
                cols: ['fecha_apertura', 'monto_apertura'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.caja_aperturas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return
            this.vista.caja_apertura = res.data[0] || null
        },
        setQuery() {
            this.vista.qry = {
                fltr: {
                    caja_apertura: { op: 'Es', val: this.vista.caja_apertura.id },
                },
                sqls: ['comprobante_pagos_monto'],
                incl: ['doc_tipo1', 'socio1', 'transaccion1', 'createdBy1'],
                iccl: {
                    transaccion1: {
                        cols: ['venta_codigo'],
                    },
                },
                ordr: [['createdAt', 'DESC']],
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
            this.vista.qry.fltr.caja_apertura = {
                op: 'Es',
                val: this.vista.caja_apertura.id,
            }
            this.vista.qry.cols.push('caja_apertura', 'empresa_datos', 'cliente_datos')
        },
        async loadComprobantes() {
            await this.loadCajaApertura()
            if (!this.vista.caja_apertura) {
                this.vista.comprobantes = []
                this.vista.loaded = true
                return
            }

            this.setQuery()
            this.vista.comprobantes = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.comprobantes}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return
            this.vista.comprobantes = res.data
        },
        async runMethod(method, item) {
            await this.loadCajaApertura()
            if (
                !this.vista.caja_apertura ||
                item.caja_apertura != this.vista.caja_apertura.id
            ) {
                this.vista.comprobantes = []
                jmsg('warning', 'El comprobante no pertenece a la caja aperturada')
                return
            }

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
                vista: 'vCajaComprobantes',
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
        verPagos(item) {
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
            this.useModals.setModal(
                'mComprobantePagos',
                `Editar pagos de ${item.serie} - ${item.numero}`,
                2,
                { comprobante: item },
                true,
            )
        },
        agregarPagos(item) {
            this.useModals.setModal(
                'mComprobantePagos',
                `Agregar pagos de ${item.serie} - ${item.numero}`,
                1,
                { comprobante: item },
                true,
            )
        },
        enviarCorreo(item) {
            this.useModals.setModal(
                'mComprobanteCorreo',
                'Enviar comprobante por email',
                null,
                item,
            )
        },
        enviarWhatsapp(item) {
            this.useModals.setModal(
                'mComprobanteWhatsapp',
                'Enviar comprobante por whatsapp',
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
                sucursal: this.useAuth.sucursal.id,
            }

            this.useAuth.socket.emit('vEmitirComprobante:imprimir', send)
        },
        async descargarPdf(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.comprobantes}/pdf/${item.id}`, true)
            this.useAuth.setLoading(false)
            if (!(res instanceof Blob)) return

            const pdfUrl = URL.createObjectURL(res)
            this.useModals.setModal('mPdfViewer', 'Comprobante', null, pdfUrl)
        },
        actualizarPagos(item) {
            const i = this.vista.comprobantes.findIndex((a) => a.id == item.id)
            if (i == -1) return

            this.vista.comprobantes[i].comprobante_pagos_monto = item.monto
        },
        comprobanteCanjeado(item) {
            const i = this.vista.comprobantes.findIndex((a) => a.id == item.id)
            if (i == -1) return

            this.vista.comprobantes[i].estado = 4
            this.vista.comprobantes[i].estado1 = { id: 4, nombre: 'CANJEADO' }
        },
    },
}
</script>

<style lang="scss" scoped></style>

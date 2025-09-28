<template>
    <JdModal
        modal="mComprobanteCanjear"
        :buttons="buttons"
        @button-click="(action) => this[action]()"
    >
        <div class="container-datos">
            <p>Importe: S/ {{ modal.comprobante.monto }}</p>

            <JdInput
                label="Fecha"
                :nec="true"
                type="date"
                v-model="modal.comprobante.fecha_emision"
                style="grid-column: 1/2"
            />

            <JdSelect
                label="Tipo"
                :nec="true"
                v-model="modal.comprobante.doc_tipo1"
                :lista="pago_comprobantes_filtered"
                style="grid-column: 1/3"
            />

            <JdSelectQuery
                label="Cliente"
                :nec="true"
                v-model="modal.comprobante.socio"
                :spin="modal.spinSocios"
                :lista="modal.socios || []"
                mostrar="doc_nombres"
                @search="loadSocios"
                @elegir="setSocio"
                style="grid-column: 1/3"
            />
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdSelect, JdSelectQuery } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        JdSelect,
        JdSelectQuery,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        usuario: null,
        contrasena: null,

        buttons: [{ text: 'Canjear', action: 'canjear', show: true }],
    }),
    computed: {
        pago_comprobantes_filtered() {
            if (this.modal.pago_comprobantes == null) return []

            if (
                this.modal.comprobante.doc_tipo == `${this.useAuth.usuario.empresa.subdominio}-03`
            ) {
                return this.modal.pago_comprobantes.filter(
                    (a) =>
                        a.id != `${this.useAuth.usuario.empresa.subdominio}-NV` &&
                        a.id != `${this.useAuth.usuario.empresa.subdominio}-03`,
                )
            } else {
                return this.modal.pago_comprobantes.filter(
                    (a) => a.id != `${this.useAuth.usuario.empresa.subdominio}-NV`,
                )
            }
        },
    },
    created() {
        this.modal = this.useModals.mComprobanteCanjear
        this.loadPagoComprobantes()

        if (this.modal.comprobante.doc_tipo == `${this.useAuth.usuario.empresa.subdominio}-03`) {
            this.modal.comprobante.doc_tipo1 = `${this.useAuth.usuario.empresa.subdominio}-01`
        }
    },
    methods: {
        async loadSocios(txtBuscar) {
            if (!txtBuscar) {
                this.modal.socios.length = 0
                return
            }

            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: 2 },
                    activo: { op: 'Es', val: true },
                    nombres: { op: 'Contiene', val: txtBuscar },
                },
                cols: [
                    'nombres',
                    'doc_tipo',
                    'doc_numero',
                    'doc_nombres',
                    'telefono',
                    'direccion',
                    'referencia',
                ],
            }

            this.modal.spinSocios = true
            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
            this.modal.spinSocios = false

            if (res.code !== 0) return

            this.modal.socios = res.data
        },
        async loadPagoComprobantes() {
            const qry = {
                fltr: { activo: { op: 'Es', val: true } },
                cols: ['nombre', 'estandar'],
            }

            this.modal.pago_comprobantes = []
            this.useAuth.loading = { show: true, text: 'Cargando...' }
            const res = await get(`${urls.pago_comprobantes}?qry=${JSON.stringify(qry)}`)
            this.useAuth.loading = { show: false, text: '' }

            if (res.code != 0) return

            this.modal.pago_comprobantes = res.data
        },

        setSocio(item) {
            this.modal.socio = item
        },

        checkDatos() {
            const props = ['fecha_emision', 'doc_tipo1', 'socio']
            if (incompleteData(this.modal.comprobante, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            if (
                this.modal.comprobante.doc_tipo1 == `${this.useAuth.usuario.empresa.subdominio}-01`
            ) {
                if (['0', '1', '4', '7'].includes(this.modal.socio.doc_tipo)) {
                    jmsg('error', 'El cliente debe tener RUC')
                    return true
                }
            }

            if (
                this.modal.comprobante.doc_tipo1 == `${this.useAuth.usuario.empresa.subdominio}-03`
            ) {
                if (['6', '4', '7'].includes(this.modal.socio.doc_tipo)) {
                    jmsg('error', 'El cliente debe tener DNI')
                    return true
                }
            }

            return false
        },
        async canjear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Canjeando...')
            const res = await patch(`${urls.comprobantes}/canjear`, this.modal.comprobante)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            // this.useVistas.addItem(
            //     'vReporteComprobantes',
            //     'comprobantes',
            //     this.modal.comprobante,
            //     'first',
            // )
            this.$emit('canjeado', this.modal.comprobante)
            this.useModals.show.mComprobanteCanjear = false
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 10rem 10rem;
    gap: 0.5rem;
}
</style>

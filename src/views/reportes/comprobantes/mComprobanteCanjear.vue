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
                v-model="modal.comprobante.fecha"
                style="grid-column: 1/2"
            />

            <JdSelect
                label="Tipo"
                :nec="true"
                v-model="modal.comprobante.doc_tipo"
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
import JdModal from '@/components/JdModal.vue'
import JdInput from '@/components/inputs/JdInput.vue'
import JdSelect from '@/components/inputs/JdSelect.vue'
import JdSelectQuery from '@/components/inputs/JdSelectQuery.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, patch } from '@/utils/crud'
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

            if (this.modal.comprobante.venta_tipo_documento_codigo == '03') {
                return this.modal.pago_comprobantes.filter((a) => a.id != 'NV' && a.id != '03')
            } else {
                return this.modal.pago_comprobantes.filter((a) => a.id != 'NV')
            }
        },
    },
    created() {
        this.modal = this.useModals.mComprobanteCanjear
        this.loadDatosSistema()
    },
    methods: {
        async loadDatosSistema() {
            const qry = ['pago_comprobantes']

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
        },
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
        setSocio(item) {
            this.modal.socio = item
        },

        checkDatos() {
            if (this.modal.comprobante.doc_tipo == '01') {
                if (['1', '4', '7'].includes(this.modal.socio.doc_tipo)) {
                    jmsg('error', 'El cliente debe tener RUC')
                    return true
                }
            }

            if (this.modal.comprobante.doc_tipo == '03') {
                if (this.modal.socio.doc_numero == '00000000') {
                    jmsg('error', 'El cliente debe tener un DNI válido')
                    return true
                }

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

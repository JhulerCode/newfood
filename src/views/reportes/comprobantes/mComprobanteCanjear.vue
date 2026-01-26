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
                v-model="modal.comprobante.doc_tipo_nuevo"
                :lista="pago_comprobantes_filtered"
                mostrar="tipo_serie"
                :loaded="modal.comprobanteTiposLoaded"
                @reload="loadComprobanteTipos"
                style="grid-column: 1/3"
            />

            <div style="grid-column: 1/4" class="dato-cliente">
                <JdSelectQuery
                    label="Cliente"
                    :nec="true"
                    v-model="modal.comprobante.socio"
                    :spin="modal.spinSocios"
                    :lista="modal.socios || []"
                    mostrar="doc_nombres"
                    @search="loadSocios"
                    @elegir="setSocio"
                />

                <JdButton
                    icon="fa-solid fa-user-plus"
                    title="Nuevo socio"
                    tipo="2"
                    :small="true"
                    @click="nuevoSocio()"
                />
            </div>
        </div>
    </JdModal>

    <mSocio @created="setSocioCreated" v-if="useModals.show.mSocio" />
</template>

<script>
import { JdModal, JdInput, JdSelect, JdSelectQuery, JdButton } from '@jhuler/components'

import mSocio from '@/views/compras/proveedores/mSocio.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    emits: ['canjeado'],
    components: {
        JdModal,
        JdInput,
        JdSelect,
        JdSelectQuery,
        JdButton,
        mSocio,
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
            if (this.modal.comprobante_tipos == null) return []

            if (this.modal.comprobante.doc_tipo1?.tipo == `03`) {
                return this.modal.comprobante_tipos.filter((a) => a.tipo != `NV` && a.tipo != `03`)
            } else {
                return this.modal.comprobante_tipos.filter((a) => a.tipo != `NV`)
            }
        },
    },
    created() {
        this.modal = this.useModals.mComprobanteCanjear
        this.loadComprobanteTipos()
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
                    or: {
                        nombres: { op: 'Contiene', val: txtBuscar },
                        doc_numero: { op: 'Contiene', val: txtBuscar },
                    },
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
                ordr: [['nombres', 'ASC']],
            }

            this.modal.spinSocios = true
            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
            this.modal.spinSocios = false

            if (res.code !== 0) return

            this.modal.socios = res.data
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

            this.modal.comprobante_tipos = []
            this.useAuth.loading = { show: true, text: 'Cargando...' }
            this.modal.comprobanteTiposLoaded = false
            const res = await get(`${urls.comprobante_tipos}?qry=${JSON.stringify(qry)}`)
            this.modal.comprobanteTiposLoaded = true
            this.useAuth.loading = { show: false, text: '' }

            if (res.code != 0) return

            this.modal.comprobante_tipos = res.data
        },

        setSocio(item) {
            this.modal.socio = item
        },
        nuevoSocio() {
            const send = { tipo: 2, activo: true }

            this.useModals.setModal('mSocio', 'Nuevo cliente', 1, send)
        },
        setSocioCreated(item) {
            this.modal.socios = [item]
            this.modal.comprobante.socio = item.id

            this.setSocio(item)
        },

        checkDatos() {
            const props = ['fecha_emision', 'doc_tipo_nuevo', 'socio']
            if (incompleteData(this.modal.comprobante, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            const elegido = this.modal.comprobante_tipos.find(
                (a) => a.id == this.modal.comprobante.doc_tipo_nuevo,
            )

            if (elegido.tipo == '01') {
                if (['0', '1', '4', '7'].includes(this.modal.socio.doc_tipo)) {
                    jmsg('error', 'El cliente debe tener RUC')
                    return true
                }

                if (this.modal.socio.doc_numero == this.useAuth.empresa.ruc) {
                    jmsg('error', 'El cliente no puede ser el mismo que la empresa')
                    return true
                }
            }

            if (elegido.tipo == '03') {
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
    grid-template-columns: 10rem 10rem 10rem;
    gap: 0.5rem;

    .dato-cliente {
        display: flex;
        gap: 0.5rem;
    }
}
</style>

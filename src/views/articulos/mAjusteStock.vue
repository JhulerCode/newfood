<template>
    <JdModal modal="mAjusteStock" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-agregar">
            <JdInput
                type="date"
                label="Fecha"
                :nec="true"
                v-model="modal.transaccion.fecha"
                :disabled="true"
                style="grid-column: 1/3"
            />

            <JdSelect
                label="Tipo"
                :nec="true"
                v-model="modal.transaccion.tipo"
                :lista="modal.kardex_tipos?.filter(a => ['3', '4'].includes(a.id)) || []"
                style="grid-column: 1/3"
                @elegir="modal.is_nuevo_lote = false"
            />

            <JdSelectQuery
                label="Artículo"
                :nec="true"
                v-model="modal.transaccion.articulo"
                :spin="modal.spinArticulos"
                :lista="modal.articulos"
                @search="searchArticulos"
                @elegir="setArticulo"
                style="grid-column: 1/4"
            />

            <JdInput
                type="number"
                label="Cantidad"
                :nec="true"
                v-model="modal.transaccion.cantidad"
                style="grid-column: 1/3"
            />

            <JdTextArea
                label="Observación"
                :nec="true"
                v-model="modal.transaccion.observacion"
                style="grid-column: 1/5"
            />
        </div>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdInput from '@/components/inputs/JdInput.vue'
import JdSelect from '@/components/inputs/JdSelect.vue'
import JdSelectQuery from '@/components/inputs/JdSelectQuery.vue'
// import JdCheckBox from '@/components/inputs/JdCheckBox.vue'
import JdTextArea from '@/components/inputs/JdTextArea.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post } from '@/utils/crud'
import { redondear, incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

import dayjs from 'dayjs'

export default {
    components: {
        JdModal,
        JdInput,
        JdSelect,
        JdSelectQuery,
        // JdCheckBox,
        JdTextArea,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        redondear,

        modal: {},
        nuevo: { is_receta: true },

        buttons: [{ text: 'Grabar', action: 'grabar', show: true }],
    }),
    created() {
        this.modal = this.useModals.mAjusteStock

        this.loadDatosSistema()
        // this.loadLotes()
    },
    methods: {
        initTransaccion() {
            this.modal.transaccion = {
                fecha: dayjs().format('YYYY-MM-DD'),
            }

            this.modal.lotes = []
            this.modal.lotesLoaded = false
        },
        async searchArticulos(txtBuscar) {
            if (!txtBuscar) {
                this.modal.articulos.length = 0
                return
            }

            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: this.modal.articulo_tipo.toString() },
                    activo: { op: 'Es', val: true },
                    nombre: { op: 'Contiene', val: txtBuscar },
                },
                cols: ['nombre', 'unidad', 'igv_afectacion'],
            }

            this.modal.spinArticulos = true
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            this.modal.spinArticulos = false

            if (res.code !== 0) return

            this.modal.articulos = JSON.parse(JSON.stringify(res.data))
        },
        setArticulo(item) {
            this.modal.articulo1 = item
        },

        checkDatos() {
            const props = ['fecha', 'tipo', 'articulo', 'cantidad', 'observacion']

            if (incompleteData(this.modal.transaccion, props)) {
                jmsg('warning', 'Completa los campos requeridos')
                return true
            }

            return false
        },
        async grabar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(urls.kardex, this.modal.transaccion)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.initTransaccion()
        },

        async loadDatosSistema() {
            const qry = ['kardex_tipos']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
        },
    },
}
</script>

<style lang="scss" scoped>
.container-agregar {
    display: grid;
    grid-template-columns: repeat(4, 8rem);
    gap: 0.5rem;
}
</style>

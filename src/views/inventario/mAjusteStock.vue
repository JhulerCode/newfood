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
                :lista="modal.kardex_operaciones?.filter((a) => ['3', '4'].includes(a.id)) || []"
                style="grid-column: 1/3"
                @elegir="modal.is_nuevo_lote = false"
            />

            <JdSelectQuery
                label="Artículo"
                :nec="true"
                v-model="modal.transaccion.articulo_variant"
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
import { JdModal, JdInput, JdSelect, JdSelectQuery, JdTextArea } from '@jhuler/components'

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
    async created() {
        this.modal = this.useModals.mAjusteStock

        this.loadDatosSistema()
        if (
            this.modal.transaccion.articulo &&
            !this.modal.transaccion.articulo_variant
        ) {
            await this.loadArticleVariants(this.modal.transaccion.articulo)
        }
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
                tipo: this.modal.articulo_tipo.toString(),
                search: txtBuscar,
                include_inactive: true,
                include_disabled_branch: true,
                limit: 50,
            }

            this.modal.spinArticulos = true
            const res = await get(`${urls.articulos}/variants?qry=${JSON.stringify(qry)}`)
            this.modal.spinArticulos = false

            if (res.code !== 0) return

            this.modal.articulos = JSON.parse(JSON.stringify(res.data))
        },
        setArticulo(item) {
            this.modal.articulo1 = item
            this.modal.transaccion.articulo = item.articulo
            this.modal.transaccion.articulo_variant = item.articulo_variant
        },
        async loadArticleVariants(articulo) {
            const qry = {
                articulo,
                tipo: this.modal.articulo_tipo.toString(),
                include_inactive: true,
                include_disabled_branch: true,
                limit: 200,
            }
            const res = await get(`${urls.articulos}/variants?qry=${JSON.stringify(qry)}`)
            if (res.code != 0) return

            this.modal.articulos = res.data
            if (res.data.length == 1) {
                this.setArticulo(res.data[0])
            } else {
                this.modal.transaccion.articulo_variant = null
            }
        },

        checkDatos() {
            const props = [
                'fecha',
                'tipo',
                'articulo',
                'articulo_variant',
                'cantidad',
                'observacion',
            ]

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
            this.useModals.show.mAjusteStock = false
            this.$emit('saved')
        },

        async loadDatosSistema() {
            const qry = ['kardex_operaciones']
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

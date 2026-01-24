<template>
    <JdModal modal="mComprobanteTipo" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdSelect
                label="Tipo"
                :nec="true"
                v-model="modal.item.tipo"
                :lista="modal.comprobante_tipos"
                :disabled="modal.mode == 3"
            />

            <JdInput
                label="Serie"
                :nec="true"
                v-model="modal.item.serie"
                :disabled="modal.mode == 3"
            />

            <JdInput
                label="Empieza en"
                type="number"
                :nec="true"
                v-model="modal.item.numero"
                :disabled="modal.mode == 3"
            />

            <JdSwitch label="Activo" v-model="modal.item.activo" :disabled="modal.mode == 3" />

            <JdSwitch
                label="Por defecto?"
                v-model="modal.item.estandar"
                :disabled="modal.mode == 3"
            />
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdSelect, JdInput, JdSwitch } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdSelect,
        JdInput,
        JdSwitch,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        colaborador: {},

        buttons: [{ text: 'Grabar', action: 'crear', show: true }],
    }),
    created() {
        this.modal = this.useModals.mComprobanteTipo

        this.loadDatosSistema()
    },
    methods: {
        async loadDatosSistema() {
            const qry = ['comprobante_tipos']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
        },

        checkDatos() {
            const props = ['tipo', 'serie', 'numero', 'activo', 'estandar']

            if (incompleteData(this.modal.item, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Modificando...')
            const res = await post(urls.comprobante_tipos, this.modal.item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.addItem('vComprobanteTipos', 'comprobante_tipos', res.data)

            this.useModals.show.mComprobanteTipo = false
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 20rem;
    gap: 0.5rem;
}
</style>

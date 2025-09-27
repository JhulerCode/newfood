<template>
    <JdModal modal="mProduccionArea" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdInput
                label="Nombre"
                :nec="true"
                v-model="modal.item.nombre"
                :disabled="modal.mode == 3 || modal.item.nombre == 'CAJA'"
            />

            <JdSelect
                label="Tipo de impresora"
                :nec="true"
                :lista="modal.impresora_tipos"
                v-model="modal.item.impresora_tipo"
                :disabled="modal.mode == 3"
            />

            <JdInput
                :label="impresora_tipo == 1 ? 'Impresora nombre' : 'Impresora ip'"
                :nec="true"
                v-model="modal.item.impresora"
                :disabled="modal.mode == 3"
            />

            <JdSwitch
                label="Activo"
                v-model="modal.item.activo"
                :disabled="modal.mode == 3 || modal.item.nombre == 'CAJA'"
            />
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdSwitch, JdSelect } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        JdSwitch,
        JdSelect,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        colaborador: {},

        buttons: [
            {
                text: 'Grabar',
                action: 'crear',
                permiso: 'vProduccionAreas:crear',
            },
            {
                text: 'Actualizar',
                action: 'modificar',
                permiso: 'vProduccionAreas:editar',
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mProduccionArea
        this.setButtons()
        this.loadDatosSistema()
    },
    methods: {
        setButtons() {
            if (this.modal.mode == 1) {
                this.buttons[0].show = true
                this.buttons[1].show = false
            } else if (this.modal.mode == 2) {
                this.buttons[0].show = false
                this.buttons[1].show = true
            }
        },
        checkDatos() {
            const props = ['nombre', 'impresora_tipo', 'impresora', 'activo']

            if (incompleteData(this.modal.item, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(urls.produccion_areas, this.modal.item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.addItem('vProduccionAreas', 'produccion_areas', res.data)
            this.useModals.show.mProduccionArea = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.produccion_areas, this.modal.item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vProduccionAreas', 'produccion_areas', res.data)
            this.useModals.show.mProduccionArea = false
        },

        async loadDatosSistema() {
            const qry = ['impresora_tipos']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
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

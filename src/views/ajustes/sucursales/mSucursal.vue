<template>
    <JdModal modal="mSucursal" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdInput
                label="Codigo"
                :nec="true"
                v-model="modal.item.codigo"
                :disabled="modal.mode == 3"
            />

            <JdInput
                label="Dirección"
                :nec="true"
                v-model="modal.item.direccion"
                :disabled="modal.mode == 3"
            />

            <JdInput
                label="Teléfono"
                v-model="modal.item.telefono"
                :disabled="modal.mode == 3"
            />

            <JdInput
                label="Correo"
                v-model="modal.item.correo"
                :disabled="modal.mode == 3"
            />

            <JdSwitch label="Activo" v-model="modal.item.activo" :disabled="modal.mode == 3" />
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdSwitch } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, post, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        JdSwitch,
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
                permiso: 'vSucursales:crear',
            },
            {
                text: 'Actualizar',
                action: 'modificar',
                permiso: 'vSucursales:editar',
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mSucursal
        this.setButtons()
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
            const props = ['codigo', 'direccion', 'activo']

            if (incompleteData(this.modal.item, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(urls.sucursales, this.modal.item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.addItem('vSucursales', 'sucursales', res.data)
            this.useModals.show.mSucursal = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.sucursales, this.modal.item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vSucursales', 'sucursales', res.data)
            this.useModals.show.mSucursal = false
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

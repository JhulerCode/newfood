<template>
    <JdModal modal="mTenantSucursal" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdInput label="Codigo" :nec="true" v-model="sucursal.codigo" />
            <JdInput label="Direccion" v-model="sucursal.direccion" />
            <JdInput label="Telefono" v-model="sucursal.telefono" />
            <JdInput label="Correo" v-model="sucursal.correo" />
            <JdSwitch label="Activo" v-model="sucursal.activo" />
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdSwitch } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'

import { urls, post, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        JdSwitch,
    },
    emits: ['updated'],
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),

        modal: {},
        empresa: {},
        sucursal: {},
        buttons: [
            { text: 'Grabar', action: 'crear', spin: false, permiso: 'vTenantSucursales:crear' },
            {
                text: 'Actualizar',
                action: 'modificar',
                spin: false,
                permiso: 'vTenantSucursales:editar',
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mTenantSucursal
        this.empresa = this.modal.empresa || {}
        this.sucursal = this.modal.item || {}
        this.showButtons()
    },
    methods: {
        showButtons() {
            if (this.modal.mode == 1) {
                this.buttons[0].show = true
            } else if (this.modal.mode == 2) {
                this.buttons[1].show = true
            }
        },
        getUrl() {
            return `${urls.empresas}/${this.empresa.id}/sucursales`
        },
        checkDatos() {
            if (incompleteData(this.sucursal, ['codigo'])) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(this.getUrl(), this.sucursal)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.$emit('updated')
            this.useModals.show.mTenantSucursal = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(this.getUrl(), this.sucursal)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.$emit('updated')
            this.useModals.show.mTenantSucursal = false
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 20rem 20rem;
    gap: 0.5rem;
}

@media (max-width: 640px) {
    .container-datos {
        grid-template-columns: 1fr;
    }
}
</style>

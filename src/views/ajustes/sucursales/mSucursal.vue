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

            <JdInput label="Teléfono" v-model="modal.item.telefono" :disabled="modal.mode == 3" />

            <JdInput label="Correo" v-model="modal.item.correo" :disabled="modal.mode == 3" />

            <JdInput
                v-if="is_admin_mode"
                label="Fecha límite"
                type="date"
                v-model="modal.item.fecha_fin"
                :disabled="modal.mode == 3"
            />

            <div class="informative">
                <div v-if="!is_admin_mode" class="field">
                    <small>Fecha límite</small>
                    <strong>
                        {{ dayjs(modal.item.fecha_fin).format('DD/MM/YYYY') || 'Sin limite' }}
                    </strong>
                </div>

                <div class="field">
                    <small>Estado</small>
                    <span class="chip" :class="{ inactive: modal.item.activo === false }">
                        {{ modal.item.activo === false ? 'Inactivo' : 'Activo' }}
                    </span>
                </div>
            </div>
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, post, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'
import dayjs from 'dayjs'

export default {
    components: {
        JdModal,
        JdInput,
    },
    emits: ['updated'],
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        colaborador: {},
        dayjs,

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
    computed: {
        is_admin_mode() {
            return !!this.modal.empresa?.id
        },
    },
    methods: {
        setButtons() {
            this.buttons[0].permiso = this.is_admin_mode
                ? 'vTenantSucursales:crear'
                : 'vSucursales:crear'
            this.buttons[1].permiso = this.is_admin_mode
                ? 'vTenantSucursales:editar'
                : 'vSucursales:editar'

            if (this.modal.mode == 1) {
                this.buttons[0].show = true
                this.buttons[1].show = false
            } else if (this.modal.mode == 2) {
                this.buttons[0].show = false
                this.buttons[1].show = true
            }
        },
        getUrl() {
            if (this.is_admin_mode) return `${urls.sucursales}/empresas/${this.modal.empresa.id}`

            return urls.sucursales
        },
        checkDatos() {
            const props = ['codigo', 'direccion']

            if (incompleteData(this.modal.item, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(this.getUrl(), this.modal.item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            if (this.is_admin_mode) this.$emit('updated')
            else this.useVistas.addItem('vSucursales', 'sucursales', res.data)

            this.useModals.show.mSucursal = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(this.getUrl(), this.modal.item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            if (this.is_admin_mode) this.$emit('updated')
            else this.useVistas.updateItem('vSucursales', 'sucursales', res.data)

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

.informative {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;

    .field {
        display: grid;
        gap: 0.25rem;

        .chip {
            width: fit-content;
            border-radius: 1rem;
            padding: 0.25rem 0.6rem;
            background: #dcfce7;
            color: var(--verde);
            font-size: 0.85rem;
            font-weight: 600;

            &.inactive {
                background: #fee2e2;
                color: var(--rojo);
            }
        }
    }
}
</style>

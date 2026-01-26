<template>
    <JdModal modal="mSalon" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdSelect
                label="Sucursal"
                :nec="true"
                :lista="modal.sucursales || []"
                mostrar="codigo"
                :loaded="modal.sucursalesLoaded"
                @reload="loadSucursales"
                v-model="modal.item.sucursal"
                :disabled="modal.mode == 3 || modal.mode == 2"
            />

            <JdInput
                label="Nombre"
                :nec="true"
                v-model="modal.item.nombre"
                :disabled="modal.mode == 3"
            />

            <JdSwitch label="Activo" v-model="modal.item.activo" :disabled="modal.mode == 3" />
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdSelect, JdSwitch } from '@jhuler/components'

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
        JdSelect,
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
                permiso: 'vSalones:crear',
            },
            {
                text: 'Actualizar',
                action: 'modificar',
                permiso: 'vSalones:editar',
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mSalon
        this.setButtons()
        this.loadSucursales()
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
            const props = ['sucursal', 'nombre', 'activo']

            if (incompleteData(this.modal.item, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(urls.salones, this.modal.item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.addItem('vSalones', 'salones', res.data)
            this.useModals.show.mSalon = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.salones, this.modal.item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vSalones', 'salones', res.data)
            this.useModals.show.mSalon = false
        },

        async loadSucursales() {
            const qry = {
                fltr: {
                    activo: { op: 'Es', val: true },
                },
                cols: ['codigo'],
                ordr: [['codigo', 'ASC']],
            }

            this.modal.sucursales = []
            this.modal.sucursalesLoaded = false
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.sucursales}?qry=${JSON.stringify(qry)}`)
            this.modal.sucursalesLoaded = true
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.sucursales = res.data
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 20rem;
    gap: 1rem 2rem;
}
</style>

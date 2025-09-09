<template>
    <JdModal modal="mSocio" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdSelect
                label="Tipo doc"
                :nec="true"
                v-model="socio.doc_tipo"
                :lista="modal.documentos_identidad || []"
                mostrar="nombre"
                :disabled="modal.mode == 3"
                style="grid-column: 1/3"
            />

            <JdInput
                label="Nro documento"
                :nec="true"
                v-model="socio.doc_numero"
                :disabled="modal.mode == 3"
                style="grid-column: 3/5"
            />

            <JdInput
                label="Razón social o nombre"
                :nec="true"
                v-model="socio.nombres"
                :disabled="modal.mode == 3"
                style="grid-column: 1/5"
            />

            <JdInput
                label="Teléfono"
                v-model="socio.telefono"
                :disabled="modal.mode == 3"
                style="grid-column: 1/3"
            />

            <JdInput
                label="E-mail"
                v-model="socio.correo"
                :disabled="modal.mode == 3"
                style="grid-column: 1/3"
            />

            <JdInput
                label="Dirección"
                v-model="socio.direccion"
                :disabled="modal.mode == 3"
                style="grid-column: 1/4"
            />

            <JdInput
                label="Referencia"
                v-model="socio.referencia"
                :disabled="modal.mode == 3"
                style="grid-column: 1/4"
            />

            <JdSwitch
                label="Activo?"
                v-model="socio.activo"
                :disabled="modal.mode == 3"
                style="grid-column: 1/3"
            />
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdSelect, JdSwitch } from 'jd-components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch } from '@/utils/crud'
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
        socio: {},
        pestana: 1,

        buttons: [
            { text: 'Grabar', action: 'crear', spin: false },
            { text: 'Actualizar', action: 'modificar', spin: false },
        ],
    }),
    created() {
        this.modal = this.useModals.mSocio
        this.socio = this.useModals.mSocio.item

        this.showButtons()
        this.loadDatosSistema()
    },
    methods: {
        showButtons() {
            if (this.modal.mode == 1) {
                this.buttons[0].show = true
            } else if (this.modal.mode == 2) {
                this.buttons[1].show = true
            }
        },
        checkDatos() {
            const props = ['tipo', 'doc_tipo', 'doc_numero', 'nombres']

            if (incompleteData(this.socio, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async crear() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(urls.socios, this.socio)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const vista = this.socio.tipo == 1 ? 'vProveedores' : 'vClientes'
            this.useVistas.addItem(vista, 'socios', res.data)
            this.useModals.show.mSocio = false

            this.$emit('created', res.data)
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.socios, this.socio)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const vista = this.socio.tipo == 1 ? 'vProveedores' : 'vClientes'
            this.useVistas.updateItem(vista, 'socios', res.data)
            this.useModals.show.mSocio = false
        },

        async loadDatosSistema() {
            const qry = ['documentos_identidad']
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
    grid-template-columns: repeat(4, 10rem);
    gap: 0.5rem;
}

.extra-datos {
    border: var(--border);
    margin-top: 2rem;

    .pestanas {
        display: flex;
        background-color: var(--bg-color2);

        li {
            padding: 0.3rem 0.5rem;
            cursor: pointer;
        }

        .pestana-activo {
            background-color: var(--bg-color);
        }
    }

    .pestana-body {
        padding: 1rem;
    }
}

@media (max-width: 540px) {
    .container-datos {
        grid-template-columns: minmax(100%, 33.5rem) !important;

        > * {
            grid-column: 1/2 !important;
        }
    }
}
</style>

<template>
    <JdModal modal="mTenant" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <section class="bloque">
                <strong>Empresa</strong>

                <JdInput label="RUC" :nec="true" v-model="empresa.ruc" :disabled="is_readonly" />
                <JdInput
                    label="Razon social"
                    :nec="true"
                    v-model="empresa.razon_social"
                    :disabled="is_readonly"
                />
                <JdInput
                    label="Nombre comercial"
                    :nec="true"
                    v-model="empresa.nombre_comercial"
                    :disabled="is_readonly"
                />
                <JdInput
                    label="Subdominio"
                    :nec="true"
                    v-model="empresa.subdominio"
                    :disabled="is_readonly"
                />
                <JdInput
                    label="Domicilio fiscal"
                    v-model="empresa.domicilio_fiscal"
                    :disabled="is_readonly"
                />
                <JdInput label="Ubigeo" v-model="empresa.ubigeo" :disabled="is_readonly" />
                <JdInput
                    label="IGV (%)"
                    type="number"
                    v-model="empresa.igv_porcentaje"
                    :disabled="is_readonly"
                />
                <JdInput label="Telefono" v-model="empresa.telefono" :disabled="is_readonly" />
                <JdInput label="Correo" v-model="empresa.correo" :disabled="is_readonly" />
                <div class="field">
                    <span>Estado</span>
                    <span class="chip" :class="{ inactive: empresa.activo === false }">
                        {{ empresa.activo === false ? 'Inactivo' : 'Activo' }}
                    </span>
                </div>
            </section>

            <section class="bloque">
                <strong>Features</strong>

                <JdSwitch
                    v-for="feature in features_opciones"
                    :key="feature.id"
                    :label="feature.label"
                    v-model="empresa.features[feature.id]"
                    :disabled="is_readonly || !can_edit_features"
                />
            </section>
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
import { empresa_features, normalizeFeatures } from '@/utils/menuFeatures'

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
        empresa: {},
        features_opciones: empresa_features,

        buttons: [
            { text: 'Grabar', action: 'crear', spin: false, permiso: 'vTenants:crear' },
            { text: 'Actualizar', action: 'modificar', spin: false, permiso: 'vTenants:editar' },
        ],
    }),
    computed: {
        is_readonly() {
            return this.modal.mode == 3
        },
        can_edit_features() {
            return this.useAuth.verifyPermiso('vTenantFeatures:editar', 'vTenants:editar')
        },
    },
    created() {
        this.modal = this.useModals.mTenant
        this.empresa = this.useModals.mTenant.item || {}
        this.shapeFeatures()

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
        shapeFeatures() {
            this.empresa.features = normalizeFeatures(this.empresa.features)
        },
        checkDatos() {
            const props = ['ruc', 'razon_social', 'nombre_comercial', 'subdominio']

            if (incompleteData(this.empresa, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        shapeDatos() {
            this.shapeFeatures()
        },
        async crear() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Grabando...')
            const res = await post(urls.empresas, this.empresa)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.addItem('vTenants', 'tenantes', res.data)
            this.useModals.show.mTenant = false
        },
        async modificar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.empresas, this.empresa)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vTenants', 'tenantes', res.data)
            this.useModals.show.mTenant = false
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 24rem 18rem;
    gap: 1rem;
}

.bloque {
    display: grid;
    gap: 0.5rem;
    height: fit-content;
}

.field {
    display: grid;
    gap: 0.25rem;
}

.field > span:first-child {
    font-size: 0.85rem;
    color: var(--text-color-2);
}

.chip {
    width: fit-content;
    border-radius: 999px;
    padding: 0.25rem 0.6rem;
    background: #dcfce7;
    color: #166534;
    font-size: 0.85rem;
    font-weight: 600;
}

.chip.inactive {
    background: #fee2e2;
    color: #991b1b;
}

@media (max-width: 900px) {
    .container-datos {
        grid-template-columns: 1fr;
        min-width: auto;
    }
}
</style>

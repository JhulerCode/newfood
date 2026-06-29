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
                <JdSwitch label="Activo" v-model="empresa.activo" :disabled="is_readonly" />
            </section>

            <section class="bloque">
                <strong>Features</strong>

                <JdSwitch
                    v-for="feature in features_opciones"
                    :key="feature.id"
                    :label="feature.label"
                    v-model="empresa.features[feature.id]"
                    :disabled="is_readonly || !useAuth.verifyPermiso('vTenantFeatures:editar')"
                />
            </section>

            <section class="bloque sucursales">
                <div class="bloque-head">
                    <strong>Sucursales</strong>
                    <JdButton
                        text="Agregar"
                        tipo="2"
                        :small="true"
                        @click="addSucursal"
                        v-if="!is_readonly && useAuth.verifyPermiso('vTenantSucursales:crear')"
                    />
                </div>

                <div
                    class="sucursal"
                    v-for="(sucursal, index) in empresa.sucursales || []"
                    :key="sucursal.id || index"
                >
                    <JdInput
                        label="Codigo"
                        :nec="true"
                        v-model="sucursal.codigo"
                        :disabled="is_readonly"
                    />
                    <JdInput
                        label="Direccion"
                        v-model="sucursal.direccion"
                        :disabled="is_readonly"
                    />
                    <JdInput
                        label="Telefono"
                        v-model="sucursal.telefono"
                        :disabled="is_readonly"
                    />
                    <JdInput label="Correo" v-model="sucursal.correo" :disabled="is_readonly" />
                    <JdSwitch label="Activo" v-model="sucursal.activo" :disabled="is_readonly" />
                    <JdButton
                        icon="fa-solid fa-trash-can"
                        title="Eliminar"
                        tipo="2"
                        :small="true"
                        @click="removeSucursal(index)"
                        v-if="!is_readonly && useAuth.verifyPermiso('vTenantSucursales:eliminar')"
                    />
                </div>
            </section>
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdSwitch, JdButton } from '@jhuler/components'

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
        JdButton,
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
    },
    created() {
        this.modal = this.useModals.mTenant
        this.empresa = this.useModals.mTenant.item
        this.shapeFeatures()
        if (!Array.isArray(this.empresa.sucursales)) this.empresa.sucursales = []

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

            if ((this.empresa.sucursales || []).some((sucursal) => !sucursal.codigo)) {
                jmsg('warning', 'Cada sucursal debe tener codigo')
                return true
            }

            return false
        },
        shapeDatos() {
            this.shapeFeatures()
            this.empresa.sucursales = (this.empresa.sucursales || []).map((sucursal) => ({
                ...sucursal,
                activo: sucursal.activo === true,
            }))
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
        addSucursal() {
            this.empresa.sucursales.push({
                codigo: '',
                direccion: '',
                telefono: '',
                correo: '',
                activo: true,
            })
        },
        removeSucursal(index) {
            this.empresa.sucursales.splice(index, 1)
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 24rem 18rem 1fr;
    gap: 1rem;
    min-width: min(90vw, 80rem);
}

.bloque {
    display: grid;
    gap: 0.5rem;
    height: fit-content;
}

.bloque-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
}

.sucursales {
    max-height: 70vh;
    overflow-y: auto;
}

.sucursal {
    display: grid;
    grid-template-columns: repeat(2, minmax(8rem, 1fr)) auto;
    align-items: end;
    gap: 0.5rem;
    padding-bottom: 0.75rem;
    border-bottom: var(--border);
}

@media (max-width: 900px) {
    .container-datos {
        grid-template-columns: 1fr;
        min-width: auto;
    }
}
</style>

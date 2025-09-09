<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Empresa</strong>

            <div class="buttons">
                <JdButton
                    text="Recargar"
                    @click="loadEmpresa"
                    v-if="useAuth.verifyPermiso('vEmpresa:ver')"
                />
            </div>
        </div>

        <div class="container-datos">
            <div class="datos-fiscales">
                <JdInput
                    label="RUC"
                    :nec="true"
                    v-model="vista.empresa.ruc"
                    style="grid-column: 1/3"
                />

                <JdInput
                    label="Razón social"
                    :nec="true"
                    v-model="vista.empresa.razon_social"
                    style="grid-column: 1/5"
                />

                <JdInput
                    label="Nombre comercial"
                    :nec="true"
                    v-model="vista.empresa.nombre_comercial"
                    style="grid-column: 1/5"
                />

                <JdInput
                    label="Domicilio fiscal"
                    :nec="true"
                    v-model="vista.empresa.domicilio_fiscal"
                    style="grid-column: 1/5"
                />

                <JdInput
                    label="Ubigeo"
                    :nec="true"
                    v-model="vista.empresa.ubigeo"
                    style="grid-column: 1/4"
                />

                <JdInput
                    label="Urbanización"
                    :nec="true"
                    v-model="vista.empresa.urbanizacion"
                    style="grid-column: 1/4"
                />

                <JdInput
                    label="Distrito"
                    :nec="true"
                    v-model="vista.empresa.distrito"
                    style="grid-column: 1/4"
                />

                <JdInput
                    label="Provincia"
                    :nec="true"
                    v-model="vista.empresa.provincia"
                    style="grid-column: 1/4"
                />

                <JdInput
                    label="Departamento"
                    :nec="true"
                    v-model="vista.empresa.departamento"
                    style="grid-column: 1/4"
                />
            </div>

            <div class="datos-secundarios">
                <JdInput label="Teléfono" :nec="true" v-model="vista.empresa.telefono" />
                <JdInput label="Correo" :nec="true" v-model="vista.empresa.correo" />

                <JdInput label="Pc principal" :nec="true" v-model="vista.empresa.pc_principal_ip" />
                <JdInput
                    label="Impuesto"
                    :nec="true"
                    type="number"
                    v-model="vista.empresa.igv_porcentaje"
                />

                <JdButton
                    text="Modificar"
                    @click="modificar"
                    v-if="useAuth.verifyPermiso('vEmpresa:editar')"
                />
            </div>
        </div>
    </div>
</template>

<script>
import { JdButton, JdInput } from 'jd-components'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdButton,
        JdInput,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},
    }),
    created() {
        this.vista = this.useVistas.vEmpresa

        if (this.vista.loaded) return

        this.vista.empresa = {}
        if (this.useAuth.verifyPermiso('vEmpresa:ver') == true) this.loadEmpresa()
    },
    methods: {
        checkDatos() {
            const props = [
                'ruc',
                'razon_social',
                'nombre_comercial',
                'domicilio_fiscal',
                'ubigeo',
                'urbanizacion',
                'distrito',
                'provincia',
                'departamento',
                'pc_principal_ip',
                'igv_porcentaje',
            ]

            if (incompleteData(this.vista.empresa, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async loadEmpresa() {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(urls.empresa)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.empresa = res.data
        },

        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await patch(urls.empresa, this.vista.empresa)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mColaborador', 'Editar colaborador', 2, res.data)
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: auto 1fr;
    // display: flex;
    // flex-wrap: wrap;
    gap: 4rem;

    .datos-fiscales {
        display: grid;
        grid-template-columns: repeat(4, 6rem);
        gap: 0.5rem;
    }

    .datos-secundarios {
        display: grid;
        grid-template-columns: 20rem;
        gap: 0.5rem;
        // align-items: flex-start;
        height: fit-content;
    }
}

@media (max-width: 540px) {
    .container-datos {
        grid-template-columns: 1fr;

        .datos-fiscales {
            grid-template-columns: 100%;

            > * {
                grid-column: 1/2 !important;
            }
        }
    }
}
</style>

<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Empresa</strong>

            <div class="buttons">
                <JdButton
                    text="Recargar"
                    tipo="2"
                    @click="loadEmpresa"
                    v-if="useAuth.verifyPermiso('vEmpresa:ver')"
                />

                <JdButton
                    text="Modificar"
                    @click="modificar"
                    v-if="useAuth.verifyPermiso('vEmpresa:editar')"
                />
            </div>
        </div>

        <div class="container-datos">
            <div class="card datos-fiscales">
                <strong style="grid-column: 1/3">Datos fiscales</strong>

                <JdInput
                    label="RUC"
                    :nec="true"
                    v-model="vista.empresa.ruc"
                    style="grid-column: 1/3"
                    :disabled="true"
                />

                <JdInput
                    label="Razón social"
                    :nec="true"
                    v-model="vista.empresa.razon_social"
                    style="grid-column: 1/5"
                    :disabled="true"
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

                <!-- <JdInput
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
                /> -->

                <JdInput
                    label="Impuesto (%)"
                    :nec="true"
                    type="number"
                    v-model="vista.empresa.igv_porcentaje"
                    style="grid-column: 1/4"
                />
            </div>

            <div class="card datos-secundarios">
                <strong>Datos generales</strong>

                <JdInput label="Teléfono" :nec="true" v-model="vista.empresa.telefono" />

                <JdInput label="Correo" :nec="true" v-model="vista.empresa.correo" />

                <JdInputFile
                    label="Logo"
                    :nec="true"
                    accept="image/*"
                    v-model="vista.empresa.logo"
                    @handleFile="
                        (file, blob) => ((vista.empresa.archivo = file), (vista.blob = blob))
                    "
                    @deleteFile="((vista.empresa.archivo = null), (vista.blob = null))"
                />
            </div>

            <div v-if="vista.empresa.archivo || vista.empresa.foto" class="empresa-logo">
                <img
                    :src="vista.blob"
                    :alt="'logo-' + vista.empresa.razon_social"
                    v-if="vista.empresa.archivo"
                />
                <img
                    :src="vista.empresa.foto.url"
                    :alt="'logo-' + vista.empresa.razon_social"
                    v-else
                />
            </div>
        </div>
    </div>

    <mEmpresaCdt v-if="useModals.show.mEmpresaCdt" />
</template>

<script>
import { JdButton, JdInput, JdInputFile } from '@jhuler/components'
import mEmpresaCdt from './mEmpresaCdt.vue'

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
        JdInputFile,
        // JdInputPassword,
        mEmpresaCdt,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),
        urls,

        vista: {},
    }),
    created() {
        this.vista = this.useVistas.vEmpresa

        if (this.vista.loaded) return

        this.vista.empresa = {}
        if (this.useAuth.verifyPermiso('vEmpresa:ver') == true) this.loadEmpresa()
    },
    methods: {
        async loadEmpresa() {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.empresa}/uno/${this.useAuth.empresa.id}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.empresa = res.data
        },

        checkDatos() {
            const props = [
                'nombre_comercial',

                'domicilio_fiscal',
                'ubigeo',
                'igv_porcentaje',

                'telefono',
                'correo',
                'logo',
            ]

            if (incompleteData(this.vista.empresa, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        shapeDatos() {
            if (this.vista.empresa.archivo) this.vista.empresa.formData = true
        },
        async modificar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await patch(urls.empresa, this.vista.empresa)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            // this.vista.empresa = res.data
        },

        // subirCdt() {
        //     this.useModals.setModal(
        //         'mEmpresaCdt',
        //         'Subir certificado digital tributario',
        //         null,
        //         this.vista.empresa,
        //     )
        // },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    // display: flex;
    // flex-wrap: wrap;
    gap: 2rem;
    overflow-y: auto;

    .datos-fiscales {
        display: grid;
        // grid-template-columns: repeat(4, 6rem);
        gap: 0.5rem;
        height: fit-content;
    }

    .datos-secundarios {
        display: grid;
        // grid-template-columns: 20rem;
        gap: 0.5rem;
        // align-items: flex-start;
        height: fit-content;
    }

    .empresa-logo {
        height: fit-content;
        // width: 100%;
        padding: 0.5rem;
        box-shadow: 0 0 0.5rem var(--shadow-color);
        margin: 0.5rem 0.5rem 0 0.5rem;

        img {
            width: 100%;
            border-radius: 0.5rem;
        }
    }
}

@media (max-width: 540px) {
    .container-datos {
        grid-template-columns: 1fr;
        gap: 2rem;

        .datos-fiscales {
            grid-template-columns: 100%;

            > * {
                grid-column: 1/2 !important;
            }
        }
    }
}
</style>

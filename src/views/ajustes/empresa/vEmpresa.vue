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

        <div class="containder-datos">
            <JdInput label="RUC" :nec="true" v-model="vista.empresa.ruc" />
            <JdInput
                label="Nombre comercial"
                :nec="true"
                v-model="vista.empresa.nombre"
                style="grid-column: 1/3"
            />
            <JdInput label="Teléfono" :nec="true" v-model="vista.empresa.telefono" />
            <JdInput label="Correo" :nec="true" v-model="vista.empresa.correo" />
            <JdInput
                label="Direccion"
                :nec="true"
                v-model="vista.empresa.direccion"
                style="grid-column: 1/3"
            />
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
</template>

<script>
import JdButton from '@/components/inputs/JdButton.vue'
import JdInput from '@/components/inputs/JdInput.vue'

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
                'nombre',
                'telefono',
                'correo',
                'direccion',
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
.containder-datos {
    display: grid;
    grid-template-columns: 20rem 20rem;
    gap: 0.5rem;
}
</style>

<template>
    <JdModal modal="mEmpresaCdt" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdInputFile
                label="Certificado"
                :nec="true"
                accept=".pfx"
                v-model="modal.item.cdt"
                @handleFile="(file, blob) => ((modal.item.archivo_cdt = file), (modal.blob = blob))"
                @deleteFile="((modal.item.archivo_cdt = null), (modal.blob = null))"
            />

            <JdInputPassword
                label="Clave certificado"
                :nec="true"
                v-model="modal.item.cdt_clave"
            />
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInputFile, JdInputPassword } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInputFile,
        JdInputPassword,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},

        buttons: [
            { text: 'Actualizar', action: 'modificar', show: true },
        ],
    }),
    created() {
        this.modal = this.useModals.mEmpresaCdt
    },
    methods: {
        checkDatos() {
            const props = ['cdt', 'cdt_clave']

            if (incompleteData(this.modal.item, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        async modificar() {
            if (this.checkDatos()) return

            const send = {
                id: this.modal.item.id,
                cdt: this.modal.item.cdt,
                cdt_clave: this.modal.item.cdt_clave,
                archivo: this.modal.item.archivo_cdt,
                destino: 'sunat',
                formData: true,
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await patch(`${urls.empresa}/cdt`, send, 'Certificado subido')
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.show.mEmpresaCdt = false
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    // grid-template-columns: 20rem;
    gap: 0.5rem;
}
</style>

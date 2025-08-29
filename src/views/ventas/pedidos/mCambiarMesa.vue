<template>
    <JdModal modal="mCambiarMesa" :buttons="buttons" @button-click="(action) => this[action]()">
        <div>
            <p class="mrg-btm1">{{ `Pedido N° ${modal.pedido.venta_codigo}` }}</p>

            <div class="container-datos mrg-btm1" v-if="modal.pedido">
                <strong>Origen: </strong>
                <p>{{ modal.salon1.nombre }} - {{ modal.mesa1.nombre }}</p>
            </div>

            <div class="container-datos">
                <strong>Destino: </strong>
                <JdSelect :nec="true" label="Salón" v-model="modal.salon" :lista="modal.salones" />

                <JdSelect :nec="true" label="Mesa" v-model="modal.mesa" :lista="mesasFiltered" />
            </div>
        </div>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdSelect from '@/components/inputs/JdSelect.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'

import { jmsg } from '@/utils/swal'
import { urls, patch } from '@/utils/crud'

export default {
    components: {
        JdModal,
        JdSelect,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),

        buttons: [
            {
                text: 'Cambiar',
                action: 'cambiar',
                show: true,
            },
        ],
    }),
    computed: {
        mesasFiltered() {
            if (this.modal.salon == null) return []

            const salon = this.modal.salones.find((a) => a.id == this.modal.salon)
            return salon.mesas.sort((a, b) => a.nombre.localeCompare(b.nombre))
        },
    },
    created() {
        this.modal = this.useModals.mCambiarMesa

        // setTimeout(() => {
        //     this.useModals.mCambiarMesa.inicio = false
        // }, 500)
    },
    methods: {
        async cambiar() {
            if (this.modal.mesa1.id == this.modal.mesa) return jmsg('warning', 'Elige otra mesa')

            const send = {
                id: this.modal.pedido.id,
                venta_mesa: this.modal.mesa,
            }

            this.useAuth.setLoading(true, 'Cambiando...')
            const res = await patch(
                `${urls.transacciones}/cambiar-mesa`,
                send,
                'Pedido cambiado de mesa con éxito',
            )
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.$emit('mesaCambiada')

            this.useModals.show.mCambiarMesa = false
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

@media (max-width: 540px) {
    .container-datos {
        grid-template-columns: minmax(100%, 33.5rem) !important;
    }
}
</style>

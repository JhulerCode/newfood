<template>
    <JdModal modal="mSucursalCambiar">
        <JdTable
            :columns="columns"
            :datos="useAuth.empresa.sucursales || []"
            :seeker="false"
            :download="false"
        >
            <template v-slot:cElegir="{ item }">
                <JdButton
                    v-if="canElegir(item)"
                    text="Elegir"
                    tipo="2"
                    :small="true"
                    @click="elegir(item)"
                />
                <span v-else-if="!isSucursalActual(item)" class="chip inactive">Inactivo</span>
            </template>
        </JdTable>
    </JdModal>
</template>

<script>
import { JdModal, JdTable, JdButton } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'
import { deepCopy } from '@/utils/mine'

export default {
    components: {
        JdModal,
        JdTable,
        JdButton,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        colaborador: {},

        columns: [
            {
                id: 'sucursal',
                title: 'Sucursal',
                prop: 'codigo',
                width: '15rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'elegir',
                title: '',
                slot: 'cElegir',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mSucursalCambiar
    },
    methods: {
        isSucursalActual(item) {
            return item?.id == this.useAuth.sucursal?.id
        },
        canElegir(item) {
            return !this.isSucursalActual(item) && this.useAuth.isSucursalDisponible(item)
        },
        async elegir(item) {
            if (!this.canElegir(item)) return

            this.useAuth.sucursal = deepCopy(item)
            this.useModals.show.mSucursalCambiar = false
            window.location.reload()
        },
    },
}
</script>

<style lang="scss" scoped>
.chip {
    width: fit-content;
    border-radius: 1rem;
    padding: 0.25rem 0.6rem;
    font-size: 0.85rem;
    font-weight: 600;

    &.inactive {
        background: #fee2e2;
        color: var(--rojo);
    }
}
</style>

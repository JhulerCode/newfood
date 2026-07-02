<template>
    <JdModal modal="mTenantSockets">
        <div class="container-sockets">
            <div class="head">
                <div class="title">
                    <strong>{{ empresa.razon_social || empresa.nombre_comercial }}</strong>
                </div>
                <span>{{ resumen }}</span>
            </div>

            <JdTable
                :columns="columns"
                :datos="sockets"
                :colAct="false"
                :download="false"
                :reload="loadSockets"
            />
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdTable } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'

export default {
    components: {
        JdModal,
        JdTable,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),

        empresa: {},
        sockets: [],
        columns: [
            {
                id: 'socket_id',
                title: 'Socket ID',
                width: '14rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'nombres',
                title: 'Nombres',
                width: '12rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'apellidos',
                title: 'Apellidos',
                width: '12rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'sucursal_codigo',
                title: 'Sucursal',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'tipo',
                title: 'Tipo',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'transport',
                title: 'Transport',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'ip',
                title: 'IP',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'conectado_at',
                title: 'Conectado',
                format: 'datetime',
                width: '12rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'ultima_actividad_at',
                title: 'Ultima actividad',
                format: 'datetime',
                width: '12rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
    }),
    computed: {
        resumen() {
            const total = this.sockets.length
            const usuarios = this.sockets.filter((socket) => socket.tipo == 'usuario').length
            const pc_principal = this.sockets.filter(
                (socket) => socket.tipo == 'pc_principal',
            ).length

            return `${total} conectados | ${usuarios} usuarios | ${pc_principal} PC principal`
        },
    },
    created() {
        this.empresa = this.useModals.mTenantSockets.item || {}
        this.loadSockets()
    },
    methods: {
        async loadSockets() {
            if (!this.empresa.id) return

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.empresas}/${this.empresa.id}/sockets`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.sockets = res.data
        },
    },
}
</script>

<style lang="scss" scoped>
.container-sockets {
    display: grid;
    gap: 1rem;
    min-width: min(90vw, 76rem);
}

.head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;

    .title {
        display: grid;
        gap: 0.25rem;
    }

     span {
        color: var(--text-color-2);
        font-size: 0.85rem;
    }
}

</style>

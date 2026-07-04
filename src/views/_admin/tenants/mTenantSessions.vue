<template>
    <JdModal modal="mTenantSessions">
        <div class="container-sessions">
            <div class="head">
                <div class="title">
                    <strong>{{ empresa.razon_social || empresa.nombre_comercial }}</strong>
                </div>
                <span>{{ resumen }}</span>
            </div>

            <JdTable
                :columns="columns"
                :datos="sessions"
                :colAct="false"
                :download="false"
                :reload="loadSessions"
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
        sessions: [],
        columns: [
            {
                id: 'session_id',
                title: 'Session ID',
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
                id: 'usuario',
                title: 'Usuario',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'sucursal',
                title: 'Sucursal',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'sockets_count',
                title: 'Sockets',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'device_type',
                prop: 'client_info.device.type',
                title: 'Dispositivo',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'device_os',
                prop: 'client_info.device.os',
                title: 'SO',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'device_browser',
                prop: 'client_info.device.browser',
                title: 'Navegador',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'client_ip',
                prop: 'client_info.ip',
                title: 'IP',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'created_at',
                title: 'Creada',
                format: 'datetime',
                width: '12rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'updated_at',
                title: 'Actualizada',
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
            const total = this.sessions.length
            const sockets = this.sessions.reduce(
                (count, session) => count + Number(session.sockets_count || 0),
                0,
            )

            return `${total} sesiones | ${sockets} sockets activos`
        },
    },
    created() {
        this.empresa = this.useModals.mTenantSessions.item || {}
        this.loadSessions()
    },
    methods: {
        async loadSessions() {
            if (!this.empresa.id) return

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.empresas}/${this.empresa.id}/sessions`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.sessions = res.data
        },
    },
}
</script>

<style lang="scss" scoped>
.container-sessions {
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

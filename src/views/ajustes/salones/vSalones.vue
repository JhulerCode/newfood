<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Salones y mesas</strong>

            <div class="buttons">
                <JdButton
                    text="Nueva mesa"
                    tipo="2"
                    @click="nuevaMesa()"
                    v-if="vista.salon?.id && useAuth.verifyPermiso('vSalones:crearMesa')"
                />

                <JdButton
                    text="Nuevo salon"
                    @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vSalones:crear')"
                />
            </div>
        </div>

        <div class="body">
            <JdTable
                :name="tableName"
                :columns="columns"
                :datos="vista.salones || []"
                :colAct="true"
                :seeker="false"
                :reload="loadSalones"
                :rowOptions="tableRowOptions"
                @rowOptionSelected="runMethod"
            >
            </JdTable>

            <div v-if="vista.salon?.id">
                <strong>Mesas de {{ vista.salon?.nombre }}</strong>

                <JdTable
                    :name="tableName1"
                    :columns="columns1"
                    :datos="vista.mesas || []"
                    :colAct="true"
                    :seeker="false"
                    :reload="loadMesas"
                    :rowOptions="tableRowOptions1"
                    @rowOptionSelected="runMethod"
                >
                </JdTable>
            </div>

            <div class="empty" v-else>
                <i class="fa-solid fa-circle-chevron-left"></i>

                <p>Agrega o selecciona un salón</p>

                <span>
                    Debes agregar o seleccionar un salón para poder agregar, modificar o visualizar
                    sus mesas
                </span>
            </div>
        </div>
    </div>

    <mSalon v-if="useModals.show.mSalon" />
    <mMesa v-if="useModals.show.mMesa" />
</template>

<script>
import JdButton from '@/components/inputs/JdButton.vue'
import JdTable from '@/components/JdTable.vue'

import mSalon from './mSalon.vue'
import mMesa from './mMesa.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

export default {
    components: {
        JdButton,
        JdTable,

        mSalon,
        mMesa,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        vista: {},

        tableName: 'vSalones',
        columns: [
            {
                id: 'nombre',
                title: 'Nombre',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'activo',
                title: 'Estado',
                prop: 'activo1.nombre',
                format: 'yesno',
                width: '6rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
        tableRowOptions: [
            {
                label: 'Editar',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editar',
                permiso: 'vSalones:editar',
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash',
                action: 'eliminar',
                permiso: 'vSalones:eliminar',
            },
            {
                label: 'Ver mesas',
                icon: 'fa-solid fa-table',
                action: 'listarMesas',
                permiso: 'vSalones:listarMesa',
            },
        ],

        tableName1: 'vMesas',
        columns1: [
            {
                id: 'nombre',
                title: 'Nombre',
                width: '10rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'activo',
                title: 'Estado',
                prop: 'activo1.nombre',
                format: 'yesno',
                width: '6rem',
                show: true,
                seek: true,
                sort: true,
            },
        ],
        tableRowOptions1: [
            {
                label: 'Editar',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editarMesa',
                permiso: 'vSalones:editarMesa',
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash',
                action: 'eliminarMesa',
                permiso: 'vSalones:eliminarMesa',
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vSalones
        this.useAuth.setColumns(this.tableName, this.columns)
        // this.useAuth.setColumns(this.tableName1, this.columns1)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vSalones:listar') == true) this.loadSalones()
    },
    methods: {
        setQuery() {
            this.vista.qry = {
                fltr: {},
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
        },
        async loadSalones() {
            this.setQuery()

            this.vista.salones = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.salones}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.salones = res.data
        },

        nuevo() {
            const item = { activo: true }

            this.useModals.setModal('mSalon', 'Nuevo salón', 1, item)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.salones}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mSalon', 'Editar salón', 2, res.data)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.salones, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vSalones', 'salones', item)
        },
        listarMesas(item) {
            this.vista.salon = item
            this.loadMesas()
        },

        setQuery1() {
            this.vista.qry1 = {
                fltr: { salon: { op: 'Es', val: this.vista.salon.id } },
            }

            this.useAuth.updateQuery(this.columns1, this.vista.qry1)
        },
        async loadMesas() {
            this.setQuery1()

            this.vista.mesas = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.mesas}?qry=${JSON.stringify(this.vista.qry1)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.mesas = res.data
        },
        nuevaMesa() {
            const item = { salon: this.vista.salon.id, activo: true }

            this.useModals.setModal('mMesa', 'Nueva mesa', 1, item)
        },
        async editarMesa(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.mesas}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.setModal('mMesa', 'Editar mesa', 2, res.data)
        },
        async eliminarMesa(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.mesas, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vSalones', 'mesas', item)
        },
    },
}
</script>

<style lang="scss" scoped>
.body {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5rem;
    align-items: flex-start;
}

.empty {
    text-align: center;

    p {
        font-size: 1.3rem;
        margin-bottom: 0.5rem;
    }

    span {
        color: var(--text-color2)
    }
}
</style>

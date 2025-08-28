<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Compras</strong>

            <div class="buttons">
                <JdButton
                    text="Recuperar guardado"
                    tipo="2"
                    @click="recuperarGuardado()"
                    v-if="useAuth.avances.mCompra && useAuth.verifyPermiso('vCompras:crear')"
                />

                <JdButton
                    text="Nuevo"
                    @click="nuevo()"
                    v-if="useAuth.verifyPermiso('vCompras:crear')"
                />
            </div>
        </div>

        <JdTable
            :name="tableName"
            :columns="columns"
            :datos="vista.transacciones || []"
            :colAct="true"
            :configFiltros="openConfigFiltros"
            :reload="loadTransacciones"
            :rowOptions="tableRowOptions"
            @rowOptionSelected="runMethod"
        >
        </JdTable>
    </div>

    <mTransaccion v-if="useModals.show.mTransaccion" />

    <mConfigCols v-if="useModals.show.mConfigCols" />
    <mConfigFiltros v-if="useModals.show.mConfigFiltros" />

    <mAnular v-if="useModals.show.mAnular" />
</template>

<script>
import JdButton from '@/components/inputs/JdButton.vue'
import JdTable from '@/components/JdTable.vue'
import mAnular from '@/components/mAnular.vue'

import mConfigCols from '@/components/mConfigCols.vue'
import mConfigFiltros from '@/components/mConfigFiltros.vue'

import mTransaccion from '@/views/compras/compras/mTransaccion.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get, delet } from '@/utils/crud'
import { jqst } from '@/utils/swal'

import dayjs from 'dayjs'

export default {
    components: {
        JdButton,
        JdTable,
        mAnular,

        mConfigCols,
        mConfigFiltros,

        mTransaccion,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),
        dayjs,

        vista: {},

        tableName: 'vCompras',
        columns: [
            {
                id: 'fecha',
                title: 'Fecha',
                type: 'date',
                format: 'date',
                width: '8rem',
                show: true,
                seek: true,
                sort: true,
            },
            {
                id: 'pago_comprobante_serie',
                title: 'Serie',
                type: 'text',
                width: '5rem',
                show: true,
                seek: false,
                sort: false,
            },
            {
                id: 'pago_comprobante_correlativo',
                title: 'Correlativo',
                type: 'text',
                width: '7rem',
                show: true,
                seek: false,
                sort: false,
            },
            {
                id: 'socio',
                title: 'Proveedor',
                prop: 'socio1.nombres',
                type: 'select',
                mostrar: 'nombres',
                width: '15rem',
                show: true,
                seek: true,
                sort: false,
            },
            {
                id: 'pago_condicion',
                title: 'Condición de pago',
                prop: 'pago_condicion1.nombre',
                type: 'select',
                width: '8rem',
                show: true,
                seek: false,
                sort: false,
            },
            {
                id: 'monto',
                title: 'Importe',
                type: 'number',
                format: 'decimal',
                toRight: true,
                width: '10rem',
                show: true,
                seek: false,
                sort: false,
            },
            {
                id: 'estado',
                title: 'Estado',
                type: 'select',
                prop: 'estado1.nombre',
                format: 'estado',
                width: '10rem',
                show: true,
                seek: false,
                sort: false,
            },
        ],
        tableRowOptions: [
            {
                label: 'Ver',
                icon: 'fa-regular fa-folder-open',
                action: 'ver',
                permiso: 'vCompras:ver',
            },
            {
                label: 'Editar',
                icon: 'fa-solid fa-pen-to-square',
                action: 'editar',
                permiso: 'vCompras:editar',
            },
            {
                label: 'Eliminar',
                icon: 'fa-solid fa-trash-can',
                action: 'eliminar',
                permiso: 'vCompras:eliminar',
            },
        ],
    }),
    async created() {
        this.vista = this.useVistas.vCompras
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vCompras:listar') == true) this.loadTransacciones()
    },
    methods: {
        initFiltros() {
            this.columns[0].op = 'Está dentro de'
            this.columns[0].val = dayjs().startOf('month').format('YYYY-MM-DD')
            this.columns[0].val1 = dayjs().format('YYYY-MM-DD')
        },
        setQuery() {
            this.vista.qry = {
                fltr: { tipo: { op: 'Es', val: 1 } },
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)
            this.vista.qry.cols.push('tipo')
        },
        async loadTransacciones() {
            this.setQuery()

            this.vista.transacciones = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}?qry=${JSON.stringify(this.vista.qry)}`)
            this.useAuth.setLoading(false)
            this.vista.loaded = true

            if (res.code != 0) return

            this.vista.transacciones = res.data
        },

        nuevo() {
            const send = {
                transaccion: {
                    tipo: 1,
                    fecha: dayjs().format('YYYY-MM-DD'),
                    estado: 1,
                    transaccion_items: [],
                },
            }

            this.useModals.setModal('mTransaccion', 'Nueva compra', 1, send, true)
        },
        async recuperarGuardado() {
            const send = {
                transaccion: this.useAuth.avances.mCompra,
            }

            this.useModals.setModal('mTransaccion', 'Nueva compra', 1, send, true)
        },

        async openConfigFiltros() {
            await this.loadDatosSistema()
            await this.loadSocios()

            const cols = this.columns
            cols.find((a) => a.id == 'socio').lista = this.vista.socios
            cols.find((a) => a.id == 'pago_condicion').lista = this.vista.pago_condiciones
            cols.find((a) => a.id == 'estado').lista = this.vista.transaccion_estados

            const send = {
                table: this.tableName,
                cols,
                reload: this.loadTransacciones,
            }

            this.useModals.setModal('mConfigFiltros', 'Filtros', null, send, true)
        },

        runMethod(method, item) {
            this[method](item)
        },
        async ver(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const send = {
                transaccion: res.data,
                socio: { ...res.data.socio1 },
                socios: [{ ...res.data.socio1 }],
            }

            this.useModals.setModal('mTransaccion', 'Ver compra', 3, send, true)
        },
        async editar(item) {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.transacciones}/uno/${item.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            const send = {
                transaccion: res.data,
                socio: { ...res.data.socio1 },
                socios: [{ ...res.data.socio1 }],
            }

            this.useModals.setModal('mTransaccion', 'Editar compra', 2, send, true)
        },
        async eliminar(item) {
            const resQst = await jqst('¿Está seguro de eliminar?')
            if (resQst.isConfirmed == false) return

            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.transacciones, item)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.removeItem('vCompras', 'transacciones', item)
        },

        async loadSocios() {
            const qry = {
                fltr: { tipo: { op: 'Es', val: 1 }, activo: { op: 'Es', val: true } },
                cols: ['nombres'],
            }

            this.vista.socios = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.vista.socios = res.data
        },
        async loadDatosSistema() {
            const qry = ['transaccion_estados', 'pago_condiciones']

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            Object.assign(this.vista, res.data)
        },
    },
}
</script>

<style lang="scss" scoped></style>

<template>
    <JdModal modal="mPedidoDetalles" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <div
                v-if="modal.pedido.venta_canal == 2 || modal.pedido.venta_canal == 3"
                class="dato-cliente"
            >
                <JdSelectQuery
                    icon="fa-solid fa-magnifying-glass"
                    placeholder="Buscar cliente"
                    v-model="modal.pedido.socio"
                    :spin="modal.spinSocios"
                    :lista="modal.socios || []"
                    mostrar="doc_nombres"
                    @search="loadSocios"
                    @elegir="setSocio"
                />

                <JdButton
                    icon="fa-solid fa-user-plus"
                    title="Nuevo socio"
                    tipo="2"
                    :small="true"
                    @click="nuevoSocio()"
                />
            </div>

            <JdInput label="Nombres" :nec="true" v-model="modal.pedido.venta_socio_datos.nombres" />

            <template v-if="modal.pedido.venta_canal == 3">
                <JdInput
                    label="Teléfono"
                    :nec="true"
                    v-model="modal.pedido.venta_socio_datos.telefono"
                />
                <JdInput
                    label="Dirección"
                    :nec="true"
                    v-model="modal.pedido.venta_socio_datos.direccion"
                />
                <JdSelect
                    label="Repartidor"
                    v-model="modal.pedido.repartidor"
                    :lista="modal.colaboradores || []"
                    mostrar="nombres_apellidos"
                />
                <JdSelect
                    label="Método de pago"
                    :nec="true"
                    v-model="modal.pedido.venta_pago_metodo"
                    :lista="modal.pago_metodos || []"
                />
            </template>

            <JdInput label="Observación" v-model="modal.pedido.observacion" />
        </div>
    </JdModal>

    <mSocio @created="setSocioCreated" v-if="useModals.show.mSocio" />
</template>

<script>
import { JdModal, JdInput, JdSelect, JdSelectQuery, JdButton } from '@jhuler/components'

import mSocio from '@/views/compras/proveedores/mSocio.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'

import { jmsg } from '@/utils/swal'
import { urls, get, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'

export default {
    components: {
        JdModal,
        JdInput,
        JdSelect,
        JdSelectQuery,
        JdButton,
        mSocio,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),

        buttons: [
            {
                text: 'Actualizar',
                action: 'modificar',
                show: true,
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mPedidoDetalles

        this.setSocio(this.modal.socios[0])
        if (this.modal.pedido.venta_canal == 3) this.loadPagoMetodos()
    },
    methods: {
        async loadSocios(txtBuscar) {
            if (!txtBuscar) {
                this.modal.socios.length = 0
                return
            }

            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: 2 },
                    activo: { op: 'Es', val: true },
                    nombres: { op: 'Contiene', val: txtBuscar },
                },
                cols: [
                    'nombres',
                    'doc_tipo',
                    'doc_numero',
                    'doc_nombres',
                    'telefono',
                    'direccion',
                    'referencia',
                ],
            }

            this.modal.spinSocios = true
            const res = await get(`${urls.socios}?qry=${JSON.stringify(qry)}`)
            this.modal.spinSocios = false

            if (res.code !== 0) return

            this.modal.socios = res.data
        },
        async loadPagoMetodos() {
            const qry = {
                fltr: { activo: { op: 'Es', val: true } },
                cols: ['nombre'],
            }

            this.modal.pago_metodos = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.pago_metodos}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.pago_metodos = res.data
        },

        setSocio(item) {
            if (item) {
                this.modal.pedido.venta_socio_datos = {
                    doc_tipo: item.doc_tipo,
                    doc_numero: item.doc_numero,
                    doc_nombres: item.doc_nombres,
                    nombres: item.nombres,
                    telefono: item.telefono,
                    direccion: item.direccion,
                    referencia: item.referencia,
                }
            } else {
                this.modal.pedido.venta_socio_datos = {}
            }
        },
        nuevoSocio() {
            const send = { tipo: 2, activo: true }

            this.useModals.setModal('mSocio', 'Nuevo cliente', 1, send)
        },
        setSocioCreated(item) {
            this.modal.socios = [item]
            this.modal.pedido.socio = item.id

            this.setSocio(item)
        },

        checkDatos() {
            if (this.modal.pedido.venta_canal == 2 || this.modal.pedido.venta_canal == 3) {
                if (incompleteData(this.modal.pedido.venta_socio_datos, ['nombres'])) {
                    jmsg('warning', 'Ingrese los datos necesarios')
                    return true
                }
            }

            if (this.modal.pedido.venta_canal == 3) {
                if (
                    incompleteData(this.modal.pedido.venta_socio_datos, ['direccion', 'telefono'])
                ) {
                    jmsg('warning', 'Ingrese los datos necesarios')
                    return true
                }

                if (incompleteData(this.modal.pedido, ['venta_pago_metodo'])) {
                    jmsg('warning', 'Ingrese el método de pago')
                    return true
                }
            }
        },
        async modificar() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await patch(urls.transacciones, this.modal.pedido)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.$emit('datallesModificados')
            this.useModals.show.mPedidoDetalles = false
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 30rem;
    gap: 0.5rem;

    .dato-cliente {
        display: flex;
        gap: 0.5rem;
    }
}

@media (max-width: 540px) {
    .container-datos {
        grid-template-columns: minmax(100%, 33.5rem) !important;
    }
}
</style>

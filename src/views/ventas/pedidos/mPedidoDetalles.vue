<template>
    <JdModal modal="mPedidoDetalles" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdInput
                label="Fecha"
                :nec="true"
                v-model="modal.pedido.fecha"
                :disabled="modal.mode == 3"
                style="grid-column: 1/3"
            />

            <JdInput
                label="Atención"
                v-model="atencion"
                :disabled="true"
                style="grid-column: 1/3"
            />

            <div
                v-if="
                    modal.mode != 3 &&
                    (modal.pedido.venta_canal == 2 || modal.pedido.venta_canal == 3)
                "
                class="dato-cliente"
                style="grid-column: 1/4"
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

            <JdInput
                :label="modal.mode == 2 ? 'Nombres' : 'Cliente'"
                :nec="true"
                v-model="modal.pedido.venta_socio_datos.nombres"
                :disabled="modal.mode == 3"
                style="grid-column: 1/4"
            />

            <template v-if="modal.pedido.venta_canal == 3">
                <JdInput
                    label="Teléfono"
                    :nec="true"
                    v-model="modal.pedido.venta_socio_datos.telefono"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/3"
                />

                <JdInput
                    label="Dirección"
                    :nec="true"
                    v-model="modal.pedido.venta_socio_datos.direccion"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/4"
                />

                <JdSelect
                    label="Repartidor"
                    v-model="modal.pedido.repartidor"
                    :lista="modal.colaboradores || []"
                    mostrar="nombres_apellidos"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/4"
                />

                <JdSelect
                    label="Método de pago"
                    :nec="true"
                    v-model="modal.pedido.venta_pago_metodo"
                    :lista="modal.pago_metodos || []"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/3"
                />

                <JdInput
                    label="Paga con"
                    :nec="true"
                    type="number"
                    v-model="modal.pedido.venta_pago_con"
                    :disabled="modal.mode == 3"
                    v-if="
                        modal.pedido.venta_canal == 3 &&
                        modal.pedido.venta_pago_metodo ==
                            `${useAuth.usuario.empresa.subdominio}-EFECTIVO`
                    "
                    style="grid-column: 1/3"
                />
            </template>

            <JdSelect
                label="Estado"
                v-model="modal.pedido.estado"
                :lista="modal.transaccion_estados"
                :disabled="true"
                style="grid-column: 1/3"
            />

            <i
                class="fa-regular fa-copy"
                style="cursor: pointer"
                title="Copiar id"
                @click="copyToClipboard(modal.pedido.id)"
            ></i>
        </div>

        <JdTable
            :columns="columns"
            :datos="modal.pedido.transaccion_items || []"
            :columnsResizable="true"
            :seeker="false"
            :colNro="false"
            :download="false"
            v-if="modal.mode == 3"
        />

        <div class="datos-bottom">
            <div class="left">
                <JdInput
                    label="Observación"
                    v-model="modal.pedido.observacion"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/2"
                />

                <JdInput
                    label="Motivo de anulación"
                    v-model="modal.pedido.anulado_motivo"
                    :disabled="true"
                    style="grid-column: 1/2"
                    v-if="modal.pedido.estado == 0"
                />
            </div>

            <div class="right">
                <strong>Total:</strong>
                <strong class="total"> S/ {{ modal.mtoImpVenta }} </strong>
            </div>
        </div>
    </JdModal>

    <mSocio
        @created="setSocioCreated"
        v-if="useModals.show.mSocio"
        :columnsResizable="true"
        :seeker="false"
        :colAct="true"
        :colNro="false"
        :download="false"
    />
</template>

<script>
import { JdModal, JdInput, JdSelect, JdSelectQuery, JdButton, JdTable } from '@jhuler/components'

import mSocio from '@/views/compras/proveedores/mSocio.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'

import { jmsg } from '@/utils/swal'
import { urls, get, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { redondear, copyToClipboard } from '@/utils/mine'

export default {
    emits: ['detallesModificados'],
    components: {
        JdModal,
        JdInput,
        JdSelect,
        JdSelectQuery,
        JdButton,
        JdTable,
        mSocio,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        copyToClipboard,

        buttons: [
            {
                text: 'Imprimir',
                action: 'modificar',
                show: false,
                tipo: '2',
            },
            {
                text: 'Actualizar',
                action: 'modificar',
            },
        ],

        columns: [
            {
                id: 'articulo',
                title: 'Producto',
                prop: 'articulo1.nombre',
                width: '20rem',
                show: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                format: 'number',
                toRight: true,
                width: '5rem',
                show: true,
            },
            {
                id: 'pu',
                title: 'Pu',
                toRight: true,
                width: '5rem',
                show: true,
            },
            {
                id: 'total',
                title: 'Importe',
                format: 'decimal',
                toRight: true,
                width: '6rem',
                show: true,
            },
        ],
    }),
    computed: {
        atencion() {
            if (this.modal.pedido.venta_canal == 1) {
                return (
                    this.modal.pedido.venta_mesa1.salon1.nombre +
                    ' - ' +
                    this.modal.pedido.venta_mesa1.nombre
                )
            } else {
                return this.modal.pedido.venta_canal == 2 ? 'PARA LLEVAR' : 'DELIVERY'
            }
        },
    },
    created() {
        this.modal = this.useModals.mPedidoDetalles

        this.setSocio(this.modal.socios[0])

        if (this.modal.mode == 2) {
            this.buttons[1].show = true
            if (this.modal.pedido.venta_canal == 3) {
                this.loadPagoMetodos()
            }
        } else if (this.modal.mode == 3) {
            this.loadDatosSistema()
            this.sumarItems()
        }
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
                    or: {
                        nombres: { op: 'Contiene', val: txtBuscar },
                        doc_numero: { op: 'Contiene', val: txtBuscar },
                    },
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
        async loadDatosSistema() {
            const qry = ['transaccion_estados']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
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

        sumarItems() {
            for (const a of this.modal.pedido.transaccion_items) this.calcularUno(a)

            this.calcularTotales()
        },
        calcularUno(item) {
            item.vu =
                item.igv_afectacion == '10' ? item.pu / (1 + item.igv_porcentaje / 100) : item.pu

            item.mtoValorVenta = item.cantidad * item.vu
            item.igv =
                item.igv_afectacion == '10' ? item.mtoValorVenta * (item.igv_porcentaje / 100) : 0
            item.total = item.mtoValorVenta + item.igv
        },
        calcularTotales() {
            this.modal.mtoOperGravadas = 0
            this.modal.mtoOperExoneradas = 0
            this.modal.mtoOperInafectas = 0
            this.modal.mtoIGV = 0

            for (const a of this.modal.pedido.transaccion_items) {
                if (a.igv_afectacion == '10') {
                    this.modal.mtoOperGravadas += a.mtoValorVenta
                    this.modal.mtoIGV += a.igv
                } else if (a.igv_afectacion == '20') {
                    this.modal.mtoOperExoneradas += a.mtoValorVenta
                } else if (a.igv_afectacion == '30') {
                    this.modal.mtoOperInafectas += a.mtoValorVenta
                }
            }

            this.modal.valorVenta =
                this.modal.mtoOperGravadas +
                this.modal.mtoOperExoneradas +
                this.modal.mtoOperInafectas
            this.modal.mtoImpVenta = redondear(this.modal.valorVenta + this.modal.mtoIGV)
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
        shapeDatos() {
            if (
                this.modal.pedido.venta_pago_metodo !=
                `${this.useAuth.usuario.empresa.subdominio}-EFECTIVO`
            ) {
                this.modal.pedido.venta_pago_con = null
            }
        },
        async modificar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await patch(urls.transacciones, this.modal.pedido)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useAuth.socket.emit('mPedidoDetalles:modificar', res.data)
            this.useModals.show.mPedidoDetalles = false
        },

        // copiarId() {
        //     navigator.clipboard.writeText(this.modal.pedido.id)
        //     jmsg('success', 'Id copiado')
        // },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: 9rem 9rem 9rem;
    gap: 0.5rem;
    margin-bottom: 2rem;

    .dato-cliente {
        display: flex;
        gap: 0.5rem;
    }
}

.datos-bottom {
    margin-top: 2rem;
    display: flex;
    gap: 1rem;
    justify-content: space-between;

    .left {
        display: grid;
        grid-template-columns: 20rem;
        gap: 0.5rem;
    }

    .right {
        background-color: var(--bg-color2);
        padding: 1rem;
        border-radius: 0.5rem;
        display: grid;
        grid-template-columns: 4rem 9rem;
        gap: 0.5rem;
        align-items: center;
        height: fit-content;

        p {
            text-align: right;
        }

        .total {
            font-size: 1.4rem;
            text-align: right;
        }
    }
}

@media (max-width: 540px) {
    .container-datos {
        grid-template-columns: minmax(100%, 33.5rem) !important;
    }
}
</style>

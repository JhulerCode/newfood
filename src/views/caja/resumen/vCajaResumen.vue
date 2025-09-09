<template>
    <div class="tablero">
        <div class="tablero-head">
            <strong>{{ vista.pasado == true ? 'Caja resumen' : 'Apertura y cierre' }}</strong>

            <div class="buttons">
                <template v-if="vista.pasado == true">
                    <JdButton
                        text="Regresar"
                        icon="fa-solid fa-arrow-left"
                        tipo="2"
                        @click="regresar()"
                    />
                </template>

                <template v-else>
                    <JdButton text="Reload" tipo="2" @click="loadCajaApertura()" />

                    <JdButton
                        text="Aperturar caja"
                        @click="aperturar()"
                        v-if="
                            useAuth.verifyPermiso('vCajaResumen:aperturar') &&
                            vista.caja_apertura == null
                        "
                    />

                    <JdButton
                        text="Cerrar caja"
                        @click="cerrar()"
                        v-if="
                            useAuth.verifyPermiso('vCajaResumen:cerrar') &&
                            vista.caja_apertura != null
                        "
                    />
                </template>
            </div>
        </div>

        <div class="tablero-body">
            <div class="first" v-if="vista.caja_apertura == null">
                <div class="card caja">
                    <div class="card-head" :style="{ 'background-color': 'var(--rojo)' }">
                        CERRADO
                    </div>
                </div>

                <div class="empty">
                    <i class="fa-solid fa-ghost"></i>
                    <p>Aperture la caja</p>
                    <span> No podrá generar pedidos ni hacer cobranzas de las ventas </span>
                </div>
            </div>

            <div class="first" v-if="vista.resumen">
                <div class="card caja">
                    <div class="card-head" :style="{ 'background-color': 'var(--verde)' }">
                        <!-- <span>{{ caja }}</span> -->
                        ABIERTO
                    </div>

                    <div class="dato">
                        <span>Usuario</span>
                        <p>{{ vista.caja_apertura.createdBy1?.nombres_apellidos }}</p>
                    </div>

                    <div class="dato">
                        <span>Fecha de apertura</span>
                        <p>
                            {{
                                dayjs(vista.caja_apertura.fecha_apertura).format(
                                    useAuth.usuario.format_date + ' HH:mm',
                                )
                            }}
                        </p>
                    </div>

                    <div class="dato" v-if="vista.caja_apertura.fecha_cierre">
                        <span>Fecha de cierre</span>
                        <p>
                            {{
                                dayjs(vista.caja_apertura.fecha_cierre).format(
                                    useAuth.usuario.format_date + ' HH:mm',
                                )
                            }}
                        </p>
                    </div>
                </div>

                <div class="card efectivo">
                    <div class="concepto">
                        <div class="icon" style="background-color: var(--amarillo)">
                            <i class="fa-solid fa-coins"></i>
                        </div>
                        <div class="detalle">
                            <p>Monto de apertura</p>
                            <span>S/ {{ redondear(vista.caja_apertura.monto_apertura) }}</span>
                        </div>
                    </div>

                    <div class="concepto">
                        <div class="icon" style="background-color: var(--verde)">
                            <i class="fa-solid fa-arrow-up"></i>
                        </div>
                        <div class="detalle">
                            <p>Ingresos</p>
                            <span>S/ {{ redondear(vista.resumen.efectivo_ingresos_total) }}</span>
                        </div>
                    </div>

                    <div class="concepto">
                        <div class="icon" style="background-color: var(--rojo)">
                            <i class="fa-solid fa-arrow-down"></i>
                        </div>
                        <div class="detalle">
                            <p>Egresos</p>
                            <span>S/ {{ redondear(vista.resumen.efectivo_egresos_total) }}</span>
                        </div>
                    </div>

                    <div class="footer">
                        <div class="monto-resumen">
                            <span
                                >S/
                                {{
                                    redondear(
                                        Number(vista.caja_apertura.monto_apertura) +
                                            vista.resumen.efectivo_ingresos_total -
                                            vista.resumen.efectivo_egresos_total,
                                    )
                                }}</span
                            >
                            <p>Total en caja</p>
                        </div>

                        <div class="monto-resumen">
                            <span>S/ {{ redondear(vista.caja_apertura.monto_cierre || 0) }}</span>
                            <p>Monto cierre</p>
                        </div>

                        <div class="monto-resumen">
                            <span
                                >S/
                                {{
                                    redondear(
                                        Number(vista.caja_apertura.monto_apertura) +
                                            vista.resumen.efectivo_ingresos_total -
                                            vista.resumen.efectivo_egresos_total -
                                            vista.caja_apertura.monto_cierre,
                                    )
                                }}</span
                            >
                            <p>Diferencia</p>
                        </div>
                    </div>
                </div>

                <div class="card pago_metodos">
                    <!-- <div class="card-head">
                        <p>Métodos de pago</p>
                        <span>{{ redondear(vista.resumen.pago_metodos_total) }}</span>
                    </div>

                    <JdTable
                        :datos="vista.resumen.pago_metodos || []"
                        :columns="columnsPagoMetodos"
                        :seeker="false"
                        :download="false"
                        height="12rem"
                    /> -->
                </div>
            </div>

            <div class="second" v-if="vista.resumen">
                <div class="card">
                    <div class="card-head">
                        <p>Otros ingresos</p>

                        <div class="monto-resumen">
                            <span
                                >S/
                                {{ redondear(vista.resumen.efectivo_ingresos_extra_total) }}</span
                            >
                            <p>Total ingresos</p>
                        </div>
                    </div>

                    <JdTable
                        :datos="vista.resumen.efectivo_ingresos || []"
                        :columns="columnsOperaciones"
                        :seeker="false"
                        :download="false"
                        height="15rem"
                    />
                </div>

                <div class="card">
                    <div class="card-head">
                        <p>Egresos</p>

                        <div class="monto-resumen">
                            <span>S/ {{ redondear(vista.resumen.efectivo_egresos_total) }}</span>
                            <p>Total egresos</p>
                        </div>
                    </div>

                    <JdTable
                        :datos="vista.resumen.efectivo_egresos || []"
                        :columns="columnsOperaciones"
                        :seeker="false"
                        :download="false"
                        height="15rem"
                    />
                </div>
            </div>

            <div class="third" v-if="vista.resumen">
                <div class="card">
                    <div class="icon" style="background-color: var(--verde)">
                        <i class="fa-solid fa-dollar-sign"></i>
                    </div>
                    <div>
                        <span>S/ {{ redondear(vista.resumen.comprobantes_aceptados_total) }}</span>
                        <p>Total de ventas</p>
                    </div>
                </div>

                <div class="card">
                    <div class="icon" style="background-color: var(--rojo)">
                        <i class="fa-solid fa-ban"></i>
                    </div>
                    <div>
                        <span>S/ {{ redondear(vista.resumen.comprobantes_anulados_total) }}</span>
                        <p>Anulaciones</p>
                    </div>
                </div>

                <div class="card">
                    <div class="icon" style="background-color: var(--amarillo)">
                        <i class="fa-solid fa-tags"></i>
                    </div>
                    <div>
                        <div>
                            <span>S/ {{ redondear(vista.resumen.descuentos_total) }}</span>

                            <small
                                >+S/{{ redondear(vista.resumen.descuentos_anulados_total) }}</small
                            >
                        </div>
                        <p>Descuentos</p>
                    </div>
                </div>

                <div class="card">
                    <div class="icon" style="background-color: var(--verde)">
                        <i class="fa-solid fa-note-sticky"></i>
                    </div>
                    <div>
                        <span>S/ {{ redondear(vista.resumen.venta_canales_total) }}</span>
                        <p>Pedidos</p>
                    </div>
                </div>
            </div>

            <div class="forth" v-if="vista.resumen">
                <div class="card">
                    <div class="card-head">
                        <p>Métodos de pago</p>
                    </div>

                    <JdTable
                        :datos="vista.resumen.venta_pago_metodos || []"
                        :columns="columnsPagoMetodos"
                        :seeker="false"
                        :download="false"
                        height="12rem"
                    />
                </div>

                <div class="card">
                    <div class="card-head">
                        <p>Tipos de comprobante</p>
                    </div>

                    <JdTable
                        :datos="vista.resumen.venta_comprobantes || []"
                        :columns="columnsPagoMetodos"
                        :seeker="false"
                        :download="false"
                        height="12rem"
                    />
                </div>

                <div class="card">
                    <div class="card-head">
                        <p>Canales</p>
                    </div>

                    <JdTable
                        :datos="vista.resumen.venta_canales || []"
                        :columns="columnsVentaCanales"
                        :seeker="false"
                        :download="false"
                        height="12rem"
                    />
                </div>
            </div>

            <div class="fifth" v-if="vista.resumen">
                <div class="card">
                    <div class="card-head">
                        <p>Comprobantes</p>
                    </div>

                    <JdTable
                        :datos="vista.resumen.comprobantes_aceptados || []"
                        :columns="columnsComprobantes"
                        :seeker="false"
                        :download="false"
                        height="20rem"
                    />
                </div>

                <div class="card">
                    <div class="card-head">
                        <p>Productos</p>
                    </div>

                    <JdTable
                        :datos="vista.resumen.productos || []"
                        :columns="columnsProductos"
                        :seeker="false"
                        :download="false"
                        height="20rem"
                    />
                </div>

                <div class="card">
                    <div class="card-head">
                        <p>Comprobantes anulados</p>
                    </div>

                    <JdTable
                        :datos="vista.resumen.comprobantes_anulados || []"
                        :columns="columnsComprobantes"
                        :seeker="false"
                        :download="false"
                        height="20rem"
                    />
                </div>

                <div class="card">
                    <div class="card-head">
                        <p>Productos anulados</p>
                    </div>

                    <JdTable
                        :datos="vista.resumen.productos_anulados || []"
                        :columns="columnsProductosAnulados"
                        :seeker="false"
                        :download="false"
                        height="20rem"
                    />
                </div>

                <div class="card">
                    <div class="card-head">
                        <p>Comprobantes canjeados</p>
                    </div>

                    <JdTable
                        :datos="vista.resumen.comprobantes_canjeados || []"
                        :columns="columnsComprobantesAnulados"
                        :seeker="false"
                        :download="false"
                        height="20rem"
                    />
                </div>
            </div>

            <div class="second" v-if="vista.resumen">
                <div class="card">
                    <div class="card-head">
                        <p>Pedidos anulados</p>

                        <div class="monto-resumen">
                            <span>S/ {{ redondear(vista.resumen.pedidos_anulados_total) }}</span>
                            <p>Total</p>
                        </div>
                    </div>

                    <JdTable
                        :datos="vista.resumen.pedidos_anulados || []"
                        :columns="columnsPedidosAnulados"
                        :seeker="false"
                        :download="false"
                        height="15rem"
                    />
                </div>
            </div>
        </div>
    </div>

    <mCajaAperturar
        v-if="useModals.show.mCajaAperturar"
        @aperturado="cajaAperturada"
        @cerrado="((vista.caja_apertura = null), (vista.resumen = null))"
    />
</template>

<script>
import { JdTable, JdButton } from 'jd-components'

import mCajaAperturar from './mCajaAperturar.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'
import { redondear } from '@/utils/mine'

import dayjs from 'dayjs'

export default {
    components: {
        JdButton,
        mCajaAperturar,
        JdTable,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),

        redondear,
        dayjs,

        columnsPagoMetodos: [
            {
                id: 'nombre',
                title: 'Nombre',
                width: '8rem',
                show: true,
                sort: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                width: '4rem',
                show: true,
                sort: true,
            },
            {
                id: 'monto',
                title: 'Monto',
                toRight: true,
                format: 'currency',
                moneda: 'S/',
                width: '8rem',
                show: true,
                sort: true,
            },
        ],

        columnsVentaCanales: [
            {
                id: 'name',
                title: 'Nombre',
                width: '8rem',
                show: true,
                sort: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                width: '4rem',
                show: true,
                sort: true,
            },
            {
                id: 'value',
                title: 'Monto',
                toRight: true,
                format: 'currency',
                moneda: 'S/',
                width: '8rem',
                show: true,
                sort: true,
            },
        ],

        columnsOperaciones: [
            {
                id: 'operacion',
                title: 'Operación',
                width: '10rem',
                show: true,
            },
            {
                id: 'detalle',
                title: 'Detalle',
                width: '13rem',
                show: true,
            },
            {
                id: 'monto',
                title: 'Monto',
                toRight: true,
                format: 'currency',
                moneda: 'S/',
                width: '8rem',
                show: true,
            },
        ],

        columnsComprobantes: [
            {
                id: 'tipo',
                title: 'Documento',
                width: '10rem',
                show: true,
                sort: true,
            },
            {
                id: 'id',
                title: 'Número',
                width: '10rem',
                show: true,
                sort: true,
            },
            {
                id: 'monto',
                title: 'Monto',
                toRight: true,
                format: 'currency',
                moneda: 'S/',
                width: '8rem',
                show: true,
                sort: true,
            },
        ],
        columnsComprobantesAnulados: [
            {
                id: 'tipo',
                title: 'Documento',
                width: '10rem',
                show: true,
                sort: true,
            },
            {
                id: 'id',
                title: 'Número',
                width: '8rem',
                show: true,
                sort: true,
            },
            {
                id: 'monto',
                title: 'Monto',
                toRight: true,
                format: 'currency',
                moneda: 'S/',
                width: '8rem',
                show: true,
                sort: true,
            },
            {
                id: 'canjeado_por',
                title: 'Canjeado por',
                width: '8rem',
                show: true,
                sort: true,
            },
        ],

        columnsProductos: [
            {
                id: 'nombre',
                title: 'Nombre',
                width: '20rem',
                show: true,
                sort: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                width: '5rem',
                show: true,
                sort: true,
            },
            {
                id: 'monto',
                title: 'Monto',
                toRight: true,
                format: 'currency',
                moneda: 'S/',
                width: '8rem',
                show: true,
                sort: true,
            },
            {
                id: 'descuento',
                title: 'Descuento',
                toRight: true,
                format: 'currency',
                moneda: 'S/',
                width: '8rem',
                show: true,
                sort: true,
            },
        ],

        columnsProductosAnulados: [
            {
                id: 'nombre',
                title: 'Nombre',
                width: '20rem',
                show: true,
                sort: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                width: '5rem',
                show: true,
                sort: true,
            },
            {
                id: 'monto',
                title: 'Monto',
                toRight: true,
                format: 'currency',
                moneda: 'S/',
                width: '8rem',
                show: true,
                sort: true,
            },
            {
                id: 'descuento',
                title: 'Descuento',
                toRight: true,
                format: 'currency',
                moneda: 'S/',
                width: '8rem',
                show: true,
                sort: true,
            },
        ],

        columnsPedidosAnulados: [
            {
                id: 'venta_codigo',
                title: 'Nro pedido',
                width: '12rem',
                show: true,
                sort: true,
            },
            {
                id: 'venta_canal',
                title: 'Canal',
                width: '10rem',
                show: true,
                sort: true,
            },
            {
                id: 'monto',
                title: 'Monto',
                toRight: true,
                format: 'currency',
                moneda: 'S/',
                width: '8rem',
                show: true,
                sort: true,
            },
        ],
    }),
    async created() {
        this.vista = this.useVistas.vCajaResumen

        if (this.vista.caja_apertura) {
            this.loadResumen()
            return
        }

        if (this.useAuth.verifyPermiso('vCajaResumen:ver') == true) await this.loadCajaApertura()
    },
    methods: {
        async loadCajaApertura() {
            const qry = {
                fltr: { estado: { op: 'Es', val: '1' } },
                cols: [
                    'fecha_apertura',
                    'monto_apertura',
                    'fecha_cierre',
                    'monto_cierre',
                    'estado',
                ],
                incl: ['createdBy1'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.caja_aperturas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.caja_apertura = res.data[0]
            if (this.vista.caja_apertura) this.loadResumen()
        },
        aperturar() {
            const send = {
                fecha_apertura: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                caja: 1,
            }
            this.useModals.setModal('mCajaAperturar', 'Aperturar caja', 1, send)
        },
        cerrar() {
            const send = {
                id: this.vista.caja_apertura.id,
                fecha_cierre: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                caja: 1,
                caja_total: redondear(
                    Number(this.vista.caja_apertura.monto_apertura) +
                        this.vista.resumen.efectivo_ingresos_total -
                        this.vista.resumen.efectivo_egresos_total,
                ),
            }
            this.useModals.setModal('mCajaAperturar', 'Cerrar caja', 2, send)
        },
        async loadResumen() {
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.caja_aperturas}/resumen/${this.vista.caja_apertura.id}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.resumen = res.data
        },
        cajaAperturada(item) {
            this.vista.caja_apertura = item
            this.loadResumen()
        },

        regresar() {
            this.useVistas.closePestana('vCajaResumen', 'vCajaAperturas')
        },
    },
}
</script>

<style lang="scss" scoped>
.tablero {
    height: 100%;
    overflow-y: auto;
    // padding: 0 1rem;
}

.tablero-head {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    position: sticky;
    top: 0;
    background-color: var(--bg-color2);
    padding: 1rem;
    z-index: 3;

    strong {
        font-size: 1.4rem;
    }

    .buttons {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }
}

.tablero-body {
    padding: 0 1rem;
}

.card {
    padding: 1rem;
    background-color: var(--bg-color);
    border-radius: 1rem;
    box-shadow: 0 0 0.5rem var(--shadow-color);
    overflow: hidden;
}

.icon {
    display: grid;
    place-content: center;
    border-radius: 50%;

    i {
        color: var(--text-color3);
    }
    // justify-content: center;
}

.card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
}

.monto-resumen {
    text-align: center;

    p {
        color: var(--text-color2);
    }

    span {
        font-size: 1.5rem;
    }
}

.first {
    display: grid;
    grid-template-columns: 1fr 1.3fr 1.3fr;
    gap: 2rem;
    margin-bottom: 2rem;

    .caja {
        .card-head {
            height: 5rem;
            justify-content: center;
            align-items: center;
            border-radius: 0.5rem;

            color: var(--text-color3);
            // * {
            // }
        }

        .dato {
            margin-top: 1rem;

            span {
                color: var(--text-color2);
            }
        }
    }

    .efectivo {
        .concepto {
            display: grid;
            grid-template-columns: 3rem 1fr;
            height: 3rem;
            margin-bottom: 1rem;
            gap: 2rem;

            .detalle {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
        }

        .footer {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            margin-top: 1.5rem;
        }
    }

    .empty {
        display: flex;
        flex-direction: column;
        text-align: center;
        justify-content: center;

        p {
            font-size: 1.3rem;
            margin-bottom: 0.5rem;
        }

        span {
            color: var(--text-color2);
        }
    }
}

.second {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
}

.third {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;

    .card {
        display: grid;
        grid-template-columns: 3rem 1fr;
        height: 5rem;
        gap: 2rem;

        span {
            font-size: 1.5rem;
        }

        p {
            color: var(--text-color2);
        }
    }
}

.forth {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
}

.fifth {
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 2rem;
    margin-bottom: 2rem;
}

@media (max-width: 540px) {
    .first,
    .second,
    .third,
    .forth,
    .fifth {
        grid-template-columns: 1fr;
        gap: 1rem;
        margin-bottom: 1rem;
    }
}
</style>

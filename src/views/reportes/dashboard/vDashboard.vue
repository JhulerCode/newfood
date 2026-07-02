<template>
    <div class="vista">
        <div class="head">
            <strong>Dashboard ventas</strong>

            <div class="buttons">
                <JdSelect
                    style="width: 10rem"
                    v-model="selectedYear"
                    :lista="yearOptions"
                    @elegir="elegirAnio"
                />
            </div>
        </div>

        <div>
            <div class="first" v-if="vista.data">
                <div class="card">
                    <div class="icon" style="background-color: var(--verde)">
                        <i class="fa-solid fa-dollar-sign"></i>
                    </div>
                    <div>
                        <span>S/ {{ redondear(vista.data.ventas.total) }}</span>
                        <p>Total de ventas</p>
                    </div>
                </div>

                <div class="card">
                    <div class="icon" style="background-color: var(--rojo)">
                        <i class="fa-solid fa-ban"></i>
                    </div>
                    <div>
                        <span>S/ {{ redondear(vista.data.anulados.total) }}</span>
                        <p>Anulaciones</p>
                    </div>
                </div>

                <div class="card">
                    <div class="icon" style="background-color: var(--amarillo)">
                        <i class="fa-solid fa-tags"></i>
                    </div>
                    <div>
                        <div>
                            <span>S/ {{ redondear(vista.data.ventas.descuentos) }}</span>

                            <small>+S/{{ redondear(vista.data.anulados.descuentos) }}</small>
                        </div>
                        <p>Descuentos</p>
                    </div>
                </div>

                <div class="card">
                    <div class="icon" style="background-color: var(--verde)">
                        <i class="fa-solid fa-note-sticky"></i>
                    </div>
                    <div>
                        <span>S/ {{ redondear(vista.data.general) }}</span>
                        <p>Suma general</p>
                    </div>
                </div>

                <div class="card">
                    <div class="icon" style="background-color: var(--verde)">
                        <i class="fa-solid fa-file-invoice-dollar"></i>
                    </div>
                    <div>
                        <span>S/ {{ redondear(vista.data.ventas.sunat_aceptadas_total) }}</span>
                        <p>Aceptado por SUNAT</p>
                    </div>
                </div>
            </div>

            <div class="second" v-if="vista.data">
                <div class="card">
                    <v-chart
                        :option="barOptTiempo"
                        style="width: 100%; height: 15rem"
                        autoresize
                        @click="seleccionarMes"
                    />
                </div>

                <div class="card">
                    <div class="card-head">
                        <p>Top de productos</p>
                    </div>

                    <JdTable
                        :datos="vista.data.ventas.productos || []"
                        :columns="columnsProductos"
                        :seeker="false"
                        :download="false"
                        height="15rem"
                    />
                </div>
            </div>

            <div class="third" v-if="vista.data">
                <div class="card">
                    <v-chart
                        :option="pieOptPagoMetodos"
                        style="width: 100%; height: 15rem"
                        autoresize
                    />
                </div>

                <div class="card">
                    <v-chart
                        :option="pieOptComprobantes"
                        style="width: 100%; height: 15rem"
                        autoresize
                    />
                </div>

                <div class="card">
                    <v-chart
                        :option="pieOptCanales"
                        style="width: 100%; height: 15rem"
                        autoresize
                    />
                </div>

                <div></div>

                <div></div>

                <div class="card">
                    <v-chart
                        :option="pieOptCanalesCantidad"
                        style="width: 100%; height: 15rem"
                        autoresize
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { JdTable, JdSelect } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'
import { redondear } from '@/utils/mine'

import dayjs from 'dayjs'

import { use } from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

use([
    BarChart,
    PieChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    CanvasRenderer,
])

export default {
    components: {
        JdSelect,
        JdTable,
        VChart,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),
        redondear,
        selectedYear: dayjs().year().toString(),
        selectedMonths: [],
        yearOptions: Array.from({ length: 8 }, (_, i) => {
            const year = dayjs().year() - i
            return { id: year.toString(), nombre: year.toString() }
        }),

        columnsProductos: [
            {
                id: 'nombre',
                title: 'Nombre',
                width: '20rem',
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
            {
                id: 'cantidad',
                title: 'Cantidad',
                toRight: true,
                width: '8rem',
                show: true,
            },
        ],

        tableName: 'vDashboard',
        columns: [
            {
                id: 'fecha_emision',
                title: 'Fecha',
            },
        ],
    }),
    computed: {
        barOptTiempo() {
            const meses = this.vista?.data?.ventas?.tiempo?.meses || []
            const ventas = this.vista?.data?.ventas?.tiempo?.ventas || []

            return {
                title: {
                    text: 'Meses',
                    left: 'center',
                    top: 0,
                    padding: 0,
                },
                tooltip: {
                    trigger: 'axis',
                    // axisPointer: { type: 'shadow' },
                },
                grid: {
                    left: '0%',
                    right: '0%',
                    bottom: '0%',
                    top: '28px',
                    containLabel: true,
                },
                xAxis: {
                    type: 'category',
                    data: meses,
                    axisTick: { alignWithLabel: true },
                },
                yAxis: {
                    type: 'value',
                },
                series: [
                    {
                        name: 'Ventas',
                        type: 'bar',
                        barWidth: '60%',
                        data: ventas.map((value, index) => ({
                            value,
                            itemStyle: {
                                color:
                                    this.selectedMonths.length == 0 ||
                                    this.selectedMonths.includes(meses[index])
                                        ? '#5470C6'
                                        : '#c9ced8',
                            },
                        })),
                        itemStyle: {
                            color: '#5470C6', // azul por defecto
                        },
                    },
                ],
            }
        },
        pieOptPagoMetodos() {
            return {
                title: {
                    text: 'Métodos de pago',
                    left: 'center',
                    top: 0,
                    padding: 0,
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)',
                },
                legend: {
                    orient: 'horizontal',
                    bottom: 0,
                    left: 'center',
                    itemGap: 5,
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['40%', '70%'],
                        avoidLabelOverlap: false,
                        itemStyle: {
                            borderRadius: 10,
                            borderColor: '#fff',
                            borderWidth: 2,
                        },
                        label: {
                            show: false,
                            position: 'center',
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: 20,
                                fontWeight: 'bold',
                            },
                        },
                        labelLine: {
                            show: false,
                        },
                        data: this.vista?.data?.ventas?.pago_metodos || [],
                    },
                ],
            }
        },
        pieOptComprobantes() {
            return {
                title: {
                    text: 'Tipos de comprobante',
                    left: 'center',
                    top: 0,
                    padding: 0,
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)',
                },
                legend: {
                    orient: 'horizontal',
                    bottom: 0,
                    left: 'center',
                    itemGap: 5,
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['40%', '70%'],
                        avoidLabelOverlap: false,
                        itemStyle: {
                            borderRadius: 10,
                            borderColor: '#fff',
                            borderWidth: 2,
                        },
                        label: {
                            show: false,
                            position: 'center',
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: 20,
                                fontWeight: 'bold',
                            },
                        },
                        labelLine: {
                            show: false,
                        },
                        data: this.vista?.data?.ventas?.comprobante_tipos || [],
                    },
                ],
            }
        },
        pieOptCanales() {
            return {
                title: {
                    text: 'Canales',
                    left: 'center',
                    top: 0,
                    padding: 0,
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)',
                },
                legend: {
                    orient: 'horizontal',
                    bottom: 0,
                    left: 'center',
                    itemGap: 5,
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['40%', '70%'],
                        avoidLabelOverlap: false,
                        itemStyle: {
                            borderRadius: 10,
                            borderColor: '#fff',
                            borderWidth: 2,
                        },
                        label: {
                            show: false,
                            position: 'center',
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: 20,
                                fontWeight: 'bold',
                            },
                        },
                        labelLine: {
                            show: false,
                        },
                        data: this.vista?.data?.ventas?.canales || [],
                    },
                ],
            }
        },
        pieOptCanalesCantidad() {
            return {
                title: {
                    text: 'Canales (cantidad)',
                    left: 'center',
                    top: 0,
                    padding: 0,
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{b}: {c} ({d}%)',
                },
                legend: {
                    orient: 'horizontal',
                    bottom: 0,
                    left: 'center',
                    itemGap: 5,
                },
                series: [
                    {
                        type: 'pie',
                        radius: ['40%', '70%'],
                        avoidLabelOverlap: false,
                        itemStyle: {
                            borderRadius: 10,
                            borderColor: '#fff',
                            borderWidth: 2,
                        },
                        label: {
                            show: false,
                            position: 'center',
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: 20,
                                fontWeight: 'bold',
                            },
                        },
                        labelLine: {
                            show: false,
                        },
                        data:
                            this.vista?.data?.ventas?.canales.map((c) => ({
                                ...c,
                                value: c.cantidad,
                            })) || [],
                    },
                ],
            }
        },
    },
    async created() {
        this.vista = this.useVistas.vDashboard
        this.initFiltros()
        this.useAuth.setColumns(this.tableName, this.columns)
        this.setYearFilter()

        if (this.vista.loaded && this.vista.dataPeriodo) {
            this.aplicarFiltroMeses()
            return
        }

        if (this.useAuth.verifyPermiso('vDashboard:ver') == true) await this.loadResumen()
    },
    methods: {
        initFiltros() {
            this.setYearFilter()
        },
        setYearFilter() {
            this.columns[0].op = 'Está dentro de'
            this.columns[0].val = dayjs(`${this.selectedYear}-01-01`).format('YYYY-MM-DD')
            this.columns[0].val1 = dayjs(`${this.selectedYear}-12-31`).format('YYYY-MM-DD')
        },
        setQuery() {
            this.setYearFilter()
            this.vista.qry = {
                fltr: {
                    sucursal: { op: 'Es', val: this.useAuth.sucursal.id },
                },
            }

            this.useAuth.updateQuery(this.columns, this.vista.qry)

        },
        async loadResumen() {
            this.setQuery()

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(
                `${urls.comprobantes}/dashboard?qry=${JSON.stringify(this.vista.qry)}`,
            )
            this.useAuth.setLoading(false)
            this.vista.loaded = true
            this.useAuth.saveTableColumns(this.tableName, this.columns)

            if (res.code != 0) return

            this.vista.dataPeriodo = res.data
            this.aplicarFiltroMeses()
        },
        elegirAnio() {
            if (!this.selectedYear) return
            this.selectedMonths = []
            this.loadResumen()
        },
        seleccionarMes(params) {
            if (params.componentType != 'series' || !params.name) return

            const ctrlPressed = params.event?.event?.ctrlKey == true

            if (ctrlPressed) {
                if (this.selectedMonths.includes(params.name)) {
                    this.selectedMonths = this.selectedMonths.filter((a) => a != params.name)
                } else {
                    this.selectedMonths.push(params.name)
                }
            } else if (this.selectedMonths.length == 1 && this.selectedMonths[0] == params.name) {
                this.selectedMonths = []
            } else {
                this.selectedMonths = [params.name]
            }

            this.aplicarFiltroMeses()
        },
        aplicarFiltroMeses() {
            if (!this.vista.dataPeriodo?.dashboard_items) return

            this.vista.data = this.calcularDashboardLocal(
                this.vista.dataPeriodo.dashboard_items,
            )
        },
        calcularDashboardLocal(items) {
            const selectedMonths = new Set(this.selectedMonths)
            const shouldFilter = selectedMonths.size > 0
            const ventas = {
                tiempo: this.calcularTiempoLocal(items),
                pago_metodos: [],
                comprobante_tipos: [],
                canales: [],
                productos: [],
                total: 0,
                sunat_aceptadas_total: 0,
                descuentos: 0,
            }
            const anulados = {
                total: 0,
                descuentos: 0,
            }
            const pagoMetodosMap = {}
            const comprobanteTiposMap = {}
            const canalesMap = {}
            const productosMap = {}
            const pedidosMap = {}

            for (const item of items) {
                if (shouldFilter && !selectedMonths.has(item.mes)) continue

                if (['1', '2', '3'].includes(item.estado)) {
                    ventas.total += Number(item.monto)

                    if (item.estado == '3' && ['01', '03'].includes(item.doc_tipo)) {
                        ventas.sunat_aceptadas_total += Number(item.monto)
                    }

                    for (const pago of item.pago_metodos || []) {
                        if (!pagoMetodosMap[pago.id]) {
                            const nuevo = {
                                id: pago.id,
                                name: pago.nombre,
                                value: Number(pago.monto),
                                itemStyle: { color: pago.color },
                            }
                            ventas.pago_metodos.push(nuevo)
                            pagoMetodosMap[pago.id] = nuevo
                        } else {
                            pagoMetodosMap[pago.id].value += Number(pago.monto)
                        }
                    }

                    if (!comprobanteTiposMap[item.doc_tipo]) {
                        const nuevo = {
                            id: item.doc_tipo,
                            name: item.doc_tipo_nombre,
                            value: Number(item.monto),
                        }
                        ventas.comprobante_tipos.push(nuevo)
                        comprobanteTiposMap[item.doc_tipo] = nuevo
                    } else {
                        comprobanteTiposMap[item.doc_tipo].value += Number(item.monto)
                    }

                    if (!canalesMap[item.venta_canal]) {
                        const nuevo = {
                            id: item.venta_canal,
                            name: item.venta_canal_nombre,
                            value: Number(item.monto),
                            cantidad: 0,
                        }
                        ventas.canales.push(nuevo)
                        canalesMap[item.venta_canal] = nuevo
                    } else {
                        canalesMap[item.venta_canal].value += Number(item.monto)
                    }

                    if (!pedidosMap[item.transaccion]) {
                        pedidosMap[item.transaccion] = true
                        canalesMap[item.venta_canal].cantidad += 1
                    }

                    for (const producto of item.productos || []) {
                        ventas.descuentos += Number(producto.descuento)

                        if (!productosMap[producto.id]) {
                            const nuevo = {
                                id: producto.id,
                                nombre: producto.nombre,
                                cantidad: Number(producto.cantidad),
                                monto: Number(producto.monto),
                                descuento:
                                    Number(producto.descuento) == 0
                                        ? null
                                        : Number(producto.descuento),
                            }
                            ventas.productos.push(nuevo)
                            productosMap[producto.id] = nuevo
                        } else {
                            productosMap[producto.id].cantidad += Number(producto.cantidad)
                            productosMap[producto.id].monto += Number(producto.monto)
                            productosMap[producto.id].descuento +=
                                Number(producto.descuento) == 0
                                    ? null
                                    : Number(producto.descuento)
                        }
                    }
                }

                if (item.estado == 0) {
                    anulados.total += Number(item.monto)

                    for (const producto of item.productos || []) {
                        anulados.descuentos += Number(producto.descuento)
                    }
                }
            }

            ventas.productos = ventas.productos.sort((a, b) => b.monto - a.monto)

            return {
                ventas,
                anulados,
                general: ventas.total + anulados.total + ventas.descuentos + anulados.descuentos,
                dashboard_items: items,
            }
        },
        calcularTiempoLocal(items) {
            const mesesMap = {}

            for (const item of items) {
                if (!['1', '2', '3'].includes(item.estado)) continue
                if (!mesesMap[item.mes]) {
                    mesesMap[item.mes] = {
                        orden: item.mes_orden,
                        total: 0,
                    }
                }
                mesesMap[item.mes].total += Number(item.monto)
            }

            const meses = Object.keys(mesesMap).sort((a, b) => {
                return mesesMap[a].orden.localeCompare(mesesMap[b].orden)
            })

            return {
                meses,
                ventas: meses.map((mes) => mesesMap[mes].total),
            }
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
    // position: sticky;
    top: 0;
    background-color: var(--bg-color2);
    padding: 1rem 0;
    // z-index: 3;

    strong {
        font-size: 1.4rem;
    }

    .buttons {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }
}

.card {
    box-shadow: 0 0 0.5rem var(--shadow-color);
}

.icon {
    display: grid;
    place-content: center;
    height: 3rem;
    width: 3rem;
    border-radius: 50%;

    i {
        color: var(--text-color3);
    }
    // justify-content: center;
}

.card-head {
    display: flex;
    align-items: center;
    // justify-content: space-between;
    justify-content: center;
    margin-bottom: 1.5rem;

    p {
        font-size: 1.2rem;
        font-weight: bold;
    }
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
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
    margin-bottom: 2rem;

    .card {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 2rem;

        span {
            font-size: 1.5rem;
        }

        p {
            color: var(--text-color2);
        }
    }
}

.second {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
    // height: 20rem;
}

.third {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 2rem;
    // height: 20rem;
}

@media (max-width: 540px) {
    .first,
    .second,
    .third {
        grid-template-columns: 1fr;
        gap: 1rem;
        margin-bottom: 1rem;
    }
}
</style>

<template>
    <div class="tablero">
        <div class="tablero-head">
            <strong>Dashboard ventas</strong>

            <div class="buttons">
                <JdInput type="date" style="width: 10rem" v-model="columns[0].val" />
                <JdInput type="date" style="width: 10rem" v-model="columns[0].val1" />
                <JdButton text="Buscar" tipo="2" @click="loadResumen" />
            </div>
        </div>

        <div class="tablero-body">
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
            </div>

            <div class="second" v-if="vista.data">
                <div class="card">
                    <v-chart :option="barOptTiempo" style="width: 100%; height: 15rem" autoresize />
                </div>

                <div class="card">
                    <div class="card-head">
                        <p>Top 10 productos</p>
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

                <div class="card"></div>

                <div class="card"></div>

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
import { JdTable, JdInput, JdButton } from '@jhuler/components'

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
        JdInput,
        JdButton,
        JdTable,
        VChart,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),
        redondear,

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
                    data: this.vista?.data?.ventas?.tiempo?.meses,
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
                        data: this.vista?.data?.ventas?.tiempo?.ventas,
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

        if (this.vista.loaded) return

        if (this.useAuth.verifyPermiso('vDashboard:ver') == true) await this.loadResumen()
    },
    methods: {
        initFiltros() {
            this.columns[0].op = 'Está dentro de'
            this.columns[0].val = dayjs().startOf('year').format('YYYY-MM-DD')
            this.columns[0].val1 = dayjs().format('YYYY-MM-DD')
        },
        setQuery() {
            this.vista.qry = {
                fltr: {},
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

            this.vista.data = res.data
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
    padding: 1rem;
    background-color: var(--bg-color);
    border-radius: 1rem;
    box-shadow: 0 0 0.5rem var(--shadow-color);
    overflow: hidden;
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
    grid-template-columns: 1fr 1fr 1fr 1fr;
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

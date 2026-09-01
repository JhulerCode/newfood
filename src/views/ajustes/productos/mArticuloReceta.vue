<template>
    <JdModal modal="mArticuloReceta">
        <div class="agregar" v-if="useAuth.verifyPermiso('vProductos:crearReceta')">
            <JdSelectQuery
                label="Artículo"
                :nec="true"
                v-model="nuevo.articulo_variant"
                :spin="spinArticulos"
                :lista="articulos"
                @search="searchArticulos"
                @elegir="setArticulo"
                style="grid-column: 1/5"
            />

            <JdInput
                type="number"
                label="Cantidad"
                :nec="true"
                v-model="nuevo.cantidad"
                style="grid-column: 1/3"
            />

            <JdButton text="Agregar" @click="crear" />
        </div>

        <JdTable
            :columns="columns"
            :datos="receta.receta_insumos || []"
            :seeker="false"
            :download="false"
            :colAct="true"
            :reload="loadReceta"
            class="jd-table"
            height="25rem"
            @onChange="(action, a) => this[action](a)"
            :inputsDisabled="!this.useAuth.verifyPermiso('vProductos:editarReceta')"
        >
            <template v-slot:cArticulo="{ item }">
                {{ componentName(item) }}
            </template>

            <template v-slot:cAction="{ item }">
                <JdButton
                    :small="true"
                    tipo="2"
                    icon="fa-solid fa-trash-can"
                    title="Eliminar"
                    @click="quitar(item)"
                    v-if="this.useAuth.verifyPermiso('vProductos:eliminarReceta')"
                />
            </template>

            <template v-slot:cOrden="{ item }">
                <div class="acts">
                    <JdButton
                        icon="fa-solid fa-angle-down"
                        :small="true"
                        tipo="2"
                        @click="upDown(item, 1)"
                        v-if="
                            receta.receta_insumos.findIndex((a) => a.id == item.id) !=
                            receta.receta_insumos.length - 1
                        "
                    />

                    <span v-else></span>

                    <JdButton
                        icon="fa-solid fa-angle-up"
                        :small="true"
                        tipo="2"
                        @click="upDown(item, 2)"
                        v-if="receta.receta_insumos.findIndex((a) => a.id == item.id) != 0"
                    />
                </div>
            </template>
        </JdTable>
    </JdModal>
</template>

<script>
import { JdModal, JdTable, JdSelectQuery, JdInput, JdButton } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch, delet } from '@/utils/crud'
import { getItemFromArray } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdSelectQuery,
        JdInput,
        JdButton,
        JdTable,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        getItemFromArray,

        modal: {},
        receta: { receta_insumos: [] },
        nuevo: {},
        articulos: [],
        spinArticulos: false,

        columns: [
            {
                id: 'orden',
                title: 'Ordenar',
                slot: 'cOrden',
                width: '5rem',
                show: true,
            },
            {
                id: 'articulo',
                title: 'Artículo',
                slot: 'cArticulo',
                width: '20rem',
                show: true,
            },
            {
                id: 'unidad',
                title: 'Unidad',
                prop: 'articulo1.unidad',
                width: '5rem',
                show: true,
            },
            {
                id: 'cantidad',
                title: 'Cantidad',
                toRight: true,
                input: true,
                type: 'number',
                onchange: 'modificar',
                width: '6rem',
                show: true,
            },
        ],
    }),
    created() {
        this.modal = this.useModals.mArticuloReceta
        this.receta = this.useModals.mArticuloReceta.item || {}
        this.receta.articulo_principal ||= this.receta.id
        this.receta.articulo_principal_variant ||= this.receta.id
        this.receta.receta_insumos ||= []

        if (this.useAuth.verifyPermiso('vProductos:editarReceta') == false)
            this.columns[0].show = false

        this.loadReceta()
    },
    methods: {
        async searchArticulos(txtBuscar) {
            if (!txtBuscar) {
                this.articulos.length = 0
                return
            }

            const qry = { search: txtBuscar, tipo: '1', limit: 50 }

            this.spinArticulos = true
            const res = await get(`${urls.articulos}/variants?qry=${JSON.stringify(qry)}`)
            this.spinArticulos = false

            if (res.code !== 0) return

            this.articulos = JSON.parse(JSON.stringify(res.data))
        },
        setArticulo(a) {
            if (a == null) {
                this.nuevo = {}
            } else {
                this.nuevo.nombre = a.nombre
                this.nuevo.articulo = a.articulo
                this.nuevo.articulo_variant = a.articulo_variant
                this.nuevo.articulo_nombre = a.articulo_nombre
                this.nuevo.variant_nombre = a.variant_nombre
                this.nuevo.unidad = a.unidad
            }
        },
        async crear() {
            if (
                this.nuevo.articulo == null ||
                this.nuevo.articulo_variant == null ||
                this.nuevo.cantidad == null
            )
                return jmsg('warning', 'Selecciona una variante e ingrese la cantidad')

            if (Number(this.nuevo.cantidad) <= 0)
                return jmsg('warning', 'La cantidad debe ser mayor a cero')

            const i = this.receta.receta_insumos.findIndex(
                (a) => a.articulo_variant == this.nuevo.articulo_variant,
            )
            if (i !== -1) return jmsg('warning', 'La variante ya está agregada')

            this.useAuth.setLoading(true, 'Agregando...')
            const res = await post(urls.receta_insumos, {
                ...this.nuevo,
                articulo_principal: this.receta.articulo_principal || this.receta.id,
                articulo_principal_variant: this.receta.articulo_principal_variant,
                orden: this.receta.receta_insumos.length + 1,
            })
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            this.receta.receta_insumos.push(res.data)

            this.nuevo = {}
        },
        async quitar(item) {
            this.useAuth.setLoading(true, 'Eliminando...')
            const res = await delet(urls.receta_insumos, item)
            this.useAuth.setLoading(false)

            if (res.code !== 0) return

            const i = this.receta.receta_insumos.findIndex((a) => a.id == item.id)
            this.receta.receta_insumos.splice(i, 1)
        },
        componentName(item) {
            const articleName = item.articulo1?.nombre || item.articulo_nombre || ''
            const variantName = item.articulo_variant1?.nombre || item.variant_nombre
            return variantName ? `${articleName} / ${variantName}` : articleName
        },
        async modificar(item) {
            this.useAuth.setLoading(true, 'Modificando...')
            const res = await patch(urls.receta_insumos, item, false)
            this.useAuth.setLoading(false)

            if (res.code != 0) return false

            return true
        },
        async upDown(item, k) {
            const i = this.receta.receta_insumos.findIndex((a) => a.id == item.id)

            const o = k == 1 ? item.orden + 1 : item.orden - 1
            const j = k == 1 ? i + 1 : i - 1

            const peer = this.receta.receta_insumos[j]

            await this.modificar({ ...item, orden: o })
            await this.modificar({ ...peer, orden: item.orden })
            // if (res == false) return

            peer.orden = item.orden
            item.orden = o

            this.receta.receta_insumos.sort((a, b) => a.orden - b.orden)
        },

        async loadReceta() {
            const qry = {
                fltr: {
                    articulo_principal_variant: {
                        op: 'Es',
                        val: this.receta.articulo_principal_variant,
                    },
                },
                cols: [
                    'articulo_principal',
                    'articulo_principal_variant',
                    'articulo',
                    'articulo_variant',
                    'cantidad',
                    'orden',
                ],
                incl: ['articulo1', 'articulo_variant1'],
            }

            this.receta.receta_insumos = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.receta_insumos}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false, '')

            if (res.code != 0) return

            this.receta.receta_insumos = res.data
        },
    },
}
</script>

<style lang="scss" scoped>
.agregar {
    display: grid;
    grid-template-columns: repeat(4, 10rem);
    gap: 0.5rem;
    // margin-bottom: 1rem;
}

.jd-table {
    .acts {
        display: grid;
        grid-template-columns: 1.75rem 1.75rem;
        gap: 0.5rem;
    }
}
</style>

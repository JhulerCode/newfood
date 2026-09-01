<template>
    <JdModal modal="mCombo" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdSelect
                label="Categoria"
                :nec="true"
                :lista="modal.articulo_categorias || []"
                :loaded="modal.articulo_categoriasLoaded"
                @reload="loadCategorias"
                v-model="articulo.categoria"
                style="grid-column: 1/4"
            />

            <JdButton
                icon="fa-solid fa-plus"
                tipo="2"
                title="Nueva categoría"
                @click="nuevaCategoria"
                v-if="useAuth.verifyPermiso('vArticuloCategorias:crear')"
                class="btn-nueva-categoria"
            />

            <JdInput
                label="Nombre"
                :nec="true"
                v-model="articulo.nombre"
                style="grid-column: 1/5"
            />

            <JdSelect
                label="Tributo"
                :nec="true"
                v-model="articulo.igv_afectacion"
                :lista="modal.igv_afectaciones || []"
                style="grid-column: 1/4"
            />

            <JdInput
                label="Precio de venta"
                :nec="true"
                type="number"
                v-model="articulo.precio_venta"
                style="grid-column: 1/3"
            />

            <JdInputFile
                label="Foto"
                accept="image/*"
                v-model="articulo.foto_path"
                @handleFile="(file, blob) => ((articulo.archivo = file), (modal.blob = blob))"
                @deleteFile="((articulo.archivo = null), (modal.blob = null))"
                style="grid-column: 1/3"
            />

            <JdSwitch label="Activo?" v-model="articulo.activo" style="grid-column: 1/3" />

            <div
                style="grid-column: 4/5; grid-row: 5/9"
                v-if="articulo.archivo || articulo.foto_url"
                class="producto-foto"
            >
                <img :src="modal.blob" :alt="articulo.nombre" v-if="articulo.archivo" />
                <img :src="articulo.foto_url" :alt="articulo.nombre" v-else />
            </div>
        </div>

        <div class="agregar">
            <strong style="grid-column: 1/5">--- Componentes ---</strong>
            <JdSelectQuery
                label="Producto"
                :nec="true"
                v-model="nuevo.articulo_variant"
                :spin="spinArticulos"
                :lista="modal.articulos"
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

            <JdButton text="Agregar" tipo="2" @click="addArticulo" />
        </div>

        <JdTable
            :columns="columns"
            :datos="articulo.combo_articulos || []"
            :seeker="false"
            :colAct="true"
            :download="false"
        >
            <template v-slot:cArticulo="{ item }">
                {{ componentName(item) }}
            </template>

            <template v-slot:cAction="{ item }">
                <JdButton
                    tipo="2"
                    :small="true"
                    icon="fa-solid fa-trash-can"
                    title="Eliminar"
                    @click="quitar(item)"
                />
            </template>
        </JdTable>
    </JdModal>

    <mArticuloCategoria
        @created="setCategoriaCreada"
        v-if="useModals.show.mArticuloCategoria"
    />
</template>

<script>
import {
    JdModal,
    JdSelect,
    JdInput,
    JdSwitch,
    JdTable,
    JdSelectQuery,
    JdButton,
    JdInputFile,
} from '@jhuler/components'

import mArticuloCategoria from '@/views/ajustes/categorias/mArticuloCategoria.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, post, patch, get } from '@/utils/crud'
import { incompleteData, genId } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        JdSelect,
        JdSelectQuery,
        JdButton,
        JdSwitch,
        JdTable,
        JdInputFile,
        mArticuloCategoria,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        urls: urls,

        modal: {},
        articulo: {},

        nuevo: {},
        spinArticulos: false,

        buttons: [
            { text: 'Grabar', action: 'crear', spin: false },
            { text: 'Actualizar', action: 'modificar', spin: false },
        ],

        columns: [
            {
                id: 'articulo',
                title: 'Producto',
                slot: 'cArticulo',
                width: '23rem',
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
                type: 'number',
                input: true,
                width: '6rem',
                show: true,
            },
        ],
    }),
    async created() {
        this.modal = this.useModals.mCombo
        this.articulo = this.useModals.mCombo.item

        this.showButtons()

        this.loadDatosSistema()
        await this.loadCategorias()
        this.loadProduccionAreas()
    },
    methods: {
        showButtons() {
            if (this.useModals.mCombo.mode == 1) {
                this.buttons[0].show = true
            } else {
                this.buttons[1].show = true
            }
        },

        async searchArticulos(txtBuscar) {
            if (!txtBuscar) {
                this.modal.articulos.length = 0
                return
            }

            const qry = {
                search: txtBuscar,
                tipo: '2',
                is_combo: false,
                limit: 50,
            }

            this.spinArticulos = true
            const res = await get(`${urls.articulos}/variants?qry=${JSON.stringify(qry)}`)
            this.spinArticulos = false

            if (res.code !== 0) return

            this.modal.articulos = JSON.parse(JSON.stringify(res.data))
        },
        setArticulo(a) {
            if (a == null) {
                this.nuevo = {}
            } else {
                this.nuevo.nombre = a.nombre
                this.nuevo.articulo_nombre = a.articulo_nombre
                this.nuevo.articulo = a.articulo
                this.nuevo.articulo_variant = a.articulo_variant
                this.nuevo.variant_nombre = a.variant_nombre
                this.nuevo.unidad = a.unidad
            }
        },
        async addArticulo() {
            if (
                this.nuevo.articulo == null ||
                this.nuevo.articulo_variant == null ||
                this.nuevo.cantidad == null
            )
                return jmsg('warning', 'Selecciona una variante e ingrese la cantidad')

            if (Number(this.nuevo.cantidad) <= 0)
                return jmsg('warning', 'La cantidad debe ser mayor a cero')

            const i = this.articulo.combo_articulos.findIndex(
                (a) => a.articulo_variant == this.nuevo.articulo_variant,
            )
            if (i !== -1) return jmsg('warning', 'La variante ya está agregada')

            this.articulo.combo_articulos.push({
                id: genId(this.articulo.combo_articulos),
                articulo: this.nuevo.articulo,
                articulo_variant: this.nuevo.articulo_variant,
                articulo1: {
                    nombre: this.nuevo.articulo_nombre,
                    unidad: this.nuevo.unidad,
                },
                articulo_variant1: {
                    id: this.nuevo.articulo_variant,
                    articulo: this.nuevo.articulo,
                    nombre: this.nuevo.variant_nombre,
                },
                nombre: this.nuevo.nombre,
                cantidad: this.nuevo.cantidad,
            })

            this.nuevo = {}
        },
        async quitar(item) {
            const i = this.articulo.combo_articulos.findIndex(
                (a) => a.articulo_variant == item.articulo_variant,
            )
            this.articulo.combo_articulos.splice(i, 1)
        },

        componentName(item) {
            if (item.nombre) return item.nombre
            const articleName = item.articulo1?.nombre || ''
            const variantName = item.articulo_variant1?.nombre
            return variantName ? `${articleName} / ${variantName}` : articleName
        },

        checkDatos() {
            const props = ['tipo', 'categoria', 'nombre', 'igv_afectacion', 'precio_venta']

            if (incompleteData(this.articulo, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            if (this.articulo.combo_articulos.length == 0) {
                jmsg('warning', 'Agregue al menos un artículo al combo')
                return true
            }

            for (const a of this.articulo.combo_articulos) {
                if (incompleteData(a, ['articulo', 'articulo_variant', 'cantidad'])) {
                    jmsg('warning', 'Ingrese los datos necesarios de los artículos')
                    return true
                }
                if (Number(a.cantidad) <= 0) {
                    jmsg('warning', 'Las cantidades deben ser mayores a cero')
                    return true
                }
            }

            return false
        },
        shapeDatos() {
            if (this.articulo.archivo) this.articulo.formData = true
        },
        async crear() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Modificando...')
            const res = await post(urls.articulos, this.articulo)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.addItem('vCombos', 'articulos', res.data)

            this.useAuth.socket.emit('mArticulo:crear')

            this.useModals.show.mCombo = false
        },
        async modificar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Modificando...')
            const res = await patch(urls.articulos, this.articulo)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vCombos', 'articulos', res.data)

            this.useAuth.socket.emit('mArticulo:modificar')

            this.useModals.show.mCombo = false
        },

        async loadCategorias() {
            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: '2' },
                    activo: { op: 'Es', val: true },
                },
                cols: ['nombre'],
                ordr: [['nombre', 'ASC']],
            }

            this.modal.articulo_categorias = []
            this.modal.articulo_categoriasLoaded = false
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_categorias}?qry=${JSON.stringify(qry)}`)
            this.modal.articulo_categoriasLoaded = true
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.articulo_categorias = res.data
        },
        nuevaCategoria() {
            const send = {
                item: {
                    tipo: 2,
                    activo: true,
                },
                lock_tipo: true,
            }

            this.useModals.setModal(
                'mArticuloCategoria',
                'Nueva categoría',
                1,
                send,
                true,
            )
        },
        setCategoriaCreada(item) {
            const index = this.modal.articulo_categorias.findIndex((a) => a.id == item.id)

            if (index == -1) this.modal.articulo_categorias.push(item)
            else this.modal.articulo_categorias[index] = item

            this.articulo.categoria = item.id
        },
        async loadProduccionAreas() {
            const qry = {
                fltr: {
                    activo: { op: 'Es', val: true },
                },
                cols: ['nombre'],
                ordr: [['nombre', 'ASC']],
            }

            this.modal.produccion_areas = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.produccion_areas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.produccion_areas = res.data
        },
        async loadDatosSistema() {
            const qry = ['igv_afectaciones', 'unidades']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
        },
    },
}
</script>

<style lang="scss" scoped>
.container-datos {
    display: grid;
    grid-template-columns: repeat(4, 10rem);
    gap: 0.5rem;

    .btn-nueva-categoria {
        align-self: end;
    }

    .producto-foto {
        width: 9rem;
        height: 8.9rem;

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }
}

.agregar {
    display: grid;
    grid-template-columns: repeat(4, 10rem);
    gap: 0.5rem;
    margin-bottom: 1rem;
    margin-top: 2rem;
}

@media (max-width: 540px) {
    .container-datos {
        grid-template-columns: minmax(100%, 33.5rem) !important;

        > * {
            grid-column: 1/2 !important;
        }
    }
}
</style>

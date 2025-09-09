<template>
    <JdModal modal="mCombo" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-datos">
            <JdSelect
                label="Categoria"
                :nec="true"
                :lista="modal.articulo_categorias || []"
                v-model="articulo.categoria"
                style="grid-column: 1/4"
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

            <JdSelect
                label="Área de producción"
                :nec="true"
                v-model="articulo.produccion_area"
                :lista="modal.produccion_areas || []"
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
                v-if="articulo.archivo || articulo.foto_path"
                class="producto-foto"
            >
                <img :src="modal.blob" :alt="articulo.nombre" v-if="articulo.archivo" />
                <img :src="`${urls.uploads}/${articulo.foto_path}`" :alt="articulo.nombre" v-else />
            </div>
        </div>

        <div class="agregar">
            <strong style="grid-column: 1/5">--- Componentes ---</strong>
            <JdSelectQuery
                label="Artículo"
                :nec="true"
                v-model="nuevo.articulo"
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
} from 'jd-components'

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
                title: 'Artículo',
                prop: 'articulo1.nombre',
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
                fltr: {
                    tipo: { op: 'Es', val: '2' },
                    is_combo: { op: 'Es', val: false },
                    activo: { op: 'Es', val: true },
                    nombre: { op: 'Contiene', val: txtBuscar },
                },
                cols: ['nombre', 'unidad', 'igv_afectacion'],
            }

            this.spinArticulos = true
            const res = await get(`${urls.articulos}?qry=${JSON.stringify(qry)}`)
            this.spinArticulos = false

            if (res.code !== 0) return

            this.modal.articulos = JSON.parse(JSON.stringify(res.data))
        },
        setArticulo(a) {
            if (a == null) {
                this.nuevo = {}
            } else {
                this.nuevo.nombre = a.nombre
                this.nuevo.unidad = a.unidad
            }
        },
        async addArticulo() {
            if (this.nuevo.articulo == null || this.nuevo.cantidad == null)
                return jmsg('warning', 'Selecciona un artículo e ingrese la cantidad')

            const i = this.articulo.combo_articulos.findIndex(
                (a) => a.articulo == this.nuevo.articulo,
            )
            if (i !== -1) return jmsg('warning', 'El artículo ya está agregado')

            this.articulo.combo_articulos.push({
                id: genId(this.articulo.combo_articulos),
                articulo: this.nuevo.articulo,
                articulo1: { nombre: this.nuevo.nombre },
                cantidad: this.nuevo.cantidad,
            })

            this.nuevo = {}
        },
        async quitar(item) {
            const i = this.articulo.combo_articulos.findIndex((a) => a.articulo == item.articulo)
            this.articulo.combo_articulos.splice(i, 1)
        },

        checkDatos() {
            const props = ['tipo', 'categoria', 'nombre', 'igv_afectacion']

            if (incompleteData(this.articulo, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            if (this.articulo.combo_articulos.length == 0) {
                jmsg('warning', 'Agregue al menos un artículo al combo')
                return true
            }

            for (const a of this.articulo.combo_articulos) {
                if (incompleteData(a, ['articulo', 'cantidad'])) {
                    jmsg('warning', 'Ingrese los datos necesarios de los artículos')
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
            this.useModals.show.mCombo = false
        },

        async loadCategorias() {
            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: '2' },
                    activo: { op: 'Es', val: true },
                },
            }

            this.modal.articulo_categorias = []
            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.articulo_categorias}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.modal.articulo_categorias = res.data
        },
        async loadProduccionAreas() {
            const qry = {
                fltr: {
                    activo: { op: 'Es', val: true },
                },
                cols: ['nombre'],
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

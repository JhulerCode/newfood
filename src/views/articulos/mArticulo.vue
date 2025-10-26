<template>
    <JdModal modal="mArticulo" :buttons="buttons" @button-click="(action) => this[action]()">
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
                label="Unidad"
                :nec="true"
                v-model="articulo.unidad"
                :lista="modal.unidades"
                mostrar="nombre_completo"
                style="grid-column: 1/3"
                v-if="articulo.tipo == 1"
            />

            <JdSelect
                label="Tributo"
                :nec="true"
                v-model="articulo.igv_afectacion"
                :lista="modal.igv_afectaciones || []"
                style="grid-column: 1/4"
            />

            <JdSelect
                label="Área de impresión"
                :nec="true"
                v-model="articulo.produccion_area"
                :lista="modal.produccion_areas || []"
                style="grid-column: 1/3"
                v-if="articulo.tipo == 2"
            />

            <JdInput
                label="Precio de venta"
                :nec="true"
                type="number"
                v-model="articulo.precio_venta"
                style="grid-column: 1/3"
                v-if="articulo.tipo == 2"
            />

            <JdInputFile
                label="Foto"
                accept="image/*"
                v-model="articulo.foto_path"
                @handleFile="(file, blob) => ((articulo.archivo = file), (modal.blob = blob))"
                @deleteFile="((articulo.archivo = null), (modal.blob = null))"
                style="grid-column: 1/3"
            />

            <JdSwitch
                label="Es producto transformado?"
                v-model="articulo.has_receta"
                style="grid-column: 1/3"
                v-if="articulo.tipo == 2"
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
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdSelect, JdSwitch, JdInputFile } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, post, patch, get } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        JdSelect,
        JdInputFile,
        JdSwitch,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        urls,
        modal: {},
        articulo: {},

        buttons: [
            { text: 'Grabar', action: 'crear', spin: false },
            { text: 'Actualizar', action: 'modificar', spin: false },
        ],
    }),
    async created() {
        this.modal = this.useModals.mArticulo
        this.articulo = this.useModals.mArticulo.item

        this.showButtons()

        this.loadDatosSistema()
        await this.loadCategorias()
        this.loadProduccionAreas()
    },
    methods: {
        showButtons() {
            if (this.useModals.mArticulo.mode == 1) {
                this.buttons[0].show = true
            } else {
                this.buttons[1].show = true
            }
        },

        checkDatos() {
            const props = ['tipo', 'categoria', 'nombre', 'unidad', 'igv_afectacion']

            if (this.articulo.tipo == 2) props.push('produccion_area', 'has_receta', 'precio_venta')

            if (incompleteData(this.articulo, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            return false
        },
        shapeDatos() {
            if (this.articulo.archivo) this.articulo.formData = true
        },
        async crear() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Creando...')
            const res = await post(urls.articulos, this.articulo)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.addItem(
                this.articulo.tipo == 1 ? 'vInsumos' : 'vProductos',
                'articulos',
                res.data,
            )

            this.useAuth.socket.emit('mArticulo:crear')

            this.useModals.show.mArticulo = false
        },
        async modificar() {
            if (this.checkDatos()) return
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Modificando...')
            const res = await patch(urls.articulos, this.articulo)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem(
                this.articulo.tipo == 1 ? 'vInsumos' : 'vProductos',
                'articulos',
                res.data,
            )

            this.useAuth.socket.emit('mArticulo:modificar')

            this.useModals.show.mArticulo = false
        },

        async loadCategorias() {
            const qry = {
                fltr: {
                    tipo: { op: 'Es', val: this.articulo.tipo },
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
    grid-template-columns: repeat(4, 9rem);
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

@media (max-width: 540px) {
    .container-datos {
        grid-template-columns: minmax(100%, 33.5rem) !important;

        > * {
            grid-column: 1/2 !important;
        }
    }
}
</style>

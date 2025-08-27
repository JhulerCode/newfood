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
                label="Área de producción"
                :nec="true"
                v-model="articulo.produccion_area"
                :lista="modal.produccion_areas || []"
                style="grid-column: 1/4"
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

            <JdSwitch
                label="Es producto transformado?"
                v-model="articulo.has_receta"
                style="grid-column: 1/3"
                v-if="articulo.tipo == 2"
            />

            <JdSwitch label="Activo?" v-model="articulo.activo" style="grid-column: 1/3" />
        </div>
    </JdModal>
</template>

<script>
import JdModal from '@/components/JdModal.vue'
import JdInput from '@/components/inputs/JdInput.vue'
import JdSelect from '@/components/inputs/JdSelect.vue'
import JdSwitch from '@/components/inputs/JdSwitch.vue'

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
        JdSwitch,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

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
        async crear() {
            if (this.checkDatos()) return

            this.buttons[0].spin = true
            const res = await post(urls.articulos, this.articulo)
            this.buttons[0].spin = false

            if (res.code != 0) return

            this.useVistas.addItem(
                this.articulo.tipo == 1 ? 'vInsumos' : 'vProductos',
                'articulos',
                res.data,
            )
            this.useModals.show.mArticulo = false
        },
        async modificar() {
            if (this.checkDatos()) return

            this.buttons[1].spin = true
            const res = await patch(urls.articulos, this.articulo)
            this.buttons[1].spin = false

            if (res.code != 0) return

            this.useVistas.updateItem(
                this.articulo.tipo == 1 ? 'vInsumos' : 'vProductos',
                'articulos',
                res.data,
            )
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
    grid-template-columns: repeat(4, 10rem);
    gap: 0.5rem;
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

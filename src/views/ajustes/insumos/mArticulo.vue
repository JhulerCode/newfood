<template>
    <JdModal modal="mArticulo" :buttons="buttons" @button-click="(action) => this[action]()">
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

            <JdInput
                label="Código de barras"
                v-model="articulo.codigo_barra"
                style="grid-column: 1/5"
                v-if="articulo.has_variants != true"
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
                v-if="articulo.tipo == 2"
            />

            <template v-if="useAuth.verifyFeature('recetas')">
                <JdSwitch
                    label="Es producto transformado?"
                    v-model="articulo.has_receta"
                    style="grid-column: 1/3"
                    v-if="articulo.tipo == 2"
                />
            </template>

            <JdSwitch label="Activo?" v-model="articulo.activo" style="grid-column: 1/3" />

            <JdSwitch
                label="¿Tiene variantes?"
                v-model="articulo.has_variants"
                @update:modelValue="toggleVariants"
                style="grid-column: 1/3"
            />

            <div
                style="grid-column: 4/5; grid-row: 5/9"
                v-if="articulo.archivo || articulo.foto_url"
                class="producto-foto"
            >
                <img :src="modal.blob" :alt="articulo.nombre" v-if="articulo.archivo" />
                <img :src="articulo.foto_url" :alt="articulo.nombre" v-else />
            </div>
        </div>

        <section class="variants" v-if="articulo.has_variants == true">
            <div class="variants-head">
                <div>
                    <strong>Variantes</strong>
                    <small>La primera variante conserva la identidad original del producto.</small>
                </div>

                <JdButton
                    text="Agregar variante"
                    icon="fa-solid fa-plus"
                    tipo="2"
                    @click="addVariant"
                />
            </div>

            <p class="variants-empty" v-if="articulo.articulo_variants.length == 0">
                Aún no se agregaron variantes. Use “Agregar variante” para registrar la primera.
            </p>

            <div class="variants-grid" v-if="articulo.articulo_variants.length > 0">
                <div
                    class="variant-card"
                    v-for="(variant, index) in articulo.articulo_variants"
                    :key="variant.id || index"
                >
                    <div class="variant-title">
                        <strong>Variante {{ index + 1 }}</strong>
                        <small v-if="isOriginalVariant(variant, index)">Original</small>

                        <div class="variant-actions">
                            <JdButton
                                v-if="
                                    articulo.id &&
                                    variant.id &&
                                    !String(variant.id).startsWith('new-') &&
                                    useAuth.verifyPermiso('vSucursales:editar')
                                "
                                :small="true"
                                tipo="2"
                                icon="fa-solid fa-store"
                                title="Disponibilidad por sucursal"
                                @click="openVariantBranches(variant)"
                            />

                            <JdButton
                                v-if="
                                    articulo.tipo == 2 &&
                                    articulo.has_receta == true &&
                                    useAuth.verifyFeature('recetas') &&
                                    isPersistedVariant(variant)
                                "
                                :small="true"
                                tipo="2"
                                icon="fa-solid fa-flask"
                                title="Configurar receta"
                                @click="openVariantRecipe(variant)"
                                :disabled="!useAuth.verifyPermiso('vProductos:listarReceta')"
                            />

                            <JdButton
                                v-if="!isOriginalVariant(variant, index)"
                                :small="true"
                                tipo="2"
                                icon="fa-solid fa-trash-can"
                                title="Eliminar variante"
                                @click="removeVariant(index)"
                            />
                        </div>
                    </div>

                    <div class="variant-fields">
                        <JdInput label="Nombre" :nec="true" v-model="variant.nombre" />
                        <JdInput label="Código de barras" v-model="variant.codigo_barras" />
                        <JdInput
                            v-if="articulo.tipo == 2"
                            label="Precio propio"
                            placeholder="vacío = precio principal"
                            type="number"
                            v-model="variant.price"
                        />
                        <JdSwitch label="Activo" v-model="variant.activo" />
                    </div>
                </div>
            </div>
        </section>
    </JdModal>

    <mArticuloCategoria
        @created="setCategoriaCreada"
        v-if="useModals.show.mArticuloCategoria"
    />
    <mArticuloReceta v-if="useModals.show.mArticuloReceta" />
</template>

<script>
import { JdModal, JdInput, JdSelect, JdSwitch, JdInputFile, JdButton } from '@jhuler/components'

import mArticuloCategoria from '@/views/ajustes/categorias/mArticuloCategoria.vue'
import mArticuloReceta from '@/views/ajustes/productos/mArticuloReceta.vue'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, post, patch, get } from '@/utils/crud'
import { incompleteData, genId } from '@/utils/mine'
import { jqst, jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        JdSelect,
        JdInputFile,
        JdSwitch,
        JdButton,
        mArticuloCategoria,
        mArticuloReceta,
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
        this.initVariants()

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

            if (this.useAuth.verifyFeature('recetas')) {
                if (this.articulo.tipo == 2) props.push('has_receta')
            }

            if (this.articulo.tipo == 2) props.push('precio_venta')

            if (incompleteData(this.articulo, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            if (this.checkVariants()) return true

            return false
        },
        shapeDatos() {
            if (this.articulo.has_variants != true) {
                this.articulo.has_variants = false
            }

            if (this.articulo.archivo) this.articulo.formData = true
        },
        initVariants() {
            this.articulo.has_variants = this.articulo.has_variants == true

            if (!Array.isArray(this.articulo.articulo_variants)) {
                this.articulo.articulo_variants = []
            }

            const defaultIndex = this.articulo.articulo_variants.findIndex(
                (variant) =>
                    variant.is_default == true || (variant.id && variant.id == this.articulo.id),
            )

            if (defaultIndex > 0) {
                const [defaultVariant] = this.articulo.articulo_variants.splice(defaultIndex, 1)
                this.articulo.articulo_variants.unshift(defaultVariant)
            }
        },
        newVariant(isDefault = false) {
            return {
                id: isDefault ? this.articulo.id || null : `new-${genId()}`,
                is_default: isDefault,
                nombre: null,
                sku: null,
                codigo_barras: null,
                price: null,
                activo: true,
            }
        },
        async toggleVariants(value) {
            this.articulo.has_variants = value == true
            if (!this.articulo.has_variants) {
                if (this.articulo.articulo_variants.length > 0) {
                    const result = await jqst(
                        'Al actualizar se conservará solo la variante técnica y se eliminarán los datos de las variantes visibles. ¿Desea continuar?',
                    )

                    if (result.isConfirmed == false) {
                        this.articulo.has_variants = true
                        return
                    }
                }

                const defaultVariant = this.articulo.articulo_variants[0]
                if (!defaultVariant) return

                this.articulo.codigo_barra = defaultVariant.codigo_barras || null

                if (
                    this.articulo.tipo == 2 &&
                    defaultVariant?.price !== null &&
                    defaultVariant?.price !== undefined &&
                    defaultVariant?.price !== ''
                ) {
                    this.articulo.precio_venta = defaultVariant.price
                }

                return
            }
        },
        addVariant() {
            const isDefault = this.articulo.articulo_variants.length == 0
            this.articulo.articulo_variants.push(this.newVariant(isDefault))
        },
        removeVariant(index) {
            const variant = this.articulo.articulo_variants[index]
            if (this.isOriginalVariant(variant, index)) {
                return jmsg('warning', 'La variante original no se puede eliminar')
            }

            this.articulo.articulo_variants.splice(index, 1)
        },
        isOriginalVariant(variant, index) {
            return (
                variant?.is_default == true ||
                (variant?.id && variant.id == this.articulo.id) ||
                (!this.articulo.id && index == 0)
            )
        },
        isPersistedVariant(variant) {
            return Boolean(
                this.articulo.id &&
                    variant?.id &&
                    !String(variant.id).startsWith('new-'),
            )
        },
        openVariantRecipe(variant) {
            if (!this.isPersistedVariant(variant)) return

            const send = {
                id: this.articulo.id,
                articulo_principal: this.articulo.id,
                articulo_principal_variant: variant.id,
            }
            const variantName = variant.nombre
                ? `${this.articulo.nombre} / ${variant.nombre}`
                : this.articulo.nombre

            this.useModals.setModal(
                'mArticuloReceta',
                `Receta - ${variantName}`,
                null,
                send,
            )
        },
        openVariantBranches(variant) {
            const send = {
                item: variant,
                url: 'sucursal_articulo_variants',
                column: 'articulo_variant',
            }
            const name = variant.nombre || this.articulo.nombre

            this.useModals.setModal('mRelacionadoSucursales', `${name} - sucursales`, 2, send, true)
        },
        checkVariants() {
            if (this.articulo.has_variants != true) return false

            const variants = this.articulo.articulo_variants || []
            if (variants.length == 0) {
                jmsg('warning', 'Agregue al menos una variante')
                return true
            }

            if (variants.some((variant) => !variant.nombre?.trim())) {
                jmsg('warning', 'Ingrese el nombre de todas las variantes')
                return true
            }

            if (
                variants.some(
                    (variant) =>
                        variant.price !== null &&
                        variant.price !== undefined &&
                        variant.price !== '' &&
                        (!Number.isFinite(Number(variant.price)) || Number(variant.price) < 0),
                )
            ) {
                jmsg('warning', 'Ingrese un precio válido para las variantes')
                return true
            }

            for (const [prop, label] of [
                ['nombre', 'nombre'],
                ['sku', 'SKU'],
                ['codigo_barras', 'código de barras'],
            ]) {
                const values = variants
                    .map((variant) => variant[prop]?.toString().trim().toLocaleLowerCase())
                    .filter(Boolean)

                if (new Set(values).size != values.length) {
                    jmsg('warning', `No se puede repetir el ${label} de una variante`)
                    return true
                }
            }

            return false
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
            this.$emit('created', res.data)
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
                    tipo: this.articulo.tipo,
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

.variants {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: var(--border);

    .variants-head,
    .variant-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }

    .variants-head > div,
    .variant-title {
        small {
            display: block;
            color: var(--text-color2);
        }
    }

    .variants-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.75rem;
        margin-top: 0.75rem;
    }

    .variant-card {
        min-width: 0;
        padding: 0.75rem;
        border: var(--border);
        border-radius: 0.5rem;
    }

    .variants-empty {
        margin: 0.75rem 0 0;
        padding: 0.75rem;
        border: var(--border);
        border-radius: 0.5rem;
        color: var(--text-color2);
    }

    .variant-title {
        margin-bottom: 0.75rem;

        small {
            margin-right: auto;
        }
    }

    .variant-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-left: auto;
    }

    .variant-fields {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.5rem;
    }

}

@media (max-width: 540px) {
    .container-datos {
        grid-template-columns: minmax(100%, 33.5rem) !important;

        > * {
            grid-column: 1/2 !important;
        }
    }

    .variants {
        .variants-grid {
            grid-template-columns: 1fr;
        }
    }
}
</style>

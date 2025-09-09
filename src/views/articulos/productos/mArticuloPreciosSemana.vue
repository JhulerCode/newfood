<template>
    <JdModal
        modal="mArticuloPreciosSemana"
        :buttons="buttons"
        @button-click="(action) => this[action]()"
    >
        <p class="mrg-btm1">Precio estandar: S/{{ articulo.precio_venta }}</p>

        <JdTable
            :columns="columns"
            :datos="articulo.precios_semana || []"
            :seeker="false"
            :download="false"
            @onChange="runMethod"
        >
        </JdTable>
    </JdModal>
</template>

<script>
import { JdModal, JdTable } from 'jd-components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, patch } from '@/utils/crud'
import { getItemFromArray } from '@/utils/mine'
// import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdTable,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),
        getItemFromArray,

        modal: {},

        columns: [
            {
                id: 'dia',
                title: 'Día',
                width: '10rem',
                show: true,
            },
            // {
            //     id: 'descuento_tipo',
            //     title: 'Tipo',
            //     input: true,
            //     type: 'select',
            //     onchange: 'setDescuentoTipo',
            //     mostrar: 'codigo',
            //     width: '6rem',
            //     show: true,
            // },
            {
                id: 'pu',
                title: 'Precio unitario',
                input: true,
                type: 'number',
                width: '6rem',
                show: true,
            },
        ],

        descuento_tipos: [
            { id: 1, nombre: 'MONTO', codigo: 'M' },
            { id: 2, nombre: 'PORCENTAJE', codigo: '%' },
        ],

        buttons: [{ text: 'Actualizar', action: 'modificar', show: true }],
    }),
    created() {
        this.modal = this.useModals.mArticuloPreciosSemana
        this.articulo = this.modal.item

        this.columns[1].list = this.descuento_tipos
    },
    methods: {
        runMethod(method, item) {
            this[method](item)
        },
        setDescuentoTipo(item) {
            item.descuento_valor = null
        },
        shapeDatos() {
            for (const a of this.articulo.precios_semana) {
                if (a.pu == '') a.pu = null
            }

            this.articulo.patch_mode = 1
        },
        async modificar() {
            this.shapeDatos()

            this.useAuth.setLoading(true, 'Modificando...')
            const res = await patch(urls.articulos, this.articulo)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useModals.show.mArticuloPreciosSemana = false
        },
    },
}
</script>

<style lang="scss" scoped></style>

<template>
    <div class="vista vista-fill">
        <div class="head">
            <strong>Caja resumen</strong>

            <div class="buttons">
                <JdButton
                    text="Recuperar guardado"
                    tipo="2"
                    @click="recuperarGuardado()"
                    v-if="useAuth.avances.mCompra && useAuth.verifyPermiso('vCajaResumen:crear')"
                />

                <JdButton
                    text="Aperturar caja"
                    @click="aperturar()"
                    v-if="useAuth.verifyPermiso('vCajaResumen:aperturar') && vista.caja_apertura == null"
                />

                <JdButton
                    text="Cerrar caja"
                    @click="cerrar()"
                    v-if="useAuth.verifyPermiso('vCajaResumen:cerrar') && vista.caja_apertura != null"
                />
            </div>
        </div>

        <div>
            <div>{{ vista.caja_apertura }}</div>
        </div>
    </div>

    <mCajaAperturar v-if="useModals.show.mCajaAperturar" />
</template>

<script>
import JdButton from '@/components/inputs/JdButton.vue'
import mCajaAperturar from './mCajaAperturar.vue'

import { useAuth } from '@/pinia/auth'
import { useVistas } from '@/pinia/vistas'
import { useModals } from '@/pinia/modals'

import { urls, get } from '@/utils/crud'

import dayjs from 'dayjs'

export default {
    components: {
        JdButton,
        mCajaAperturar,
    },
    data: () => ({
        useAuth: useAuth(),
        useVistas: useVistas(),
        useModals: useModals(),
    }),
    async created() {
        this.vista = this.useVistas.vCajaResumen

        if (this.vista.loaded) return
        if (this.useAuth.verifyPermiso('vCajaResumen:ver') == true) this.loadCajaApertura()
    },
    methods: {
        async loadCajaApertura() {
            const qry = {
                fltr: { estado: { op: 'Es', val: '1' } },
                cols: ['fecha_apertura', 'monto_apertura'],
            }

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await get(`${urls.caja_aperturas}?qry=${JSON.stringify(qry)}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.vista.caja_apertura = res.data[0]
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
            }
            this.useModals.setModal('mCajaAperturar', 'Cerrar caja', 2, send)
        },
    },
}
</script>

<style lang="scss"></style>

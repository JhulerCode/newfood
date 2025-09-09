<template>
    <JdModal modal="mMesasUnir" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="body">
            <ul class="salones" v-if="vista">
                <li v-for="(a, i) in vista.salones || []" :key="i" class="salon">
                    <div class="salon-head">
                        <span>{{ a.nombre }}</span>
                    </div>

                    <ul class="mesas">
                        <li
                            v-for="(b, j) in a.mesas
                                .filter((a) => a.unida == false)
                                .sort((a, b) => a.nombre.localeCompare(b.nombre)) || []"
                            :key="j"
                            class="mesa"
                            :class="{ 'mesa-ocupada': b.pedido }"
                            @click="agregar(a, b)"
                        >
                            <p class="mesa-nombre">
                                <span>{{ b.nombre }}</span>
                                <template v-if="b.unidos && b.unidos.length > 0">
                                    <span v-for="(c, k) in b.unidos || []" :key="k"
                                        >, {{ c.nombre }}</span
                                    >
                                </template>
                            </p>
                        </li>
                    </ul>
                </li>
            </ul>

            <div class="mesas-unir">
                <p class="mrg-btm1">
                    <strong>Listado de mesas a unir</strong>
                </p>

                <small v-if="mesasUnir.length == 0">Aun no ha seleccionado ninguna mesa</small>

                <ul v-else>
                    <li v-for="(a, i) in mesasUnir" :key="i" class="mesa">
                        <JdButton
                            :small="true"
                            icon="fa-solid fa-trash-can"
                            title="Quitar"
                            backColor="rojo"
                            color="text-color3"
                            @click="remove(i)"
                        />

                        <p>
                            {{ a.nombre }}
                            <small>{{ a.ambienteNombre }}</small>
                        </p>

                        <JdCheckBox v-model="a.principal" @change="setPrincipal(a)" />
                    </li>
                </ul>
            </div>
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdButton, JdCheckBox } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, post } from '@/utils/crud'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdButton,
        JdCheckBox,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        vista: null,
        mesasUnir: [],

        buttons: [
            {
                text: 'Unir mesas',
                action: 'unirMesas',
                spin: false,
                show: true,
                backColor: 'primary-color',
                color: 'text-color3',
            },
        ],
    }),
    created() {
        this.vista = this.useVistas.vPedidos
    },
    methods: {
        agregar(salon, mesa) {
            const i = this.mesasUnir.findIndex((a) => a.id == mesa.id)
            if (i !== -1) return

            const send = {
                id: mesa.id,
                nombre: mesa.nombre,
                salon: salon.id,
                ambienteNombre: salon.nombre,
                principal: this.mesasUnir.length == 0 ? true : false,
                unidos: mesa.unidos,
                // pedido: mesa.pedido,
            }

            this.mesasUnir.push(send)
        },
        setPrincipal(item) {
            if (item.principal == true) {
                for (const a of this.mesasUnir) {
                    if (a.id == item.id) continue
                    a.principal = false
                }
            }
        },
        remove(i) {
            this.mesasUnir.splice(i, 1)
        },

        checkDatos() {
            if (this.mesasUnir.length < 2) {
                jmsg('warning', 'Agrega al menos 2 mesas')
                return true
            }

            const hayPrincipal = this.mesasUnir.some((a) => a.principal == true)
            if (!hayPrincipal) {
                jmsg('warning', 'Selecciona una mesa principal')
                return true
            }

            return false
        },
        async unirMesas() {
            if (this.checkDatos()) return

            this.useAuth.setLoading(true, 'Cargando...')
            const res = await post(`${urls.mesas}/unir`, this.mesasUnir, 'Mesas unidas con éxito')
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.$emit('mesasUnidas')
            this.useModals.show.mMesasUnir = false
        },
    },
}
</script>

<style lang="scss" scoped>
.body {
    display: grid;
    grid-template-columns: 40rem 17rem;
    gap: 1rem;
}

.salones {
    height: 70dvh;
    overflow-y: auto;
    overflow-x: hidden;

    .salon {
        margin-bottom: 2rem;

        .salon-head {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            border: var(--border);
            border-radius: 0.3rem;
            background-color: var(--bg-color2);
            padding: 0.3rem 0.5rem;

            span {
                font-size: 1.3rem;
            }

            div {
                display: flex;
                align-items: center;
                padding: 0.2rem 0.5rem;
                font-size: 0.8rem;
                background-color: var(--celeste);
                border-radius: 0.7rem;
                color: white;
            }
        }

        .mesas {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            padding: 1rem;

            .mesa {
                width: 7rem;
                height: 7rem;
                border-radius: 0.5rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 0.3rem;
                background-color: var(--verde);
                cursor: pointer;
                padding: 0.3rem;
                text-align: center;

                * {
                    color: white;
                }
            }

            .mesa-ocupada {
                background-color: var(--rojo);
            }
        }
    }
}

.mesas-unir {
    width: 100%;
    padding: 0.5rem;
    background-color: var(--bg-color2);
    border-radius: 0.3rem;

    .mesa {
        padding: 0.5rem;
        border-radius: 0.3rem;
        display: grid;
        grid-template-columns: auto 1fr auto;
        border: var(--border);
        gap: 0.5rem;
        align-items: center;
        margin-bottom: 1rem;
        background-color: var(--bg-color);
    }

    li:last-child {
        margin-bottom: 0;
    }
}

@media (max-width: 540px) {
    .body {
        grid-template-columns: minmax(100%, 33.5rem) !important;
    }

    .salones {
        height: 60dvh;

        // .salon {
        //     .mesas {
        //         gap: 1rem;
        //     }
        // }
    }
}
</style>

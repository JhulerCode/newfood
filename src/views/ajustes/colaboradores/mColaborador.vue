<template>
    <JdModal modal="mColaborador" :buttons="buttons" @button-click="(action) => this[action]()">
        <div class="container-todo">
            <div class="container-datos">
                <JdSelect
                    label="Tipo documento"
                    :nec="true"
                    v-model="colaborador.doc_tipo"
                    :lista="modal.documentos_identidad || []"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/3"
                />

                <JdInput
                    label="Nro documento"
                    :nec="true"
                    v-model="colaborador.doc_numero"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/3"
                />

                <JdButton
                    icon="fa-solid fa-magnifying-glass"
                    title="Buscar DNI"
                    tipo="2"
                    :small="true"
                    @click="loadDni"
                    style="grid-column: 3/4"
                    v-if="colaborador.doc_tipo == 1 && modal.mode != 3"
                />

                <JdInput
                    label="Nombres"
                    :nec="true"
                    v-model="colaborador.nombres"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/4"
                />

                <JdInput
                    label="Apellidos"
                    :nec="true"
                    v-model="colaborador.apellidos"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/4"
                />

                <JdInput
                    label="Fecha de nacimiento"
                    type="date"
                    v-model="colaborador.fecha_nacimiento"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/3"
                />

                <JdSelect
                    label="Sexo"
                    v-model="colaborador.sexo"
                    :lista="modal.generos || []"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/3"
                />

                <JdInput
                    label="Dirección"
                    v-model="colaborador.direccion"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/4"
                />

                <JdInput
                    label="Teléfono"
                    v-model="colaborador.telefono"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/3"
                />

                <JdSelect
                    label="Cargo"
                    :nec="true"
                    v-model="colaborador.cargo"
                    :lista="modal.colaborador_cargos || []"
                    mostrar="id"
                    :disabled="modal.mode == 3"
                    @elegir="setPermisoEstandar"
                    style="grid-column: 1/3"
                />

                <JdSwitch
                    label="Activo"
                    v-model="colaborador.activo"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/3"
                />

                <JdSwitch
                    label="Tiene usuario?"
                    v-model="colaborador.has_signin"
                    :disabled="modal.mode == 3"
                    style="grid-column: 1/3"
                />
            </div>

            <div class="right" v-if="colaborador.has_signin">
                <div class="container-accesos">
                    <JdSelect
                        label="Vista inicial"
                        :nec="true"
                        v-model="colaborador.vista_inicial"
                        :lista="vistas"
                        mostrar="label"
                        :disabled="modal.mode == 3"
                        groupBy="menu"
                    />

                    <JdInput
                        label="Usuario"
                        :nec="true"
                        v-model="colaborador.usuario"
                        :disabled="modal.mode == 3"
                    />

                    <div>
                        <JdInput
                            label="Contraseña"
                            v-model="colaborador.contrasena"
                            :disabled="modal.mode == 3"
                        />
                        <small class="fa-solid fa-triangle-exclamation"></small>
                        <small> No modificar este campo si no desea actualizar la contraseña</small>
                    </div>
                </div>

                <div class="grupos" v-if="colaborador.has_signin">
                    <div class="mrg-btm05">
                        <strong>--- Permisos ---</strong>
                    </div>

                    <div v-for="a in useAuth.menu || []" :key="a.id">
                        <div class="grupo-header" @click="toggleGrupo(a.id)">
                            {{ a.label }}

                            <span class="icono-expand">
                                <i
                                    class="fa-solid fa-caret-down"
                                    v-if="modal.grupoExpandido === a.id"
                                ></i>
                                <i class="fa-solid fa-caret-right" v-else></i>
                            </span>
                        </div>

                        <div v-if="a.children && modal.grupoExpandido === a.id">
                            <div v-for="b in a.children" :key="b.id" class="vistas">
                                <div class="vista-header" @click="toggleVista(b.goto)">
                                    {{ b.label }}

                                    <span class="icono-expand">
                                        <i
                                            class="fa-solid fa-caret-down"
                                            v-if="modal.vistaExpandida === b.goto"
                                        ></i>
                                        <i class="fa-solid fa-caret-right" v-else></i>
                                    </span>
                                </div>

                                <div
                                    class="permisos"
                                    v-if="b.permisos && modal.vistaExpandida === b.goto"
                                >
                                    <div class="permisos-acciones">
                                        <JdButton
                                            text="Sel. todo"
                                            tipo="3"
                                            @click="selectAll(b.goto)"
                                        />
                                        <JdButton
                                            text="Sel. ninguno"
                                            tipo="3"
                                            @click="selectNone(b.goto)"
                                        />
                                    </div>

                                    <JdCheckBox
                                        :label="c.label"
                                        v-model="c.val"
                                        v-for="c in b.permisos"
                                        :key="c.id"
                                        class="mrg-btm05"
                                        :disabled="modal.mode == 3"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </JdModal>
</template>

<script>
import { JdModal, JdInput, JdSwitch, JdSelect, JdCheckBox, JdButton } from '@jhuler/components'

import { useAuth } from '@/pinia/auth'
import { useModals } from '@/pinia/modals'
import { useVistas } from '@/pinia/vistas'

import { urls, get, post, patch } from '@/utils/crud'
import { incompleteData } from '@/utils/mine'
import { jmsg } from '@/utils/swal'

export default {
    components: {
        JdModal,
        JdInput,
        JdSwitch,
        JdSelect,
        JdCheckBox,
        JdButton,
    },
    data: () => ({
        useAuth: useAuth(),
        useModals: useModals(),
        useVistas: useVistas(),

        modal: {},
        colaborador: {},

        buttons: [
            { text: 'Grabar', action: 'crear', spin: false, permiso: 'vColaboradores:crear' },
            {
                text: 'Actualizar',
                action: 'modificar',
                spin: false,
                permiso: 'vColaboradores:editar',
            },
        ],
    }),
    computed: {
        vistas() {
            let vistas = this.useAuth.menu
                .map((a) => a.children.map((b) => ({ id: b.goto, label: b.label, menu: a.label })))
                .flat()

            const tipo = this.useAuth.usuario.empresa?.tipo

            if (tipo === 1) {
                vistas = vistas.filter((c) => c.id !== 'vPos')
            } else {
                vistas = vistas.filter(
                    (c) =>
                        c.id !== 'vPedidos' && c.id !== 'vSalones' && c.id !== 'vProduccionAreas',
                )
            }

            return vistas
        },
    },
    created() {
        this.modal = this.useModals.mColaborador
        this.colaborador = this.useModals.mColaborador.item

        this.showButtons()
        this.loadDatosSistema()
        this.sincronizarChecksConPermisos()
    },
    methods: {
        showButtons() {
            if (this.modal.mode == 1) {
                this.buttons[0].show = true
            } else if (this.modal.mode == 2) {
                this.buttons[1].show = true
            }
        },

        checkDatos() {
            const props = [
                'nombres',
                'apellidos',
                'doc_tipo',
                'doc_numero',
                'cargo',
                'activo',
                'has_signin',
            ]

            if (this.colaborador.has_signin) props.push('vista_inicial', 'usuario', 'contrasena')

            if (incompleteData(this.colaborador, props)) {
                jmsg('warning', 'Ingrese los datos necesarios')
                return true
            }

            this.colaborador.permisos = this.recolectarPermisosSeleccionados()

            // if (this.colaborador.has_signin) {
            //     const asd = this.colaborador.permisos.includes(this.colaborador.vista_inicial)

            //     if (!asd) {
            //         jmsg('error', 'Seleccione una vista inicial que tenga permiso')
            //         return true
            //     }
            // }

            return false
        },
        // shapeDatos() {
        //     this.colaborador.permisos = this.recolectarPermisosSeleccionados()
        // },
        async crear() {
            if (this.checkDatos()) return
            // this.shapeDatos()

            this.useAuth.setLoading(true, 'Creando...')
            const res = await post(urls.colaboradores, this.colaborador)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.addItem('vColaboradores', 'colaboradores', res.data)

            this.useModals.show.mColaborador = false
        },
        async modificar() {
            if (this.checkDatos()) return
            // this.shapeDatos()

            this.useAuth.setLoading(true, 'Actualizando...')
            const res = await patch(urls.colaboradores, this.colaborador)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.useVistas.updateItem('vColaboradores', 'colaboradores', res.data)

            if (this.useAuth.usuario.colaborador == this.colaborador.id) {
                this.useAuth.usuario.permisos = this.colaborador.permisos
            }
            this.useModals.show.mColaborador = false
        },

        async loadDatosSistema() {
            const qry = ['generos', 'documentos_identidad', 'colaborador_cargos']
            const res = await get(`${urls.sistema}?qry=${JSON.stringify(qry)}`)

            if (res.code != 0) return

            Object.assign(this.modal, res.data)
        },
        async loadDni() {
            if (!this.colaborador.doc_numero || this.colaborador.doc_numero.length != 8) {
                jmsg('warning', 'Ingrese un DNI válido')
                return
            }

            this.useAuth.setLoading(true, 'Buscando...')
            const res = await get(`${urls.decolecta}/dni/${this.colaborador.doc_numero}`)
            this.useAuth.setLoading(false)

            if (res.code != 0) return

            this.colaborador.nombres = res.data.first_name
            this.colaborador.apellidos = `${res.data.first_last_name} ${res.data.second_last_name}`
        },

        sincronizarChecksConPermisos() {
            const permisos = this.colaborador.permisos || []

            for (const a of this.useAuth.menu) {
                if (a.children) {
                    for (const b of a.children) {
                        if (b.permisos) {
                            for (const c of b.permisos) {
                                c.val = permisos.includes(c.id)
                            }
                        }
                    }
                }
            }
        },
        recolectarPermisosSeleccionados() {
            const permisos = []

            for (const a of this.useAuth.menu) {
                if (a.children) {
                    for (const b of a.children) {
                        if (b.permisos) {
                            for (const c of b.permisos) {
                                if (c.val) permisos.push(c.id)
                            }
                        }
                    }
                }
            }
            return permisos
        },
        toggleGrupo(id) {
            this.modal.grupoExpandido = this.modal.grupoExpandido === id ? null : id
        },
        toggleVista(id) {
            this.modal.vistaExpandida = this.modal.vistaExpandida === id ? null : id
        },

        selectAll(id) {
            for (const a of this.useAuth.menu) {
                if (a.children) {
                    for (const b of a.children) {
                        if (b.goto == id) {
                            for (const c of b.permisos) {
                                c.val = true
                            }
                        }
                    }
                }
            }
        },
        selectNone(id) {
            for (const a of this.useAuth.menu) {
                if (a.children) {
                    for (const b of a.children) {
                        if (b.goto == id) {
                            for (const c of b.permisos) {
                                c.val = false
                            }
                        }
                    }
                }
            }
        },

        setPermisoEstandar() {
            // if (this.colaborador.id != null && this.colaborador.permisos.lenght > 0) return

            const permisos = {
                ADMINISTRADOR: [],
                CAJERO: [
                    'vClientes:listar',
                    'vClientes:crear',
                    'vClientes:ver',
                    'vClientes:editar',

                    'vPedidos:listar',
                    'vPedidos:crear',
                    'vPedidos:ver',
                    'vPedidos:addProductos',
                    'vPedidos:editarDetalles',
                    'vPedidos:imprimirComanda',
                    'vPedidos:imprimirPrecuenta',
                    'vPedidos:generarComprobante',
                    'vPedidos:verComprobantes',
                    'vPedidos:entregar',
                    'vPedidos:unirMesas',
                    'vPedidos:cambiarMesa',

                    'vCajaResumen:ver',
                    'vCajaResumen:aperturar',
                    'vCajaResumen:cerrar',

                    'vCajaMovimientos:listar',
                    'vCajaMovimientos:crear',
                    'vCajaMovimientos:editar',
                    'vCajaMovimientos:eliminar',

                    'vReporteComprobantes:listar',
                    'vReporteComprobantes:anular',
                    'vReporteComprobantes:canjear',
                    'vReporteComprobantes:verPagos',
                    'vReporteComprobantes:agregarPagos',
                    'vReporteComprobantes:editarPagos',
                    'vReporteComprobantes:enviarCorreo',
                    'vReporteComprobantes:imprimir',
                    'vReporteComprobantes:descargarPdf',
                ],
                MOZO: [
                    'vPedidos:listar',
                    'vPedidos:crear',
                    'vPedidos:ver',
                    'vPedidos:addProductos',
                    'vPedidos:editarDetalles',
                    'vPedidos:imprimirComanda',
                    'vPedidos:imprimirPrecuenta',
                    'vPedidos:unirMesas',
                    'vPedidos:cambiarMesa',
                ],
                CONTADOR: [
                    'vReporteComprobantes:listar',
                    'vReporteComprobantes:descargarPdf',
                    'vReporteComprobantes:descargarXml',
                    'vReporteComprobantes:descargarCdr',
                    'vReporteComprobantes:consultarEstado',
                ],
                REPARTIDOR: [''],
            }

            if (this.colaborador.cargo == 'ADMINISTRADOR') {
                for (const a of this.useAuth.menu) {
                    for (const b of a.children) {
                        for (const c of b.permisos) {
                            c.val = true
                        }
                    }
                }
                return
            }

            this.colaborador.permisos = permisos[this.colaborador.cargo]
            this.sincronizarChecksConPermisos()
        },
    },
}
</script>

<style lang="scss" scoped>
.container-todo {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem 3rem;
}

.container-datos {
    display: grid;
    grid-template-columns: repeat(3, 10rem);
    gap: 0.5rem;
    height: fit-content;
}

.right {
    .container-accesos {
        display: grid;
        grid-template-columns: 20rem;
        gap: 0.5rem;
        margin-bottom: 2rem;
    }

    .grupos {
        .grupo-header {
            cursor: pointer;
            background: var(--bg-color2);
            padding: 0.5rem 1rem;
            border-radius: 0.3rem;
            margin-bottom: 0.2rem;
            user-select: none;

            .icono-expand {
                float: right;
            }
        }

        .vistas {
            margin-left: 1rem;
            margin-right: 1rem;

            .vista-header {
                cursor: pointer;
                border-bottom: var(--border);
                padding: 0.3rem 0.3rem;
                margin-bottom: 0.2rem;
                user-select: none;

                .icono-expand {
                    float: right;
                }
            }

            .permisos {
                margin-left: 1rem;

                .permisos-acciones {
                    display: flex;
                    margin-bottom: 0.25rem;
                }
            }
        }
    }
}

@media (max-width: 540px) {
    .container-datos,
    .right .container-accesos {
        grid-template-columns: minmax(100%, 33.5rem) !important;

        > * {
            grid-column: 1/2 !important;
        }
    }
}
</style>

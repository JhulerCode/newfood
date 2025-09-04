import { defineStore } from "pinia"

export const useVistas = defineStore('vistas', {
    state: () => ({
        show: {},
        pestanas: [],
    }),
    actions: {
        initVars() {
            this.show = {}
            this.pestanas = []
        },

        async showVista(goto, label, variables) {
            for (let a in this.show) this.show[a] = false
            this.addPestana(goto, label)

            if (this[goto] == undefined) {
                this[goto] = {
                    loaded: false,
                }
            }
            else {
                if (label != undefined) {
                    const i = this.pestanas.findIndex(a => a.goto == goto)
                    this.pestanas[i].label = label
                }
            }

            if (variables) {
                Object.assign(this[goto], variables)
            }

            this.show[goto] = true
        },
        addPestana(goto, label) {
            if (goto == 'vHome') return

            if (this.pestanas.some(a => a.goto === goto)) return

            this.pestanas.push({ label, goto })
        },
        closePestana(goto, redirect) {
            const i = this.pestanas.findIndex(a => a.goto == goto)

            if (redirect !== undefined) {
                this.show[redirect] = true
            }
            else if (this.pestanas.length == 1) {
                this.show.vHome = true
            }
            else {
                if (this.show[goto] == true) {
                    const asd = i == 0 ? this.pestanas[i + 1].goto : this.pestanas[i - 1].goto
                    this.show[asd] = true
                }
            }

            this.pestanas.splice(i, 1)
            this.show[goto] = false
            delete this[goto]
        },

        addItem(goto, array, item, where = 'last') {
            if (!this[goto]) return
            if (!this[goto][array]) return

            if (where == 'last') {
                this[goto][array].push(item)
            } else {
                this[goto][array].unshift(item)
            }
        },
        removeItem(goto, array, item) {
            if (!this[goto]) return
            if (!this[goto][array]) return

            const i = this[goto][array].findIndex(a => a.id == item.id)
            this[goto][array].splice(i, 1)
        },
        updateItem(goto, array, item) {
            if (!this[goto]) return
            if (!this[goto][array]) return

            const i = this[goto][array].findIndex(a => a.id == item.id)
            this[goto][array].splice(i, 1, item)
        }
    },
})

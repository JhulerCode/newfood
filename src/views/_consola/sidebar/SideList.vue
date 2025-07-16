<template>
    <div class="SideList">
        <!-- Si va de frente a una vista -->
        <div v-if="goto" class="option" :class="{ 'active': useVistas.show[goto] }"
            :style="{ marginLeft: depth * 1 + 'rem' }" @click="useVistas.showVista(goto, label)">

            <div class="left" :class="{ 'has-icon': icon }">
                <i v-if="icon" :class=icon></i>
                <span>{{ label }}</span>
            </div>
        </div>

        <!-- Si tiene hijos -->
        <div v-else class="option" :class="{ 'active': useVistas.show[goto] }"
            :style="{ marginLeft: depth * 1 + 'rem' }" @click="this.toggleList()">

            <div class="left" :class="{ 'has-icon': icon }">
                <i v-if="icon" :class=icon></i>
                <span>{{ label }}</span>
            </div>

            <i v-if="children" :class="{ expanded: expanded }" class="fa-solid fa-angle-right"></i>
        </div>

        <div v-if="children" v-show="showChildren" :style="{ height: listHeigth }" class="items-container"
            ref="container">
            <SideList v-for="(item, index) in children" :key="index" :label="item.label" :icon="item.icon"
                :goto="item.goto" :depth="depth + 1" :children="item.children" />
        </div>
    </div>
</template>

<script>
import { useVistas } from '@/pinia/vistas.js'

export default {
    data: () => ({
        showChildren: false,
        expanded: false,
        listHeigth: '0',

        useVistas: useVistas(),
    }),
    props: {
        depth: { type: Number, required: true },
        icon: { type: String },
        label: { type: String, required: true },
        goto: { type: String },
        children: { type: Array },
    },
    methods: {
        toggleList() {
            this.expanded = !this.expanded

            if (!this.showChildren) {
                this.showChildren = true

                this.$nextTick(() => {
                    this.listHeigth = this.$refs.container.scrollHeight + 'px'

                    setTimeout(() => {
                        this.listHeigth = "fit-content"
                        this.$refs.container.style.overflow = "visible"
                    }, 300)
                })
            }
            else {
                this.listHeigth = this.$refs.container.scrollHeight + 'px'
                this.$refs.container.style.overflow = "hidden"

                setTimeout(() => {
                    this.listHeigth = 0 + "px"
                }, 10)

                setTimeout(() => {
                    this.showChildren = false
                }, 300)
            }
        },
    }
}
</script>

<style lang="scss" scoped>
.option {
    padding: 0.8rem 1rem;
    border-radius: 0.5rem;
    display: grid;
    grid-template-columns: 1fr 0.5rem;
    gap: 0.5rem;
    align-items: center;
    overflow-x: hidden;

    &:hover {
        cursor: pointer;
        background-color: var(--bg-color);

        * {
            color: var(--primary-color);
        }
    }

    .left {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.8rem;
        align-items: center;
        overflow-x: hidden;

        i {
            text-align: center;
            font-size: 1.2rem;
        }

        span {
            width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }

    .has-icon {
        grid-template-columns: 1.2rem 1fr;
    }

    .expanded {
        transform: rotate(90deg);
    }
}

.active {
    background-color: var(--bg-color);

    * {
        color: var(--primary-color) !important;
    }
}

.items-container {
    overflow: hidden;
    transition: all 0.2s ease;
}
</style>
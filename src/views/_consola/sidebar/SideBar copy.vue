<template>
    <div class="side-bar" :class="`${useAuth.showNavbar ? 'visible' : 'no-visible'}`">
        <aside ref="aside">
            <SideList v-for="(a, i) in menu" :key="i" :label="a.label" :icon="a.icon" :goto="a.goto" :depth="0"
                :children="a.children" />
        </aside>
        <!-- {{ menu }}
        {{ this.useAuth.permisos }} -->
    </div>
</template>

<script>
import { useAuth } from '@/pinia/auth'
import SideList from './SideList.vue'

export default {
    components: { SideList },
    data: () => ({
        useAuth: useAuth()
    }),
    computed: {
        menu() {
            const tienePermiso = (a) => {
                if (a.children) {
                    const hijos = a.children.filter(b => !b.goto || this.useAuth.verifyPermiso(b.goto))
                    return hijos.length > 0 ? { ...a, children: hijos } : null
                }
                
                return !a.goto || this.useAuth.verifyPermiso(a.goto) ? a : null
            }
            
            return this.useAuth.menu.map(tienePermiso).filter(Boolean)
        }
    },
    methods: {
    },
    created() {
        // console.log(this.useAuth.permisos)
    }
}
</script>

<style lang="scss" scoped>
.side-bar {
    height: 100%;
    overflow-y: auto;
    transition: width 0.3s linear;
    margin-right: 1rem;

    &::-webkit-scrollbar {
		width: 0rem;
		height: 0rem;
	}

    * {
        color: var(--text-color2);
    }

    .top {
        display: flex;
        justify-content: center;
        padding: 1rem;

        img {
            max-width: 70%;
            max-height: 4rem;
        }
    }

    aside {
        overflow-x: hidden;
    }
}

.visible {
    width: 15rem;
    // transform: translateX(0);
}

.no-visible {
    width: 0rem;
    margin-right: 0;
    // transform: translateX(-5rem);
}
</style>
<template>
    <main class="signin">
        <div class="particles"></div>
        <div class="center">
            <SignInLeft />
            <SignInRight />
        </div>
    </main>
</template>

<script>
import SignInLeft from './SignInLeft.vue'
import SignInRight from './SignInRight.vue'

import { useAuth } from '@/pinia/auth'

export default {
    components: {
        SignInLeft,
        SignInRight,
    },
    data: () => ({
        useAuth: useAuth(),
    }),
    created() {
        if (this.useAuth.isDarkMode) {
            document.body.classList.add('dark-mode')
        }
    },
    mounted() {
        this.generateParticles()
    },
    methods: {
        generateParticles() {
            const particleContainer = this.$el.querySelector('.particles')

            const createParticle = () => {
                const particle = document.createElement('div')
                particle.className = 'particle'

                const randomX = Math.random() * 100 // % de ancho
                const randomY = Math.random() * 100 // % de altura
                const randomDX = (Math.random() - 0.5) * 2 // Desplazamiento horizontal
                const randomDY = (Math.random() - 0.5) * 2 // Desplazamiento vertical
                const duration = Math.random() * 3 + 3 // Entre 3s y 6s

                particle.style.left = `${randomX}%`
                particle.style.top = `${randomY}%`
                particle.style.setProperty('--dx', randomDX)
                particle.style.setProperty('--dy', randomDY)
                particle.style.animationDuration = `${duration}s`

                particleContainer.appendChild(particle)

                setTimeout(() => {
                    particle.remove()
                }, duration * 1000)
            }

            setInterval(createParticle, 300)
        },
    },
}
</script>

<style lang="scss" scoped>
.signin {
    height: 100dvh;
    width: 100vw;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--bg-color2);
    // background: linear-gradient(135deg, #0f4c75, #2492c2);
}

.particles {
    position: relative;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
    border-radius: 1rem;

    ::v-deep(.particle) {
        position: absolute;
        width: 0.7rem;
        height: 0.7rem;
        background-color: var(--primary-color);
        // background-color: rgba($color: #ffffff, $alpha: 0.9);
        border-radius: 50%;
        opacity: 0.8;
        animation: particleAnimation 6s linear infinite;
    }
}

.center {
    position: absolute;
    display: flex;
    border-radius: 2rem;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    max-width: 90%;
}

@keyframes particleAnimation {
    0% {
        opacity: 1;
        transform: scale(1) translate3d(0, 0, 0);
    }

    100% {
        opacity: 0;
        transform: scale(1.5) translate3d(5rem, 10rem, 0);
    }
}

@media (max-width: 900px) {
    .left {
        display: none !important;
    }

    .right {
        border-radius: 2rem;
    }
}
</style>

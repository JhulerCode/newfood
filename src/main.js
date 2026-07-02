import '@/assets/base.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

async function limpiarPWAAntigua() {
    const claveLimpieza = 'pwa_cleanup_v1'

    // Evita ejecutar la limpieza en cada recarga
    if (localStorage.getItem(claveLimpieza)) {
        return
    }

    try {
        // 1. Eliminar Service Workers antiguos
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations()

            for (const registration of registrations) {
                await registration.unregister()
            }
        }

        // 2. Eliminar Cache Storage antiguo
        if ('caches' in window) {
            const cacheNames = await caches.keys()

            for (const cacheName of cacheNames) {
                await caches.delete(cacheName)
            }
        }

        localStorage.setItem(claveLimpieza, 'true')

        // 4. Recargar una sola vez para asegurar que ya no use archivos cacheados
        window.location.reload()
    } catch (error) {
        console.error('Error limpiando datos antiguos de PWA:', error)
        localStorage.setItem(claveLimpieza, 'true')
    }
}

limpiarPWAAntigua().finally(() => {
    createApp(App).use(router).use(createPinia().use(piniaPluginPersistedstate)).mount('#app')
})

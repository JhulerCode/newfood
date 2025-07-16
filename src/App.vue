<script setup>
import LoadingSpin from '@/components/LoadingSpin.vue'

import { onMounted } from 'vue'

import { useAuth } from '@/pinia/auth'
// import { useMo}

const auth = useAuth()

onMounted(() => {
	if (auth.isDarkMode) {
		document.body.classList.add('dark-mode')
	}
})
</script>

<template>
	<RouterView />

	<LoadingSpin v-if="auth.loading.show" :text="auth.loading.text" scale="1.5" style="z-index: 3" />
</template>

<style scoped></style>

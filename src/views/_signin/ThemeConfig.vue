<script setup>
import iMoon from '@/components/icons/iMoon.vue'
import iSun from '@/components/icons/iSun.vue'

import { useAuth } from '@/pinia/auth'

const auth = useAuth()

function darkLigthMode() {
	document.body.classList.toggle('dark-mode')
	auth.isDarkMode = document.body.classList.contains('dark-mode')
}

defineProps({
	backGround: { type: String, default: 1 },
})
</script>

<template>
	<div class="btn" :class="{ 'bg-color2': backGround == 2 }" @click="darkLigthMode"
		:title="`Modo ${!auth.isDarkMode ? 'oscuro' : 'claro'}`">
		<iSun v-if="auth.isDarkMode" height="1.2rem" width="1.2rem" />
		<iMoon v-else height="1.2rem" width="1.2rem" />
	</div>
</template>

<style lang="scss" scoped>
.btn {
	width: 2.5rem;
	height: 2.5rem;
	border-radius: 50%;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;

	&:hover {
		background-color: var(--bg-color2);
	}
}

.bg-color2 {
	&:hover {
		background-color: var(--bg-color) !important;
	}
}
</style>
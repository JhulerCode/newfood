<script setup>
import iScreenLarge from '@/components/icons/iScreenLarge.vue'

import { useAuth } from '@/pinia/auth'

const auth = useAuth()

function fullScreen() {
	// Alterna el modo pantalla completa
	const doc = window.document
	const docEl = doc.documentElement

	const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullscreen || docEl.msRequestFullscreen
	const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen

	if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
		requestFullScreen.call(docEl)
	} else {
		cancelFullScreen.call(doc)
	}
}
</script>

<template>
	<div class="btn" @click="fullScreen" :title="`Modo ${!auth.isDarkMode ? 'oscuro' : 'claro'}`">
		<!-- <iScreenSmall v-if="auth.isDarkMode" height="1.2rem" width="1.2rem" /> -->
		<iScreenLarge height="1.2rem" width="1.2rem" />
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
		background-color: var(--bg-color);
	}
}
</style>
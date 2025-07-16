<template>
	<div class="left">
		<div class="particles">
			<div class="branding-info">
				<h2>Gestión Integral Empresarial</h2>

				<p class="slogan">Soluciones para cada etapa de tu operación</p>

				<!-- <ul class="areas">
						<li>
							<span class="icon">🚚</span>
							<span><strong>Logística de Entrada</strong><br><small>Recepción y control eficiente de insumos y
									materiales.</small></span>
						</li>
						<li>
							<span class="icon">🏭</span>
							<span><strong>Producción</strong><br><small>Planificación, seguimiento y control de
									procesos productivos.</small></span>
						</li>
						<li>
							<span class="icon">⚙️</span>
							<span><strong>Operaciones</strong><br><small>Gestión centralizada de recursos y actividades
									diarias.</small></span>
						</li>
						<li>
							<span class="icon">🧪</span>
							<span><strong>Calidad</strong><br><small>Control y aseguramiento de la calidad en cada
									etapa.</small></span>
						</li>
						<li>
							<span class="icon">🚚</span>
							<span><strong>Logística de Salida</strong><br><small>Despacho y distribución eficiente de
									productos terminados.</small></span>
						</li>
					</ul> -->
			</div>
		</div>
	</div>
</template>

<script>
export default {
	mounted() {
		this.generateParticles()
	},
	methods: {
		generateParticles() {
			const particleContainer = this.$el.querySelector(".particles");

			const createParticle = () => {
				const particle = document.createElement("div");
				particle.className = "particle";

				const randomX = Math.random() * 100; // % de ancho
				const randomY = Math.random() * 100; // % de altura
				const randomDX = (Math.random() - 0.5) * 2; // Desplazamiento horizontal
				const randomDY = (Math.random() - 0.5) * 2; // Desplazamiento vertical
				const duration = Math.random() * 3 + 3; // Entre 3s y 6s

				particle.style.left = `${randomX}%`;
				particle.style.top = `${randomY}%`;
				particle.style.setProperty("--dx", randomDX);
				particle.style.setProperty("--dy", randomDY);
				particle.style.animationDuration = `${duration}s`;

				particleContainer.appendChild(particle);

				setTimeout(() => {
					particle.remove();
				}, duration * 1000);
			};

			setInterval(createParticle, 300);
		}
	}
}
</script>

<style lang="scss" scoped>
.left {
	height: 100dvh;
	width: 65%;
	padding: 1.5rem 0 1.5rem 1.5rem;

}

.particles {
	position: relative;
	width: 100%;
	height: 100%;
	pointer-events: none;
	overflow: hidden;
	border-radius: 1rem;
	background-color: var(--bg-color2);
	// display: flex;
	// align-items: center;
	padding: 2rem;

	::v-deep(.particle) {
		position: absolute;
		width: 0.7rem;
		height: 0.7rem;
		// background-color: rgba(255, 255, 255, 0.8);
		// background-color: var(--text-color2);
		background-color: var(--primary-color);
		border-radius: 50%;
		opacity: 0.8;
		animation: particleAnimation 6s linear infinite,
	}
}

.branding-info {
	position: absolute;
	z-index: 1;

	h2 {
		font-size: 2.2rem;
		font-weight: 800;
		margin-bottom: 0.5rem;
		letter-spacing: 1px;
		color: var(--text-color);
	}

	.slogan {
		font-size: 1.1rem;
		margin-bottom: 2rem;
		color: var(--text-color2);
		font-weight: 500;
		letter-spacing: 0.5px;
	}

	// .areas {
	// 	list-style: none;
	// 	padding: 0;
	// 	// margin: 0 0 2rem 0;
	// 	display: flex;
	// 	flex-direction: column;
	// 	gap: 1.2rem;

	// 	li {
	// 		display: flex;
	// 		align-items: flex-start;
	// 		gap: 1rem;
	// 		// background-color: var(--bg-color-transparent);
	// 		border-radius: 0.7rem;
	// 		padding: 1rem 1.2rem;
	// 		box-shadow: 0 2px 12px 0 rgba(30, 58, 138, 0.07);

	// 		.icon {
	// 			font-size: 2rem;
	// 			flex-shrink: 0;
	// 			// filter: drop-shadow(0 2px 6px #38bdf8aa);
	// 		}

	// 		strong {
	// 			font-size: 1.2rem;
	// 			color: var(--text-color2);
	// 		}

	// 		small {
	// 			color: var(--text-color2);
	// 			font-size: 0.9rem;
	// 		}
	// 	}
	// }
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
}
</style>
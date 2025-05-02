<script>
	export let menuItems = [
		{ text: 'Sommaire', href: '/' },
		{ text: 'Ecrire une recette', href: '/write-recipe' }
	];
</script>

<div class="bookmark-menu">
	<ul class="menu">
		{#each menuItems as item}
			<li><a href={item.href}>{item.text}</a></li>
		{/each}
	</ul>
</div>

<style lang="scss">
	.bookmark-menu {
		width: 100%;
		background-color: #960018;
		overflow: visible;
		z-index: 1000;
		position: fixed;
		top: 0;
		left: 10px;
		width: 180px;
		height: 150px;
		transition:
			transform 0.3s ease;
			transform-origin: top left;

		&:not(:hover) {
			transform: scale(0.4);
		}

		&::after {
			content: '';
			display: block;
			width: 0;
			height: 0;
			margin-top:62px;
			border-left: 90px solid #960018;
			border-right: 90px solid #960018;
			border-bottom: 50px solid transparent;
			transition:
				border-left 0.3s ease,
				border-right 0.3s ease,
				border-bottom 0.3s ease,
				bottom 0.3s ease;
		}


		

		.menu {
			margin: 0;
			padding: 0;
			list-style: none;
			opacity: 0;
			pointer-events: none;
			transition: opacity 0.3s ease;

			li {
				a {
					display: block;
					padding: 10px;
					color: #fff;
					text-decoration: none;
					transition: background 0.2s ease;

					&:hover {
						background: rgba(255, 255, 255, 0.2);
					}
				}
			}
		}

		&:hover .menu {
			opacity: 1; // show text on hover
			pointer-events: auto;
		}
	}
</style>

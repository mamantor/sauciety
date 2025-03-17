<script lang="ts">
	import '../../app.css';
	import { onMount } from 'svelte';
	import svgContent from '$lib/friezes/frieze1.svg?raw'; // Adjust the path as needed

	export let children;
	let firstGroupContent = ""; // Separate local reactivity
	let firstObject = '';
	const friezeIndex = 0;

	onMount(() => {
		const parser = new DOMParser();
		const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
		const firstGroup = svgDoc.querySelector('g');
		if (firstGroup) {
			firstGroupContent = firstGroup.children[friezeIndex].outerHTML;
		}
	});
</script>

<div>
	<div class="svg-container">
		<svg
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			x="0px"
			y="0px"
			viewBox={`0 ${75 * friezeIndex} 750 100`}
			xml:space="preserve"
		>
			{@html firstGroupContent}
		</svg>
	</div>
	{@render children()}
	<div class="svg-container">
		<svg
			version="1.1"
			xmlns="http://www.w3.org/2000/svg"
			xmlns:xlink="http://www.w3.org/1999/xlink"
			x="0px"
			y="0px"
			viewBox={`0 ${75 * friezeIndex} 750 100`}
			style="enable-background:new 0 0 750 100;"
			xml:space="preserve"
		>
			{@html firstGroupContent}
		</svg>
	</div>
</div>


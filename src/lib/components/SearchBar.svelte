<script lang="ts">
	import { Search } from '@lucide/svelte';
	let { value = $bindable('') }: { value?: string } = $props();
</script>

<div class="relative">
	<Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
	<input
		type="text"
		bind:value
		aria-label="Chercher une recette"
		placeholder="Chercher une recette"
		class="w-full rounded-lg border border-border bg-card py-3 pl-10 pr-4 text-sm transition-all placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
	/>
</div>

<script>
	import { page } from '$app/state';
	import TurboTonioLogo from './TurboTonioLogo.svelte';
	const session = $derived(page.data.session);
</script>

<header class="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
	<div class=" flex h-16 items-center justify-between">
		<div class="ml-24 flex items-center gap-2">
			<TurboTonioLogo />
			<h1 class="font-serif text-xl font-medium text-foreground md:text-2xl">Sauciety</h1>
		</div>
		<div class="mr-4 flex min-w-0 items-center gap-2 sm:mr-24">
			{#if session?.user}
				<p class="truncate font-sans text-sm text-foreground">bonjour {session.user.name}</p>
			{/if}
		</div>
	</div>
</header>

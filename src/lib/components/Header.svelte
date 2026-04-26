<script>
	import { ChefHat } from '@lucide/svelte';
  import { page } from '$app/state';
	const session = $derived(page.data.session);
</script>

<header class="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
	<div class=" flex h-16 items-center justify-between">
		<div class="ml-24 flex items-center gap-2">
			<ChefHat class="h-6 w-6 text-primary" />
			<h1 class="font-serif text-xl font-medium text-foreground md:text-2xl">
				Turbo Tonio's Sauciety
			</h1>
		</div>
    <div class="mr-24 flex items-center gap-2">
      {#if session?.user}
        <p>bonjour {session.user.email ?? session.user.name}</p>
      {/if}
    </div>
	</div>
</header>

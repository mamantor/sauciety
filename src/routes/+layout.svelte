<script lang="ts">
	import '../app.css';
	import Menu from '$lib/components/menu.svelte';
	import { afterNavigate } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	import { signIn } from '@auth/sveltekit/client';
	let { children, data } = $props();

	afterNavigate(() => {
		// TODO scroll to top
	});
</script>

<div>
	<Menu />
	<div>
		{#if data.session?.user}
			<p>Logged in as {data.session.user.email ?? data.session.user.name}</p>
		{:else}
			<p>Not logged in</p>
		{/if}

		<button onclick={() => signIn('authentik')}> Sign in with Authentik </button>
	</div>
	<Header />
	{@render children()}
</div>

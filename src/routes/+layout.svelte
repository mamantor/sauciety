<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { signIn } from '@auth/sveltekit/client';
	import Menu from '$lib/components/Menu/menu.svelte';
	import { afterNavigate } from '$app/navigation';
	import Header from '$lib/components/Header.svelte';
	let { children } = $props();

	afterNavigate(() => {
		// TODO scroll to top
	});

	// Landing here with ?welcome=1 (set by Authentik's invitation enrollment
	// flow's Redirect stage) means the user just got an Authentik session but
	// not a Sauciety one yet - those are separate, see Enrollment.md. Silently
	// run the same OIDC handshake the menu's "Connexion" button triggers; SSO
	// makes it instant since Authentik already has them logged in.
	onMount(() => {
		if (page.url.searchParams.has('welcome') && !page.data.session?.user) {
			signIn('authentik', { callbackUrl: '/' });
		}
	});
</script>

<svelte:head>
	<title>Turbo Tonio Sauciety</title>
</svelte:head>

<div>
	<Menu />
	<Header />
	{@render children()}
</div>

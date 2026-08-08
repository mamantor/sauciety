<script lang="ts">
	import { page } from '$app/state';
	import { signIn } from '@auth/sveltekit/client';
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';
	import styles from './index.module.scss';

	const menuItems: readonly { text: string; href: Pathname; protected?: boolean }[] = [
		{ text: 'Sommaire', href: '/' },
		{ text: 'Ecrire une recette', href: '/write-recipe', protected: true }
	];

	const session = $derived(page.data.session);
	const isLoggedIn = $derived(Boolean(session?.user));

	let open = $state(false);
</script>

<div
	class="{styles.bookmarkMenu} {open ? styles.open : ''}"
	aria-expanded={open}
	aria-label={open ? 'Fermer le menu' : 'Menu'}
	onclick={() => (open = !open)}
>
	<ul class={styles.menu}>
		{#each menuItems as item (item.href)}
			{#if !item.protected || session?.user}
				<li><a class='text-foreground' href={resolve(item.href)}>{item.text}</a></li>
			{/if}
		{/each}
		{#if !isLoggedIn}
			<li>
				<button
					type="button"
					class="w-full cursor-pointer text-left text-foreground"
					onclick={() => signIn('authentik')}
				>
					Connexion
				</button>
			</li>
		{/if}
	</ul>
</div>

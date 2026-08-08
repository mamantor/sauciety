<script lang="ts">
	import { ChevronDown } from '@lucide/svelte';

	type Option = { value: string; label: string };

	let {
		value = $bindable(''),
		options,
		placeholder = 'Choisir...',
		id
	}: {
		value?: string;
		options: Option[];
		placeholder?: string;
		id?: string;
	} = $props();

	let open = $state(false);
	let rootEl: HTMLDivElement | undefined = $state();

	const selectedOption = $derived(options.find((option) => option.value === value));

	function selectOption(optionValue: string) {
		value = optionValue;
		open = false;
	}

	$effect(() => {
		if (!open) return;

		const closeIfOutside = (event: MouseEvent) => {
			if (rootEl && !rootEl.contains(event.target as Node)) {
				open = false;
			}
		};

		document.addEventListener('click', closeIfOutside);
		return () => document.removeEventListener('click', closeIfOutside);
	});
</script>

<div class="relative" bind:this={rootEl}>
	<button
		type="button"
		{id}
		class="input-base flex items-center justify-between text-left"
		aria-haspopup="listbox"
		aria-expanded={open}
		onclick={() => (open = !open)}
		onkeydown={(event) => {
			if (event.key === 'Escape') open = false;
		}}
	>
		<span class={selectedOption ? '' : 'text-muted-foreground'}>
			{selectedOption?.label ?? placeholder}
		</span>
		<ChevronDown
			class="h-4 w-4 shrink-0 text-muted-foreground transition-transform {open ? 'rotate-180' : ''}"
		/>
	</button>

	{#if open}
		<ul
			role="listbox"
			class="shadow-soft absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-card p-1"
		>
			{#each options as option (option.value)}
				<li>
					<button
						type="button"
						role="option"
						aria-selected={option.value === value}
						class="w-full rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-accent/30 {option.value ===
						value
							? 'bg-accent/20 font-medium'
							: ''}"
						onclick={() => selectOption(option.value)}
					>
						{option.label}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

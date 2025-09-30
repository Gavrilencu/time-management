<!-- Modern Card Component -->
<script lang="ts">
	import { onMount } from 'svelte';
	
	// Props pentru componente
	export let variant: 'default' | 'elevated' | 'outlined' | 'glass' | 'gradient' = 'default';
	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let hover: boolean = true;
	export let clickable: boolean = false;
	export let loading: boolean = false;
	export let animated: boolean = true;
	export let rounded: boolean = true;
	export let padding: 'none' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let className: string = '';
	export let onclick: ((event: MouseEvent) => void) | undefined = undefined;
	
	// Funcții pentru clasele CSS
	function getVariantClasses() {
		const variants = {
			default: 'card-default',
			elevated: 'card-elevated',
			outlined: 'card-outlined',
			glass: 'card-glass',
			gradient: 'card-gradient'
		};
		return variants[variant];
	}
	
	function getSizeClasses() {
		const sizes = {
			sm: 'card-sm',
			md: 'card-md',
			lg: 'card-lg',
			xl: 'card-xl'
		};
		return sizes[size];
	}
	
	function getPaddingClasses() {
		const paddings = {
			none: 'card-padding-none',
			sm: 'card-padding-sm',
			md: 'card-padding-md',
			lg: 'card-padding-lg',
			xl: 'card-padding-xl'
		};
		return paddings[padding];
	}
	
	function getModifierClasses() {
		let classes = [];
		if (hover) classes.push('card-hover');
		if (clickable) classes.push('card-clickable');
		if (loading) classes.push('card-loading');
		if (animated) classes.push('card-animated');
		if (rounded) classes.push('card-rounded');
		return classes.join(' ');
	}
	
	function handleClick(event: MouseEvent) {
		if (clickable && !loading) {
			// Call the onclick prop if provided
			if (onclick) {
				onclick(event);
			}
			
			// Emit click event
			const customEvent = new CustomEvent('cardclick', {
				detail: { event }
			});
			event.currentTarget?.dispatchEvent(customEvent);
		}
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (clickable && !loading && (event.key === 'Enter' || event.key === ' ')) {
			event.preventDefault();
			handleClick(event as any);
		}
	}
</script>

<!-- Modern Card Component -->
<div 
	class="card {getVariantClasses()} {getSizeClasses()} {getPaddingClasses()} {getModifierClasses()} {className}"
	role={clickable ? 'button' : 'article'}
	{...clickable ? { tabindex: 0 } : {}}
	onclick={handleClick}
	onkeydown={handleKeydown}
	aria-disabled={clickable ? false : undefined}
	aria-busy={loading}
>
	{#if loading}
		<div class="card-loading-overlay">
			<div class="card-spinner"></div>
		</div>
	{/if}
	
	<slot />
</div>

<style>
	/* Modern Card Styles */
	.card {
		/* Base styles */
		position: relative;
		display: flex;
		flex-direction: column;
		background: var(--color-card, var(--color-surface));
		border: 1px solid var(--color-cardBorder, var(--color-border));
		overflow: hidden;
		transition: all var(--transition-normal, 250ms) var(--transition-ease, cubic-bezier(0.4, 0, 0.2, 1));
		user-select: none;
		
		/* Focus styles for clickable cards */
		&:focus-visible {
			outline: 2px solid var(--color-borderFocus, var(--color-primary));
			outline-offset: 2px;
		}
		
		/* Clickable styles */
		&.card-clickable {
			cursor: pointer;
			
			&:hover:not(.card-loading) {
				cursor: pointer;
			}
			
			&:active:not(.card-loading) {
				transform: scale(0.98);
			}
		}
		
		/* Loading styles */
		&.card-loading {
			pointer-events: none;
			opacity: 0.7;
		}
		
		/* Rounded */
		&.card-rounded {
			border-radius: var(--radius-lg, 0.75rem);
		}
		
		/* Animated */
		&.card-animated {
			&:hover:not(.card-loading) {
				transform: translateY(-2px);
			}
		}
	}
	
	/* Size variants */
	.card-sm {
		min-height: 8rem;
	}
	
	.card-md {
		min-height: 12rem;
	}
	
	.card-lg {
		min-height: 16rem;
	}
	
	.card-xl {
		min-height: 20rem;
	}
	
	/* Padding variants */
	.card-padding-none {
		padding: 0;
	}
	
	.card-padding-sm {
		padding: var(--spacing-sm, 0.5rem);
	}
	
	.card-padding-md {
		padding: var(--spacing-md, 1rem);
	}
	
	.card-padding-lg {
		padding: var(--spacing-lg, 1.5rem);
	}
	
	.card-padding-xl {
		padding: var(--spacing-xl, 2rem);
	}
	
	/* Variant styles */
	.card-default {
		background: var(--color-card, var(--color-surface));
		border: 1px solid var(--color-cardBorder, var(--color-border));
		box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
	}
	
	.card-elevated {
		background: var(--color-card, var(--color-surface));
		border: 1px solid var(--color-cardBorder, var(--color-border));
		box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
		
		&.card-hover:hover:not(.card-loading) {
			box-shadow: var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1));
		}
	}
	
	.card-outlined {
		background: transparent;
		border: 2px solid var(--color-cardBorder, var(--color-border));
		box-shadow: none;
		
		&.card-hover:hover:not(.card-loading) {
			border-color: var(--color-primary);
			box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
		}
	}
	
	.card-glass {
		background: var(--color-glass, rgba(255, 255, 255, 0.8));
		backdrop-filter: blur(10px);
		border: 1px solid var(--color-glassBorder, rgba(255, 255, 255, 0.2));
		box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
	}
	
	.card-gradient {
		background: var(--color-gradient, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
		border: none;
		color: var(--color-textInverse, #ffffff);
		box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
	}
	
	/* Loading overlay */
	.card-loading-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(255, 255, 255, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
	}
	
	.card-spinner {
		width: 2rem;
		height: 2rem;
		border: 3px solid var(--color-border);
		border-top: 3px solid var(--color-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	
	/* Responsive adjustments */
	@media (max-width: 768px) {
		.card-lg {
			min-height: 12rem;
		}
		
		.card-xl {
			min-height: 16rem;
		}
		
		.card-padding-lg {
			padding: var(--spacing-md, 1rem);
		}
		
		.card-padding-xl {
			padding: var(--spacing-lg, 1.5rem);
		}
	}
	
	/* Dark theme adjustments */
	:global(.theme-dark) .card-loading-overlay {
		background: rgba(0, 0, 0, 0.8);
	}
</style>

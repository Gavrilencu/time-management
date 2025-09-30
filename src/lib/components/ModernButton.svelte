<!-- Modern Button Component -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { currentTheme } from '$lib/themes';
	
	// Props pentru componente
	export let variant: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' = 'primary';
	export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let disabled: boolean = false;
	export let loading: boolean = false;
	export let fullWidth: boolean = false;
	export let rounded: boolean = false;
	export let glass: boolean = false;
	export let gradient: boolean = false;
	export let animated: boolean = true;
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let className: string = '';
	export let onclick: ((event: MouseEvent) => void) | undefined = undefined;
	
	// Funcții pentru clasele CSS
	function getVariantClasses() {
		const variants = {
			primary: 'btn-primary',
			secondary: 'btn-secondary',
			accent: 'btn-accent',
			success: 'btn-success',
			warning: 'btn-warning',
			error: 'btn-error'
		};
		return variants[variant];
	}
	
	function getSizeClasses() {
		const sizes = {
			xs: 'btn-xs',
			sm: 'btn-sm',
			md: 'btn-md',
			lg: 'btn-lg',
			xl: 'btn-xl'
		};
		return sizes[size];
	}
	
	function getModifierClasses() {
		let classes = [];
		if (disabled) classes.push('btn-disabled');
		if (loading) classes.push('btn-loading');
		if (fullWidth) classes.push('btn-full-width');
		if (rounded) classes.push('btn-rounded');
		if (glass) classes.push('btn-glass');
		if (gradient) classes.push('btn-gradient');
		if (animated) classes.push('btn-animated');
		return classes.join(' ');
	}
	
	function handleClick(event: MouseEvent) {
		if (disabled || loading) {
			event.preventDefault();
			return;
		}
		
		// Call the onclick prop if provided
		if (onclick) {
			onclick(event);
		}
		
		// Emit click event
		const customEvent = new CustomEvent('click', {
			detail: { event }
		});
		event.currentTarget?.dispatchEvent(customEvent);
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (disabled || loading) return;
		
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleClick(event as any);
		}
	}
</script>

<!-- Modern Button Component -->
<button 
	class="btn {getVariantClasses()} {getSizeClasses()} {getModifierClasses()} {className}"
	{disabled}
	{type}
	onclick={handleClick}
	onkeydown={handleKeydown}
	tabindex="0"
	aria-disabled={disabled}
	aria-busy={loading}
>
	{#if loading}
		<div class="btn-spinner"></div>
	{/if}
	<slot />
</button>

<style>
	/* Modern Button Styles */
	.btn {
		/* Base styles */
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-sm, 0.5rem);
		font-family: var(--font-typography-fontFamily, inherit);
		font-weight: var(--font-typography-fontWeight-medium, 500);
		line-height: var(--font-typography-lineHeight-normal, 1.5);
		text-decoration: none;
		border: none;
		cursor: pointer;
		position: relative;
		overflow: hidden;
		transition: all var(--transition-normal, 250ms) var(--transition-ease, cubic-bezier(0.4, 0, 0.2, 1));
		user-select: none;
		outline: none;
		
		/* Focus styles */
		&:focus-visible {
			outline: 2px solid var(--color-borderFocus, var(--color-primary));
			outline-offset: 2px;
		}
		
		/* Disabled styles */
		&.btn-disabled {
			opacity: 0.6;
			cursor: not-allowed;
			pointer-events: none;
		}
		
		/* Loading styles */
		&.btn-loading {
			cursor: wait;
			pointer-events: none;
		}
		
		/* Full width */
		&.btn-full-width {
			width: 100%;
		}
		
		/* Rounded */
		&.btn-rounded {
			border-radius: var(--radius-full, 9999px);
		}
		
		/* Glass effect */
		&.btn-glass {
			background: var(--color-glass, rgba(255, 255, 255, 0.8));
			backdrop-filter: blur(10px);
			border: 1px solid var(--color-glassBorder, rgba(255, 255, 255, 0.2));
		}
		
		/* Gradient */
		&.btn-gradient {
			background: var(--color-gradient, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
			color: var(--color-textInverse, #ffffff);
		}
		
		/* Animated */
		&.btn-animated {
			&:hover {
				transform: translateY(-1px);
			}
			
			&:active {
				transform: translateY(0);
			}
		}
	}
	
	/* Size variants */
	.btn-xs {
		padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
		font-size: var(--font-typography-fontSize-xs, 0.75rem);
		border-radius: var(--radius-sm, 0.25rem);
		min-height: 1.5rem;
	}
	
	.btn-sm {
		padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
		font-size: var(--font-typography-fontSize-sm, 0.875rem);
		border-radius: var(--radius-sm, 0.25rem);
		min-height: 2rem;
	}
	
	.btn-md {
		padding: var(--spacing-sm, 0.5rem) var(--spacing-lg, 1.5rem);
		font-size: var(--font-typography-fontSize-base, 1rem);
		border-radius: var(--radius-md, 0.5rem);
		min-height: 2.5rem;
	}
	
	.btn-lg {
		padding: var(--spacing-md, 1rem) var(--spacing-xl, 2rem);
		font-size: var(--font-typography-fontSize-lg, 1.125rem);
		border-radius: var(--radius-md, 0.5rem);
		min-height: 3rem;
	}
	
	.btn-xl {
		padding: var(--spacing-lg, 1.5rem) var(--spacing-2xl, 3rem);
		font-size: var(--font-typography-fontSize-xl, 1.25rem);
		border-radius: var(--radius-lg, 0.75rem);
		min-height: 3.5rem;
	}
	
	/* Color variants */
	.btn-primary {
		background: var(--color-primary);
		color: var(--color-textInverse, #ffffff);
		box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
		
		&:hover:not(.btn-disabled):not(.btn-loading) {
			background: var(--color-primaryHover, var(--color-primary));
			box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
		}
		
		&:active:not(.btn-disabled):not(.btn-loading) {
			background: var(--color-primaryActive, var(--color-primary));
			box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
		}
	}
	
	.btn-secondary {
		background: var(--color-secondary);
		color: var(--color-textInverse, #ffffff);
		box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
		
		&:hover:not(.btn-disabled):not(.btn-loading) {
			background: var(--color-secondaryHover, var(--color-secondary));
			box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
		}
		
		&:active:not(.btn-disabled):not(.btn-loading) {
			background: var(--color-secondaryActive, var(--color-secondary));
			box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
		}
	}
	
	.btn-accent {
		background: var(--color-accent);
		color: var(--color-textInverse, #ffffff);
		box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
		
		&:hover:not(.btn-disabled):not(.btn-loading) {
			background: var(--color-accentHover, var(--color-accent));
			box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
		}
		
		&:active:not(.btn-disabled):not(.btn-loading) {
			background: var(--color-accentActive, var(--color-accent));
			box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
		}
	}
	
	.btn-success {
		background: var(--color-success);
		color: var(--color-textInverse, #ffffff);
		box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
		
		&:hover:not(.btn-disabled):not(.btn-loading) {
			background: var(--color-successLight, var(--color-success));
			box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
		}
	}
	
	.btn-warning {
		background: var(--color-warning);
		color: var(--color-textInverse, #ffffff);
		box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
		
		&:hover:not(.btn-disabled):not(.btn-loading) {
			background: var(--color-warningLight, var(--color-warning));
			box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
		}
	}
	
	.btn-error {
		background: var(--color-error);
		color: var(--color-textInverse, #ffffff);
		box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05));
		
		&:hover:not(.btn-disabled):not(.btn-loading) {
			background: var(--color-errorLight, var(--color-error));
			box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
		}
	}
	
	/* Loading spinner */
	.btn-spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid transparent;
		border-top: 2px solid currentColor;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	
	/* Ripple effect */
	.btn::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.3);
		transform: translate(-50%, -50%);
		transition: width 0.6s, height 0.6s;
		pointer-events: none;
	}
	
	.btn:active::before {
		width: 300px;
		height: 300px;
	}
	
	/* Responsive adjustments */
	@media (max-width: 768px) {
		.btn-lg {
			padding: var(--spacing-sm, 0.5rem) var(--spacing-lg, 1.5rem);
			font-size: var(--font-typography-fontSize-base, 1rem);
			min-height: 2.5rem;
		}
		
		.btn-xl {
			padding: var(--spacing-md, 1rem) var(--spacing-xl, 2rem);
			font-size: var(--font-typography-fontSize-lg, 1.125rem);
			min-height: 3rem;
		}
	}
</style>

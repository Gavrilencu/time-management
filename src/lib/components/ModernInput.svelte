<!-- Modern Input Component -->
<script lang="ts">
	import { onMount } from 'svelte';
	
	// Props pentru componente
	export let type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' = 'text';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let variant: 'default' | 'filled' | 'outlined' | 'glass' = 'default';
	export let disabled: boolean = false;
	export let readonly: boolean = false;
	export let required: boolean = false;
	export let placeholder: string = '';
	export let label: string = '';
	export let helper: string = '';
	export let error: string = '';
	export let success: string = '';
	export let icon: string = '';
	export let iconPosition: 'left' | 'right' = 'left';
	export let animated: boolean = true;
	export let rounded: boolean = true;
	export let fullWidth: boolean = false;
	
	// State
	let inputElement: HTMLInputElement;
	let isFocused: boolean = false;
	let hasValue: boolean = false;
	
	// Funcții pentru clasele CSS
	function getVariantClasses() {
		const variants = {
			default: 'input-default',
			filled: 'input-filled',
			outlined: 'input-outlined',
			glass: 'input-glass'
		};
		return variants[variant];
	}
	
	function getSizeClasses() {
		const sizes = {
			sm: 'input-sm',
			md: 'input-md',
			lg: 'input-lg'
		};
		return sizes[size];
	}
	
	function getModifierClasses() {
		let classes = [];
		if (disabled) classes.push('input-disabled');
		if (readonly) classes.push('input-readonly');
		if (error) classes.push('input-error');
		if (success) classes.push('input-success');
		if (animated) classes.push('input-animated');
		if (rounded) classes.push('input-rounded');
		if (fullWidth) classes.push('input-full-width');
		if (icon) classes.push(`input-with-icon input-icon-${iconPosition}`);
		return classes.join(' ');
	}
	
	function handleFocus() {
		isFocused = true;
	}
	
	function handleBlur() {
		isFocused = false;
		hasValue = inputElement?.value.length > 0;
	}
	
	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		hasValue = target.value.length > 0;
		
		// Emit input event
		const customEvent = new CustomEvent('input', {
			detail: { value: target.value, event }
		});
		event.currentTarget?.dispatchEvent(customEvent);
	}
	
	function handleChange(event: Event) {
		const target = event.target as HTMLInputElement;
		hasValue = target.value.length > 0;
		
		// Emit change event
		const customEvent = new CustomEvent('change', {
			detail: { value: target.value, event }
		});
		event.currentTarget?.dispatchEvent(customEvent);
	}
	
	// Reactive statements
	$: inputId = `input-${Math.random().toString(36).substr(2, 9)}`;
</script>

<!-- Modern Input Component -->
<div class="input-container {getModifierClasses()}">
	{#if label}
		<label for={inputId} class="input-label">
			{label}
			{#if required}
				<span class="input-required">*</span>
			{/if}
		</label>
	{/if}
	
	<div class="input-wrapper {getVariantClasses()} {getSizeClasses()}">
		{#if icon && iconPosition === 'left'}
			<div class="input-icon input-icon-left">
				<slot name="icon-left">
					<!-- Icon will be rendered here -->
				</slot>
			</div>
		{/if}
		
		<input
			bind:this={inputElement}
			id={inputId}
			{type}
			{placeholder}
			{disabled}
			{readonly}
			{required}
			class="input-field"
			onfocus={handleFocus}
			onblur={handleBlur}
			oninput={handleInput}
			onchange={handleChange}
			aria-invalid={error ? 'true' : 'false'}
			aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined}
		/>
		
		{#if icon && iconPosition === 'right'}
			<div class="input-icon input-icon-right">
				<slot name="icon-right">
					<!-- Icon will be rendered here -->
				</slot>
			</div>
		{/if}
		
		{#if animated}
			<div class="input-underline"></div>
		{/if}
	</div>
	
	{#if helper && !error && !success}
		<div class="input-helper" id="{inputId}-helper">
			{helper}
		</div>
	{/if}
	
	{#if error}
		<div class="input-error-message" id="{inputId}-error">
			{error}
		</div>
	{/if}
	
	{#if success}
		<div class="input-success-message" id="{inputId}-success">
			{success}
		</div>
	{/if}
</div>

<style>
	/* Modern Input Styles */
	.input-container {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs, 0.25rem);
		width: 100%;
	}
	
	.input-label {
		font-size: var(--font-typography-fontSize-sm, 0.875rem);
		font-weight: var(--font-typography-fontWeight-medium, 500);
		color: var(--color-text, #1e293b);
		margin-bottom: var(--spacing-xs, 0.25rem);
	}
	
	.input-required {
		color: var(--color-error, #ef4444);
		margin-left: var(--spacing-xs, 0.25rem);
	}
	
	.input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		background: var(--color-input, var(--color-surface));
		border: 1px solid var(--color-inputBorder, var(--color-border));
		transition: all var(--transition-normal, 250ms) var(--transition-ease, cubic-bezier(0.4, 0, 0.2, 1));
		overflow: hidden;
	}
	
	.input-field {
		flex: 1;
		border: none;
		background: transparent;
		outline: none;
		font-family: var(--font-typography-fontFamily, inherit);
		color: var(--color-text, #1e293b);
		transition: all var(--transition-normal, 250ms) var(--transition-ease, cubic-bezier(0.4, 0, 0.2, 1));
		
		&::placeholder {
			color: var(--color-textTertiary, #94a3b8);
			transition: all var(--transition-normal, 250ms) var(--transition-ease, cubic-bezier(0.4, 0, 0.2, 1));
		}
		
		&:focus::placeholder {
			opacity: 0.7;
		}
	}
	
	.input-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-textSecondary, #64748b);
		transition: color var(--transition-normal, 250ms) var(--transition-ease, cubic-bezier(0.4, 0, 0.2, 1));
	}
	
	.input-underline {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: var(--color-primary);
		transform: scaleX(0);
		transition: transform var(--transition-normal, 250ms) var(--transition-ease, cubic-bezier(0.4, 0, 0.2, 1));
	}
	
	.input-helper {
		font-size: var(--font-typography-fontSize-xs, 0.75rem);
		color: var(--color-textSecondary, #64748b);
		margin-top: var(--spacing-xs, 0.25rem);
	}
	
	.input-error-message {
		font-size: var(--font-typography-fontSize-xs, 0.75rem);
		color: var(--color-error, #ef4444);
		margin-top: var(--spacing-xs, 0.25rem);
	}
	
	.input-success-message {
		font-size: var(--font-typography-fontSize-xs, 0.75rem);
		color: var(--color-success, #10b981);
		margin-top: var(--spacing-xs, 0.25rem);
	}
	
	/* Size variants */
	.input-sm {
		min-height: 2rem;
		
		.input-field {
			padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
			font-size: var(--font-typography-fontSize-sm, 0.875rem);
		}
		
		.input-icon {
			padding: 0 var(--spacing-sm, 0.5rem);
		}
	}
	
	.input-md {
		min-height: 2.5rem;
		
		.input-field {
			padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
			font-size: var(--font-typography-fontSize-base, 1rem);
		}
		
		.input-icon {
			padding: 0 var(--spacing-md, 1rem);
		}
	}
	
	.input-lg {
		min-height: 3rem;
		
		.input-field {
			padding: var(--spacing-md, 1rem) var(--spacing-lg, 1.5rem);
			font-size: var(--font-typography-fontSize-lg, 1.125rem);
		}
		
		.input-icon {
			padding: 0 var(--spacing-lg, 1.5rem);
		}
	}
	
	/* Variant styles */
	.input-default {
		border-radius: var(--radius-md, 0.5rem);
		
		&:focus-within {
			border-color: var(--color-inputFocus, var(--color-primary));
			box-shadow: 0 0 0 3px var(--color-shadowFocus, rgba(59, 130, 246, 0.1));
		}
	}
	
	.input-filled {
		background: var(--color-surface, #f8fafc);
		border: none;
		border-radius: var(--radius-md, 0.5rem);
		
		&:focus-within {
			background: var(--color-surfaceHover, #f1f5f9);
			box-shadow: 0 0 0 3px var(--color-shadowFocus, rgba(59, 130, 246, 0.1));
		}
	}
	
	.input-outlined {
		background: transparent;
		border: 2px solid var(--color-inputBorder, var(--color-border));
		border-radius: var(--radius-md, 0.5rem);
		
		&:focus-within {
			border-color: var(--color-inputFocus, var(--color-primary));
			box-shadow: 0 0 0 3px var(--color-shadowFocus, rgba(59, 130, 246, 0.1));
		}
	}
	
	.input-glass {
		background: var(--color-glass, rgba(255, 255, 255, 0.8));
		backdrop-filter: blur(10px);
		border: 1px solid var(--color-glassBorder, rgba(255, 255, 255, 0.2));
		border-radius: var(--radius-md, 0.5rem);
		
		&:focus-within {
			border-color: var(--color-inputFocus, var(--color-primary));
			box-shadow: 0 0 0 3px var(--color-shadowFocus, rgba(59, 130, 246, 0.1));
		}
	}
	
	/* Modifier styles */
	.input-disabled {
		opacity: 0.6;
		cursor: not-allowed;
		
		.input-field {
			cursor: not-allowed;
		}
	}
	
	.input-readonly {
		background: var(--color-surface, #f8fafc);
		cursor: default;
		
		.input-field {
			cursor: default;
		}
	}
	
	.input-error {
		.input-wrapper {
			border-color: var(--color-error, #ef4444);
		}
		
		&:focus-within .input-wrapper {
			border-color: var(--color-error, #ef4444);
			box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
		}
	}
	
	.input-success {
		.input-wrapper {
			border-color: var(--color-success, #10b981);
		}
		
		&:focus-within .input-wrapper {
			border-color: var(--color-success, #10b981);
			box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
		}
	}
	
	.input-animated {
		&:focus-within .input-underline {
			transform: scaleX(1);
		}
		
		&:focus-within .input-icon {
			color: var(--color-primary);
		}
	}
	
	.input-rounded {
		border-radius: var(--radius-full, 9999px);
	}
	
	.input-full-width {
		width: 100%;
	}
	
	/* Responsive adjustments */
	@media (max-width: 768px) {
		.input-lg {
			min-height: 2.5rem;
			
			.input-field {
				padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 1rem);
				font-size: var(--font-typography-fontSize-base, 1rem);
			}
		}
	}
</style>

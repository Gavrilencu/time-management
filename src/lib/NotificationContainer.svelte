<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { notifications, type Notification } from './notifications';
	import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-svelte';

	let notificationList: Notification[] = $state([]);

	onMount(() => {
		const unsubscribe = notifications.subscribe((notifications) => {
			notificationList = notifications;
		});
		
		return unsubscribe;
	});

	function removeNotification(id: string) {
		notifications.remove(id);
	}

	function getIcon(type: string) {
		switch (type) {
			case 'success':
				return CheckCircle;
			case 'error':
				return XCircle;
			case 'warning':
				return AlertTriangle;
			case 'info':
				return Info;
			default:
				return Info;
		}
	}

	function getIconColor(type: string) {
		switch (type) {
			case 'success':
				return '#10b981';
			case 'error':
				return '#ef4444';
			case 'warning':
				return '#f59e0b';
			case 'info':
				return '#3b82f6';
			default:
				return '#6b7280';
		}
	}

	function getBackgroundColor(type: string) {
		switch (type) {
			case 'success':
				return '#ecfdf5';
			case 'error':
				return '#fef2f2';
			case 'warning':
				return '#fffbeb';
			case 'info':
				return '#eff6ff';
			default:
				return '#f9fafb';
		}
	}

	function getBorderColor(type: string) {
		switch (type) {
			case 'success':
				return '#d1fae5';
			case 'error':
				return '#fecaca';
			case 'warning':
				return '#fed7aa';
			case 'info':
				return '#dbeafe';
			default:
				return '#e5e7eb';
		}
	}
</script>

<!-- Container pentru notificări -->
<div class="notification-container">
	{#each notificationList as notification (notification.id)}
		<div 
			class="notification"
			style="
				background-color: {getBackgroundColor(notification.type)};
				border-color: {getBorderColor(notification.type)};
			"
		>
			<div class="notification-content">
				<div class="notification-icon">
					<svelte:component 
						this={getIcon(notification.type)} 
						size={20} 
						color={getIconColor(notification.type)}
					/>
				</div>
				<div class="notification-text">
					<div class="notification-title">{notification.title}</div>
					<div class="notification-message">{notification.message}</div>
				</div>
				<button 
					class="notification-close"
					on:click={() => removeNotification(notification.id)}
				>
					<X size={16} />
				</button>
			</div>
		</div>
	{/each}
</div>

<style>
	.notification-container {
		position: fixed;
		top: 20px;
		right: 20px;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		gap: 12px;
		max-width: 400px;
		width: 100%;
	}

	.notification {
		border: 1px solid;
		border-radius: 8px;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.notification-content {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 16px;
	}

	.notification-icon {
		flex-shrink: 0;
		margin-top: 2px;
	}

	.notification-text {
		flex: 1;
		min-width: 0;
	}

	.notification-title {
		font-weight: 600;
		font-size: 14px;
		color: #1f2937;
		margin-bottom: 4px;
	}

	.notification-message {
		font-size: 13px;
		color: #6b7280;
		line-height: 1.4;
	}

	.notification-close {
		flex-shrink: 0;
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px;
		border-radius: 4px;
		color: #9ca3af;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.notification-close:hover {
		background: rgba(0, 0, 0, 0.05);
		color: #6b7280;
	}

	/* Responsive */
	@media (max-width: 640px) {
		.notification-container {
			top: 10px;
			right: 10px;
			left: 10px;
			max-width: none;
		}
	}
</style>

// Sistem de notificări pentru aplicație

export interface Notification {
	id: string;
	type: 'success' | 'error' | 'warning' | 'info';
	title: string;
	message: string;
	duration?: number;
}

class NotificationService {
	private notifications: Notification[] = [];
	private listeners: ((notifications: Notification[]) => void)[] = [];

	// Adaugă o notificare
	add(notification: Omit<Notification, 'id'>) {
		const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
		const newNotification: Notification = {
			id,
			duration: 5000, // 5 secunde default
			...notification
		};

		this.notifications.push(newNotification);
		this.notifyListeners();

		// Auto-remove după durata specificată
		if (newNotification.duration && newNotification.duration > 0) {
			setTimeout(() => {
				this.remove(id);
			}, newNotification.duration);
		}

		return id;
	}

	// Șterge o notificare
	remove(id: string) {
		this.notifications = this.notifications.filter(n => n.id !== id);
		this.notifyListeners();
	}

	// Șterge toate notificările
	clear() {
		this.notifications = [];
		this.notifyListeners();
	}

	// Abonează-te la schimbări
	subscribe(listener: (notifications: Notification[]) => void) {
		this.listeners.push(listener);
		return () => {
			this.listeners = this.listeners.filter(l => l !== listener);
		};
	}

	// Notifică toți listenerii
	private notifyListeners() {
		this.listeners.forEach(listener => listener([...this.notifications]));
	}

	// Helper methods pentru tipuri comune
	success(title: string, message: string, duration?: number) {
		return this.add({ type: 'success', title, message, duration });
	}

	error(title: string, message: string, duration?: number) {
		return this.add({ type: 'error', title, message, duration });
	}

	warning(title: string, message: string, duration?: number) {
		return this.add({ type: 'warning', title, message, duration });
	}

	info(title: string, message: string, duration?: number) {
		return this.add({ type: 'info', title, message, duration });
	}
}

// Instanță globală
export const notifications = new NotificationService();

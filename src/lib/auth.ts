import { writable } from 'svelte/store';
import type { User } from '$lib/api';

// Store pentru utilizatorul curent autentificat
export const currentUser = writable<User | null>(null);

// Store pentru starea de autentificare
export const isAuthenticated = writable<boolean>(false);

// Store pentru starea de loading
export const authLoading = writable<boolean>(true);

// Funcții helper pentru gestionarea utilizatorului curent
export function setCurrentUser(user: User | null) {
    currentUser.set(user);
    isAuthenticated.set(user !== null);
}

export function clearCurrentUser() {
    currentUser.set(null);
    isAuthenticated.set(false);
}

export function setAuthLoading(loading: boolean) {
    authLoading.set(loading);
}

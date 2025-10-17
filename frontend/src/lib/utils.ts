import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
	const d = new Date(date);
	return d.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}

export function formatDateBangla(date: string | Date) {
	const d = new Date(date);
	return d.toLocaleDateString('bn-BD', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}

export function truncateText(text: string, maxLength: number) {
	if (text.length <= maxLength) return text;
	return text.substring(0, maxLength) + '...';
}

export function validateEmail(email: string) {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

export function validatePhone(phone: string) {
	const phoneRegex = /^(\+8801|01)[3-9]\d{8}$/;
	return phoneRegex.test(phone);
}
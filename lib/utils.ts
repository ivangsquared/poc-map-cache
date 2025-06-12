import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names using clsx and tailwind-merge for better class name handling.
 * @param inputs - Class names to be combined
 * @returns A single string of combined class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number with commas as thousand separators
 * @param num - The number to format
 * @returns Formatted number as string
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Debounces a function call
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttles a function call
 * @param func - The function to throttle
 * @param limit - The time limit in milliseconds
 * @returns A throttled version of the function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Checks if the current environment is a browser
 * @returns Boolean indicating if the code is running in a browser
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * Safely parses JSON, returns null if parsing fails
 * @param str - The JSON string to parse
 * @returns The parsed object or null if parsing fails
 */
export const safeJsonParse = <T>(str: string): T | null => {
  try {
    return JSON.parse(str) as T;
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return null;
  }
};

/**
 * Generates a unique ID
 * @returns A unique ID string
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

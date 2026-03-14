import { useState, useEffect } from 'react';

/**
 * Debounces a value by the specified delay.
 * Returns the debounced value which only updates after the user stops
 * changing the input for `delay` milliseconds.
 *
 * @param value - The value to debounce
 * @param delay - Debounce delay in ms (default: 500)
 */
export function useDebounce<T>(value: T, delay = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default useDebounce;

import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/authApi';


export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: useCallback(() => authApi.logout(), []),
        onSuccess: () => {
            // Clear entire query cache so auth state resets globally
            queryClient.clear();
        },
    });
}

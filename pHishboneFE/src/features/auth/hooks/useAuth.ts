import { useCallback } from 'react';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import type { LoginRequestDto, RegisterRequestDto } from '../types';

export const AUTH_ME_KEY = ['auth', 'me'] as const;

/** Reads the currently authenticated user via Suspense (never returns isLoading). */
export function useCurrentUser() {
    const { data } = useSuspenseQuery({
        queryKey: AUTH_ME_KEY,
        queryFn: authApi.getMe,
        retry: false,
    });
    return data;
}

/** Mutation for logging in. Invalidates the /me cache on success. */
export function useLoginMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: useCallback(
            (dto: LoginRequestDto) => authApi.login(dto),
            [],
        ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: AUTH_ME_KEY });
        },
    });
}

/** Mutation for registering. Auto-logs in and invalidates the /me cache. */
export function useRegisterMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: useCallback(
            (dto: RegisterRequestDto) => authApi.register(dto),
            [],
        ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: AUTH_ME_KEY });
        },
    });
}

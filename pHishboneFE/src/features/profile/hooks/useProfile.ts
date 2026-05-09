import { useCallback } from 'react';
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { profileApi } from '../api/profileApi';
import { AUTH_ME_KEY } from '../../auth';
import type { SpeciesBookmarkFilterDto } from '../types';

export const PROFILE_BOOKMARKS_QUERY_KEY = ['profile', 'bookmarks'] as const;

/**
 * Mutation to update the user's username.
 * On success, invalidates AUTH_ME_KEY so all consumers re-fetch the latest profile.
 */
export function useUpdateProfileMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: useCallback((username: string) => profileApi.updateProfile(username), []),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: AUTH_ME_KEY });
        },
    });
}

/**
 * Mutation to upload a new avatar image.
 * On success, invalidates AUTH_ME_KEY so the navbar avatar updates immediately.
 */
export function useUploadAvatarMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: useCallback((file: File) => profileApi.uploadAvatar(file), []),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: AUTH_ME_KEY });
        },
    });
}

/**
 * Mutation to request an email change via Supabase Auth.
 * No cache invalidation — the email change only takes effect after confirmation.
 */
export function useChangeEmailMutation() {
    return useMutation({
        mutationFn: useCallback((newEmail: string) => profileApi.changeEmail(newEmail), []),
    });
}

/**
 * Mutation to change the user's password (requires current password for verification).
 */
export function useChangePasswordMutation() {
    return useMutation({
        mutationFn: useCallback(
            ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
                profileApi.changePassword(currentPassword, newPassword),
            [],
        ),
    });
}

/**
 * Suspense query for the authenticated user's bookmark library.
 */
export function useProfileBookmarksQuery(filter: SpeciesBookmarkFilterDto) {
    return useSuspenseQuery({
        queryKey: [...PROFILE_BOOKMARKS_QUERY_KEY, filter],
        queryFn: () => profileApi.getBookmarks(filter),
    });
}

/**
 * Removes a bookmarked species and refreshes dependent bookmark-aware views.
 */
export function useRemoveBookmarkMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: useCallback((speciesId: string) => profileApi.removeBookmark(speciesId), []),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: PROFILE_BOOKMARKS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ['public-catalog', 'species-page'] });
        },
    });
}


// Type augmentation for react-i18next — enables TypeScript autocomplete on t('key.path').
// This file must import our en.json as the single source of truth for key shapes.
import en from './locales/en.json';

declare module 'react-i18next' {
    interface CustomTypeOptions {
        defaultNS: 'translation';
        resources: {
            translation: typeof en;
        };
    }
}

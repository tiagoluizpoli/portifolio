import * as React from 'react';

const STORAGE_NAMESPACE = 'zenith:form-backup:';
const EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useFormPersistence<T>(formKey: string, initialData: T) {
  const fullKey = `${STORAGE_NAMESPACE}${formKey}`;

  // Restore logic
  const restore = React.useCallback(() => {
    if (typeof window === 'undefined') return initialData;
    const stored = window.localStorage.getItem(fullKey);
    if (!stored) return initialData;

    try {
      const { data, timestamp } = JSON.parse(stored);
      if (Date.now() - timestamp > EXPIRATION_MS) {
        window.localStorage.removeItem(fullKey);
        return initialData;
      }
      return data as T;
    } catch (_e) {
      return initialData;
    }
  }, [fullKey, initialData]);

  const [formData, setFormData] = React.useState<T>(restore);

  // Persistence logic
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const backup = {
      data: formData,
      timestamp: Date.now(),
    };
    window.localStorage.setItem(fullKey, JSON.stringify(backup));
  }, [fullKey, formData]);

  const clearBackup = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(fullKey);
  }, [fullKey]);

  return [formData, setFormData, clearBackup] as const;
}

import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { getDateFnsLocale } from '@/ui/field/display/utils/getDateFnsLocale';
import { enUS } from 'date-fns/locale';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type APP_LOCALES } from 'twenty-shared/translations';

export const useUpdateDateLocaleCatalog = () => {
  const store = useStore();

  const updateDateLocaleCatalog = useCallback(
    async (newLocale: keyof typeof APP_LOCALES) => {
      if (store.get(dateLocaleState.atom).locale === newLocale) {
        return;
      }

      const localeCatalog = await getDateFnsLocale(newLocale);

      store.set(dateLocaleState.atom, {
        locale: newLocale,
        localeCatalog: localeCatalog ?? enUS,
      });
    },
    [store],
  );

  return { updateDateLocaleCatalog };
};

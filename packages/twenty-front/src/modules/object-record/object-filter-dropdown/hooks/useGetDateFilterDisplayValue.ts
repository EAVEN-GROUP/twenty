import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { useUserDateFormat } from '@/ui/input/components/internal/date/hooks/useUserDateFormat';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type Temporal } from 'temporal-polyfill';
import { formatZonedDateTimeDatePart } from '@/localization/utils/formatZonedDateTimeDatePart';

export const useGetDateFilterDisplayValue = () => {
  const { userDateFormat } = useUserDateFormat();
  const dateLocale = useAtomStateValue(dateLocaleState);

  const getDateFilterDisplayValue = (zonedDateTime: Temporal.ZonedDateTime) => {
    const displayValue = `${formatZonedDateTimeDatePart(zonedDateTime, userDateFormat, dateLocale.localeCatalog.code)}`;

    return { displayValue };
  };

  return {
    getDateFilterDisplayValue,
  };
};

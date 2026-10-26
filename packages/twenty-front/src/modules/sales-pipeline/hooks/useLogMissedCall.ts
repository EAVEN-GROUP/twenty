import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { PERSON_STATUS_VALUE } from '@/sales-pipeline/constants/PersonStatusValue';
import { useGetMaxCallAttempts } from '@/sales-pipeline/hooks/useGetMaxCallAttempts';
import { getMissedCallUpdate } from '@/sales-pipeline/utils/getMissedCallUpdate';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { Temporal } from 'temporal-polyfill';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

export const useLogMissedCall = () => {
  const { t } = useLingui();
  const apolloCoreClient = useApolloCoreClient();
  const { userTimezone } = useUserTimezone();
  const dateLocale = useAtomStateValue(dateLocaleState);
  const { updateOneRecord } = useUpdateOneRecord();
  const { enqueueToast } = useToast();
  const { fetchMaxCallAttempts } = useGetMaxCallAttempts();

  const { findOneRecordQuery } = useFindOneRecordQuery({
    objectNameSingular: CoreObjectNameSingular.Person,
    recordGqlFields: { id: true, callAttempts: true, callDate: true },
  });

  const logMissedCall = async ({
    personId,
    previousStatus,
  }: {
    personId: string;
    previousStatus: unknown;
  }) => {
    const maxCallAttempts = await fetchMaxCallAttempts();
    const { data } = await apolloCoreClient.query<
      Record<string, RecordGqlNode>
    >({
      query: findOneRecordQuery,
      variables: { objectRecordId: personId },
      fetchPolicy: 'network-only',
    });

    const person = data?.[CoreObjectNameSingular.Person];
    const now = Temporal.Now.zonedDateTimeISO(userTimezone);

    const missedCallUpdate = getMissedCallUpdate({
      previousStatus,
      callAttempts: person?.callAttempts,
      callDate: person?.callDate,
      now,
      maxCallAttempts,
    });

    if (!isDefined(missedCallUpdate)) {
      enqueueToast({
        status: 'info',
        children: t`A missed call was already logged today. Only one attempt per day counts.`,
      });
      return false;
    }

    await updateOneRecord({
      objectNameSingular: CoreObjectNameSingular.Person,
      idToUpdate: personId,
      updateOneRecordInput: missedCallUpdate,
    });

    if (missedCallUpdate.status === PERSON_STATUS_VALUE.UNREACHABLE) {
      enqueueToast({
        status: 'warning',
        children: t`${maxCallAttempts} missed calls: the lead is now unreachable.`,
      });
      return true;
    }

    const attempt = missedCallUpdate.callAttempts;
    const nextCall = isDefined(missedCallUpdate.nextCallAt)
      ? Temporal.Instant.from(missedCallUpdate.nextCallAt)
          .toZonedDateTimeISO(userTimezone)
          .toLocaleString(dateLocale.localeCatalog.code, {
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit',
          })
      : '';

    enqueueToast({
      status: 'success',
      children: t`Missed call ${attempt} of ${maxCallAttempts} logged. Next contact: ${nextCall}.`,
    });

    return true;
  };

  return { logMissedCall };
};

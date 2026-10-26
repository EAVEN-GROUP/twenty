import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { LEAD_CALL_OBJECT_NAME_SINGULAR } from '@/sales-pipeline/constants/LeadCallObjectNameSingular';
import { type LeadCallOutcome } from '@/sales-pipeline/types/LeadCallOutcome';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Temporal } from 'temporal-polyfill';

const OUTCOME_FIELD_NAME = 'outcome';

export const useLogLeadCall = () => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const dateLocale = useAtomStateValue(dateLocaleState);
  const { userTimezone } = useUserTimezone();
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: LEAD_CALL_OBJECT_NAME_SINGULAR,
  });
  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: LEAD_CALL_OBJECT_NAME_SINGULAR,
  });

  const logLeadCall = async ({
    personId,
    outcome,
  }: {
    personId: string;
    outcome: LeadCallOutcome;
  }) => {
    const calledAt = Temporal.Now.zonedDateTimeISO(userTimezone);
    const outcomeLabel =
      objectMetadataItem.fields
        .find(({ name }) => name === OUTCOME_FIELD_NAME)
        ?.options?.find(({ value }) => value === outcome)?.label ?? outcome;
    // The name is what the lead's Calls chips show, so it carries the date too.
    const calledAtLabel = calledAt.toLocaleString(
      dateLocale.localeCatalog.code,
      { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' },
    );

    await createOneRecord({
      name: `${outcomeLabel} · ${calledAtLabel}`,
      calledAt: calledAt.toInstant().toString(),
      outcome,
      personId,
      setterId: currentWorkspaceMember?.id ?? null,
    });
  };

  return { logLeadCall };
};

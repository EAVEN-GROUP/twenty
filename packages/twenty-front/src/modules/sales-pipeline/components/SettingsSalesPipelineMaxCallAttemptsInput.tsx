import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SALES_PIPELINE_SETTING_OBJECT_NAME_SINGULAR } from '@/sales-pipeline/constants/SalesPipelineSettingObjectNameSingular';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { useDebouncedCallback } from 'use-debounce';
import { v4 } from 'uuid';

type SettingsSalesPipelineMaxCallAttemptsInputProps = {
  salesPipelineSettingId?: string;
  initialMaxCallAttempts: number;
};

export const SettingsSalesPipelineMaxCallAttemptsInput = ({
  salesPipelineSettingId,
  initialMaxCallAttempts,
}: SettingsSalesPipelineMaxCallAttemptsInputProps) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { updateOneRecord } = useUpdateOneRecord();
  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: SALES_PIPELINE_SETTING_OBJECT_NAME_SINGULAR,
  });

  const [maxCallAttempts, setMaxCallAttempts] = useState(
    String(initialMaxCallAttempts),
  );
  const [settingId, setSettingId] = useState(salesPipelineSettingId);

  const saveMaxCallAttempts = useDebouncedCallback(async (value: string) => {
    const nextMaxCallAttempts = Number(value);

    if (!Number.isInteger(nextMaxCallAttempts) || nextMaxCallAttempts < 1) {
      return;
    }

    try {
      if (isDefined(settingId)) {
        await updateOneRecord({
          objectNameSingular: SALES_PIPELINE_SETTING_OBJECT_NAME_SINGULAR,
          idToUpdate: settingId,
          updateOneRecordInput: { maxCallAttempts: nextMaxCallAttempts },
        });
        return;
      }

      const newSettingId = v4();

      await createOneRecord({
        id: newSettingId,
        maxCallAttempts: nextMaxCallAttempts,
      });
      setSettingId(newSettingId);
    } catch {
      enqueueToast({
        status: 'error',
        children: t`The number of call attempts could not be saved.`,
      });
    }
  }, 500);

  return (
    <SettingsTextInput
      instanceId="sales-pipeline-max-call-attempts"
      label={t`Call attempts`}
      type="number"
      min={1}
      value={maxCallAttempts}
      onChange={(value) => {
        setMaxCallAttempts(value);
        saveMaxCallAttempts(value);
      }}
    />
  );
};

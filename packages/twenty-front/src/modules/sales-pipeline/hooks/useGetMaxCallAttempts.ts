import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { SALES_PIPELINE_SETTING_OBJECT_NAME_SINGULAR } from '@/sales-pipeline/constants/SalesPipelineSettingObjectNameSingular';
import { getMaxCallAttempts } from '@/sales-pipeline/utils/getMaxCallAttempts';

export const useGetMaxCallAttempts = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { findManyRecordsQuery } = useFindManyRecordsQuery({
    objectNameSingular: SALES_PIPELINE_SETTING_OBJECT_NAME_SINGULAR,
    recordGqlFields: { id: true, maxCallAttempts: true },
  });

  const fetchMaxCallAttempts = async () => {
    const { data } =
      await apolloCoreClient.query<RecordGqlOperationFindManyResult>({
        query: findManyRecordsQuery,
        variables: { orderBy: [{ createdAt: 'AscNullsLast' }], limit: 1 },
        fetchPolicy: 'network-only',
      });

    return getMaxCallAttempts(
      data?.salesPipelineSettings?.edges[0]?.node.maxCallAttempts,
    );
  };

  return { fetchMaxCallAttempts };
};

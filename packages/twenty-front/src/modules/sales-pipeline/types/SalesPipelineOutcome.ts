import {
  type OpportunityOutcomeStatus,
  type PersonOutcomeStatus,
} from '@/sales-pipeline/types/SalesPipelineFieldChange';

export type SalesPipelineOutcome =
  | {
      objectNameSingular: 'person';
      recordId: string;
      status: PersonOutcomeStatus;
    }
  | {
      objectNameSingular: 'opportunity';
      recordId: string;
      status: OpportunityOutcomeStatus;
    };

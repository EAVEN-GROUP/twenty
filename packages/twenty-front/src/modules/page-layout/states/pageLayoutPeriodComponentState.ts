import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { type DashboardPeriod } from '@/page-layout/types/DashboardPeriod';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const pageLayoutPeriodComponentState =
  createAtomComponentState<DashboardPeriod>({
    key: 'pageLayoutPeriodComponentState',
    defaultValue: 'ALL',
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });

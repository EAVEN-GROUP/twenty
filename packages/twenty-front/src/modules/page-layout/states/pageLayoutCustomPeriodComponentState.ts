import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { type DashboardCustomPeriod } from '@/page-layout/types/DashboardCustomPeriod';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const pageLayoutCustomPeriodComponentState =
  createAtomComponentState<DashboardCustomPeriod>({
    key: 'pageLayoutCustomPeriodComponentState',
    defaultValue: { from: null, to: null },
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });

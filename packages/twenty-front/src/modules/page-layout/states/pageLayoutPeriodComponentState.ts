import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { type DashboardPeriod } from '@/page-layout/types/DashboardPeriod';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { doNotTranslate } from 'twenty-shared/i18n';

export const pageLayoutPeriodComponentState =
  createAtomComponentState<DashboardPeriod>({
    key: 'pageLayoutPeriodComponentState',
    defaultValue: doNotTranslate('ALL'),
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });

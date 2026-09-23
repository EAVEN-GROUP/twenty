import { useStore } from 'jotai';
import { useCallback } from 'react';
import { createPath, useNavigate } from 'react-router-dom';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';

type NavigateToRecordPageParams = {
  objectNameSingular: string;
  recordId: string;
};

export const useNavigateToRecordPageFromSidePanel = () => {
  const store = useStore();
  const navigate = useNavigate();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const sidePanelPageInstanceId = useComponentInstanceStateContext(
    SidePanelPageComponentInstanceContext,
  )?.instanceId;

  const navigateToRecordPage = useCallback(
    ({ objectNameSingular, recordId }: NavigateToRecordPageParams) => {
      const navigationStack = store.get(sidePanelNavigationStackState.atom);
      const currentRoutedLocation = navigationStack.at(-1)?.routedLocation;
      const currentRoutedPath = isDefined(currentRoutedLocation)
        ? createPath(currentRoutedLocation)
        : undefined;
      const recordPath = getAppPath(AppPath.RecordShowPage, {
        objectNameSingular,
        objectRecordId: recordId,
      });

      const isExpandingCurrentRoutedRecord =
        currentRoutedLocation?.pathname === recordPath;

      const fallbackTabId =
        objectNameSingular === CoreObjectNameSingular.Note ||
        objectNameSingular === CoreObjectNameSingular.Task
          ? 'richText'
          : 'timeline';
      const destinationPath =
        isExpandingCurrentRoutedRecord && isDefined(currentRoutedPath)
          ? currentRoutedPath
          : `${recordPath}#${encodeURIComponent(fallbackTabId)}`;

      const panelParentViewState = isDefined(sidePanelPageInstanceId)
        ? contextStoreRecordShowParentViewComponentState.atomFamily({
            instanceId: sidePanelPageInstanceId,
          })
        : undefined;
      const parentView = isDefined(panelParentViewState)
        ? store.get(panelParentViewState)
        : undefined;

      store.set(
        contextStoreRecordShowParentViewComponentState.atomFamily({
          instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
        }),
        isDefined(parentView) &&
          parentView.parentViewObjectNameSingular === objectNameSingular
          ? parentView
          : undefined,
      );

      navigate(destinationPath, { surface: 'main' });

      void closeSidePanelMenu();
    },
    [closeSidePanelMenu, navigate, sidePanelPageInstanceId, store],
  );

  return { navigateToRecordPage };
};

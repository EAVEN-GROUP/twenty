import { renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useUpdatePersonName } from '@/meetings/hooks/useUpdatePersonName';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

const mockUpdateOneRecord = jest.fn();

jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: () => ({ updateOneRecord: mockUpdateOneRecord }),
}));

const PERSON_ID = 'person-id';

const renderUpdatePersonName = (
  currentName: { firstName: string | null; lastName: string | null } | null,
) => {
  const store = createStore();

  store.set(recordStoreFamilyState.atomFamily(PERSON_ID), {
    id: PERSON_ID,
    __typename: 'Person',
    name: currentName,
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>{children}</JotaiProvider>
  );

  return renderHook(() => useUpdatePersonName(), { wrapper: Wrapper });
};

describe('useUpdatePersonName', () => {
  beforeEach(() => {
    mockUpdateOneRecord.mockReset();
  });

  it('saves the trimmed name on the person', async () => {
    const { result } = renderUpdatePersonName({
      firstName: null,
      lastName: null,
    });

    await result.current.updatePersonName({
      personId: PERSON_ID,
      personName: { firstName: ' Mario', lastName: 'Rossi ' },
    });

    expect(mockUpdateOneRecord).toHaveBeenCalledWith({
      objectNameSingular: 'person',
      idToUpdate: PERSON_ID,
      updateOneRecordInput: {
        name: { firstName: 'Mario', lastName: 'Rossi' },
      },
    });
  });

  it('does not update the person when the name is unchanged', async () => {
    const { result } = renderUpdatePersonName({
      firstName: 'Mario',
      lastName: 'Rossi',
    });

    await result.current.updatePersonName({
      personId: PERSON_ID,
      personName: { firstName: 'Mario ', lastName: 'Rossi' },
    });

    expect(mockUpdateOneRecord).not.toHaveBeenCalled();
  });

  it('does not update a person without a name when no name is entered', async () => {
    const { result } = renderUpdatePersonName(null);

    await result.current.updatePersonName({
      personId: PERSON_ID,
      personName: { firstName: '', lastName: '  ' },
    });

    expect(mockUpdateOneRecord).not.toHaveBeenCalled();
  });

  it('lets the caller handle a failed update', async () => {
    mockUpdateOneRecord.mockRejectedValueOnce(new Error('update failed'));
    const { result } = renderUpdatePersonName(null);

    await expect(
      result.current.updatePersonName({
        personId: PERSON_ID,
        personName: { firstName: 'Mario', lastName: '' },
      }),
    ).rejects.toThrow('update failed');
  });
});

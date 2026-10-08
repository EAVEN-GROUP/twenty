import { renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import {
  currentWorkspaceMemberState,
  type CurrentWorkspaceMember,
} from '@/auth/states/currentWorkspaceMemberState';
import { useCreateMeetingForPerson } from '@/meetings/hooks/useCreateMeetingForPerson';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

const mockCreateOneRecord = jest.fn();
const mockUpdateOneRecord = jest.fn();

jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: () => ({
    createOneRecord: mockCreateOneRecord,
    loading: false,
  }),
}));

jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: () => ({ updateOneRecord: mockUpdateOneRecord }),
}));

const PERSON_ID = 'person-id';
const MEETING_DATE = '2026-10-15T13:00:00Z';

const renderCreateMeetingForPerson = (personStatus: string) => {
  const store = createStore();

  store.set(currentWorkspaceMemberState.atom, {
    id: 'workspace-member-id',
  } as CurrentWorkspaceMember);
  store.set(recordStoreFamilyState.atomFamily(PERSON_ID), {
    id: PERSON_ID,
    __typename: 'Person',
    status: personStatus,
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>{children}</JotaiProvider>
  );

  return renderHook(() => useCreateMeetingForPerson(), { wrapper: Wrapper });
};

describe('useCreateMeetingForPerson', () => {
  beforeEach(() => {
    mockCreateOneRecord.mockReset();
    mockUpdateOneRecord.mockReset();
  });

  it('creates a scheduled meeting owned by the current member and marks the person as booked', async () => {
    const { result } = renderCreateMeetingForPerson('TO_CALL');

    await result.current.createMeetingForPerson({
      personId: PERSON_ID,
      meetingDate: MEETING_DATE,
    });

    expect(mockCreateOneRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        personId: PERSON_ID,
        meetingDate: MEETING_DATE,
        status: 'SCHEDULED',
        ownerId: 'workspace-member-id',
      }),
    );
    expect(mockUpdateOneRecord).toHaveBeenCalledWith({
      objectNameSingular: 'person',
      idToUpdate: PERSON_ID,
      updateOneRecordInput: { status: 'BOOKED' },
    });
  });

  it('leaves the person untouched when already booked', async () => {
    const { result } = renderCreateMeetingForPerson('BOOKED');

    await result.current.createMeetingForPerson({
      personId: PERSON_ID,
      meetingDate: MEETING_DATE,
    });

    expect(mockCreateOneRecord).toHaveBeenCalledTimes(1);
    expect(mockUpdateOneRecord).not.toHaveBeenCalled();
  });

  it('does not touch the person status when the meeting creation fails', async () => {
    mockCreateOneRecord.mockRejectedValueOnce(new Error('create failed'));
    const { result } = renderCreateMeetingForPerson('TO_CALL');

    await expect(
      result.current.createMeetingForPerson({
        personId: PERSON_ID,
        meetingDate: MEETING_DATE,
      }),
    ).rejects.toThrow('create failed');

    expect(mockUpdateOneRecord).not.toHaveBeenCalled();
  });
});

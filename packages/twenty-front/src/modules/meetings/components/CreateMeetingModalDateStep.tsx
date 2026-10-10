import { CREATE_MEETING_MODAL_ID } from '@/meetings/constants/CreateMeetingModalId';
import { DateTimePicker } from '@/ui/input/components/internal/date/components/DateTimePicker';
import { styled } from '@linaria/react';
import { type Temporal } from 'temporal-polyfill';

const StyledPickerContainer = styled.div`
  display: flex;
  justify-content: center;
`;

type CreateMeetingModalDateStepProps = {
  meetingDate: Temporal.ZonedDateTime | null;
  onMeetingDateChange: (meetingDate: Temporal.ZonedDateTime | null) => void;
};

export const CreateMeetingModalDateStep = ({
  meetingDate,
  onMeetingDateChange,
}: CreateMeetingModalDateStepProps) => (
  <StyledPickerContainer>
    <DateTimePicker
      instanceId={`${CREATE_MEETING_MODAL_ID}-date-time-picker`}
      date={meetingDate}
      onChange={onMeetingDateChange}
      clearable={false}
    />
  </StyledPickerContainer>
);

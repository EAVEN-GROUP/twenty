import { CREATE_MEETING_MODAL_ID } from '@/meetings/constants/CreateMeetingModalId';
import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { DateTimePicker } from '@/ui/input/components/internal/date/components/DateTimePicker';
import { styled } from '@linaria/react';
import { type Temporal } from 'temporal-polyfill';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledMeetingTypes = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledMeetingType = styled.div`
  flex: 1;
`;

const StyledPickerContainer = styled.div`
  display: flex;
  justify-content: center;
`;

type CreateMeetingModalDateStepProps = {
  meetingDate: Temporal.ZonedDateTime | null;
  onMeetingDateChange: (meetingDate: Temporal.ZonedDateTime | null) => void;
  meetingTypeOptions: FieldMetadataItemOption[];
  meetingType: string | null;
  onMeetingTypeChange: (meetingType: string) => void;
};

export const CreateMeetingModalDateStep = ({
  meetingDate,
  onMeetingDateChange,
  meetingTypeOptions,
  meetingType,
  onMeetingTypeChange,
}: CreateMeetingModalDateStepProps) => (
  <StyledContainer>
    {meetingTypeOptions.length > 0 && (
      <StyledMeetingTypes>
        {meetingTypeOptions.map(({ value, label }) => (
          <StyledMeetingType key={value}>
            <Button
              onClick={() => onMeetingTypeChange(value)}
              variant={value === meetingType ? 'solid' : 'outline'}
              color={value === meetingType ? 'accent' : undefined}
              fullWidth
            >
              {label}
            </Button>
          </StyledMeetingType>
        ))}
      </StyledMeetingTypes>
    )}
    <StyledPickerContainer>
      <DateTimePicker
        instanceId={`${CREATE_MEETING_MODAL_ID}-date-time-picker`}
        date={meetingDate}
        onChange={onMeetingDateChange}
        clearable={false}
      />
    </StyledPickerContainer>
  </StyledContainer>
);

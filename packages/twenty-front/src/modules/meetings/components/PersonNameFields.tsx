import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { TextInput } from '@/ui/input/components/TextInput';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledNameFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

type PersonNameFieldsProps = {
  personName: FieldFullNameValue;
  onPersonNameChange: (personName: FieldFullNameValue) => void;
  autoFocus?: boolean;
};

export const PersonNameFields = ({
  personName,
  onPersonNameChange,
  autoFocus = false,
}: PersonNameFieldsProps) => {
  const { t } = useLingui();

  return (
    <StyledNameFields>
      <TextInput
        label={t`First Name`}
        value={personName.firstName}
        onChange={(firstName) =>
          onPersonNameChange({ ...personName, firstName })
        }
        autoFocus={autoFocus}
        fullWidth
      />
      <TextInput
        label={t`Last Name`}
        value={personName.lastName}
        onChange={(lastName) => onPersonNameChange({ ...personName, lastName })}
        fullWidth
      />
    </StyledNameFields>
  );
};

import { INFO_CHANNEL_VALUE } from '@/sales-pipeline/constants/InfoChannelValue';
import { type InfoChannel } from '@/sales-pipeline/types/InfoChannel';
import { TextInput } from '@/ui/input/components/TextInput';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Radio, RadioGroup } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledChannels = styled.div`
  gap: ${themeCssVariables.spacing[4]};
`;

type SalesPipelineSendInfoFieldsProps = {
  infoChannel: InfoChannel;
  onInfoChannelChange: (infoChannel: InfoChannel) => void;
  phoneNumber: string;
  onPhoneNumberChange: (phoneNumber: string) => void;
  email: string;
  onEmailChange: (email: string) => void;
};

export const SalesPipelineSendInfoFields = ({
  infoChannel,
  onInfoChannelChange,
  phoneNumber,
  onPhoneNumberChange,
  email,
  onEmailChange,
}: SalesPipelineSendInfoFieldsProps) => {
  const { t } = useLingui();

  return (
    <StyledContainer>
      <RadioGroup
        orientation="horizontal"
        render={<StyledChannels />}
        aria-label={t`Send the info via`}
        value={infoChannel}
        onValueChange={(value: InfoChannel) => onInfoChannelChange(value)}
      >
        <Radio value={INFO_CHANNEL_VALUE.WHATSAPP}>{t`WhatsApp`}</Radio>
        <Radio value={INFO_CHANNEL_VALUE.EMAIL}>{t`Email`}</Radio>
      </RadioGroup>
      {infoChannel === INFO_CHANNEL_VALUE.WHATSAPP ? (
        <TextInput
          label={t`WhatsApp number`}
          value={phoneNumber}
          onChange={onPhoneNumberChange}
          fullWidth
        />
      ) : (
        <TextInput
          label={t`Email`}
          value={email}
          onChange={onEmailChange}
          fullWidth
        />
      )}
    </StyledContainer>
  );
};

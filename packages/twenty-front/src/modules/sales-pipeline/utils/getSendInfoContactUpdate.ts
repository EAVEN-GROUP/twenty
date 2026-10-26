import {
  type FieldEmailsValue,
  type FieldPhonesValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { INFO_CHANNEL_VALUE } from '@/sales-pipeline/constants/InfoChannelValue';
import { type InfoChannel } from '@/sales-pipeline/types/InfoChannel';
import { isNonEmptyString } from '@sniptt/guards';

export const getSendInfoContactUpdate = ({
  infoChannel,
  phoneNumber,
  email,
  currentPhones,
  currentEmails,
}: {
  infoChannel: InfoChannel;
  phoneNumber: string;
  email: string;
  currentPhones: FieldPhonesValue | null | undefined;
  currentEmails: FieldEmailsValue | null | undefined;
}): Record<string, unknown> => {
  if (infoChannel === INFO_CHANNEL_VALUE.WHATSAPP) {
    const trimmedPhoneNumber = phoneNumber.trim();

    if (
      !isNonEmptyString(trimmedPhoneNumber) ||
      trimmedPhoneNumber === currentPhones?.primaryPhoneNumber
    ) {
      return { infoChannel };
    }

    return {
      infoChannel,
      phones: {
        primaryPhoneNumber: trimmedPhoneNumber,
        primaryPhoneCountryCode: currentPhones?.primaryPhoneCountryCode ?? '',
        primaryPhoneCallingCode: currentPhones?.primaryPhoneCallingCode ?? '',
        additionalPhones: currentPhones?.additionalPhones ?? null,
      },
    };
  }

  const trimmedEmail = email.trim();

  if (
    !isNonEmptyString(trimmedEmail) ||
    trimmedEmail === currentEmails?.primaryEmail
  ) {
    return { infoChannel };
  }

  return {
    infoChannel,
    emails: {
      primaryEmail: trimmedEmail,
      additionalEmails: currentEmails?.additionalEmails ?? null,
    },
  };
};

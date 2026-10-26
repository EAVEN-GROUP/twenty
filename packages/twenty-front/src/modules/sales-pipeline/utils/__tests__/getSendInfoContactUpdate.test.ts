import { getSendInfoContactUpdate } from '@/sales-pipeline/utils/getSendInfoContactUpdate';

const currentPhones = {
  primaryPhoneNumber: '3929624756',
  primaryPhoneCountryCode: 'IT',
  primaryPhoneCallingCode: '+39',
  additionalPhones: [],
};

const currentEmails = {
  primaryEmail: 'mario@example.com',
  additionalEmails: ['m.rossi@example.com'],
};

describe('getSendInfoContactUpdate', () => {
  it('only saves the channel when the contact did not change', () => {
    expect(
      getSendInfoContactUpdate({
        infoChannel: 'WHATSAPP',
        phoneNumber: ' 3929624756 ',
        email: '',
        currentPhones,
        currentEmails,
      }),
    ).toEqual({ infoChannel: 'WHATSAPP' });
    expect(
      getSendInfoContactUpdate({
        infoChannel: 'EMAIL',
        phoneNumber: '',
        email: 'mario@example.com',
        currentPhones,
        currentEmails,
      }),
    ).toEqual({ infoChannel: 'EMAIL' });
  });

  it('keeps the calling code when the WhatsApp number changes', () => {
    expect(
      getSendInfoContactUpdate({
        infoChannel: 'WHATSAPP',
        phoneNumber: '3331234567',
        email: 'ignored@example.com',
        currentPhones,
        currentEmails,
      }),
    ).toEqual({
      infoChannel: 'WHATSAPP',
      phones: {
        primaryPhoneNumber: '3331234567',
        primaryPhoneCountryCode: 'IT',
        primaryPhoneCallingCode: '+39',
        additionalPhones: [],
      },
    });
  });

  it('keeps additional emails when the email changes', () => {
    expect(
      getSendInfoContactUpdate({
        infoChannel: 'EMAIL',
        phoneNumber: '3929624756',
        email: 'nuova@example.com',
        currentPhones,
        currentEmails,
      }),
    ).toEqual({
      infoChannel: 'EMAIL',
      emails: {
        primaryEmail: 'nuova@example.com',
        additionalEmails: ['m.rossi@example.com'],
      },
    });
  });

  it('never clears a contact left empty', () => {
    expect(
      getSendInfoContactUpdate({
        infoChannel: 'WHATSAPP',
        phoneNumber: '  ',
        email: '',
        currentPhones,
        currentEmails,
      }),
    ).toEqual({ infoChannel: 'WHATSAPP' });
  });
});

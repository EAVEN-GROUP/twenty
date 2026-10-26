import { type INFO_CHANNEL_VALUE } from '@/sales-pipeline/constants/InfoChannelValue';

export type InfoChannel =
  (typeof INFO_CHANNEL_VALUE)[keyof typeof INFO_CHANNEL_VALUE];

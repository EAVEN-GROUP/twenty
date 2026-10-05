import { type RecordIndexStatCardFilter } from '@/object-record/record-index/types/RecordIndexStatCardFilter';
import { type MessageDescriptor } from '@lingui/core';

type RecordIndexStatCardBaseConfig = {
  key: string;
  label: MessageDescriptor;
  tone: 'default' | 'blue' | 'green' | 'purple';
  // Defaults to the object of the page. A card on another object ignores the
  // filters of the current view, since they target fields of the page object.
  objectNameSingular?: string;
};

export type RecordIndexStatCardConfig =
  | (RecordIndexStatCardBaseConfig & {
      kind: 'count';
      filter: RecordIndexStatCardFilter;
    })
  | (RecordIndexStatCardBaseConfig & {
      kind: 'percentage';
      numeratorFilter: RecordIndexStatCardFilter;
      denominatorFilter: RecordIndexStatCardFilter;
    });

import { DatePicker } from '@/ui/input/components/internal/date/components/DatePicker';
import { DATE_PICKER_CONTAINER_WIDTH } from '@/ui/input/components/internal/date/components/StyledDatePickerContainer';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { UserContext } from '@/users/contexts/UserContext';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCalendar } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { formatDateString } from '~/utils/string/formatDateString';

const StyledDateButton = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: inline-flex;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  min-width: 112px;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};

  &:hover {
    border-color: ${themeCssVariables.border.color.strong};
  }
`;

type PageLayoutPeriodDatePickerProps = {
  dropdownId: string;
  value: string | null;
  onChange: (value: string | null) => void;
  ariaLabel: string;
};

export const PageLayoutPeriodDatePicker = ({
  dropdownId,
  value,
  onChange,
  ariaLabel,
}: PageLayoutPeriodDatePickerProps) => {
  const { t } = useLingui();
  const { dateFormat, timeZone } = useContext(UserContext);
  const dateLocale = useAtomStateValue(dateLocaleState);
  const { closeDropdown } = useCloseDropdown();

  const displayValue = isDefined(value)
    ? formatDateString({
        value,
        timeZone,
        dateFormat,
        localeCatalog: dateLocale.localeCatalog,
      })
    : t`Select date`;

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-start"
      clickableComponent={
        <StyledDateButton type="button" aria-label={ariaLabel}>
          {displayValue}
          <IconCalendar size={14} />
        </StyledDateButton>
      }
      dropdownComponents={
        <DropdownContent widthInPixels={DATE_PICKER_CONTAINER_WIDTH}>
          <DatePicker
            instanceId={`${dropdownId}-picker`}
            plainDateString={value}
            onChange={onChange}
            onClose={() => closeDropdown(dropdownId)}
            onClear={() => onChange(null)}
          />
        </DropdownContent>
      }
    />
  );
};

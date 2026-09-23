import { createContext } from 'react';

export const CommandMenuDropdownCloseContext = createContext<
  (() => void) | undefined
>(undefined);

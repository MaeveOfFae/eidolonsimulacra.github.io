export interface MobileCompareSelection {
  character1Id: string;
  character1Name: string;
}

let currentCompareSelection: MobileCompareSelection | null = null;

export function getMobileCompareSelection(): MobileCompareSelection | null {
  return currentCompareSelection;
}

export function setMobileCompareSelection(selection: MobileCompareSelection | null): void {
  currentCompareSelection = selection ? { ...selection } : null;
}

export function clearMobileCompareSelection(): void {
  currentCompareSelection = null;
}

import { MarketplaceUI } from './MarketplaceUI';

interface MarketplacePanelProps {
  open: boolean;
  onClose: () => void;
}

export function MarketplacePanel({
  open,
  onClose,
}: MarketplacePanelProps) {
  if (!open) {
    return null;
  }

  return (
    <MarketplaceUI
      onClose={onClose}
    />
  );
}
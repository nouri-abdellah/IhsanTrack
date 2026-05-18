import DonationModal from "./DonationModal";

export default function DonationActionModal({ campaign, onClose, onSuccess }) {
  const handleClose = () => {
    onClose?.();
    onSuccess?.();
  };

  return <DonationModal campaign={campaign} onClose={handleClose} />;
}

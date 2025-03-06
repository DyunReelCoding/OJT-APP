import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm }: ConfirmDeleteModalProps) {
  const [message, setMessage] = useState("");

  const handleConfirm = () => {
    onConfirm();
    setMessage("Successfully deleted!");
    setTimeout(() => setMessage(""), 3000); // Clear message after 3 seconds
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black">
        <DialogHeader>
          <DialogTitle className="text-red-700">Confirm Deletion</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to delete this recommendation?</p>
        {message && <p className="text-green-600 font-semibold">{message}</p>}
        <DialogFooter>
          <Button variant="outline" className="bg-blue-700 text-white border border-blue-700 hover:bg-white hover:text-blue-700"  onClick={onClose}>Cancel</Button>
          <Button variant="destructive" className="bg-red-700 text-white border border-red-700 hover:bg-white hover:text-red-700"  onClick={handleConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { Modal, ModalContent, ModalHeader } from "@heroui/react";
import React from "react";

export default function AvailableModelModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  return (
    <Modal
      isOpen={isOpen}
      isDismissable
      onOpenChange={setIsOpen}
      className="max-h-2/3"
    >
      <ModalContent>
        <div className="p-2 flex flex-col gap-y-1 overflow-y-auto">
          <ModalHeader className="flex flex-col w-full items-center">
            Available Models
          </ModalHeader>
          Coming soon
        </div>
      </ModalContent>
    </Modal>
  );
}

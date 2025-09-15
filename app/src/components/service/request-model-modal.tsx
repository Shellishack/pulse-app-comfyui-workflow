import { Modal, ModalContent, ModalHeader } from "@heroui/react";
import React from "react";

export default function RequestModelModal({
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
            Request Model
          </ModalHeader>
          <p>
            If you would like to request a model to be added to this official
            hosted Pulse App, please submit an issue on our{" "}
            <a
              href="https://github.com/Shellishack/pulse-app-comfyui-workflow"
              className="text-primary"
            >
              GitHub repository
            </a>
            .
          </p>

          <p>
            Model request is not guaranteed to be fulfilled. If you&apos;d like
            to customize this app or add models yourself, please refer to{" "}
            <a
              href="https://github.com/Shellishack/pulse-app-comfyui-workflow"
              className="text-primary"
            >
              GitHub repository
            </a>
            .
          </p>
        </div>
      </ModalContent>
    </Modal>
  );
}

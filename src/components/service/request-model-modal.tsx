import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import React, { useState } from "react";

export default function RequestModelModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const [model, setModel] = useState<{
    url: string;
    relativePath: string;
    filename: string;
  }>({
    url: "",
    relativePath: "",
    filename: "",
  });

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
          <Input
            label="URL"
            placeholder="Only .safetensors files are allowed"
            value={model.url}
            onValueChange={(value) => {
              setModel({ ...model, url: value });
            }}
          />
          <Input
            label="relative-path"
            placeholder="e.g. models/checkpoints"
            value={model.relativePath}
            onValueChange={(value) => {
              setModel({ ...model, relativePath: value });
            }}
          />

          <p>
            If you&apos;d like to build your own docker image, please refer to{" "}
            <a href="https://github.com/runpod-workers/worker-comfyui" className="text-primary">
              RunPod&apos;s documentation
            </a>
          </p>

          <div className="w-full flex flex-col">
            <Button color="primary">Request</Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}

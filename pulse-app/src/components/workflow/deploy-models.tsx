import {
  Button,
  Code,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import React, { useState } from "react";
import Icon from "../utils/icon";

export default function DeployModels({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const [models, setModels] = useState<
    {
      url: string;
      relativePath: string;
      filename: string;
    }[]
  >([]);

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
            Hint: Follow <Code color="secondary">comfy model download</Code>{" "}
            command.
          </p>
          {models.map((model, index) => (
            <div
              key={index}
              className="flex flex-col gap-y-1 bg-content3 p-2 rounded-lg"
            >
              <p>Model {index + 1}</p>
              <Input
                label="URL"
                placeholder="Only .safetensors files are allowed"
                value={model.url}
                onValueChange={(value) => {
                  const newModels = [...models];
                  newModels[index].url = value;
                  setModels(newModels);
                }}
              />
              <Input
                label="relative-path"
                placeholder="e.g. models/checkpoints"
                value={model.relativePath}
                onValueChange={(value) => {
                  const newModels = [...models];
                  newModels[index].relativePath = value;
                  setModels(newModels);
                }}
              />
              <Input
                label="filename"
                placeholder="Match your workflow"
                value={model.filename}
                onValueChange={(value) => {
                  const newModels = [...models];
                  newModels[index].filename = value;
                  setModels(newModels);
                }}
              />
            </div>
          ))}
          <div className="w-full flex justify-center">
            <Button
              className="w-fit"
              onPress={() =>
                setModels([
                  ...models,
                  { url: "", relativePath: "", filename: "" },
                ])
              }
            >
              <Icon name="add" />
              Add Model
            </Button>
          </div>

          <div className="w-full flex flex-col">
            <Button color="primary">Deploy</Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}

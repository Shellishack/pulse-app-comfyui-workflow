import { Button, Input } from "@heroui/react";
import React, { useState } from "react";
import Icon from "../utils/icon";

export default function Workflow({
  toggleViewMode,
}: {
  toggleViewMode: () => void;
}) {
  const [inputValue, setInputValue] = useState<string | undefined>(undefined);

  return (
    <div className="w-full h-full grid grid-rows-[max-content_auto] gap-y-2">
      <div className="flex gap-x-1 items-center">
        <div className="w-full flex items-center gap-x-2">
          <p className="text-lg text-nowrap">ComfyUI Edit</p>
          <Input
            label="ComfyUI Server URL"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onKeyDown={(e: any) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const value = e.target.value;
                console.log("Enter pressed, setting input value");
                setInputValue(value);
              }
            }}
            className="h-10"
          />
        </div>
        <div className="flex gap-x-1">
          <Button
            variant="light"
            onPress={() => {
              window.open(
                "https://github.com/shellishack/pulse-app-comfyui-workflow",
                "_blank"
              );
            }}
            isIconOnly
          >
            <Icon uri="assets/github-mark-dark" extension=".svg" />
          </Button>
          <Button
            color="primary"
            variant="bordered"
            onPress={() => {
              toggleViewMode();
            }}
          >
            <Icon name="hub" />
            <p>API</p>
          </Button>
        </div>
      </div>
      <div className="w-full h-full border-1 border-divider rounded-lg bg-content2 text-content2-foreground overflow-hidden">
        {inputValue ? (
          <iframe src={inputValue} className="w-full h-full" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>
              Please enter the ComfyUI server URL above and press Enter to
              continue.
              <br />
              (WIP) Or, create a new ComfyUI instance to use ComfyUI on the
              cloud.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

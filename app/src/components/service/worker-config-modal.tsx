import { Modal, ModalContent, ModalHeader, Spinner } from "@heroui/react";
import React from "react";
import useSWR from "swr";

export default function WorkerConfigModal({
  isOpen,
  setIsOpen,
  endpointName,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  endpointName: string;
}) {
  const { data: gpus, isLoading: isLoadingGPUs } = useSWR<string[] | undefined>(
    `/server-function/runpod/get-gpus?endpointName=${endpointName}`,
    (url: string) => fetch(url).then((res) => res.json())
  );
  const { data: s3Data, isLoading: isLoadingS3 } = useSWR<string[] | undefined>(
    "/server-function/s3/list",
    (url: string) =>
      fetch(url)
        .then((res) => res.json())
        .then((data) => data.data)
  );

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
          <div>
            <p>Used GPUs: </p>
            {isLoadingGPUs ? (
              <Spinner />
            ) : (
              gpus?.map((gpu) => <div key={gpu}>- {gpu}</div>)
            )}

            <p>ComfyUI: </p>
            {isLoadingS3 ? (
              <Spinner />
            ) : (
              s3Data?.map((model) => (
                <div key={model} className="flex items-center gap-x-1">
                  <p className="flex-1 text-nowrap">- {model}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}

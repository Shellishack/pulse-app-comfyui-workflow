import {
  addToast,
  Alert,
  Button,
  Divider,
  Input,
  Spinner,
} from "@heroui/react";
import React, { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import Icon from "../utils/icon";
import RequestModelModal from "./request-model-modal";
import WorkerConfigModal from "./worker-config-modal";
import EndpointSelect from "../endpoint-select";
import { ENDPOINTS } from "../../lib/endpoints";

type WorkflowUserInput = {
  nodeId: string;
  title: string;
  inputs: {
    [key: string]: unknown;
  };
  outputTo: {
    title: string;
    input: string;
  }[];
};

type Workflow = {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiJson: any;
  userInput: WorkflowUserInput[];
};

export default function Service({
  toggleViewMode,
}: {
  toggleViewMode: () => void;
}) {
  const [workflow, setWorkflow] = useState<Workflow | undefined>(undefined);
  const [isDeployModelsOpen, setIsDeployModelsOpen] = useState(false);
  const [isAvailableModelsOpen, setIsAvailableModelsOpen] = useState(false);
  const [endpoint, setEndpoint] = useState<string | undefined>(
    ENDPOINTS.shared
  );
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    console.log("Workflows updated:", workflow);
  }, [workflow]);

  async function onDrop(acceptedFiles: File[]) {
    const file = acceptedFiles[0];

    const json = await readOneFile(file);
    const userInput = getWorkflowUserInputs(json);

    const addedWorkflow = {
      name: file.name,
      apiJson: json,
      userInput,
    };

    setWorkflow(addedWorkflow);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getWorkflowUserInputs(data: any) {
    // Add outputTo by traversing the inputs that have array type.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Object.values(data).forEach((value: any) => {
      const inputs = value.inputs;

      for (const [inputKey, inputValue] of Object.entries(inputs)) {
        if (Array.isArray(inputValue)) {
          const inputFrom = inputValue[0];
          if (data[inputFrom]) {
            if (!data[inputFrom].outputTo) {
              data[inputFrom].outputTo = [];
            }
            data[inputFrom].outputTo.push({
              title: value._meta.title,
              input: inputKey,
            });
          }
        }
      }
    });

    // Now we can get a list of easy to understand user inputs.
    const result: WorkflowUserInput[] =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Object.entries(data).map(([key, value]: [string, any]) => {
        const nodeId = key;
        const inputs = Object.entries(value.inputs)
          .filter(([, value]) => !Array.isArray(value))
          .map(([key, value]) => {
            // return the key and the type of value
            const res = {
              [key]: value,
            };
            return res;
          })
          .reduce((acc, curr) => {
            return { ...acc, ...curr };
          }, {});

        const title = value._meta.title;
        const outputTo = value.outputTo || [];

        return {
          nodeId,
          title,
          inputs,
          outputTo,
        };
      });

    return result;
  }

  async function readOneFile(file: File) {
    return new Promise<unknown>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const json = event.target?.result;
        if (typeof json === "string") {
          const data = JSON.parse(json);
          resolve(data);
        } else {
          reject(new Error("Failed to read file"));
        }
      };
      reader.readAsText(file);
    });
  }

  async function onUserInputChange(
    newValue: string,
    userInput: WorkflowUserInput,
    inputName: string
  ) {
    const type = typeof newValue;

    if (type === "number") {
      userInput.inputs[inputName] = Number(newValue);
    } else if (type === "string") {
      userInput.inputs[inputName] = newValue;
    }

    const updatedApiJson = { ...workflow?.apiJson };
    if (updatedApiJson[userInput.nodeId]) {
      updatedApiJson[userInput.nodeId].inputs[inputName] =
        userInput.inputs[inputName];
    }

    const newWorkflow = {
      name: workflow?.name || "Unnamed",
      apiJson: updatedApiJson,
      userInput: workflow?.userInput || [],
    };

    console.log("Updated workflow:", newWorkflow);
    setWorkflow(newWorkflow);
  }

  async function runInference() {
    setIsRunning(true);

    const response = await fetch("/server-function/runpod/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpointName: endpoint,
        workflow: workflow?.apiJson,
      }),
    });

    if (!response.ok) {
      setIsRunning(false);
      const error = await response.text();
      addToast({
        title: "Error",
        description: error,
        color: "danger",
      });
      return;
    }

    const data = await response.json();
    console.log("Inference result:", data);
    addToast({
      title: "Success",
      description: `Inference completed! Cost: $${data.cost}`,
      color: "success",
    });

    setIsRunning(false);
  }

  return (
    <div className="w-full h-full">
      <div className="w-full h-full grid grid-rows-[max-content_auto] gap-y-2">
        <div className="flex gap-x-1">
          <div className="w-full flex items-center gap-2 flex-wrap">
            <p className="text-lg">ComfyUI Serverless</p>
            <div className="flex items-center gap-2">
              <div className="w-64">
                <EndpointSelect
                  availableEndpoints={Object.values(ENDPOINTS)}
                  endpoint={endpoint}
                  setEndpoint={setEndpoint}
                />
              </div>

              {endpoint === ENDPOINTS.shared && (
                <Button onPress={() => setIsAvailableModelsOpen(true)}>
                  View Worker Configuration
                </Button>
              )}

              {workflow && (
                <Button onPress={() => setWorkflow(undefined)}>
                  Import New Workflow
                </Button>
              )}
            </div>
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
              onPress={() => {
                setIsDeployModelsOpen(true);
              }}
            >
              Request Models
            </Button>
            <Button
              color="primary"
              variant="bordered"
              onPress={() => {
                toggleViewMode();
              }}
            >
              <Icon name="edit" />
              <p>ComfyUI</p>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-y-1">
          <Alert
            className="whitespace-pre-wrap"
            color="primary"
            title="Use Models"
            description={`\
In order to use serverless APIs for ComfyUI workflows, you can use already existing models. If your model is not available, you need to either request it, or deploy this app yourself (see our GitHub).`}
            isClosable
          />

          <Alert
            className="whitespace-pre-wrap"
            color="primary"
            title="Serverless Workflow API Usage"
            description={`\
Import a ComfyUI workflow to start generating AI content via RESTful API (WIP) or Pulse Editor IMC.
You can also edit parameters of your workflow in this page, or connect to your ComfyUI server to do advanced editing.`}
            isClosable
          />
          {endpoint === ENDPOINTS.shared && (
            <Alert
              className="whitespace-pre-wrap"
              color="warning"
              title="Shared Endpoint Notice"
              description={`\
You are currently using the shared endpoint. This endpoint may be slow or unreliable during cold starts. If you experience issues, please consider select endpoint with a specific image.`}
              isClosable
            />
          )}

          {workflow ? (
            <div className="h-full w-full grid grid-rows-[auto_max-content] overflow-y-auto gap-y-1">
              <div className="h-full overflow-y-auto overflow-x-hidden">
                <p className="text-center text-xl">{workflow.name}</p>
                <div className="flex flex-col">
                  {workflow.userInput.map((userInput, index) => (
                    <div key={userInput.nodeId}>
                      <div className="bg-content3 p-2 rounded-lg flex flex-col gap-y-1">
                        <p>Node Name: {userInput.title}</p>
                        <p>Results will be used in:</p>
                        <div className="flex gap-x-1">
                          {userInput.outputTo.map((output, index) => (
                            <div
                              key={index}
                              className="bg-primary text-primary-foreground rounded-full px-2"
                            >
                              {`${output.title}:${output.input}`}
                            </div>
                          ))}
                        </div>

                        <p>Inputs:</p>
                        {Object.entries(userInput.inputs).map(
                          ([key, value], index) => (
                            <Input
                              key={index}
                              label={`${key} (${typeof value})`}
                              value={value as string}
                              onValueChange={(value) =>
                                onUserInputChange(value, userInput, key)
                              }
                            />
                          )
                        )}
                      </div>

                      {index < workflow.userInput.length - 1 && (
                        <div className="py-4">
                          <Divider />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col pb-2">
                <Button color="primary" onPress={runInference}>
                  Run
                </Button>
                {isRunning && <Spinner />}
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col gap-y-1">
              <div className="w-full h-full border-dashed border-2 border-divider rounded-lg bg-content2 text-content2-foreground">
                <Dropzone
                  onDrop={onDrop}
                  accept={{
                    "application/json": [".json"],
                  }}
                  multiple={false}
                >
                  {({ getRootProps, getInputProps }) => (
                    <section className="w-full h-full">
                      <div
                        {...getRootProps()}
                        className="w-full h-full cursor-pointer"
                      >
                        <input {...getInputProps()} />
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <div className="flex flex-col items-center gap-y-1.5 text-lg">
                            <p className="text-center">
                              Drag and drop your ComfyUI workflows (API format)
                              here.
                            </p>
                            <p>Or, click to select workflow files.</p>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}
                </Dropzone>
              </div>
            </div>
          )}
        </div>
      </div>
      <RequestModelModal
        isOpen={isDeployModelsOpen}
        setIsOpen={setIsDeployModelsOpen}
      />
      {endpoint === ENDPOINTS.shared && (
        <WorkerConfigModal
          isOpen={isAvailableModelsOpen}
          setIsOpen={setIsAvailableModelsOpen}
          endpointName={endpoint}
        />
      )}
    </div>
  );
}

import { Alert, Button, Divider, Input, } from "@heroui/react";
import React, { useEffect, useState } from "react";
import Dropzone from "react-dropzone";
import Icon from "../utils/icon";
import DeployModels from "../workflow/deploy-models";


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

  return (
    <div className="w-full h-full">
      <div className="w-full h-full grid grid-rows-[max-content_auto] gap-y-2">
        <div className="flex gap-x-1">
          <div className="w-full flex items-center gap-x-2">
            <p className="text-lg">ComfyUI Workflow API</p>
            <Button
              onPress={() => {
                setIsDeployModelsOpen(true);
              }}
            >
              Deploy Models
            </Button>

            {workflow && (
              <Button onPress={() => setWorkflow(undefined)}>
                Import New Workflow
              </Button>
            )}
          </div>

          <div>
            <Button
              onPress={() => {
                toggleViewMode();
              }}
            >
              <Icon name="edit" />
              <p>ComfyUI</p>
            </Button>
          </div>
        </div>

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
                            onChange={(e) => {
                              const newValue = e.target.value;

                              const type = typeof value;

                              if (type === "number") {
                                userInput.inputs[key] = Number(newValue);
                              } else if (type === "string") {
                                userInput.inputs[key] = newValue;
                              }

                              setWorkflow({ ...workflow });
                            }}
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
            <Button color="primary">Run</Button>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col gap-y-1">
            <Alert
              className="whitespace-pre-wrap"
              color="primary"
              title="Deploy Models"
              description={`\
In order to use serverless APIs for ComfyUI workflows, you must deploy your models ahead of calling APIs. Click "Deploy Models" to get started.`}
            />

            <Alert
              className="whitespace-pre-wrap"
              color="primary"
              title="Serverless Workflow API Usage"
              description={`\
Import a ComfyUI workflow to start generating AI content via RESTful API (WIP) or Pulse Editor IMC.
You can also edit parameters of your workflow in this page, or connect to your ComfyUI server to do advanced editing.`}
            />

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
      <DeployModels isOpen={isDeployModelsOpen} setIsOpen={setIsDeployModelsOpen} />
    </div>
  );
}

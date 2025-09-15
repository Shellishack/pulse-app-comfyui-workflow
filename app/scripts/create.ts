import { config } from "dotenv";
import {
  getEndpointByName,
  getTemplateIdByName,
  getVolumeByName,
} from "./helper/utils";

config();

const comfyuiWorkerImageName = "claypulse/runpod-comfyui-worker:latest";
const comfyuiWorkerTemplateName = "comfyui-worker-template";
const comfyuiWorkerNetworkVolumeName = "comfyui-worker-network-volume";
const comfyuiWorkerEndpointName = "comfyui-worker-shared";
// Use S3-compatible regions. See https://docs.runpod.io/serverless/storage/s3-api#datacenter-availability
const comfyuiWorkerRegion = "US-KS-2";
const gpus = [
  "NVIDIA H200",
  "NVIDIA H100 80GB HBM3",
  "NVIDIA H100 NVL",
  "NVIDIA H100 PCIe",
];

/**
 *  Deploy a serverless endpoint on RunPod with RunPod's ComfyUI worker image.
 *  https://github.com/runpod-workers/worker-comfyui.
 *
 *  You can configure deployment options according to:
 *  - https://docs.runpod.io/api-reference/endpoints/POST/endpoints
 *  - https://docs.runpod.io/api-reference/templates/POST/templates
 */
async function createEndpoint(
  name: string,
  dataCenterIds: string[],
  gpuTypeIds: string[],
  workersMax: number
) {
  // Create template if not exist
  let templateId = await getTemplateIdByName(comfyuiWorkerTemplateName);
  if (!templateId) {
    const createdTemplate = await createTemplate();
    if (!createdTemplate) {
      throw new Error("Failed to create template");
    }

    templateId = createdTemplate.id;
  } else {
    console.log("Found existing template.");
  }

  const url = "https://rest.runpod.io/v1/endpoints";
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RUNPOD_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      templateId: templateId,
      allowedCudaVersions: ["12.8"],
      computeType: "GPU",
      dataCenterIds: dataCenterIds,
      executionTimeoutMs: 600000,
      flashboot: true,
      gpuCount: 1,
      gpuTypeIds: gpuTypeIds,
      idleTimeout: 5,
      name: name,
      workersMax: workersMax,
      workersMin: 0,
    }),
  };

  try {
    const response = await fetch(url, options);
    if (response.ok) {
      const data = await response.json();
      console.log("Created endpoint.");
      return data.id;
    }
    console.error("Failed to create endpoint:", await response.text());
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function createTemplate() {
  const url = "https://rest.runpod.io/v1/templates";
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RUNPOD_API_KEY}`,
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      imageName: comfyuiWorkerImageName,
      name: comfyuiWorkerTemplateName,
      category: "NVIDIA",
      containerDiskInGb: 20,
      dockerEntrypoint: [],
      dockerStartCmd: [],
      isServerless: true,
      ports: [],
    }),
  };

  try {
    const response = await fetch(url, options);
    if (response.ok) {
      const data = await response.json();
      console.log("Created template.");
      return data;
    }
    console.error("Failed to create template:", await response.text());
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function createVolume(name: string, dataCenterId: string, size: number) {
  const volume = await getVolumeByName(name);
  if (volume) {
    return volume.id;
  }

  const url = "https://rest.runpod.io/v1/networkvolumes";
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RUNPOD_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dataCenterId,
      name,
      size,
    }),
  };

  try {
    const response = await fetch(url, options);
    if (response.ok) {
      const data = await response.json();

      console.log("Created volume. Id:", data.id);
      return data.id;
    }
    console.error("Failed to create volume:", await response.text());
    return null;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create volume");
  }
}

async function updateEndpoint(endpointId: string, networkVolumeId: string) {
  const url = `https://rest.runpod.io/v1/endpoints/${endpointId}`;
  const options = {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${process.env.RUNPOD_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      networkVolumeId: networkVolumeId,
    }),
  };

  try {
    const response = await fetch(url, options);
    if (response.ok) {
      return true;
    }
    console.log("Failed to update endpoint:", await response.text());
    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function attachVolume({
  endpointId,
  networkVolumeId,
}: {
  endpointId: string;
  networkVolumeId: string;
}) {
  const success = await updateEndpoint(endpointId, networkVolumeId);
  if (!success) {
    throw new Error("Failed to attach volume");
  }

  console.log("Attached volume to endpoint");
}

async function main() {
  if ((await getEndpointByName(comfyuiWorkerEndpointName)) !== null) {
    console.log("Endpoint already exists.");
    return;
  }

  // Deploy serverless
  const endpointId = await createEndpoint(
    comfyuiWorkerEndpointName,
    [comfyuiWorkerRegion],
    gpus,
    1
  );

  // Create volume
  const volumeId = await createVolume(
    comfyuiWorkerNetworkVolumeName,
    comfyuiWorkerRegion,
    60
  );

  // Attach volume to endpoint
  await attachVolume({
    endpointId,
    networkVolumeId: volumeId,
  });
}

main();

/**
 *  This will delete endpoint, but not template and volumes.
 *  Note, your volume can still be charged.
 *  If you wish to delete volume, please visit RunPod's website
 *  to do so.
 */
const comfyuiWorkerEndpointName = "comfyui-worker-endpoint";

import { config } from "dotenv";
import { getEndpointByName } from "./helper/utils";

config();

async function deleteEndpoint(name: string) {
  const endpoint = await getEndpointByName(name);

  const url = `https://rest.runpod.io/v1/endpoints/${endpoint.id}`;
  const options = {
    method: "DELETE",
    headers: { Authorization: `Bearer ${process.env.RUNPOD_API_KEY}` },
  };

  try {
    const response = await fetch(url, options);
    if (response.ok) {
      console.log("Deleted");
    }
  } catch (error) {
    console.error(error);
  }
}

deleteEndpoint(comfyuiWorkerEndpointName);

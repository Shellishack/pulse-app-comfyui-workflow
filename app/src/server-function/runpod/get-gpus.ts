import { getEndpointByName } from "../../lib/endpoints";

export default async function getGPUs(req: Request) {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const endpointName = new URL(req.url).searchParams.get("endpointName");

  if (!endpointName) {
    return new Response("Missing endpoint name", { status: 500 });
  }

  const endpoint = await getEndpointByName(endpointName);

  if (!endpoint) {
    return new Response("Endpoint not found", { status: 404 });
  }

  const gpuTypeIds = endpoint.gpuTypeIds;
  return new Response(JSON.stringify(gpuTypeIds), {
    status: 200,
  });
}

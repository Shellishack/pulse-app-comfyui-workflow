export default async function getGPUs(req: Request) {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const endpointName = process.env.RUNPOD_ENDPOINT_NAME;

  if (!endpointName) {
    return new Response("Missing endpoint name", { status: 500 });
  }

  const url = "https://rest.runpod.io/v1/endpoints";
  const options = {
    method: "GET",
    headers: { Authorization: `Bearer ${process.env.RUNPOD_API_KEY}` },
  };

  try {
    const response = await fetch(url, options);
    if (response.ok) {
      const data = await response.json();

      const endpoint = data.find((item: { name: string }) =>
        item.name.startsWith(endpointName)
      );

      const gpuTypeIds = endpoint.gpuTypeIds;
      return new Response(JSON.stringify(gpuTypeIds), {
        status: 200,
      });
    }
    console.error("Error when fetching endpoints", await response.text());
    return new Response("Error fetching endpoints", { status: 500 });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

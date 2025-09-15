// The following are available endpoints for Pulse Editor
// official Pulse App instance.

// If you'd like to self-host or add your own endpoints
// for your app, see scripts/ for more information.

export const ENDPOINTS = {
  shared: "comfyui-worker-shared",
  wan2_2_S2V: "comfyui-worker-wan2-2-s2v",
  wan2_2_I2V: "comfyui-worker-wan2-2-i2v",
};

export async function getEndpointByName(name: string) {
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
        item.name.startsWith(name)
      );

      return endpoint;
    }
    console.error("Error when fetching endpoints", await response.text());
    throw new Error("Error fetching endpoints");
  } catch (error) {
    console.error(error);
    throw new Error("Internal Server Error");
  }
}

export async function getVolumeByName(name: string) {
  const url = "https://rest.runpod.io/v1/networkvolumes";
  const options = {
    method: "GET",
    headers: { Authorization: `Bearer ${process.env.RUNPOD_API_KEY}` },
    body: undefined,
  };

  try {
    const response = await fetch(url, options);
    if (response.ok) {
      const data = await response.json();

      const volume = data.find((item: { name: string }) => item.name === name);
      if (!volume) {
        return null;
      }

      console.log("Found existing volume. Id: " + volume.id);
      return volume;
    }

    console.error("Failed to retrieve volume:", await response.text());
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getTemplateIdByName(name: string) {
  const url = "https://rest.runpod.io/v1/templates";
  const options = {
    method: "GET",
    headers: { Authorization: `Bearer ${process.env.RUNPOD_API_KEY}` },
  };

  try {
    const response = await fetch(url, options);
    const data: {
      id: string;
      name: string;
    }[] = await response.json();
    const template = data.find((item) => item.name === name);
    return template ? template.id : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

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
      if (!endpoint) {
        return null;
      }

      return endpoint;
    }
    console.error("Failed to retrieve endpoint:", await response.text());
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

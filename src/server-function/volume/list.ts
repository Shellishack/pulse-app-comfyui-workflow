import { isAuthorized } from "../../lib/auth/is-authorized";

export default async function addVolume(req: Request) {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const authorized = await isAuthorized(req);
  if (!authorized) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const url = "https://rest.runpod.io/v1/networkvolumes";
  const options = {
    method: "GET",
    headers: { Authorization: `Bearer ${process.env.RUNPOD_API_KEY}` },
  };

  try {
    const response = await fetch(url, options);
    const data: {
      id: string;
      name: string;
      size: number;
      dataCenterId: string;
    }[] = await response.json();

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Error fetching volumes" }), {
      status: 500,
    });
  }
}

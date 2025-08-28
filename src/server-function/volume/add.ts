import { isAuthorized } from "../../lib/auth/is-authorized";
import { prisma } from "../../lib/db/prisma-client";

export default async function addVolume(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const authorized = await isAuthorized(req);
  if (!authorized) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const {
    name,
    dataCenterId,
    size,
  }: {
    name: string;
    dataCenterId: string;
    size: number;
  } = await req.json();

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
    const data = await response.json();

    const { id: runpodId } = data;

    await prisma.networkVolume.create({
      data: {
        runpodId: runpodId,
      },
    });

    return new Response(
      JSON.stringify({
        message: "Volume created successfully",
        id: runpodId,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ message: "Failed to create volume" }),
      {
        status: 500,
      }
    );
  }
}

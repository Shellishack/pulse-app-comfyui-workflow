import { isAuthorized } from "../../lib/auth/is-authorized";
import { prisma } from "../../lib/db/prisma-client";

export default async function deleteVolume(req: Request) {
  if (req.method !== "DELETE") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const authorized = await isAuthorized(req);
  if (!authorized) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }

  const { id: networkVolumeId }: { id: string } = await req.json();

  const url = `https://rest.runpod.io/v1/networkvolumes/${networkVolumeId}`;
  const options = {
    method: "DELETE",
    headers: { Authorization: `Bearer ${process.env.RUNPOD_API_KEY}` },
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error("Failed to delete volume");
    }

    await prisma.networkVolume.delete({
      where: { runpodId: networkVolumeId },
    });

    return new Response(
      JSON.stringify({
        message: "Volume deleted successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Error deleting volumes" }), {
      status: 500,
    });
  }
}

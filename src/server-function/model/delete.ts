import { isAuthorized } from "../../lib/auth/is-authorized";
import { prisma } from "../../lib/db/prisma-client";

/* An example function to echo the body of a POST request */
export default async function add(req: Request) {
  if (req.method !== "DELETE") {
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
  }: {
    name: string;
  } = await req.json();

  try {
    await prisma.aIModel.delete({
      where: {
        name,
      },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ message: "Error deleting model", error: e }),
      {
        status: 500,
      }
    );
  }
  // Process the data and return a response
  return new Response(
    JSON.stringify({
      message: "Model deleted successfully",
    }),
    { status: 200 }
  );
}

import { prisma } from "../../lib/db/prisma-client";

/* An example function to echo the body of a POST request */
export default async function list(req: Request) {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const models = await prisma.aIModel.findMany({
    select: {
      name: true,
    }
  });

  // Process the data and return a response
  return new Response(
    JSON.stringify({
      models,
    }),
    { status: 200 }
  );
}

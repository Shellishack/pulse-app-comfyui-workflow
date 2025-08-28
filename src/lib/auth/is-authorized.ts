import { prisma } from "../db/prisma-client";

async function isTokenValid(token: string) {
  const result = await prisma.accessToken.findUnique({
    where: {
      token: token,
    },
  });

  return result !== null;
}

export async function isAuthorized(req: Request) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader) {
    return false;
  }
  
  const token = authHeader.replace("Bearer ", "");
  return await isTokenValid(token);
}

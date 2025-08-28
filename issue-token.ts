import { prisma } from "./src/lib/db/prisma-client";

/**
 *  Issue an access token.
 *  E.g. run `tsx issue-token.ts` in terminal.
 */

async function issueToken() {
  const result = await prisma.accessToken.create({
    data: {},
  });

  return result.token;
}

issueToken().then((token) => {
  console.log("Issued token:", token);
});

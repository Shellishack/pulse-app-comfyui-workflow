/* An example function to echo the body of a POST request */
export default async function echo(req: Request) {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }


  // Process the data and return a response
  return new Response(JSON.stringify({
    echo: "Hello, world!"
  }), { status: 200 });
}


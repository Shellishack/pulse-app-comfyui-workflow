import { getEndpointByName } from "../../lib/endpoints";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function query(endpointId: string, workflow: any) {
  const response = await fetch(`https://api.runpod.ai/v2/${endpointId}/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RUNPOD_API_KEY}`,
    },
    body: JSON.stringify({
      input: {
        workflow: workflow,
      },
    }),
  });

  const data = await response.json();

  console.log("Query response:", data);

  const { id }: { id: string } = data;

  return id;
}

async function getResult(endpointId: string, id: string) {
  const response = await fetch(
    `https://api.runpod.ai/v2/${endpointId}/status/${id}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RUNPOD_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    console.error("Error fetching result", await response.text());
    throw new Error("Error fetching result");
  }

  const data = await response.json();

  if (data.status === "FAILED") {
    throw new Error(JSON.stringify(data, null, 2));
  } else if (data.status === "CANCELLED") {
    throw new Error("Job was cancelled");
  } else if (data.status !== "COMPLETED") {
    // Wait 1 sec and get result
    console.log(`[${data.status}] Waiting for result...`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    return await getResult(endpointId, id);
  }

  console.log("Result ready. Response:", data);

  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function calculateCost(
  endpointId: string,
  workerId: string,
  executionTime: number
) {
  const response = await fetch(`https://pulse-editor.com/api/billing`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "runpod",
      data: {
        endpointId,
        workerId,
        executionTime,
      },
    }),
  });
  if (!response.ok) {
    console.error("Error calculating cost", await response.text());
    return "unknown";
  }

  const { cost }: { cost: number } = await response.json();
  return cost.toFixed(4);
}

export default async function run(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const { workflow, endpointName } = await req.json();

  if (!workflow) {
    return new Response("Missing workflow", { status: 400 });
  }

  const endpoint = await getEndpointByName(endpointName);

  const requestId = await query(endpoint.id, workflow);

  const result = await getResult(endpoint.id, requestId);

  const cost = await calculateCost(
    endpoint.id,
    result.workerId,
    result.executionTime
  );

  return new Response(
    JSON.stringify({
      cost,
      data: result.output,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

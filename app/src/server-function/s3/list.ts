import AWS from "aws-sdk";

export default async function list(req: Request) {
  if (req.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const key = process.env.S3_API_KEY;
  const secret = process.env.S3_API_SECRET;
  const bucketId = process.env.RUNPOD_S3_BUCKET_ID;
  const region = process.env.RUNPOD_REGION;

  if (!key || !secret) {
    return new Response("Missing S3 credentials", { status: 401 });
  } else if (!bucketId || !region) {
    return new Response("Missing S3 configuration", { status: 500 });
  }

  if (!bucketId || !region) {
    return new Response("Missing required parameters", { status: 400 });
  }

  const endpoint = `https://s3api-${region}.runpod.io`;

  // Can only use AWS JS SDK v2 for now.
  // SDK v3 is bugged somehow and keeps returning invalid object path.
  // TODO: migrate to v3 when this issue is fixed.
  const s3 = new AWS.S3({
    credentials: {
      accessKeyId: key,
      secretAccessKey: secret,
    },
    endpoint: endpoint,
    region: region,
    s3ForcePathStyle: true,
  });

  const promise = new Promise<AWS.S3.ListObjectsV2Output>((resolve, reject) => {
    s3.listObjectsV2(
      {
        Bucket: bucketId,
        MaxKeys: 100,
      },
      (err, data) => {
        if (err) {
          console.error(err);
          reject("Error listing objects");
        }
        resolve(data);
      }
    );
  });

  const result = await promise;

  const items = result.Contents?.map((item) => item.Key) || [];

  return new Response(
    JSON.stringify({
      data: items,
    }),
    { status: 200 }
  );
}

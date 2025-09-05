# Manage models and endpoint types

There are two ways you can deploy your own RunPod serverless endpoints: [network volume](#use-runpod-network-volume-to-share-models) and [custom image](#use-custom-image). Check RunPod's [customization guide](https://github.com/runpod-workers/worker-comfyui/blob/main/docs/customization.md) for ComfyUI Worker.

In either case, we extended the [official image](https://github.com/runpod-workers/worker-comfyui) to allow load from and/or save to Azure Blob Storage by installing custom nodes [comfyui_remote_media_io](https://github.com/Shellishack/comfyui_remote_media_io). Example docker files are available at `runpod/`.

## Option 1: Use Custom Image

See RunPod's [customization guide](https://github.com/runpod-workers/worker-comfyui/blob/main/docs/customization.md) for ComfyUI Worker.

## Option 2: Use RunPod Network Volume to Share Models

There are a few scripts in `scripts/` to help you quickly setup RunPod.

Create serverless endpoint and volume:

```bash
tsx ./scripts/create.ts
```

Delete endpoint:

```bash
# Volume and template won't be deleted in case you want to re-use them.
# Note: volume will still charge money. If you want to delete them, visit RunPod's website.
tsx ./scripts/delete.ts
```

### Upload models

To add your own models, you can do so by uploading to S3-compatible network volumes. For more details, see https://docs.runpod.io/serverless/storage/s3-api.

For example, you can use comfy-cli to download models. Then you can upload with aws cli:

```bash
# Download models via comfy-cli allows valid ComfyUI paths
comfy model download --url <model_url> --relative-path models/checkpoints
# Upload to S3 bucket via aws-cli
aws s3 cp --region us-ks-2 --endpoint-url https://s3api-us-ks-2.runpod.io --recursive ~/comfy/ComfyUI/ s3://<your_bucket_id> --exclude ".*" --exclude "*/.*" --expected-size 5000000000
```

> If the file is too large and upload fails with aws-cli, try this method from RunPod: https://docs.runpod.io/serverless/storage/s3-api#uploading-very-large-files.

## Pulse Editor ComfyUI Workflow Extension

This Pulse App allows running serverless ComfyUI Workflow on RunPod.

## Use Hosted Pulse App in Pulse Editor

### Request models

We add popular models to a shared network volume ([see RunPod's documentation](https://docs.runpod.io/serverless/storage/network-volumes)). But as of this early stage, we only add a limited number of models. If you wish your models to be added to our shared volume, you can request models by submitting the request form in app (coming soon in marketplace page support) or opening a GitHub issue here.

If you'd like to add your own models or customize this app, see [below](#deploy-this-pulse-app-yourself).

## Deploy This Pulse App Yourself

> This Pulse App relies on RunPod serverless inference. So you need to create a RunPod account and get an API key and S3 credentials from them.

### Deploy to Pulse Editor platform

You can deploy this app yourself, if you'd like to manage models and RunPod resources yourself.

> Note: To deploy this app in Pulse Editor platform, you will need to join Pulse Editor [Beta](https://pulse-editor.com/beta).

```bash
# Publish your app to marketplace, but you can set visibility (public/unlisted/private).
pulse publish
```

For this app, you'd also need to set environment variable for your published app. Visit https://pulse-editor.com/home/settings to configure your app's environment variables (WIP). Specifically, you need:

- `S3_API_KEY` and `S3_API_SECRET` for AWS S3 APIs (You need to get them from RunPod).
- `RUNPOD_API_KEY` for RunPod APIs
- `RUNPOD_REGION` for your RunPod's datacenter region
- `RUNPOD_S3_BUCKET_ID` for the bucket's ID (see in RunPod or when running `./scripts/create.ts`)

### Use your published app

Then you can find your published app in marketplace tab in public/unlisted/private category depending on your settings.

### Manage models and endpoint types

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

### Start development

#### Method 1: Install your extension in Pulse Editor as a dev extension

Run the following to start a dev server locally.

```
npm run dev
```

This will host your extension at http://localhost:3030 (or you can customize the server host in `webpack.config.ts`). Then in Pulse Editor, go to settings and fill in your extension dev server's information to install you new extension. You will need the following:

- dev server: e.g. http://localhost:3030
- extension id: your extension's ID specified in `package.json`
- version: your extension's version specified in `package.json`

#### Method 2: Preview your extension in browser

If you'd like to quickly get started on developing your extension without installing it inside Pulse Editor. You can run a preview dev server that runs in your browser (just like developing React application).

```
npm run preview
```

> Please note that your extension won't be able to use IMC (Inter-Module-Communication) to communicate with Pulse Editor during preview development mode.

## Development

### Add extension source code

Add React code inside `/src` to make your custom component(s) for your extension, `main.tsx` is the main entrance for Pulse Editor Extensions.

### Pulse Editor libraries

You can use shared utils (like types) from `@pulse-editor/shared-utils`.

You can also use React hooks provided by `@pulse-editor/react-api` to interact with Pulse Editor main process. Some examples are:

- Load/write currently opened file.
- Invoke Pulse Editor agents.
- Use AI models.
- Use agentic tools installed in Pulse Editor.

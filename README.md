## Pulse Editor ComfyUI Workflow Extension
This is a React template which you can use to make your own Pulse Editor extension. It uses Webpack Module Federation to share extensions with Pulse Editor.

## Use custom models
### Option 1: request models
We add popular models to a shared network volume ([see RunPod's documentation](https://docs.runpod.io/serverless/storage/network-volumes)). But as of this early stage, we only add a limited number of models. If you wish your models to be added to our shared volume, you can request models by submitting the request form in app or open a GitHub issue here.

### Option 2: build your own image
Follow RunPod's guide on [how to customize ComfyUI Worker](https://github.com/runpod-workers/worker-comfyui/blob/main/docs/customization.md). 

Then push the image to a public registry, and add url to your image in app (WIP).


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

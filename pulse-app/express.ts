import express from "express";
import cors from "cors";
import config from "./pulse.config";

const app = express();

app.use(cors());

app.use(`/${config.id}/${config.version}`, express.static("dist"));

// Start the server
app.listen(3030);

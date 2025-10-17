import express from "express";
import indexRoutes from "./src/routes/index.route.js";
import path from "path";

const app = express();
const port = 5000;

// Middleware para leer JSON
app.use(express.json({ limit: "10mb" }));

app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.static(path.resolve("src/public")));

app.use(indexRoutes);

app.listen(port, () => {
  console.log(`server on http://localhost:${port}`);
});

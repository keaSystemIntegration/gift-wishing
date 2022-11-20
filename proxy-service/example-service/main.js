import express from "express";

const PORT = process.env.APPID || 8080;

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send({
    message: `App running on port: ${PORT}`,
    host: req.headers.host,
    path: req.path,
  });
});

app.get("/message", (req, res) => {
  res.send({ message: "Different message" });
});

app.listen(PORT, () => console.log("Listening on port:", PORT));

import * as express from "express";
import * as dotenv from "dotenv";
import * as cors from "cors";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/getToken", async (req, res) => {
  const body = {
    grant_type: "client_credentials",
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
  };
  if (req && req.body && req.body.scope) {
    body["scope"] = req.body.scope;
  }
  try {
    const response = await fetch(`${process.env.API_ENDPOINT}/auth/v1/token`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const json = await response.json();
    res.send(json)
  } catch (err) {
    console.log("GOT ERROR ", err);
    res.send(err);
  }
});

app.use(express.static("./frontend/build"))

app.listen(process.env.PORT, () => {
  console.log(`Listening on localhost:${process.env.PORT}`);
});

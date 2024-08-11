import express from "express";
import axios from "axios";
import { config } from "dotenv";

config();

const app = express();
const port = process.env.PORT || 3001;

app.all("/*", async (req, res) => {
  try {
    const originalUrl = req.originalUrl;
    const method = req.method;
    const body = req.body;

    const rec = originalUrl.split("/")[1];
    const recURL = process.env[rec];

    if (recURL) {
      try {
        const axiosConfig = {
          method,
          url: `${recURL}${originalUrl}`,
          ...(Object.keys(body || {}).length > 0 && { data: body }),
        };
        console.log("axiosConfig", axiosConfig);

        const response = await axios(axiosConfig);
        console.log("response from rec", response.data);

        res.json(response.data);
      } catch (err) {
        const axiosError = err;

        const response = axiosError.response;

        if (response) {
          res.status(response?.status).json(response?.data);
        } else {
          res.status(500).json({ error: axiosError.message });
        }
      }
    }
  } catch (error) {
    res.status(502).json({ error: "Cannot process request" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

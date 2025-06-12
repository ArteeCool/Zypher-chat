import { createServer } from "https";
import { parse } from "url";
import next from "next";
import { readFileSync } from "fs";
import formidable from "formidable";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: readFileSync("../backend/ssl/privkey.pem"),
  cert: readFileSync("../backend/ssl/fullchain.pem"),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);

    if (req.method === "POST" && parsedUrl.pathname === "/upload") {
      const form = formidable({
        uploadDir: path.join(__dirname, "uploads"),
        keepExtensions: true,
      });

      form.parse(req, (err, fields, files) => {
        if (err || !files.image) {
          console.error("Upload error:", err);
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Upload failed" }));
          return;
        }

        const uploadedFile = Array.isArray(files.image)
          ? files.image[0]
          : files.image;
        const tempPath = uploadedFile.filepath || uploadedFile.path;

        if (!tempPath) {
          console.error("No file path found:", uploadedFile);
          res.statusCode = 400;
          res.end("No file path found");
          return;
        }

        const filename = path.basename(tempPath);
        const imageUrl = `https://arteecool.com.ua/uploads/${filename}`;

        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ imageUrl }));
      });

      return;
    }

    if (req.method === "GET" && parsedUrl.pathname.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, parsedUrl.pathname);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.statusCode = 404;
          res.end("File not found");
          return;
        }

        res.statusCode = 200;
        res.end(data);
      });
      return;
    }

    handle(req, res, parsedUrl);
  }).listen(443, () => {
    console.log("> Server started on https://localhost (port 443)");
  });
});

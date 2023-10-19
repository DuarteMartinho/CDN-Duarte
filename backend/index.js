require("dotenv").config();
const fs = require("fs");
const path = require("path");
const url = require("url");
const Jimp = require("jimp");
const express = require("express");
const cors = require("cors");
var bodyParser = require("body-parser");
var multipart = require("connect-multiparty");
var multipartMiddleware = multipart();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.json({ type: "text/*" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "*",
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Authorization");
  next();
});

app.post(
  "/*",
  bodyParser.raw({ type: ["image/*"], limit: "5mb" }),
  multipartMiddleware,
  async function (req, res) {
    const file = req.body;
    let fileName = url.parse(req.url).pathname;
    const filePath = path.join(__dirname, `public/images/${fileName}`);
    const directoryPath = path.dirname(filePath);

    try {
      if (!fs.existsSync(directoryPath)) {
        const result = fs.mkdirSync(directoryPath, { recursive: true });
        if (result) {
          fs.writeFile(filePath, file, (error) => {
            if (error) {
              res.status(500).json({ msg: error });
              return;
            } else {
              const fileUrl = process.env.CDN_URL + fileName;
              res.status(200).json({
                msg: "File saved!",
                url: fileUrl,
              });
              return;
            }
          });
        } else {
          res.status(500).json({ msg: "Error saving image" });
          return;
        }
      } else {
        fs.writeFile(filePath, file, (error) => {
          if (error) {
            res.status(500).json({ msg: error });
            return;
          } else {
            const fileUrl = process.env.CDN_URL + fileName;
            res.status(200).json({
              msg: "File saved!",
              url: fileUrl,
            });
            return;
          }
        });
      }
    } catch (err) {
      console.log(11, err);
      res.status(500).json({
        message: "Something went wrong",
        error: err.message,
      });
      return;
    }
  }
);

app.get("/*", async function (req, res) {
  // Remove headers info
  res.removeHeader("Transfer-Encoding");
  res.removeHeader("X-Powered-By");

  try {
    const query = url.parse(req.url, true).query;
    let file = url.parse(req.url).pathname;
    let filePath = path.join(__dirname, `public/images/${file}`);

    if (!fs.existsSync(filePath)) {
      file = process.env.DEFAULT_IMAGE;
      filePath = path.join(__dirname, `public/images/${file}`);
    }

    const height = parseInt(query.h) || 0; // Get height from query string
    const width = parseInt(query.w) || 0; // Get width from query string
    const quality = parseInt(query.q) < 100 ? parseInt(query.q) : 99; // Get quality from query string

    const folder = `q${quality}_h${height}_w${width}`;
    const out_file = `public/thumb/${folder}/${file}`;

    if (fs.existsSync(path.resolve(out_file))) {
      res.sendFile(path.resolve(out_file));
      return;
    }

    // If no height or no width display original image
    if (!height || !width) {
      res.sendFile(path.resolve(`public/images/${file}`));
      return;
    }

    // Use jimp to resize image
    Jimp.read(path.resolve(`public/images/${file}`))
      .then((lenna) => {
        lenna.resize(width, height); // resize
        lenna.quality(quality); // set JPEG quality

        lenna.write(path.resolve(out_file), () => {
          fs.createReadStream(path.resolve(out_file)).pipe(res);
        }); // save and display
      })
      .catch((err) => {
        console.error(err);
        res.sendFile(path.resolve(`public/images/${file}`));
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
});

const port = process.env.SERVER_PORT || 4444;
app.listen(port, () => {
  console.log(`CDN server is running on port ${port}`);
});

const dir = path.join(__dirname, `public/images/`);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

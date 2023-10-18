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

const corsOptions = {
  origin:
    process.env.APP_ORIGIN && process.env.APP_ORIGIN != "*"
      ? process.env.APP_ORIGIN.split(",")
      : "*",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use(function (err, req, res, next) {
  filePath = path.join(__dirname, process.env.DEFAULT_IMAGE);
  // Display default image if there is error
  res.sendFile(filePath);
});

app.post(
  "/:name",
  bodyParser.raw({ type: ["image/jpeg", "image/png"], limit: "5mb" }),
  multipartMiddleware,
  async function (req, res) {
    console.log(req.files, req.body);
    const file = req.body;
    const name = req.params.name;
    const fileName = name+".png";
    const filePath = path.join(__dirname, `public/images/${fileName}`);

    fs.writeFile(filePath, file, (error) => {
      if (error) {
        throw error;
      }
      console.log("File saved!");
    });

    res.sendStatus(200);
  }
);

//   res.send({
//     status: true,
//     message: "File is uploaded",
//     data: {
//       name: file.name,
//       mimetype: file.mimetype,
//       size: file.size,
//     },
//   });

//   res.send({
//     status: true,
//     message: "File is uploaded",
//     data: {
//       name: "file.name",
//       mimetype: "file.mimetype",
//       size: "file.size",
//     },
//   });
// });

app.get("*", async function (req, res) {
  // Remove headers info
  res.removeHeader("Transfer-Encoding");
  res.removeHeader("X-Powered-By");

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
      res.sendFile(path.resolve(`public/images/${file}`));
    });
});

const port = process.env.SERVER_PORT || 4444;
app.listen(port, () => {
  console.log(`CDN server is running on port ${port}`);
});

const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const app = express();
import cors from "cors";
import session from "express-session";
import morgan from "morgan";
import passport from "passport";
import { Strategy } from "passport-jwt";
import api from "./src/controller";
import { initDatabase } from "./src/database/connection";
import { UserModel } from "./src/database/models/user";
import { generic, notfound } from "./src/middlewares/error";
import { JWTConfig } from "./src/utils/jwt";
import { Request, Response } from "express";

passport.serializeUser((user: any, done) => done(null, user));

passport.deserializeUser((user: any, done) => done(null, user));

const init = () => {
  passport.use(
    new Strategy(JWTConfig.Options, async (payload, done) => {
      try {
        console.log("====================================");
        console.log({ payload });
        console.log("====================================");
        let usr = await UserModel.find({ _id: payload.sub });
        if (usr) {
          done(null, usr);
        }
      } catch (error) {
        done(error, false);
      }
    })
  );
};

export default init;

const initApp = async () => {
  app.use([
    cors(),
    // helmet(),
    // compression(),
    express.json(),
    express.urlencoded({ extended: true }),
    passport.initialize(),
    morgan("dev"),
    session({ secret: JWTConfig.Options.secretOrKey }),
  ]);

  app.disable("etag");

  init();

  // View Engine Setup
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "ejs");

  // var upload = multer({ dest: "Upload_folder_name" })
  // If you do not want to use diskStorage then uncomment it

  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Uploads is the Upload_folder_name
      let fName = path.join("uploads", req.body.folderName);
      try {
        if (!fs.existsSync(fName)) {
          fs.mkdirSync(fName);
        }
      } catch (error) {
        cb("Error in creating folder" + JSON.stringify(error));
      }
      cb(null, fName);
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + "-" + Date.now() + ".mp4");
    },
  });

  // Define the maximum size for uploading
  // picture i.e. 1 MB. it is optional
  const maxSize = 1 * 1000 * 1000 * 10000000;

  var upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb) {
      // Set the filetypes, it is optional
      var filetypes = /mp4|wow|3gp|pdf|doc|docx|txt/;
      var mimetype = filetypes.test(file.mimetype);
      var extname = filetypes.test(
        path.extname(file.originalname).toLowerCase()
      );

      if (mimetype && extname) {
        return cb(null, true);
      }
      if (!req.body.folderName) {
        cb("Please enter folder name");
      }
      cb(
        "Error: File upload only supports the " +
          "following filetypes - " +
          filetypes
      );
    },

    // mypic is the name of file attribute
  }).single("video");

  app.get("/", function (req, res) {
    res.render("upload");
  });

  app.get("/video/:courseName/:videoId", (req, res) => {
    const videoPath = `./uploads/${req.params.courseName}/${req.params.videoId}.mp4`;

    const videoStat = fs.statSync(videoPath);

    const fileSize = videoStat.size;

    const videoRange = req.headers.range;

    if (videoRange) {
      const parts = videoRange.replace(/bytes=/, "").split("-");

      const start = parseInt(parts[0], 10);

      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunksize = end - start + 1;

      const file = fs.createReadStream(videoPath, { start, end });

      const header = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,

        "Accept-Ranges": "bytes",

        "Content-Length": chunksize,

        "Content-Type": "video/mp4",
      };

      res.writeHead(206, header);

      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,

        "Content-Type": "video/mp4",
      };

      res.writeHead(200, head);

      fs.createReadStream(videoPath).pipe(res);
    }
  });

  app.post("/uploadVideo", function (req, res, next) {
    // Error MiddleWare for multer file upload, so if any
    // error occurs, the image would not be uploaded!
    upload(req, res, function (err) {
      if (err) {
        // ERROR occurred (here it can be occurred due
        // to uploading image of size greater than
        // 1MB or uploading different file type)
        res.send(err);
      } else {
        // SUCCESS, image successfully uploaded
        res.send("Success, File uploaded!");
      }
    });
  });

  app.use("/api", api);

  app.post("*", (req: Request, res: Response, next) => {
    try {
      console.log("====================================");
      console.log(req.url);
      console.log("====================================");
    } catch (error) {}
    next(req);
  });

  app.get("*", (req: Request, res: Response, next) => {
    try {
      console.log("====================================");
      console.log(req.url);
      console.log("====================================");
    } catch (error) {}
    next(req);
  });

  app.use([notfound, generic]);

  initDatabase();

  // Take any port number of your choice which
  // is not taken by any other process
  await app.listen(7400, function (error) {
    if (error) throw error;
    console.log("Server created Successfully on PORT 7400");
  });
};

initApp();

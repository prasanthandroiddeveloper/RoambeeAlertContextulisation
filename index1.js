const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: "sanjeeviprasanth@gmail.com",
    pass: "Badarinarayanarekha",
  },
});

const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
const server = app.listen(3000);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
app.use(cors());
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3001");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.get("/endpoint", function (req, res) {
  //io.sockets.emit("FromAPI", req.query + " : Updated");
  console.log(JSON.stringify(req.query), "params");

  const ambient = req.query.ambient;
  console.log(ambient);

  if (ambient > 0 && ambient <= 50) {
    console.log("Door slightly opened");
  } else if (ambient > 50 && ambient <= 80) {
    console.log("Door opened");
  } else {
    console.log("Door Fully opened");
    var mailOptions = {
      from: "sanjeeviprasanth@gmail.com",
      to: "githubprasanth@gmail.com",
      subject: "Roambee Alert",
      text: `Container Door Opened Alert`,
      // html: '<h1>Hi Smartherd</h1><p>Your Messsage</p>'
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }

  fs.writeFile("log.txt", JSON.stringify(req.query), function (err) {
    if (err) return console.log(err);
    console.log("Hello World > helloworld.txt");
  });
  io.sockets.on("connection", function (socket) {
    socket.on("getBanners", function (data) {
      io.sockets.emit("result", data);
      console.log(data, "dasdasas");
    });
  });
  return true;
});

console.log("express running on server port 3000");

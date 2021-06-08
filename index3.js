const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const transporter = nodemailer.createTransport(
  smtpTransport({
    host: "mi3-ls19.a2hosting.com",
    secure: true,
    auth: {
      user: "demo@sssbi.com",
      pass: "Admin@2020",
    },
  })
);

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

app.get("/", function (req, res) {
  //io.sockets.emit("FromAPI", req.query + " : Updated");
  console.log(JSON.stringify(req.query), "params");
  const axios = require("axios");

  const ambient = req.query.ambient;
  const shipmentId = req.query.shipment_id;
  const bee_name = req.query.bee_name;
  const destination = req.query.destination;
  var message = "";
  console.log(req.query.ambient, "ambient level");
  if (ambient <= 1) {
    message = "Door is Closed";
  } else if (ambient > 2 && ambient <= 5) {
    message = "Door maybe open";
  } else if (ambient >= 6) {
    message = "Door is open";
    console.log("Door is open");
    // res.send({msg:"Door Closed"});
  }
  if (message) {
    axios
      .post(
        `https://portal.roambee.com/services/shipment/get2?sid=${shipmentId}&apikey=f1970070-b231-4927-a004-e7bedae5a80c`
      )
      .then((res) => {
        console.log(`statusCode: ${res.statusCode}`);
        console.log(res.data, "Total response");

        subscriptions = res.data.subscriptions;
        if (subscriptions) {
          subscriptions
            .filter((item) => item.type === "ACTIVITY")
            .map((record) => {
              if (record.email) {
                console.log(record.email);
                var mailOptions = {
                  from: "demo@sssbi.com",
                  to: record.email,
                  subject: "Roambee Alert",
                  text: `Container ${message} Alert on ${bee_name} to destination ${destination}`,
                  // html: '<h1>Hi Smartherd</h1><p>Your Messsage</p>'
                };

                transporter.sendMail(mailOptions, function (error, info) {
                  if (error) {
                    console.log(error);
                    // res.send({msg:"error"});
                  } else {
                    console.log("Email sent: " + info.response);
                    // res.send({msg:"sent"});
                  }
                });
              }
            });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  fs.appendFile("log.txt", JSON.stringify(req.query), function (err) {
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

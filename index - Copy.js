const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");
const mysql = require("mysql");
const transporter = nodemailer.createTransport(
  smtpTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: "sanjeeviprasanth@gmail.com",
      pass: "Badarinarayanarekha",
    },
  })
);

const express = require("express");
const app = express();
const cors = require("cors");
const fs = require("fs");
const port = process.env.PORT || 3000;
const server = app.listen(port);
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

const con = mysql.createConnection({
  host: "dbmechine.mysql.database.azure.com",
  user: "vsk@dbmechine",
  password: "Qazzaq@1234",
  database: "roambeeschemaa",
});

// con.connect(function (err) {
//   if (err) throw err;
//   console.log("Connected!");
// });

app.get("/webhook", function (req, res) {
  //io.sockets.emit("FromAPI", req.query + " : Updated");
  console.log(JSON.stringify(req.query), "params");
  const axios = require("axios");
  res.send("Welcome to Azure");

  const ambient = req.query.ambient;
  const shipmentId = req.query.shipment_id;
  const bee_name = req.query.bee_name;
  const destination = req.query.destination;

  console.log(req.query.ambient, "ambient level");

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
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = `INSERT INTO shipment_details (ambient,shipment_id,bee_name,destination) VALUES ('${ambient}', '${shipmentId}','${bee_name}','${destination}')`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(err);
    });
  });

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
                  text: `Container ${message} Alert on ${bee_name} to destination ${destination} ${new Date()}`,
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

  // if (ambient > 10) {
  //   axios
  //     .post(
  //       `https://portal.roambee.com/services/shipment/get2?sid=${shipmentId}&apikey=f1970070-b231-4927-a004-e7bedae5a80c`
  //     )
  //     .then((res) => {
  //       console.log(`statusCode: ${res.statusCode}`);
  //       console.log(res.data, "Total response");

  //       subscriptions = res.data.subscriptions;
  //       if (subscriptions) {
  //         subscriptions
  //           .filter((item) => item.type === "ACTIVITY")
  //           .map((record) => {
  //             if (record.email) {
  //               console.log(record.email);
  //               var mailOptions = {
  //                 from: "sanjeeviprasanth@gmail.com",
  //                 to: record.email,
  //                 subject: "Roambee Alert",
  //                 text: `Container Door Opened Alert on ${bee_name} to destination ${destination} ${
  //                   new Date().getTime
  //                 }`,
  //                 // html: '<h1>Hi Smartherd</h1><p>Your Messsage</p>'
  //               };

  //               transporter.sendMail(mailOptions, function (error, info) {
  //                 if (error) {
  //                   console.log(error);
  //                 } else {
  //                   console.log("Email sent: " + info.response);
  //                 }
  //               });
  //             }
  //           });
  //       }
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });
  // } else {
  //   console.log("Door Closed");
  // }

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

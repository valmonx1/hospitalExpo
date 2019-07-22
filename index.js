var express = require("express");
var app = express();
var mysql = require("mysql");
var bodyParser = require("body-parser");
app.use(bodyParser.json({ type: "application/json" }));
app.use(bodyParser.urlencoded({ extended: true }));

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "mydb"
});

// Enter 'nodemon server.js' at cmd, open localhost:80/
var server = app.listen(8082, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log("Server start");
});

con.connect(function(error) {
  if (!!error) console.log("error");
  else console.log("Connected");
});

//Get all data
app.get("/patient", function(req, res) {
  con.query("SELECT * from users ", function(error, rows, fields) {
    if (error) console.log(error);
    else console.log(rows);
    res.send(rows);
  });
});

//Get all data from doc
app.get("/doctor", function(req, res) {
  //join table cara lain = hfc_cd itu adalah primary key yang connect setiap table
  var query =
    "SELECT * FROM hospital JOIN doctor using(hfc_cd) JOIN adm_discipline using(hfc_cd)";
  con.query(query, function(error, rows, fields) {
    if (error) {
      console.log(error);
      res.status(500).send({ success: false, message: "Something Wrong" });
    } else {
      console.log(rows);
      res.status(200).send(rows);
    }
  });
});

//Get all hospital data
app.get("/hospital", function(req, res) {
  con.query("SELECT * from hospital ", function(error, rows, fields) {
    if (error) console.log(error);
    else console.log(rows);
    res.send(rows);
  });
});

//Get all discipline data
app.get("/discipline/:hfc_cd", function(req, res) {
  con.query(
    "SELECT * from adm_discipline WHERE hfc_cd=" + req.params.hfc_cd,
    function(error, rows, fields) {
      if (error) console.log(error);
      else console.log(rows);
      res.send(rows);
    }
  );
});

// Get all sub-discipline data
app.get("/queue_name/:hfc_cd/:discipline_cd", function(req, res) {
  con.query(
    "SELECT * from pms_queue_name WHERE discipline_cd = " +
      req.params.discipline_cd +
      " AND hfc_cd = " +
      req.params.hfc_cd,
    function(error, rows, fields) {
      if (error) console.log(error);
      else console.log(rows);
      res.send(rows);
    }
  );
});

//Get type_id data
app.get("/type_id", function(req, res) {
  con.query("SELECT * FROM patient_type", function(error, rows, fields) {
    if (error) console.log(error);
    else {
      console.log(rows);
      res.send(rows);
    }
  });
});

//Post register data
app.post("/register", function(req, res) {
  con.query(
    "INSERT INTO patient_biodata(patient_name, type_id, type_id_number, patient_phone, patient_address, patient_nationality) VALUES (?,?,?,?,?,?)",
    [
      req.body.patient_name,
      req.body.type_id,
      req.body.type_id_number,
      req.body.patient_phone,
      req.body.patient_address,
      req.body.patient_nationality
    ],
    function(error, rows, fields) {
      if (error) {
        console.log(error);
        res.status(500).send({ success: false, message: "Something Wrong" });
      } else {
        console.log(rows);
        res.status(200).send({ success: true, message: "Successful Add " });
      }
    }
  );
});

//show request number in hospital
app.get("/show_now/:hfc_cd/:discipline_cd", function(req, res) {
  var status = "consult";
  var date = new Date();
  var month =
    date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1;
  var currentDate = date.getFullYear() + "-" + month + "-" + date.getDate();
  var hfc_cd = req.body.hfc_cd;
  var discipline_cd = req.body.discipline_cd;
  var query =
    "SELECT queue_no FROM pms_patient_queue WHERE hfc_cd = '" +
    hfc_cd +
    "' and episode_date = '" +
    currentDate +
    "' and discipline_cd ='" +
    discipline_cd +
    "' and status = '" +
    status +
    "' ORDER BY episode_date DESC LIMIT 1;";
  con.query(query, function(error, rows, fields) {
    if (rows == 0) {
      res.status(500).send({ success: false, message: "Something Wrong" });
    } else {
      var outData = {
        error: error,
        result: rows
      };
    }
    res.send(JSON.stringify(outData));
  });
});

//show no in dashboard page
app.get("/show_no/:pmi_no", function(req, res) {
  var date = new Date();
  var month =
    date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1;
  var currentDate = date.getFullYear() + "-" + month + "-" + date.getDate();
  var pmi_no = req.params.pmi_no;
  var query =
    "SELECT * FROM pms_patient_queue WHERE pmi_no = '" +
    pmi_no +
    "' and episode_date = '" +
    currentDate +
    "' ORDER BY episode_date DESC LIMIT 1;";
  con.query(query, function(error, rows, fields) {
    if (rows == 0) {
      res.status(500).send({ success: false, message: "Something Wrong" });
    } else {
      var outData = {
        error: error,
        result: rows
      };
    }

    res.send(JSON.stringify(outData));
  });
});

//get no in patient page
app.post("/select_pms_last_queue", function(req, res) {
  var status = "waiting";
  var queue_type = "CM";
  var hfc = req.body.hfc_cd;
  var disCode = req.body.discipline_cd;
  var queue_name = req.body.queue_name;
  var pmi = req.body.pmi_no;
  var date = new Date();
  var month =
    date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1;

  var currentDate = date.getFullYear() + "-" + month + "-" + date.getDate();

  ///cuba baru
  var query =
    "SELECT * FROM pms_patient_queue WHERE pmi_no = '" +
    pmi +
    "' and episode_date = '" +
    currentDate +
    "' ORDER BY episode_date DESC LIMIT 1;";
  con.query(query, function(error, rows, fields) {
    if (error) console.log(error);
    if (rows.length == 0) {
      var query =
        "SELECT * FROM pms_patient_queue WHERE pmi_no = '" +
        pmi +
        "' and episode_date = '" +
        currentDate +
        "' ORDER BY episode_date DESC LIMIT 1;";
      con.query(query, function(error, rows1, fields) {
        if (rows1 != 0) {
          res.status(200).send({
            success: true,
            message:
              "you already registered, you cannot register twice per day",
            data: row
          });
        } else {
          var query =
            "SELECT quota,initial_queue_no from pms_queue_name where queue_name = '" +
            queue_name +
            "' and hfc_cd ='" +
            hfc +
            "' and discipline_cd = '" +
            disCode +
            "'";
          con.query(query, function(error, rows, fields) {
            if (error) {
              console.log(error);
              res
                .status(500)
                .send({ success: false, message: "Something Wrong" });
            } else {
              var initialQueueNumber = rows[0]["initial_queue_no"];

              var query =
                "select last_queue_no from pms_last_queue_no where hfc_cd ='" +
                hfc +
                "' and queue_name ='" +
                queue_name +
                "' and episode_date='" +
                currentDate +
                "' and discipline_cd = '" +
                disCode +
                "';";
              con.query(query, function(error, rows, fields) {
                if (error) {
                  console.log(error);
                  res
                    .status(500)
                    .send({ success: false, message: "Something Wrong" });
                } else {
                  if (rows.length < 1) {
                    var newQueueNo = initialQueueNumber + 1;
                    var query =
                      "insert into pms_last_queue_no(hfc_cd,queue_name,episode_date,last_queue_no,discipline_cd)values('" +
                      hfc +
                      "','" +
                      queue_name +
                      "','" +
                      currentDate +
                      "', '" +
                      newQueueNo +
                      "','" +
                      disCode +
                      "');";
                    con.query(query, function(error, rows, fields) {
                      if (error) {
                        res
                          .status(500)
                          .send({ success: false, message: "Something Wrong" });
                      } else {
                        var query =
                          "insert into pms_patient_queue(pmi_no, hfc_cd, queue_name, discipline_cd, queue_no, queue_type, status, episode_date) " +
                          "values('" +
                          pmi +
                          "','" +
                          hfc +
                          "','" +
                          queue_name +
                          "','" +
                          disCode +
                          "','" +
                          newQueueNo +
                          "','" +
                          queue_type +
                          "','" +
                          status +
                          "', '" +
                          currentDate +
                          "' );";
                        con.query(query, function(error, rows, fields) {
                          if (error) {
                            res.status(500).send({
                              success: false,
                              message: "Something Wrong"
                            });
                          } else {
                            res.status(200).send({
                              success: true,
                              message: "Successful Add "
                            });
                          }
                        });
                      }
                    });
                  } else {
                    var query =
                      "select last_queue_no from pms_last_queue_no where hfc_cd ='" +
                      hfc +
                      "' and queue_name ='" +
                      queue_name +
                      "' and episode_date='" +
                      currentDate +
                      "' and discipline_cd = '" +
                      disCode +
                      "';";
                    con.query(query, function(error, rows, fields) {
                      if (error) {
                        res
                          .status(500)
                          .send({ success: false, message: "Something Wrong" });
                      } else {
                        var queue_now = rows[0]["last_queue_no"];
                        var newQueueNo = queue_now + 1;
                        var query =
                          "update pms_last_queue_no set last_queue_no='" +
                          newQueueNo +
                          "' where hfc_cd='" +
                          hfc +
                          "' and queue_name ='" +
                          queue_name +
                          "' and episode_date = '" +
                          currentDate +
                          "' and discipline_cd = '" +
                          disCode +
                          "';";
                        con.query(query, function(error, rows, fields) {
                          if (error) {
                            console.log(error);
                            res.status(500).send({
                              success: false,
                              message: "Something Wrong"
                            });
                          } else {
                            var query =
                              "insert into pms_patient_queue(pmi_no, hfc_cd, queue_name, discipline_cd, queue_no, queue_type, status, episode_date) " +
                              "values('" +
                              pmi +
                              "','" +
                              hfc +
                              "','" +
                              queue_name +
                              "','" +
                              disCode +
                              "','" +
                              newQueueNo +
                              "','" +
                              queue_type +
                              "','" +
                              status +
                              "', '" +
                              currentDate +
                              "');";
                            con.query(query, function(error, rows, fields) {
                              if (error) {
                                res.status(500).send({
                                  success: false,
                                  message: "Something Wrong pishang"
                                });
                              } else {
                                res.status(200).send({
                                  success: true,
                                  message:
                                    "you will get queue number in notification check your inbox"
                                });
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                }
              });
            }
          });
        }
      });
    } else {
      res.status(500).send({
        success: false,
        message: "Cannot Add "
      });
    }
  });

  ///try and test
});

//login
app.post("/user", function(req, res) {
  con.query(
    "SELECT * FROM patient_biodata WHERE type_id = ? AND type_id_number = ?",

    [req.body.type_id, req.body.type_id_number],
    function(error, row, fields) {
      if (error) console.log(error);

      if (row != 0) {
        con.query(
          "SELECT * FROM patient WHERE type_id = ? AND type_id_number = ?",
          [req.body.type_id, req.body.type_id_number],
          function(error, row1) {
            if (error) console.log(error);

            if (row1 != 0) {
              res.status(200).send({
                success: true,
                message: "Successful login. Welcome ",
                data: row
              });
            } else {
              res.status(500).send({
                success: false,
                message: "User not found in KKM. Please register first"
              });
            }
          }
        );
      } else {
        res.send({
          success: false,
          message: "User not found please register first"
        });
      }
    }
  );
});

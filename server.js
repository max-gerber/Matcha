/*  SETUP
    npm install                     --save
    npm install ejs                 --save
    npm install express             --save
    npm install body-parser         --save
    npm install bcrypt              --save
    npm install express-session     --save
    npm install cookie-parser       --save
    npm install mysql               --save
    npm install nodemailer          --save
    npm install sweetalert          --save
    npm install node-datetime       --save
    npm install path                --save
    npm install multer              --save
    npm install ipinfo              --save

    Run XAMPP or MAMP APACHE/MySQLa
*/

const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const cookie = require('cookie-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const swal = require('sweetalert');
const multer = require("multer");
const dateTime = require('node-datetime');
const path = require('path');
const ipInfo = require('ipinfo');
const fs = require('fs');

const app = express();
const urlencodedParser = bodyParser.urlencoded({
    extended: false
});

var red = "❌ \x1b[1m \x1b[31m";
var green = "✅ \x1b[1m \x1b[32m";
var corrLog = 0;

app.use(express.static('./public'));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'TREDX'
}));

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123"
});

con.connect(function (err) {
    if (err) {
        console.log(err);
    }
    console.log(green + " CONNECTED TO MySQL \x1b[33m PORT: 3360 \x1b[0m");
    con.query("CREATE DATABASE maindata", function (err, result) {
        if (err) {
            console.log(red + err + " \x1b[0m");
            return;
        }
        console.log(green + "DATABASE CREATED : \x1b[33m MAINDATA \x1b[0m");
        var con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "123",
            database: "maindata"
        });
        con.connect(function (err) {
            if (err) {
                console.log(red + " DATABASE ALREADY EXIST'S \x1b[0m");
                return;
            }
            console.log(green + " CONNECTED TO MySQL \x1b[33m PORT: 3030 \x1b[0m");
            con.query("CREATE TABLE userdata (`id` INT AUTO_INCREMENT PRIMARY KEY, `username` VARCHAR(255), `name` VARCHAR(255), `surname` VARCHAR(255), `email` VARCHAR(255), `password` VARCHAR(255), `code` VARCHAR(4), `token` VARCHAR(255), `verified` TINYINT(1) DEFAULT '0', `fame` INT(5) DEFAULT '0', `online` VARCHAR(100), `reports` INT(5) DEFAULT '0', `bio` TEXT, `tags` TEXT,`age` INT(5), `pp` LONGTEXT, `lonline` DATETIME, `coord` VARCHAR(255))", function (err, result) {
                if (err) {
                    console.log(red + err + " \x1b[0m");
                    return;
                }
                console.log(green + "TABLE CREATED  :   \x1b[33m USERDATA \x1b[0m");
            });
            con.query("CREATE TABLE chat (`id` INT AUTO_INCREMENT PRIMARY KEY, `correspondence` VARCHAR(255), `user_id` VARCHAR(255), `message` VARCHAR(255))", function (err, result) {
                if (err) {
                    console.log(red + err + " \x1b[0m");
                    return;
                }
                console.log(green + "TABLE CREATED  :   \x1b[33m CHAT \x1b[0m");
            });
            con.query("CREATE TABLE visitors (`id` INT AUTO_INCREMENT PRIMARY KEY, `user_id` VARCHAR(255), `viewer_id` VARCHAR(255))", function (err, result) {
                if (err) {
                    console.log(red + err + " \x1b[0m");
                    return;
                }
                console.log(green + "TABLE CREATED  :   \x1b[33m visitors \x1b[0m");
            });
            con.query("CREATE TABLE likes (`id` INT AUTO_INCREMENT PRIMARY KEY, `user_id` VARCHAR(255), `liked` VARCHAR(255))", function (err, result) {
                if (err) {
                    console.log(red + err + " \x1b[0m");
                    return;
                }
                console.log(green + "TABLE CREATED  :   \x1b[33m LIKES \x1b[0m");
            });
            con.query("CREATE TABLE block (`id` INT AUTO_INCREMENT PRIMARY KEY, `user_id` INT(5), `blockee` INT(5))", function (err, result) {
                if (err) {
                    console.log(red + err + " \x1b[0m");
                    return;
                }
                console.log(green + "TABLE CREATED  :   \x1b[33m BLOCK \x1b[0m");
            });
        });
    });
});

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'official.matcha@gmail.com',
        pass: 'MatchaMatcha'
    },
    tls: {
        rejectUnauthorized: false
    }
});

app.get("/", function (req, res) {
    res.render("index", {
        corrLog
    });
    corrlog = 0;
});

app.post("/", urlencodedParser, function (req, res) {
    console.log(req.body);
    if (req.body.uname && req.body.upsw) {
        con.query('SELECT * FROM `maindata`.`userdata` WHERE `username`= ?', [req.body.uname], function (err, result, fields) {
            if (err) {
                console.log(red + err + " \x1b[0m");
                return;
            }
            if (result.length == 1) {
                var verified = result[0].verified;
                con.query('SELECT `password` from `maindata`.`userdata` WHERE `username`= ?', [req.body.uname], function (err, result, fields) {
                    if (err) {
                        console.log(red + err + " \x1b[0m");
                        return;
                    } else {
                        if (result) {
                            bcrypt.compare(req.body.upsw, result[0].password, (err, response) => {
                                if (response == true) {
                                    if (verified) {
                                        corrLog = 2;
                                        console.log(green + " Successfully Logged in! \x1b[0m ");
                                        con.query("UPDATE `maindata`.`userdata` SET `online` = ? WHERE `username` = ?", ["online", req.body.uname], function (err, result, fields) {
                                            if (err) {
                                                console.log(red + err + " \x1b[0m");
                                                return;
                                            }
                                        });
                                        req.session.uname = req.body.uname;
                                        res.redirect("/main.txt");
                                    } else {
                                        console.log(red + "Account not verified! \x1b[0m");
                                    }
                                } else {
                                    console.log(red + "Unuccessfully Logged in! \x1b[0m ");
                                }
                            });
                        }
                    }
                });
            } else {
                corrLog = 1;
                res.redirect("/");
            }
        });
    }
});

app.get("/reset_pass.rar", (req, res) => {
    res.render("reset_pass");
})

app.post("/reset_pass", urlencodedParser, (req, res) => {
    token = crypto.randomBytes(16).toString(`hex`);
    con.query('UPDATE `maindata`.`userdata` SET `token` = ? WHERE `email` = ?', [token, req.body.uemail], (err, results, fields) => {
        if (err) {
            console.log(red + 'Invalid email address \x1b[0m');
        } else {
            var mailOptions = {
                from: 'official.matcha@gmail.com',
                to: req.body.uemail,
                subject: 'NEED SOME HELP THERE? ❤️',
                html: '<div style="border: 5px SOLID #FF5864"><h1 style="color:#FF5864;text-align:center;">Forgot your password?</h1> <h2 style="font-size:30px;color:#FF5864;text-align:center;">' + "Don't worry. Click here for a new one." + "<br><a style='font-size:20px;text-align:center;color:white;text-decoration:none;background-color:#FF5864;padding: 5px 5px;' href='http://localhost:8888/new_pass.json/token=" + token + "'>RESET PASSWORD</a>" + "</div>"
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log(green + ' EMAIL SENT: \x1b[0m' + info.response);
                }
            });
        }
    })
})

app.get("/new_pass.json/:token", (req, res) => {
    res.render("new_pass", {
        output: req.params.token
    });
});

app.post("/new_pass/:token", urlencodedParser, (req, res) => {
    console.log(req.body);
    const errors = validateReg(req);
    var token = req.params.token.slice(6);
    if (errors.length == 0) {
        bcrypt.hash(req.body.upsw, 8, (err, hash) => {
            if (err) {
                return console.log(red + " UNABLE TO HASH \x1b[0m", err);
            }
            con.query('UPDATE `maindata`.`userdata` SET `password` = ? WHERE `token` = ?', [hash, token], (err, results, fields) => {
                if (err) {
                    console.log(red + err + " \x1b[0m");
                    return;
                } else {
                    console.log(green + ' SUCCESFULLY ADDED NEW PASSWORD! \x1b[0m');
                }
            });
        });
    }
});

app.get("/register.jpeg", function (req, res) {
    res.render("register");
});

app.post("/register", urlencodedParser, function (req, res) {
    console.log(req.body);
    const errors = validateReg(req);
    if (errors.length == 0) {
        bcrypt.hash(req.body.upsw, 8, (err, hash) => {
            if (err) {
                return console.log(red + " UNABLE TO HASH \x1b[0m", err);
            }
            token = crypto.randomBytes(16).toString(`hex`);
            var mailOptions = {
                from: 'official.matcha@gmail.com',
                to: req.body.uemail,
                subject: 'WELCOME TO MATCHA ❤️',
                html: '<div style="border: 5px SOLID #FF5864"><h1 style="color:#FF5864;text-align:center;">WELCOME TO MATCHA</h1> <h2 style="font-size:30px;color:#FF5864;text-align:center;">' + req.body.ufname + " " + req.body.ulname +
                    "<br><a style='font-size:20px;text-align:center;color:white;text-decoration:none;background-color:#FF5864;padding: 5px 5px;' href='http://localhost:8888/profile_setup.mp3/token=" + token + "'>LOGIN</a>" + "</div>"
            };
            con.query('SELECT * FROM `maindata`.`userdata` WHERE `username` = ?', [req.body.uname], (err, results, fields) => {
                if (err) {
                    console.log(red + err + " \x1b[0m");
                    return;
                }
                if (results.length == 0) {
                    con.query('SELECT * FROM `maindata`.`userdata` WHERE `email` = ?', [req.body.uemail], (err, results, fields) => {
                        if (err) {
                            console.log(red + err + " \x1b[0m");
                            return;
                        }
                        if (results.length == 0) {
                            var pos = req.body.coord;
                            if (req.body.ufname && req.body.ulname && req.body.uemail) {
                                con.query('INSERT INTO `maindata`.`userdata` (`name`, `surname`, `email`, `username`, `password`, `token`, `pp`, `coord`) VALUES (?,?,?,?,?,?,?,?)', [req.body.ufname, req.body.ulname, req.body.uemail, req.body.uname, hash, token, req.body.myFile, pos], function (err, result, fields) {
                                    if (err) {
                                        console.log(red + err + " \x1b[0m");
                                        return;
                                    } else {
                                        if (!pos) {
                                            ipInfo((err, cLoc) => {
                                                con.query('UPDATE `maindata`.`userdata` SET `coord` = ? WHERE `token` = ?', [cLoc.loc, token], function (err, r1, fields) {
                                                    if (err) {
                                                        console.log(red + err + " \x1b[0m");
                                                        return;
                                                    }
                                                });
                                            });
                                        }
                                        console.log(green + ' SUCCESFULLY ADDED NEW USER! \x1b[0m');
                                        transporter.sendMail(mailOptions, function (error, info) {
                                            if (error) {
                                                console.log(red + error);
                                            } else {
                                                console.log(green + ' EMAIL SENT: \x1b[0m' + info.response);
                                            }
                                        });
                                    }
                                });
                            }
                        } else {
                            console.log(red + 'EMAIL EXISTS IN DATABASE \x1b[0m');
                        }
                    })
                } else {
                    console.log(red + 'USERNAME EXISTS IN DATABASE \x1b[0m');
                }
            })
        })
    } else {
        console.log(errors);
    }
});

app.post("/profile_setup/:token", urlencodedParser, function (req, res1) {
    console.log("\x1b[1m \x1b[46m =======  PROFILE SETUP POST  ======= \x1b[0m");
    console.log(req.body);
    var token = req.params.token.length > 32 ? req.params.token.slice(6) : req.params.token;
    con.query('SELECT * FROM `maindata`.`userdata` WHERE `token` = ?', [token], (err, res, fields) => {
        if (err) {
            console.log(red + err + " \x1b[0m");
            return;
        }
        if (res[0].code) {
            var uname = (req.body.uname) ? req.body.uname : res[0].username;
            var fname = (req.body.fname) ? req.body.fname : res[0].name;
            var sname = (req.body.sname) ? req.body.sname : res[0].surname;
            var email = (req.body.email) ? req.body.email : res[0].email;
            var bio = (req.body.bio) ? req.body.bio : res[0].bio;
            var age = (req.body.age) ? req.body.age : res[0].age;
            var tags = (req.body.tags) ? req.body.tags : res[0].tags;
            var pos = (req.body.pos) ? req.body.pos : res[0].pos;
            var psw = (req.body.psw) ? bcrypt.hash(req.body.psw, 8, (err, hash)) : res[0].password;
            var code = evaluateCode(req.body.gender, req.body.pref);
            if (pos) {
                ipInfo((err, cLoc) => {
                    con.query('UPDATE `maindata`.`userdata` SET `coord` = ? WHERE `token` = ?', [cLoc.loc, token], function (err, r1, fields) {
                        if (err) {
                        console.log(red + err + " \x1b[0m");
                        return;
                    }});
                });
            };
            con.query('UPDATE `maindata`.`userdata` SET  `code` = ?, `bio` = ?, `tags` = ?, `password` = ?, `email` = ?, `surname` = ?, `name` = ?, `username` = ?, `age` = ? WHERE `token` = ?', [code, bio, tags, psw, email, sname, fname, uname, age, token], (err, result, fields) => {
                if (err) {
                    console.log(red + err + " \x1b[0m");
                    return;
                }
                res1.redirect("/");
            });
        } else if (req.body.bio && req.body.tags && req.body.age){
            var code = evaluateCode(req.body.gender, req.body.pref);
            con.query('UPDATE `maindata`.`userdata` SET `code` = ?, `verified` = ?, `bio` = ?, `tags` = ?, `age` = ? WHERE `token` = ?', [code, 1, req.body.bio, req.body.tags, req.body.age, token], (err, result, fields) => {
                if (err) {
                    console.log(red + err + " \x1b[0m");
                    return;
                } else {
                    console.log(green + 'SUCCESFULLY ADDED USER PREFERENCES! \x1b[0m');
                    con.query('SELECT * FROM `maindata`.`userdata`WHERE `token` = ?', [token], (err, result, fields) => {
                        if (err) {
                            console.log(red + err + " \x1b[0m");
                            return;
                        }
                        if (result.length == 1) {
                            req.session.uname = result[0].username;
                            req.session.uid = result[0].id;
                        }
                        con.query("UPDATE `maindata`.`userdata` SET `online` = ? WHERE `username` = ?", ["online", req.body.uname], function (err, result, fields) {
                            if (err) {
                                console.log(red + err + " \x1b[0m");
                                return;
                            }
                        });
                        res1.redirect("/main.txt");
                    });
                }
            });
        }
    })
});

app.get("/profile_setup.mp3/:token", function (req, res) {
    console.log("\x1b[1m \x1b[46m =======  PROFILE SETUP  ======= \x1b[0m");
    var token = req.params.token.length > 32 ? req.params.token.slice(6) : req.params.token;
    var f;
    con.query('SELECT * FROM `maindata`.`userdata` WHERE `token` = ?', [token], (err, r, fields) => {
        if (err) {
            console.log(red + err + " \x1b[0m");
            return;
        }
        if (r[0].code) {
            f = 1;
        }
        res.render("profile_setup", {
            f,
            output: token
        });
    });
});

app.get("/user/:user_id", function (req, res) {
    if (corrLog == 2) {
        console.log("\x1b[1m \x1b[46m =======  USER  ======= \x1b[0m");
        var id = req.params.user_id;
        id = id.slice(4);
        var blockee = [];
        var u1 = [];
        var u2 = [];
        var uliked = [];
        var visithis = [];
        con.query('SELECT * FROM `maindata`.`userdata` WHERE `id` = ?', [req.session.uid], (err, result, fields) => {
            con.query('SELECT * FROM `maindata`.`block` WHERE `user_id` = ?', [req.session.uid], (err, v, fields) => {
                if (err) {
                    console.log(red + err + " \x1b[0m");
                    return;
                }
                var blockee = [];
                for (i = 0; i < v.length; i++) {
                    blockee.push(v[i].blockee);
                }
                con.query('SELECT * FROM `maindata`.`chat`', (err, respo, fields) => {
                    if (err) {
                        console.log(red + err + " \x1b[0m");
                        return;
                    }
                    var log = [];
                    if (respo.length > 0) {
                        for (i = 0; i < respo.length; i++) {
                            if (respo[i].correspondence.includes(req.session.uid)) {
                                if (respo[i].user_id != req.session.uid && !(blockee.includes(parseInt(respo[i].user_id)))) {
                                    log.push(respo[i].user_id);
                                    log.push(respo[i].message);
                                }
                            }
                        }
                    }
                    log.reverse();
                    con.query('SELECT * FROM `maindata`.`visitors` WHERE `user_id` = ?', [req.session.uid], (err, respon, fields) => {
                        if (err) {
                            console.log(red + err + " \x1b[0m");
                            return;
                        }
                        var visits = [];
                        if (respon) {
                            for (i = 0; i < respon.length; i++) {
                                con.query('SELECT * FROM `maindata`.`userdata` WHERE `id` = ?', [respon[i].viewer_id], (err, result, fields) => {
                                    if (err) {
                                        console.log(red + err + " \x1b[0m");
                                        return;
                                    }
                                    if (!blockee.includes(result[0].id)) {
                                        visits.push(result[0].username);
                                        visits.push(result[0].id);
                                    }
                                });
                            }
                        }
                        con.query('SELECT * FROM `maindata`.`likes` WHERE `user_id` = ?', [req.session.uid], (err, resul, fields) => {
                            if (err) {
                                console.log(red + err + " \x1b[0m");
                                return;
                            }
                            for (i = 0; i < resul.length; i++) {
                                con.query('SELECT * FROM `maindata`.`userdata` WHERE `id` = ?', [resul[i].liked], (err, result, fields) => {
                                    if (err) {
                                        console.log(red + err + " \x1b[0m");
                                        return;
                                    }
                                    u1.push(result[0].username);
                                    u1.push(result[0].id);
                                });
                            }
                            con.query('SELECT * FROM `maindata`.`likes` WHERE `liked` = ?', [req.session.uid], (err, reslt, fields) => {
                                if (err) {
                                    console.log(red + err + " \x1b[0m");
                                    return;
                                }
                                for (i = 0; i < reslt.length; i++) {
                                    con.query('SELECT * FROM `maindata`.`userdata` WHERE `id` = ?', [reslt[i].user_id], (err, result, fields) => {
                                        if (err) {
                                            console.log(red + err + " \x1b[0m");
                                            return;
                                        }
                                        u2.push(result[0].username);
                                        u2.push(result[0].id);
                                    });
                                }
                                setTimeout(() => {
                                    for (i = 0; i < u1.length; i++) {
                                        if (u2.includes(u1[i])) {
                                            uliked.push(u1[i]);
                                        }
                                    }
                                }, 100);
                                con.query('SELECT * FROM `maindata`.`visitors` WHERE `viewer_id` = ?', [req.session.uid], (err, j, fields) => {
                                    if (err) {
                                        console.log(red + err + " \x1b[0m");
                                        return;
                                    }
                                    for (i = 0; i < j.length; i++) {
                                        con.query('SELECT * FROM `maindata`.`userdata` WHERE `id` = ?', [j[i].user_id], (err, result, fields) => {
                                            if (err) {
                                                console.log(red + err + " \x1b[0m");
                                                return;
                                            }
                                            if (!blockee.includes(result[0].id)) {
                                                visithis.push(result[0].username);
                                                visithis.push(result[0].id);
                                            }
                                        });
                                    }
                                    visithis.reverse();
                                    con.query('SELECT * FROM `maindata`.`userdata` WHERE `id` = ?', [id], (err, result, fields) => {
                                        if (err) {
                                            console.log(red + err + " \x1b[0m");
                                            return;
                                        }
                                        if (result.length == 1) {
                                            var name = result[0].name;
                                            var uname = result[0].username;
                                            var gender = (result[0].code >= 1000) ? "Female" : "Male";
                                            var bio = result[0].bio;
                                            var fame = result[0].fame + 1;
                                            var online = result[0].online;
                                            var lonline = result[0].lonline;
                                            var age = result[0].age;
                                            var tags = result[0].tags.split(" ");
                                            tags = tags.filter(value => value.charAt(0) === "#");
                                            con.query('INSERT INTO `maindata`.`visitors` (`user_id`, `viewer_id`) VALUES (?,?)', [id, req.session.uid], function (err, result, fields) {
                                                if (err) {
                                                    console.log(red + err + " \x1b[0m");
                                                    return;
                                                }
                                            });
                                            con.query('UPDATE `maindata`.`userdata` SET `fame` = ? WHERE `id` = ?', [fame, id], (err, result, fields) => {
                                                if (err) {
                                                    console.log(red + err + " \x1b[0m");
                                                    return;
                                                }
                                                console.log("👀   Fame Updated \x1b[1m +10 \x1b[0m");
                                            });
                                            req.session.viewer = id;
                                            var names = [req.session.uid, req.session.viewer];
                                            names.sort();
                                            con.query('SELECT * FROM `maindata`.`chat` WHERE `correspondence` = ? ', [names[0] + "-" + names[1]], (err, re, fields) => {
                                                if (err) {
                                                    console.log(red + err + " \x1b[0m");
                                                    return;
                                                }
                                                var chatlog = [];
                                                var sender = [];
                                                if (re) {
                                                    for (i = 0; i < re.length; i++) {
                                                        con.query('SELECT `username` FROM `maindata`.`userdata` WHERE `id` = ?', [re[i].user_id], (err, result, fields) => {
                                                            if (err) {
                                                                console.log(red + err + " \x1b[0m");
                                                                return;
                                                            }
                                                            sender.push(result[0].username);
                                                        });
                                                        chatlog.push(re[i].message);
                                                    }
                                                }
                                                var f1 = "";
                                                var f2 = "";
                                                var chat = 0;
                                                con.query('SELECT * FROM `maindata`.`likes` WHERE `user_id` = ?', [req.session.uid], (err, reslt, fields) => {
                                                    if (err) {
                                                        console.log(red + err + " \x1b[0m");
                                                        return;
                                                    }
                                                    if (reslt) {
                                                        for (i = 0; i < reslt.length; i++) {
                                                            if (reslt[i].liked == req.session.viewer) {
                                                                f1 = "yes";
                                                            }
                                                        }
                                                    }
        
                                                    con.query('SELECT * FROM `maindata`.`likes` WHERE `user_id` = ?', [req.session.viewer], (err, reslt2, fields) => {
                                                        if (err) {
                                                            console.log(red + err + " \x1b[0m");
                                                            return;
                                                        }
                                                        if (reslt2) {
                                                            for (i = 0; i < reslt2.length; i++) {
                                                                if (reslt2[i].liked == req.session.uid) {
                                                                    f2 = "yes";
                                                                }
                                                            }
                                                        }
                                                        if ((f1 == "yes") && (f2 == "yes")) {
                                                            chat = 1;
                                                        } else {
                                                            chat = 0;
                                                        }
                                                        var likes = [];
                                                        con.query('SELECT * FROM `maindata`.`likes` WHERE `liked` = ?', [req.session.uid], (err, x, fields) => {
                                                            if (x) {
                                                                for (i = 0;i < x.length; i++)
                                                                {
                                                                    con.query('SELECT * FROM `maindata`.`userdata` WHERE `id` = ?', [x[i].user_id], (err, x2, fields) => {
                                                                        likes.push(x2[0].username);
                                                                        likes.push(x2[0].id);
                                                                    });
                                                                }
                                                            }
                                                            setTimeout(() => {
                                                                res.render("user", {
                                                                    log,
                                                                    visits,
                                                                    uliked,
                                                                    visithis,
                                                                    tags,
                                                                    gender,
                                                                    sender,
                                                                    id,
                                                                    name,
                                                                    uname,
                                                                    bio,
                                                                    fame,
                                                                    chatlog,
                                                                    online,
                                                                    lonline,
                                                                    chat,
                                                                    age,
                                                                    likes
                                                                });
                                                            }, 100);
                                                        });
                                                    });
                                                });
                                            });
                                        }
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    } else {
        res.redirect("/");
    }
});

app.post("/chat", urlencodedParser, function (req, res) {
    console.log("\x1b[1m \x1b[46m =======  CHAT  ======= \x1b[0m");
    var chat = req.body.chat_1;
    var names = [req.session.uid, req.session.viewer];
    names.sort();
    con.query('INSERT INTO `maindata`.`chat` (`correspondence`, `user_id`, `message`) VALUES (?,?,?)', [names[0] + "-" + names[1], req.session.uid, chat], function (err, result, fields) {
        if (err) {
            console.log(red + err + " \x1b[0m");
            return;
        }
    });
    res.redirect("/user/usr=" + req.session.viewer);
});

app.post("/like", urlencodedParser, function (req, res) {
    console.log("\x1b[1m \x1b[46m =======  LIKE  ======= \x1b[0m");
    con.query('SELECT * FROM `maindata`.`likes` where `user_id` = ? AND `liked` = ?', [req.session.uid, req.session.viewer], function (err, res, fields) {
        if (err) {
            console.log(red + err + " \x1b[0m");
            return;
        }
        if (res == 0) {
            con.query('INSERT INTO `maindata`.`likes` (`user_id`, `liked`) VALUES (?,?)', [req.session.uid, req.session.viewer], function (err, result, fields) {
                if (err) {
                    console.log(red + err + " \x1b[0m");
                    return;
                }
            });
        } else {
            con.query('DELETE FROM `maindata`.`likes` WHERE `user_id` = ? AND `liked` = ?', [req.session.uid, req.session.viewer], function (err, result, fields) {
                if (err) {
                    console.log(red + err + " \x1b[0m");
                    return;
                }
            });
        }
    });
    res.redirect("/user/usr=" + req.session.viewer);
});

app.post("/block", urlencodedParser, function (req, res) {
    console.log("\x1b[1m \x1b[46m =======  BLOCK  ======= \x1b[0m");
    con.query('INSERT INTO `maindata`.`block` (`user_id`, `blockee`) VALUES (?,?)', [req.session.uid, req.session.viewer], function (err, result, fields) {
        if (err) {
            console.log(red + err + " \x1b[0m");
            return;
        }
    });
    con.query('DELETE FROM `maindata`.`likes` WHERE `user_id` = ? AND `liked` = ?', [req.session.uid, req.session.viewer], function (err, result, fields) {
        if (err) {
            console.log(red + err + " \x1b[0m");
            return;
        }
    });
    res.redirect("/user/usr=" + req.session.viewer);
});

app.post("/report", urlencodedParser, function (req, res) {
    console.log("\x1b[1m \x1b[46m =======  REPORT  ======= \x1b[0m");
    var report = 1;
    con.query('SELECT * FROM `maindata`.`userdata` where `id` = ? ', [req.session.viewer], function (err, res, fields) {
        if (err) {
            console.log(red + err + " \x1b[0m");
            return;
        }
        report = report + (res[0].reports);
        con.query('UPDATE `maindata`.`userdata` SET `reports` = ? WHERE `id` = ?', [report, req.session.viewer], function (err, result, fields) {
            if (err) {
                console.log(red + err + " \x1b[0m");
                return;
            }
        });
    });
    res.redirect("/user/usr=" + req.session.viewer);
});

app.get("/main.txt", function (req, res) {
    console.log("\x1b[1m \x1b[46m =======  MAIN  ======= \x1b[0m");
    if (corrLog == 2) {
        var uname = req.session.uname;
        con.query('SELECT * FROM `maindata`.`userdata` WHERE `username` = ?', [uname], (err, result, fields) => {
            if (err) {
                console.log(red + err + " \x1b[0m");
                return;
            }
            var uname = result[0].username;
            var fname = result[0].name;
            var sname = result[0].surname;
            var email = result[0].email;
            var pref = result[0].pref;
            var token = result[0].token;
            var code = result[0].code;
            var uid = result[0].id;
            var age = result[0].age;
            var coord = result[0].coord;
            var tags = result[0].tags;
            var minAge = req.query.agemin ? req.query.agemin : 18;
            var maxAge = req.query.agemax ? req.query.agemax : 1000;
            var filterTags = req.query.filtertags ? req.query.filtertags : null;
            var maxDistance = req.query.distance ? req.query.distance : 100000;
            var minFame = req.query.minfame ? req.query.minfame : 0;
            console.log(minAge + " : " + maxAge + " : " + filterTags + " : " + maxDistance + " : " + minFame);
            req.session.uid = uid;
            con.query('SELECT * FROM `maindata`.`userdata` WHERE NOT `username` = ?', [uname], (err, resl, fields) => {
                if (err) {
                    console.log(red + err + " \x1b[0m");
                    return;
                }
                con.query('SELECT * FROM `maindata`.`block` WHERE `user_id` = ?', [uid], (err, v, fields) => {
                    if (err) {
                        console.log(red + err + " \x1b[0m");
                        return;
                    }
                    var blockee = [];
                    for (i = 0; i < v.length; i++) {
                        blockee.push(v[i].blockee);
                    }
                    var ppl = [];
                    if (resl) {
                        for (i = 0; i < resl.length; i++) {
                            if ((blockee.length && !blockee.includes(resl[i].id)) || !blockee.length) {
                                if (tagCheck(resl[i], coord, minAge, maxAge, filterTags, maxDistance, minFame) && (compatibleCheck(code, resl[i].code))) {
                                    ppl.push(resl[i].id);
                                    ppl.push(resl[i].username);
                                }
                            }
                        }
                    }
                    con.query('SELECT * FROM `maindata`.`chat`', (err, respo, fields) => {
                        if (err) {
                            console.log(red + err + " \x1b[0m");
                            return;
                        }
                        var log = [];
                        if (respo.length > 0) {
                            for (i = 0; i < respo.length; i++) {
                                if (respo[i].correspondence.includes(uid)) {
                                    if (respo[i].user_id != uid && !(blockee.includes(parseInt(respo[i].user_id)))) {
                                        log.push(respo[i].user_id);
                                        log.push(respo[i].message);
                                    }
                                }
                            }
                        }
                        log.reverse();
                        con.query('SELECT * FROM `maindata`.`visitors` WHERE `user_id` = ?', [uid], (err, respon, fields) => {
                            if (err) {
                                console.log(red + err + " \x1b[0m");
                                return;
                            }
                            var visits = [];
                            if (respon) {
                                for (i = 0; i < respon.length; i++) {
                                    con.query('SELECT * FROM `maindata`.`userdata` WHERE `id` = ?', [respon[i].viewer_id], (err, result, fields) => {
                                        if (err) {
                                            console.log(red + err + " \x1b[0m");
                                            return;
                                        }
                                        if (!blockee.includes(result[0].id)) {
                                            visits.push(result[0].username);
                                            visits.push(result[0].id);
                                        }
                                    });
                                }
                            }
                            var u1 = [];
                            var u2 = [];
                            var uliked = [];
                            con.query('SELECT * FROM `maindata`.`likes` WHERE `user_id` = ?', [req.session.uid], (err, resul, fields) => {
                                if (err) {
                                    console.log(red + err + " \x1b[0m");
                                    return;
                                }
                                for (i = 0; i < resul.length; i++) {
                                    con.query('SELECT * FROM `maindata`.`userdata` WHERE `id` = ?', [resul[i].liked], (err, result, fields) => {
                                        if (err) {
                                            console.log(red + err + " \x1b[0m");
                                            return;
                                        }
                                        u1.push(result[0].username);
                                        u1.push(result[0].id);
                                    });
                                }
                                con.query('SELECT * FROM `maindata`.`likes` WHERE `liked` = ?', [req.session.uid], (err, reslt, fields) => {
                                    if (err) {
                                        console.log(red + err + " \x1b[0m");
                                        return;
                                    }
                                    for (i = 0; i < reslt.length; i++) {
                                        console.log(reslt[i].user_id);
                                        con.query('SELECT * FROM `maindata`.`userdata` WHERE `id` = ?', [reslt[i].user_id], (err, result, fields) => {
                                            if (err) {
                                                console.log(red + err + " \x1b[0m");
                                                return;
                                            }
                                            u2.push(result[0].username);
                                            u2.push(result[0].id);
                                        });
                                    }
                                    console.log("U1 :"+u1);
                                    console.log("U2 :"+u2);
                                    setTimeout(() => {
                                        for (i = 0; i < u1.length; i++) {
                                            if (u2.includes(u1[i])) {
                                                                                                    
                                                uliked.push(u1[i]);
                                            }
                                        }
                                    }, 100);
                                    var visithis = [];
                                    con.query('SELECT * FROM `maindata`.`visitors` WHERE `viewer_id` = ?', [req.session.uid], (err, j, fields) => {
                                        if (err) {
                                            console.log(red + err + " \x1b[0m");
                                            return;
                                        }
                                        for (i = 0; i < j.length; i++) {
                                            con.query('SELECT * FROM `maindata`.`userdata` WHERE `id` = ?', [j[i].user_id], (err, result, fields) => {
                                                if (err) {
                                                    console.log(red + err + " \x1b[0m");
                                                    return;
                                                }
                                                if (!blockee.includes(result[0].id)) {
                                                    visithis.push(result[0].username);
                                                    visithis.push(result[0].id);
                                                }
                                            });
                                        }
                                        visithis.reverse();
                                        var likes = [];
                                        con.query('SELECT * FROM `maindata`.`likes` WHERE `liked` = ?', [req.session.uid], (err, x, fields) => {
                                            if (err) {
                                                console.log(red + err + " \x1b[0m");
                                                return;
                                            }
                                            if (x) {
                                                for (i = 0;i < x.length; i++)
                                                {
                                                    con.query('SELECT * FROM `maindata`.`userdata` WHERE `id` = ?', [x[i].user_id], (err, x2, fields) => {
                                                        if (err) {
                                                            console.log(red + err + " \x1b[0m");
                                                            return;
                                                        }
                                                        likes.push(x2[0].username);
                                                        likes.push(x2[0].id);
                                                    });
                                                }
                                            }
                                            con.query('SELECT * FROM `maindata`.`userdata`', (err, result, fields) => {
                                                if (err) {
                                                    console.log(red + err + " \x1b[0m");
                                                    return;
                                                }
                                                ppl = match_sort(ppl, coord, age, tags, result);
                                                setTimeout(() => {
                                                    res.render("main", {
                                                        uname,
                                                        fname,
                                                        sname,
                                                        email,
                                                        pref,
                                                        ppl,
                                                        log,
                                                        visits,
                                                        uliked,
                                                        visithis,
                                                        token,
                                                        likes
                                                    });
                                                }, 100)
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    } else {
        res.redirect("/");
    }
});

app.get("/logout", function (req, res) {
    console.log("\x1b[1m \x1b[46m =======  LOGOUT  ======= \x1b[0m");
    con.query("UPDATE `maindata`.`userdata` SET `online` = ? WHERE `id` = ?", ["offline", req.session.uid], function (err, result, fields) {
        if (err) {
        console.log(red + err + " \x1b[0m");
        return;
    }});
    var dt = dateTime.create();
    var formatted = dt.format('Y-m-d H:M:S');
    con.query("UPDATE `maindata`.`userdata` SET `lonline` = ? WHERE `id` = ?", [formatted, req.session.uid], function (err, result, fields) {
        if (err) {
            console.log(red + err + " \x1b[0m");
            return;
        }
    });
    console.log("LOGOUT");
    res.redirect("/");
});

app.listen(8888, "0.0.0.0",function () {
    console.log(green + "SERVER LAUNCHED :: \x1b[33m PORT: 8888 \x1b[0m");
});

function validateReg(req) {
    const errors = [];
    if (req.body.upsw != req.body.upsw2) {
        errors.push("Passwords Do not match!");
    }
    return errors;
};

function evaluateCode(gender, preference) {
    var code;
    if (gender == "male") {
        code = "01";
    } else {
        code = "10";
    }
    if (preference == "none") {
        code = code + "00";
    } else if (preference == "male") {
        code = code + "01";
    } else if (preference == "female") {
        code = code + "10";
    } else if (preference == "both") {
        code = code + "11";
    }
    return code;
};

function compatibleCheck(user1, user2) {
    var u1 = parseInt(user1, 2);
    var u2 = parseInt(user2, 2);
    return (((((u1 >> 2) & (u2 & 3)) >> 1) | (((u1 >> 2) & (u2 & 3)) & 1)) & ((((u2 >> 2) & (u1 & 3)) >> 1) | (((u2 >> 2) & (u1 & 3)) & 1)));
};

function tagCheck(user, location, minAge, maxAge, filterTags, maxDistance, minFame){
    var coord1 = user.coord.split(",");
    var coord2 = location.split(",");
    var distance = getDistance(coord1[0], coord1[1], coord2[0], coord2[1]);
    var badTags = [];
    if (filterTags){
        var tags1 = user.tags.split(" ");
        var tags2 = filterTags.split(" ");
        badTags = tags1.filter(value => -1 !== tags2.indexOf(value));
    }
    if (user.age < minAge || user.age > maxAge || distance > maxDistance || badTags.length){
        return 0;
    };
    return 1;
};

function getDistance(lat1,lon1,lat2,lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);
    var dLon = deg2rad(lon2-lon1); 
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var dist = R * c;
    return dist;
};

function deg2rad(deg) {
    return deg * (Math.PI/180)
};

function sort_order(array) {
    var length = array.length
    var sorted = [];
    for (i = 0; i < length; i++) {
        sorted.push(i);
    };
    for (i = 0; i < length; i++) {
        for (j = 0; j < (length - i - 1); j++) {
            if (array[j] > array[j + 1]) {
                var temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;
                temp = sorted[j];
                sorted[j] = sorted[j + 1];
                sorted[j + 1] = temp;
            };
        };
    };
    return sorted;
};

function match_sort(people, coord, age, tags, result){
    var matchRating = [];
    var newArray = [];
    var k = 0;
    for (i = 0; i < people.length; i += 2) {
        for (j = 0; j < result.length; j++){
            if (result[j].id == people[i]){
                var coord1 = result[j].coord.split(",");
                var coord2 = coord.split(",");
                var tags1 = result[j].tags.split(" ");
                var tags2 = tags.split(" ");
                var commonTags = tags1.filter(value => -1 !== tags2.indexOf(value));
                matchRating[k] = getDistance(coord1[0], coord1[1], coord2[0], coord2[1]);
                matchRating[k] -= commonTags.length * 10;
                matchRating[k] += Math.abs(age - result[j].age) * 5;
                matchRating[k] -= result[j].fame * 0.001;
                k++;
            };
        };
    };
    var sorted = sort_order(matchRating);
    for (i = 0; i < sorted.length; i++) {
        newArray.push(people[2 * sorted[i]]);
        newArray.push(people[(2 * sorted[i]) + 1]);
    };
    return newArray;
};
const express = require('express');
const connection = require('../connection');
const router = express.Router();

const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
require('dotenv').config();

var auth = require('../services/authentication');
var checkRole = require('../services/checkRole');

router.post('/signup', (req, res) => {
    let user = req.body;
    let query = "select email,password,role,status from user where email=?"
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                query = "insert into user(name,contactNumber,email,password,status,role) values(?,?,?,?,'false','user')";
                connection.query(query, [user.name, user.contactNumber, user.email, user.password], (err, results) => {
                    if (!err) {
                        return res.status(200).json({ message: "Successfully Registered" });
                    }
                    else {
                        return res.status(500).json(err);
                    }
                })
            }
            else {
                return res.status(400).json({ message: "Email Already Exist." });
            }
        }
        else {
            return res.status(500).json(err);
        }

    })

})

router.post('/login', (req, res) => {
    const user = req.body;
    let query = "select email,password,role,status from user where email=?"
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0 || results[0].password != user.password) {
                return res.status(401).json({ message: "Incorrect username or password" });
            }
            else if (results[0].status == 'false') {
                return res.status(401).json({ message: "Wait for krishna's Approval" });
            }
            else if (results[0].password == user.password) {
                const response = { email: results[0].email, role: results[0].role }
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, { expiresIn: '8h' })
                res.status(200).json({ token: accessToken });

            }
            else {
                return res.status(400).json({ message: "Something went wrong. Please try again later" });
            }
        }
        else {
            return res.status(500).json(err);
        }
    })
})

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
})

router.post('/forgotPassword', (req, res) => {
    const user = req.body;
    let query = "select name,email,password from user where email=?";
    connection.query(query, [user.email], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                return res.status(200).json({ message: "Password sent successfully to your email." });
            }
            else {
                var mailOptions = {
                    from: process.env.EMAIL,
                    to: results[0].email,
                    subject: 'Pharma password reset',
                    html: '<div><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" bgcolor="#f9f9f9"><table width="600" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" bgcolor="#2980b9" style="padding: 20px;"><h1 style="color: #ffffff;">Password Reset</h1></td></tr><tr><td bgcolor="#ffffff" style="padding: 40px;"><p>Hello '+ results[0].name+',</p><p>We have received a request to reset your password. Please click the button below to login:</p><p align="center"><a href="http://localhost:4200/" style="display: inline-block; background-color: #2980b9; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login</a></p><br><b>Login Id: </b>'+results[0].email+'<br><b>Password: </b>' + results[0].password + '<p>If you did not request this reset, please ignore this email, and your password will remain unchanged.</p><p>Thank you,</p><p>The Team Pharma</p></td></tr><tr><td align="center" bgcolor="#2980b9" style="padding: 20px;"><p style="color: #ffffff; margin: 0;">© Krishna Kokate. All rights reserved.</p></td></tr></table></td></tr></table></div>'
                    
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        console.log('Email sent: ' + info.response);
                    }
                });
                return res.status(200).json({ message: "Password sent successfully to your email." });
            }
        }
        else {
            return res.status(500).json(err);
        }
    })
})


router.get('/get', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    var query = "select id,name,contactNumber,status from user where role='user'";
    connection.query(query, (err, results) => {
        if (!err) {
            return res.status(200).json(results);
        }
        else {
            return res.status(500).json(err);
        }
    })
})


// This API is used to update the status of user
router.patch('/update', auth.authenticateToken, checkRole.checkRole, (req, res) => {
    let user = req.body;
    var query = "update user set status=? where id=?";
    connection.query(query, [user.status, user.id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json({ message: "User id does no exit" });
            }
            return res.status(200).json({ message: "User Updated Sucessfully." });
        }
        else {
            return res.status(500).json(err);
        }
    })
})


router.get('/checkToken', auth.authenticateToken, (req, res) => {
    return res.status(200).json({ message: "true" });
})


router.post('/changePassword',auth.authenticateToken, (req, res) => {
    const user = req.body;
    const email = res.locals.email;
    var query = "select *from user where email=? and password=?";
    connection.query(query, [email, user.oldPassword], (err, results) => {
        if (!err) {
            if (results.length <= 0) {
                return res.status(400).json({ message: "Incorrect old Password" });
            }
            else if (results[0].password == user.oldPassword) {
                var query = "update user set password=? where email=?";
                connection.query(query, [user.newPassword, email], (err, results) => {
                    if (!err) {
                        return res.status(200).json({ message: "Password Updated Successfully." });
                    }
                    else {
                        return res.status(500).json(err);
                    }
                })
            }
            else {
                return res.status(400).json({ message: "Something went wrong please try again later." });
            }
        }
        else {
            return res.status(500).json(err);
        }
    })
})
module.exports = router;
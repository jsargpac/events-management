module.exports = function (authService) {
    var express = require('express');
    var router = express.Router();
    var async = require("async");
    var users = require('../../model/user.js');
    var mail = require('../../service/mail.js');

    function isInt(value) {
        return !isNaN(value) &&
            parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
    }

    router.get('/', authService.ensureAuthorized(), function (req, res, next) {
        if (req.decoded.user == undefined) {
            res.setHeader('Content-Type', 'application/json');
            res.status(404).json('No data');
        } else {
            var id = req.decoded.user.id;
            if (isInt(id)) {
                async.series([
                    async.apply(users.getOwnerById, id)
                ], function (err, results) {
                    if (results[0].length < 1) {
                        res.setHeader('Content-Type', 'application/json');
                        res.status(404).json('No people found');
                    }
                });
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.status(404).json('No data');
            }

        }
    });

    router.post('/', function (req, res) {
        if (req.body == undefined) {
            res.setHeader('Content-Type', 'application/json');
            res.status(404).json('No data in post');
        } else {
            if (req.body.firstname == undefined || req.body.lastname == undefined || req.body.password == undefined || req.body.mail == undefined) {
                res.setHeader('Content-Type', 'application/json');
                res.status(404).json('No data in post');
            } else {
                users.insertOwner(req.body.firstname, req.body.lastname, req.body.mail, req.body.password, function (err, results) {
                    if (err) {
                        console.log(err);
                        res.setHeader('Content-Type', 'application/json');
                        res.status(404).json('Too many people found');
                    } else {
                        res.setHeader('Content-Type', 'application/json');
                        res.status(200).json('ack');
                        users.getOwnerActivationHashById(results, function (err, user) {
                            if (err) {
                                res.setHeader('Content-Type', 'application/json');
                                res.status(404).json('No hash found');
                            } else {
                                mail.sendMailActivation(user.mail, user.mailactivationhash, function(err, result){});
                            }
                        });
                    }
                });
            }
        }
    });

    return router;
}
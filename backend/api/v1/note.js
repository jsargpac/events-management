var express = require('express');
var router = express.Router();
var async = require("async");
var notes = require('../../model/note.js');
var users = require('../../model/user.js');

router.post('/', function (req, res) {
    if (req.body.data == undefined) {
        res.setHeader('Content-Type', 'application/json');
        res.status(404).json('No data in post');
    } else {
        var data = req.body.data;
        var dataOk = true;

        if (data.id_town == undefined || data.id_town == null || data.id_town == '') {
            dataOk = dataOk && false;
        }

        if (data.firstname == undefined || data.firstname == null || data.firstname == '') {
            dataOk = dataOk && false;
        }

        if (data.lastname == undefined || data.lastname == null || data.lastname == '') {
            dataOk = dataOk && false;
        }

        if (data.date_start == undefined || data.date_start == null || data.date_start == '') {
            dataOk = dataOk && false;
        }

        if (data.date_end == undefined || data.date_end == null || data.date_end == '') {
            dataOk = dataOk && false;
        }

        if ((!(data.date_end == undefined || data.date_end == null || data.date_end == '')) && (!(data.date_start == undefined || data.date_start == null || data.date_start == '')) {
            if (data.date_end < data.date_start) {
                dataOk = dataOk && false;
            }
        }

        if (data.capacity == undefined || data.capacity == null || data.capacity < 0 || data.capacity > 5) {
            dataOk = dataOk && false;
        }

        if (data.attitude == undefined || data.attitude == null || data.attitude < 0 || data.attitude > 5) {
            dataOk = dataOk && false;
        }

        if (data.degradation == undefined || data.degradation == null || data.degradation < 0 || data.capacity > 5) {
            dataOk = dataOk && false;
        }

        async.series([
            async.apply(users.getOwnerById, data.id_owner),
            async.apply(users.getTenant, data.firstname, data.lastname)
        ], function (err, results) {
            if (results[0].length < 1) {
                res.setHeader('Content-Type', 'application/json');
                res.status(404).json('Failed');
            } else {

                if (results[1].length < 1) {

                }

                async.series([
                    async.apply(notes.insertNote, req.body.data)
                ], function (err) {
                    if (err) {
                        res.setHeader('Content-Type', 'application/json');
                        res.status(404).json('Failed');
                    } else {
                        res.setHeader('Content-Type', 'application/json');
                        res.status(200).json('ack');
                    }
                });
            }
        });
    }
});

module.exports = router;
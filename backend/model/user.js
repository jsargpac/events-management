var config = require('../config.json');
var pg = require('pg');
var connectionString = config.LPP_POSTGRESQL_URL;

function getTenant(firstname, lastname, callback) {
    var client = new pg.Client(connectionString);
    client.connect(function (err) {
        firstname += '%';
        lastname += '%';
        var users = [];
        var query = client.query("SELECT users.id, users.firstname, users.lastname  FROM t_users as users INNER JOIN t_users_usertypes as usertypelink ON users.id=usertypelink.id_user INNER JOIN t_usertypes as usertype ON usertype.id=usertypelink.id_usertype WHERE firstname_lower LIKE $1 AND lastname_lower LIKE $2 AND usertype.code='LOC'",
            [firstname, lastname]);
        query.on('row', function (row) {
            users.push(row);
        });
        query.on('end', function () {
            client.end();
            callback(null, users);
        });
    });
};
module.exports.getTenant = getTenant;

function getTenantById(id, callback) {
    var client = new pg.Client(connectionString);
    client.connect(function (err) {
        var users = [];
        var query = client.query("SELECT users.id, users.firstname, users.lastname  FROM t_users as users INNER JOIN t_users_usertypes as usertypelink ON users.id=usertypelink.id_user INNER JOIN t_usertypes as usertype ON usertype.id=usertypelink.id_usertype WHERE users.id=$1 AND usertype.code='LOC'",
            [id]);
        query.on('row', function (row) {
            users.push(row);
        });
        query.on('end', function () {
            client.end();
            callback(null, users);
        });
    });
};
module.exports.getTenantById = getTenantById;

function getOwnerById(id, callback) {
    var client = new pg.Client(connectionString);
    client.connect(function (err) {
        var users = [];
        var query = client.query("SELECT users.id, users.firstname, users.lastname, nb_request  FROM t_users as users INNER JOIN t_users_usertypes as usertypelink ON users.id=usertypelink.id_user INNER JOIN t_usertypes as usertype ON usertype.id=usertypelink.id_usertype WHERE users.id=$1 AND usertype.code='PRO'",
            [id]);
        query.on('row', function (row) {
            users.push(row);
        });
        query.on('end', function () {
            client.end();
            callback(null, users);
        });
    });
};
module.exports.getOwnerById = getOwnerById;

function insertTenant(firstname, lastname, callback) {
    var client = new pg.Client(connectionString);
    var today = new Date(Date.now());
    client.connect(function (err) {
        var query = client.query('insert into t_users (firstname, firstname_lower, lastname, lastname_lower, inscription_date) values ($1,$2,$3,$4,$5);',
            [   firstname,
                firstname.toLowerCase(),
                lastname,
                lastname.toLowerCase(),
                today], function (err, result) {
                if (err) {
                    client.end();
                    callback(new Error('Failed' + err.message));
                } else {
                    var users = [];
                    var query = client.query("SELECT id FROM t_users as users WHERE firstname=$1 AND lastname=$2",
                        [firstname,lastname]);
                    query.on('row', function (row) {
                        users.push(row);
                    });
                    query.on('end', function () {
                        if (users.length == 0) {
                            client.end();
                            callback(new Error('Failed - User not inserted'));
                        } else {
                            var id_user = users[0].id;
                            var types = [];
                            var query = client.query("SELECT id FROM t_usertypes WHERE code=$1",
                                ['LOC']);
                            query.on('row', function (row) {
                                types.push(row);
                            });
                            query.on('end', function () {
                                var id_type = types[0].id;
                                var query = client.query('insert into t_users_usertypes (id_user, id_usertype) values ($1,$2);',
                                    [id_user,id_type], function (err, result) {
                                        if (err) {
                                            client.end();
                                            callback(new Error('Failed' + err.message));
                                        } else {
                                            client.end();
                                            callback(null, id_user);
                                        }
                                    });
                            });
                        }
                    });
                }
            });
    });
};
module.exports.insertTenant = insertTenant;

var mongodb = require('./db');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://heroku_s4ggn8s2:jqqqmp4nb70ou4phibtn2e248b@ds145208.mlab.com:45208/heroku_s4ggn8s2';

function User(user) {
	this.name = user.name;
	this.password = user.password;
}
module.exports = User;

User.prototype.save = function save(callback) {
	var user = {
		name: this.name,
		password: this.password,
	};
	MongoClient.connect(url, function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('users', function(err, collection) {
			if (err) {
				db.close();
				return callback(err);
			}

			// collection.ensureIndex('name', {unique: true});

			collection.insert(user, {safe: true}, function(err, user) {
				db.close();
				callback(err, user);
			});
		});
	});
};

User.get = function get(username, callback) {
	MongoClient.connect(url, function(err, db) {
		assert.equal(null, err);
		console.log("Connect correctly to server.");
		db.collection('users', function(err, collection) {
			if (err) {
				db.close();
				return callback(err);
			}

			collection.findOne({name: username}, function(err, doc) {
				db.close();
				if (doc) {
					var user = new User(doc);
					callback(err, user);
				} else {
					callback(err, null);
				}
			});
		});
	});
};
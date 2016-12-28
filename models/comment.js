var mongodb = require('./db');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://heroku_s4ggn8s2:jqqqmp4nb70ou4phibtn2e248b@ds145208.mlab.com:45208/heroku_s4ggn8s2';	

function Comment(originusername, comment) {
	this.originusername = originusername;
	this.comment = comment;
}

module.exports = Comment;
Comment.prototype.save = function save(callback) {
	var comment = {
		originusername: this.originusername,
		comment: this.comment
	};
	MongoClient.connect(url, function(err, db) {
		if (err) {
			return callback(err);
		}

		db.collection('comments', function(err, collection) {
			if (err) {
				db.close();
				return callback(err);
			}
			collection.ensureIndex('originusername');
			collection.insert(comment, {safe: true}, function(err, comment) {
				db.close();
				callback(err, comment);
			});
		});
	});
};

Comment.get = function get(originusername, callback) {

	MongoClient.connect(url, function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('comments', function(err, collection) {
			if (err) {
				db.close();
				return callback(err);
			}

			var query = {};
			if (originusername) {
				query.originusername = originusername;
			}
			
			collection.find(query).toArray(function(err, docs) {
				db.close();
				if (err) {
					callback(err, null);
				}

				var comments = new Array();
				docs.forEach(function(doc, index) {
					var comment = doc.comment;
					comments.push(comment);
				});
				callback(null, comments);
			});
		});
	});
}
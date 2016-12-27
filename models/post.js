var mongodb = require('./db');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://localhost:27017/blog';	


function Post(username, post, time) {
	this.user = username;
	this.post = post;
	if (time) {
		this.time = time;
	} else {
		var now = new Date();
		this.time = now.getFullYear() + "/" + (now.getMonth() + 1) + 
		"/" + now.getDate() + " " + now.getHours() + ":" +
		now.getSeconds();		
	}
}

module.exports = Post;
Post.prototype.save = function save(callback) {
	var post = {
		user: this.user,
		post: this.post,
		time: this.time
	};
	MongoClient.connect(url, function(err, db) {
		if (err) {
			return callback(err);
		}

		db.collection('posts', function(err, collection) {
			if (err) {
				db.close();
				return callback(err);
			}
			collection.ensureIndex('user');
			collection.insert(post, {safe: true}, function(err, post) {
				db.close();
				callback(err, post);
			});
		});
	});
};

Post.get = function get(username, callback) {

	MongoClient.connect(url, function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function(err, collection) {
			if (err) {
				db.close();
				return callback(err);
			}

			var query = {};
			if (username) {
				query.user = username;
			}

			collection.findOne(query, function(err, doc){
				db.close();
				if (err) {
					callback(err, null);
				}
				var posts = new Array();
				console.log(posts);
				if (doc) {
					posts.push(doc);
				}
				callback(null, posts);
			});
		});
	});
};

Post.getPic = function getPic(username, filename, callback) {

	MongoClient.connect(url, function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			var query = {};
			if (username || posttime) {
				query.user = username;
				query["post.name"] = filename;
			}
			collection.findOne(query, function(err, pic, randomDigit) {
				if (err) {
					return callback(err);
				}
				var fs = require('fs');
				if (pic == null) {
					return callback(err, null);
				}
				var filenameDigit = Math.floor(Math.random() * 10);
				var filenameWithPath = 'profileCache/output' + filenameDigit.toString() + '.jpg';
				fs.writeFile(filenameWithPath, 
					pic.post.data.buffer, function(err) {
					callback(err, filenameWithPath);
				})
			});
		});
	});
};

Post.delete = function deletef(username, callback) {
	MongoClient.connect(url, function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if (username) {
				query.user = username;
			} else {
				console.log("has not gotten a proper user name.");
				return callback(err);
			}
			collection.remove(query, function(err, result) {
				console.log("here are the documents deleted");
				console.log(result);
				callback(err);
			})
		});
	});
};

var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Comment = require('../models/comment.js');

/* GET home page. */
router.get('/', function(req, res, next) {
	Post.get(null, function(err, posts) {
		if (err) {
			posts = [];
		}
		console.log(posts);
		res.render('index', {title: 'Impression Site - Main Page', posts: posts, currentUser: req.session.user});
	});
});

router.get('/u/:user', function(req, res) {
	User.get(req.params.user, function(err, user) {
		if (!user) {
			req.flash('error', 'Username does not exist.');
			return res.redirect('/');
		}
		var currentUserName = null;
		if (req.session.user) {
			currentUserName = req.session.user.name;
		}
		var viewedUserName = req.params.user;

		Comment.get(viewedUserName, function(err, comments){
			if (err) {
				console.log(err);
				req.flash('error', err);
				return res.redirect('/');
			}
			if (currentUserName == viewedUserName &&
				req.query['delete'] && req.query['delete'] == 1) {
				Post.delete(req.params.user, function (err) {
					if (err) {
						req.flash('error', err);
						return res.redirect('/');
					} else {
						Post.get(user.name, function(err, posts) {
							if (err) {
								req.flash('error', err);
								return res.redirect('/');
							}
							var currentUser = req.session.user;
							var isSelf = false;
							if (currentUser && currentUser.name == req.params.user) {
								isSelf = true;
							}
							res.render('user', {
								title: user.name,
								posts: posts,
								isSelf: isSelf,
								currentUser: req.session.user,
								comments: null
							});
						});					
					};
				});
			} else {
				Post.get(user.name, function(err, posts) {
					if (err) {
						req.flash('error', err);
						return res.redirect('/');
					}
					var currentUser = req.session.user;
					var isSelf = false;
					if (currentUser && currentUser.name == req.params.user) {
						isSelf = true;
					}
					console.log("The comments is:");
					console.log(comments);
					res.render('user', {
						title: user.name,
						posts: posts,
						isSelf: isSelf,
						currentUser: req.session.user,
						comments: comments
					});
				});
			}
		});
	});
});

router.get('/image/:user/:filename', function(req, res) {

	Post.getPic(req.params.user, req.params.filename, function(err, picFileName) {
		if (err) {
			return res.send(404);
		}
		res.sendFile(picFileName, {root: __dirname + '/..'});
	});
});

router.post('/u/:user/comment', function(req, res) {
	var originusername = req.params.user;
	var comment = new Comment(originusername, req.body.comment);
	comment.save(function(err) {
		if (err) {
			req.flash('error', err);
			console.log(err);
			return res.redirect('/');
		}
		req.flash('success','Successfully uploaded');
		res.redirect('/u/' + originusername);
	});
});

router.post('/post', checkLogin);
router.post('/post', function(req, res) {
	var currentUser = req.session.user;
	if (!req.files) {
		req.flash('error', 'Can not be empty file.');
		return res.redirect('/u/' + currentUser.name);
	}
	var profilepic = req.files.profilepic;
	var post = new Post(currentUser.name, profilepic);
	post.save(function(err){
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		req.flash('success', 'Successfully posted.');
		res.redirect('/u/' + currentUser.name);
	});
});

router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res){
	res.render('reg', {title: 'User Registration', user: null, currentUser: null});
});

router.post('/reg', checkNotLogin);
router.post('/reg', function(req, res){
	if (req.body.username == "" || req.body.userpwd == "" || req.body.pwdrepeat == "") {
		req.flash('error', 'Cannot be empty!');
		return res.redirect('/reg');
	}

	if (req.body.invitationcode != "peichen") {
		req.flash('error', 'Wrong Invitation Code for Registration');
		return res.redirect('/');
	}

	if (req.body['userpwd'] !== req.body['pwdrepeat']) {
		req.flash('error', 'Two passwords are different.');
		return res.redirect('/reg');
	}

	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.userpwd).digest('base64');

	var newUser = new User({
		name: req.body.username,
		password: password
	});

	User.get(newUser.name, function(err, user) {
		if (user) {
			err = 'Username already exists.';
		}
		if (err) {
			console.log(err);
			req.flash('error', err);
			return res.redirect('/reg');
		}
		newUser.save(function(err) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/reg');
			}
			req.session.user = newUser;
			req.flash('success', req.session.user.name + 'Successful registration.');
			res.redirect('/');
		})
	})
});

router.get('/login', checkNotLogin);
router.get('/login', function(req, res) {
	res.render('login', {title: 'User Login', currentUser: null});
});

router.post('/login', checkNotLogin);
router.post('/login', function(req, res) {
	var md5 = crypto.createHash('md5');
	console.log(req.body);
	var password = md5.update(req.body.userpwd).digest('base64');
	User.get(req.body.username, function(err, user) {
		if (!user) {
			req.flash('error', 'Username does not exist.');
			return res.redirect('/login');
		}
		if (user.password !== password) {
			req.flash('error', 'User password does not exist.');
			return res.redirect('/login');
		}
		req.session.user = user;
		req.flash('success', 'Successful Login.');
		res.redirect('/');
	});
});

router.get('/logout', checkLogin);
router.get('/logout', function(req, res) {
	req.session.user = null;
	req.flash('success', 'Successful Logout.');
	res.redirect('/');
});

router.post('/users', function(req, res) {
	console.log('admin refresh');
	res.send(200);
});

function checkNotLogin(req, res, next) {
	console.log(req.session);
	if (req.session.user) {
		req.flash('error', 'Logged in already.');
		return res.redirect('/');
	}
	next();
}

function checkLogin(req, res, next) {
	if (!req.session.user) {
		req.flash('error', 'Not logged in yet.');
		return res.redirect('/login');
	}
	next();
}

module.exports = router;

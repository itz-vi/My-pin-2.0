const express = require('express');
const router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");
const passport = require('passport');
const upload = require('./multer');


const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));


router.get('/', function (req, res, next) {
  res.render('regi', { error: req.flash("error") });
});
router.get('/login', function (req, res, next) {
  res.render('login', { error: req.flash("error") });
})


// ---------change Profile image--------------------------
router.get('/profile', isLoggedIn, async function (req, res, next) {
  const user =
    await userModel
      .findOne({ username: req.session.passport.user })
      .populate("posts")
  res.render("profile", { user });
});
router.post('/fileupload', isLoggedIn, upload.single("image"), async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect("/profile");
});

// ---------add new post--------------------------
router.get('/add', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  res.render("add", { user });
});
router.post('/createpost', isLoggedIn, upload.single("postimage"), async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  const post = await postModel.create({
    user: user._id,
    title: req.body.title,
    image: req.file.filename,
    description: req.body.description,
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});


// -----------show posts------------
router.get('/show/posts', isLoggedIn, async function (req, res, next) {
  const user =
    await userModel
      .findOne({ username: req.session.passport.user })
      .populate("posts")
  res.render("show", { user });
});

//  --------Feed page -------------
router.get('/feed', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  const posts = await postModel.find()
    .populate("user")
  res.render("feed", { user, posts })
});


// ---------Authe-Autho--------------------------
router.post('/register', function (req, res) {
  const { username, email, fullname, password } = req.body;
  const userdata = new userModel({ username, email, fullname, password });

  userModel.register(userdata, req.body.password)
    .then(function (registereduser) {
      passport.authenticate("local")(req, res, function () {
        res.redirect('/profile')
      })
})
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true
}), function (req, res) { });

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}
module.exports = router;
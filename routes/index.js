var express = require('express');
var router = express.Router();
var userModel = require('./users');
var postModel = require('./posts');
var passport = require('passport');
var localStrategy = require('passport-local');
var multer = require('multer');
var path = require('path');
passport.use(new localStrategy(userModel.authenticate()));
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads/')
  },  
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
})

const upload = multer({ storage: storage, fileFilter : fileFilter})

function fileFilter(req,file,cb)
{
  if(file.mimetype === 'image/png'|| file.mimetype === 'image/webp' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/svg')
  {
    cb(null,true);
  }
  else 
  {
    cb(new Error('I don\'t hava a clue!'), false);
  }
}
router.get('/', isLoggedOut,function(req, res) {
  res.render('index');
});

router.post('/register',function(req,res)
{
  var newUser = new userModel(
    {
      username : req.body.username,
      // image : req.body.profileimage
    }
  )

  userModel.register(newUser,req.body.password)
  .then(function(rs)
  {
    passport.authenticate('local')(req,res,function()
    {
      res.redirect('/profile');
    })
  })
  .catch(function(err)
  {
    if(err){
      res.send(err);
    }
  })
})
router.post('/upload',isLoggedIn,upload.single('avtar'),function(req,res)
{
  userModel.findOne({username : req.session.passport.user})
  .then(function(user)
  {
    user.image = req.file.filename;
    user.save()
    .then(function()
    {
      res.redirect('back');
    })
  })
})
router.post('/login',passport.authenticate('local',{
  successRedirect : "/profile",
  failureRedirect : '/'
}),function(req,res){});

router.get('/logout',function(req,res)
{
  if(req.isAuthenticated())
  {
    req.logout(function(err)
    {
      if(err) res.send(err);
      res.redirect('/');
    })
  }
  else 
  {
    res.redirect('/');
  }
})

function isLoggedIn(req,res,next)
{
  if(req.isAuthenticated())
  {
    return next();
  }
  else 
  {
    res.redirect('/');
  }
}


router.get('/username/:username',(req,res)=>
{
  userModel.findOne({username : req.params.username})
  .then((user)=>
  {
    if(user)
    {
      res.json({found :true});
    }
    else
    {
      res.json({found : false});
    }
  })
})
router.get('/find/username/:username',(req,res)=>
{
  var regex = new RegExp("^"+req.params.username);
  userModel.find({username : regex})
  .limit(4)
  .then((allusers)=>
  {
    res.json(allusers);
  })
})

router.get('/profile/:id',isLoggedIn,async function(req,res)
{
  var user = await userModel.findOne({_id :req.params.id});
  const dt = new Date();
  var min = dt.getMinutes();
  var hours = dt.getHours();
  var ampm = (hours>=12) ? "PM" : "AM";
  var time = dt.getDate() + "/" + dt.getMonth() + "/"+ dt.getFullYear() + " " + hours + ":" + min + ampm;
  // console.log(user);
  await user.populate({
    path : "posts",
    populate : {
      path : "userId"
    }
  });
  // res.send(user);
  res.render("profile",{user,loggedInUser : user.username,time});
})


router.post('/posts',isLoggedIn,(req,res)=>{
  userModel.findOne({username : req.session.passport.user})
  .then((user)=>{
    postModel.create(
      {
        postData : req.body.postData,
        userId : user._id,
      }
    )
    .then((createdPost)=>
    {
      user.posts.push(createdPost._id);
      user.save()
      .then((post)=>
      {
        res.redirect("/profile");
      })
    })
  })
})
router.get('/profile',isLoggedIn,async (req,res)=>{
  var loggedInUser = await userModel.findOne({username : req.session.passport.user});
  const dt = new Date();
  var min = dt.getMinutes();
  var hours = dt.getHours();
  var ampm = (hours>=12) ? "PM" : "AM";
  var time = dt.getDate() + "/" + dt.getMonth() + "/"+ dt.getFullYear() + " " + hours + ":" + min + ampm;
  await loggedInUser.populate({
    path : "posts",
    populate : {
      path : "userId"
    }
  });
  res.render("profile",{user : loggedInUser,loggedInUser : loggedInUser.username,time});
})

router.get("/feed",isLoggedIn,(req,res)=>{
  const dt = new Date();
  var min = dt.getMinutes();
  var hours = dt.getHours();
  var ampm = (hours>=12) ? "PM" : "AM";
  var time = dt.getDate() + "/" + dt.getMonth() + "/"+ dt.getFullYear() + " " + hours + ":" + min + ampm;
  userModel.findOne({username : req.session.passport.user})
  .populate({
    path : "posts",
    populate : {
      path : "userId"
    }
  })
  .then((u)=>{
    res.render("feed",{user : u,time});
  })
})
router.get("/like/:id",isLoggedIn,async (req,res)=>{
  var loggedInUser = await userModel.findOne({username: req.session.passport.user});
  var user = await userModel.findOne({_id : req.params.id});
  var idx = user.likes.indexOf(loggedInUser._id);
  if(idx===-1)
  {
    user.likes.push(loggedInUser._id);
    await user.save();
  }
  else
  {
    user.likes.splice(idx,1);
    await user.save();
  }
  res.redirect("back");
})

function isLoggedOut(req,res,next)
{
  if(req.isAuthenticated())
  {
    return res.redirect("/profile");
  }
  else
  {
    return next();
  }
}
module.exports = router;

var express = require('express');
var router = express.Router();
var userModel = require('./users');
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
router.get('/', function(req, res) {
  res.render('index');
});
router.get('/profile',isLoggedIn,function(req,res)
{
  userModel.findOne({username : req.session.passport.user})
  .then(function(user)
  {
    res.render('profile',{user});
  })
})
router.get('/feed',isLoggedIn,function(req,res)
{
  userModel.find()
  .then(function(allusers)
  {
    res.render('feed',{allusers});
  })
})
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
  .then((allusers)=>
  {
    res.json(allusers);
  })
})

router.get('/profile/:id',isLoggedIn,function(req,res)
{
  userModel.findOne({_id : req.params.id})
  .then(function(user)
  {
    res.render('profile',{user});
  })
})

module.exports = router;


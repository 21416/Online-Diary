const express = require('express');
const User = require('../models/Users')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const fetchuser=require('../middleware/fetchuser')

const JWT_SECRET="learning";

//Create a User using Post:"/api/auth/create"
router.post('/create', [
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'password must be atleast 5 letters').isLength({ min: 5 }),
], async (req, res) => {
  //check if user has enter detals correctly

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  //check for unique email
  try {
    
  
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).json({ error: "Sorry a user with this email already exist" });
  }

  //create user in db
  const salt = await bcrypt.genSaltSync(10);

  const secPass= await bcrypt.hash(req.body.password,salt);
  user = await User.create({
    name: req.body.name,
    password: secPass,
    email: req.body.email,
  })
  
  const data={
    user:{
      id:user.id
    }
  }
  const authtoken=jwt.sign(data,JWT_SECRET);

res.json({authtoken});
}catch (error) {
    console.error(error.message);
    res.status(500).send("Some error occured");
}

})

//Authenticate a user using post:/api/auth/login

router.post('/login', [
  body('email', 'Enter a email name').isEmail(),
  body('password', 'password cannot be blank').exists(),
], async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const {email,password}=req.body;
  
  try {
    let user= await User.findOne({email});
    if(!user){
      return res.status(400).json({error:"Try to login with correct credentials"})
    }
    let passwordcmp=await bcrypt.compare(password,user.password);
    if(!passwordcmp){
      return res.status(400).json({error:"Try to login with correct credentials"})
    }
    const data={
      user:{
        id:user.id
      }
    }
    const authtoken=jwt.sign(data,JWT_SECRET);
  
  res.json({authtoken});
  
} catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error occured");
  }
})


//get user details using post:/api/auth/getuser.login required
router.post('/getuser', fetchuser,async (req, res) => {
  try {
    const Userid=req.user.id;
    const user=await User.findById(Userid).select('-password');
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error occured");
  }
})


module.exports = router
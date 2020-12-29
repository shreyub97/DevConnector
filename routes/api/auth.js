const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')

const User = require('../../models/User')
const config = require('config');
const { check, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt =  require('bcryptjs');

// @route     GET api/auth
// @desc      Test route
// @access    Public 

router.get('/', auth, async(req,res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);

    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route     POST api/auth
// @desc      Authenticate user and get token
// @access    Public 

router.post('/', 
[
   
    check('email','Please include a valid email').isEmail(),
    check('password','Password is required').exists()
],
async(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()}) // bad request send that back, always add return if it is not the last res
    }

    const {email, password } = req.body;

    // async and await

    try{

    // See if user exists
    let user = await User.findOne({email});
    if(!user){
        return res
        .status(400)
        .json({errors: [{msg: 'Invalid Credentials'}]}); // to get the same type of error on the client
    }

    // take a plain-text password and the encrypted password and say whether it is a match or not
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        return res
        .status(400)
        .json({errors: [{msg: 'Invalid Credentials'}]});

    }

    

    // Return JWT
    const payload = {
        user: {
            id: user.id
        }
    }

    jwt.sign(
        payload,
        config.get('jwtToken'),
        { expiresIn: 360000}, 
        (err, token) => {
            if(err) throw err; 
            res.json({token});
        }
        );

    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }

   
    
});
module.exports = router; 
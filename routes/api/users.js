const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt =  require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult} = require('express-validator');


// User model 
const User = require('../../models/User');

// @route     POST api/users
// @desc      Register user
// @access    Public 

router.post('/', [
    check('name','Name is required')
    .not()
    .isEmpty(),
    check('email','Please include a valid email').isEmail(),
    check('password','Please enter a password with six or more characters').isLength({min:6})
],async(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()}) // bad request send that back, always add return if it is not the last res
    }

    const {name, email, password } = req.body;

    // async and await

    try{

    // See if user exists
    let user = await User.findOne({email});
    if(user){
        return res.status(400).json({errors: [{msg: 'User already exists'}]}); // to get the same type of error on the client
    }

    // Get usrs gravator based on their email 
    const avatar = gravatar.url(email, {
        s: '200', // size
        r: 'pg', // rating: you cannot have naked people or anything
        d: 'mm'
    })

    user = new User({
        name, 
        email,
        avatar,
        password
    });

    // Encrypt password using bcrypt
    const salt = await bcrypt.genSalt(10);

    user.password = await bcrypt.hash(password, salt); // creates a hash 
    await user.save();   // anything that returns a promise you must make sure you put an await in front of it

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
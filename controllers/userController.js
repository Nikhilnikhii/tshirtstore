const User1=require('../models/user');

const bigPromise=require("../middlewares/bigPromise");
const CustomError=require("../utils/customError");

const CookieToken=require('../utils/cookieToken');
const cookieToken = require('../utils/cookieToken');
const fileUpload=require('express-fileupload');
const cloudinary = require('cloudinary');
const mailHelper = require('../utils/emailHelper');
const crypto = require('crypto');
const user = require('../models/user');
exports.signup=bigPromise(async (req,res,next)=>{
    //sign up functuionality for user
    let result;
    if(req.files)
    {
        let file=req.files.photo;
        result=await cloudinary.v2.uploader.upload(file.tempFilePath,{
            folder:"users"
            ,width:150
            ,crop:"scale"
        })
    }


    const { name,email,password }=req.body;

    if(!email || !name || !password)
    {
        return next(new CustomError('please provide your email ,name and password',400));
    }

    const user =await User1.create({
        name,
        email,
        password
        ,

       
        photo:{
            
            id:result.public_id,
            secure_url:result.secure_url
          
        }
        

    })

    cookieToken(user,res);

    


});

exports.login=bigPromise(async (req,res,next)=>{

    const {email,password}=req.body;

    if(!email | !password)
    {
        return next(new CustomError('email and password are required to login',401));

    }
    const user=await User1.findOne({email}).select("+password");

    if(!user)
    {
        return next(new CustomError('you are not registered yet please register',401));
    }

    const isPasswordCorrect= await user.isValidPassword(password);
    // console.log(user.password);
    // console.log(password);
    // console.log(isPasswordCorrect);
    if(!isPasswordCorrect)
    {
        
        return next(new CustomError('password incorrect',401));

    }

    //here all details are correct now we generate a token
    const token = user.getJwtToken();

    //send the token via cookies using cookie utility

    cookieToken(user,res);



});

exports.logout=bigPromise(async (req,res,next)=>{

    res.cookie('token',null,{
        expires:new Date(Date.now()),
        httpOnly:true
    }).json({
        success:true
        ,message:"user logged out succesfully"
    })

});


exports.forgotPassword=bigPromise(async (req,res,next)=>{

    const {email}=req.body;

    const user=await User1.findOne({email})
    if(!user)
    {
        return next(new CustomError("no record found for the above email ",401));
    }

    const forgotToken=user.getForgotPasswordToken();

    await user.save();

    //url 
    const myUrl=`${req.protocol}://${req.get("host")}/password/reset/${forgotToken}`;

    const message=` hi here is the link to reset your password copy and paste it in browser \n\n ${myUrl}`;

    try{
        await mailHelper({
            toEmail:user.email,
            subject:"tshirt store password reset link"
            ,message

        })

        res.status(200).json({success:true,message:"password reset request succesfull kindly check ur email for more details"});

    }
    catch(error)
    {
        user.forgotPasswordToken=undefined;
        user.forgotPasswordExpiry=undefined;
        return next(new CustomError('email sending failed',500));
    }


});

exports.forgotPasswordReset=bigPromise(async (req,res,next)=>{
    const token=req.params.token;
    console.log(token);
    const {password,cPassword}=req.body;
    const encryptedToken=crypto.createHash('sha256').update(token).digest('hex');
    const user=await User1.findOne({forgotPasswordToken:encryptedToken,forgotPasswordExpiry:{$gt:Date.now()}});

    if(!user)
    {
        return next(new CustomError('invalid token',500));
    }

    if(password!=cPassword)
    {
        return next(new CustomError('both password and confirm password shoud be same',500));
    }
    if(encryptedToken!=user.forgotPasswordToken)
    {
        return next(new CustomError('token invalid',500));
    }
    user.password=password;
    user.forgotPasswordToken=undefined;
    user.forgotPasswordExpiry=undefined;
    await user.save();

    res.json({success:true,message:'password changed succesfully'});

    
})

exports.getLoggedInUserDetails=bigPromise(async (req,res,next)=>{
    const user=await User1.findById(req.user.id);

    res.status(200).json({
        success:true,user
    });
    next()

})

exports.updatePassword=bigPromise(async (req,res,next)=>{

    const {password,newPassword}=req.body;

    if(!password | !newPassword){
        return next(new CustomError('all fields are required',501));
    }

    const user=await User1.findById(req.user.id).select("+password");

    const isValidPassword=await user.isValidPassword(password);

    if(!isValidPassword)
    {
        return next(new CustomError('invalid password',401));
    }
    console.log(user);
    user.password=newPassword;
    await user.save();
    cookieToken(user,res);
    // res.status(200).json({
    //     success:true,
    //     message:"password updated succesfully"
    // });

});



const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs=require('bcryptjs');

const jwt=require('jsonwebtoken');
const crypto=require('crypto');
const { use } = require('../app');

const userSchema= new mongoose.Schema({
    name:{
        type:String
        ,required:[true,'Please provide your name']
        ,maxlength:[40,"name should be under 40 characters"]

    }
    ,email:{
        type:String
        ,required:[true,'Please provide an email']
        ,validate:[validator.isEmail,"please enter email in correct format"]
        ,unique:true
    }
    ,password:{
        type:String
        ,required:[true,'please enter a password']
        ,minlength:[6,'password should be atleast 6 char']
        ,select:false
    }
    ,role:{
        type:String
        ,default:"user"

    }
    ,photo:{
        id:{
            type:String
            
        }
        ,secure_url:{
            type:String
            
        }
    }
    ,forgotPasswordToken:String
    ,forgotPasswordExpiry:Date
    ,createdAt:{
        type:Date
        ,default:Date.now
    }
    
});
//encrypting password before saving - this is a hook
userSchema.pre('save',async function(next){
    if(!(this.isModified('password')))
    {
        return next();
    }

    this.password=await bcryptjs.hash(this.password,10);
})

//validating user password
userSchema.methods.isValidPassword= async function(userSendedPassword)
{
    return await bcryptjs.compare(userSendedPassword,this.password);
}
 
//generating a jwt token for user
userSchema.methods.getJwtToken = function()
{
    return jwt.sign({id:this._id},process.env.JWT_SECRET_KEY,{
        expiresIn:process.env.JWT_EXPIRY
    })
}


//generate forgot password token(string)
userSchema.methods.getForgotPasswordToken=function()
{
    //generate a long and random string
    const forgotToken=crypto.randomBytes(20).toString('hex');

    this.forgotPasswordToken=crypto.createHash('sha256').update(forgotToken).digest('hex');
    //forgot token in plain text is sended to user and hashing it and comparing with the fpwdtoken gives us true or false

    //time of token
    this.forgotPasswordExpiry=Date.now()+20*60*1000;

    return forgotToken;

}

module.exports=mongoose.model('User',userSchema);
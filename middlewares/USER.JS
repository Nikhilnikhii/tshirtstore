const user=require("../models/user");
const customError=require("../utils/customError");
const BigPromise=require("../middlewares/bigPromise");
const jwt=require('jsonwebtoken');
exports.isLoggedIn=BigPromise(async (req,res,next)=>{
    const token=req.cookies.token;
    console.log(token);

    if(!token)
    {
        return next(new customError('token not supplied',501));
    }
    const decoded=jwt.verify(token,process.env.JWT_SECRET_KEY);

    req.user=await user.findById(decoded.id);
    next();
    
});
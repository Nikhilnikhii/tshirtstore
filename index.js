require('dotenv').config();
const cloudinary = require('cloudinary');
const connectDb = require('./config/db');
connectDb();
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME
    ,api_key:process.env.CLOUDINARY_API_KEY
    ,api_secret:process.env.CLOUDINARY_API_SECRET

})
const app = require('./app');



const port=process.env.PORT;


app.listen(port,()=>{
    console.log(`server is running on port ${port}.......`);
})

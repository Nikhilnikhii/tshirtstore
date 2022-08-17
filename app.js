const express = require('express');
const morgan = require('morgan');
const cookieParser =require('cookie-parser');
const fileUpload=require('express-fileupload');

const app=express();

//swagger documntiation
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//cookies and file middlewares
app.use(cookieParser())
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp/"

    
}));

//morgan middleware
app.use(morgan('tiny'))

//imort all routes here


const hrouter=require("./routes/home");
const user=require("./routes/user");

app.use("/api/v1",hrouter);
app.use("/api/v1",user);


//export app

module.exports=app;
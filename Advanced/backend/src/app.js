import express, { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express()


/*This middleware sets up Cross-Origin Resource Sharing (CORS) for the Express.js application. It allows the application to handle 
requests from different origins (domains) and enables the passing of credentials (cookies, authorization headers, etc.) in 
cross-origin requests.
*/
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

/*
This middleware parses incoming requests with JSON payloads. It sets a limit of 16 kilobytes for the maximum size of the JSON payload, 
which helps protect the server from excessive memory usage caused by large requests.
*/
app.use(express.json({
    limit: '16kb'
}))

/*
This middleware parses incoming requests with URL-encoded payloads. The extended: true.  option allows for parsing of rich objects and 
arrays in the URL-encoded data. Similar to the JSON middleware, it also sets a limit of 16 kilobytes for the maximum size
of the URL-encoded payload.
*/
app.use(urlencoded({
    extended: true,
    limit: '16kb'
}))

/*
This middleware serves static files (e.g., HTML, CSS, JavaScript, images) from the public  directory of the application.
 It allows the server to respond to requests for static assets without the need for additional server-side processing.
*/
app.use(express.static('public'))

/*
This below middleware parses cookies attached to the client request object. It makes the cookies available in the 
req.cookies object, which can be used to access and manipulate cookie data in the application.
*/
app.use(cookieParser())

//routes import
import { userRouter } from './routes/user.routes.js';

//routes declaration
app.use('api/v1/users', userRouter)
export { app } 
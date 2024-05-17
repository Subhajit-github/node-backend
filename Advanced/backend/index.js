import dotenv from 'dotenv/config'
// import mongoose from 'mongoose';
// import { DB_NAME } from './constants';
import connectDB from './src/db/connectDatabase.js'
import { app } from './src/app.js'

// dotenv.config({
//     path: './config.env'
// })

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MongoDB Connection Failed !!!", err);
})
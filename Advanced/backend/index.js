import {} from 'dotenv/config'
// import mongoose from 'mongoose';
// import { DB_NAME } from './constants';
import connectDB from './src/db/connectDatabase.js'

// dotenv.config({
//     path: './config.env'
// })

connectDB()
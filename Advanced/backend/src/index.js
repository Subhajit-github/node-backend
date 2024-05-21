import dotenv from "dotenv"
import connectDB from './db/connectDatabase.js'
import { app } from './app.js'

dotenv.config({
    path: './.env'
})

console.log(process.env.MONGODB_URI);
connectDB()
.then(() => {
    app.on('error', (err) => {
        console.log("Error: ", err);
    })
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MongoDB Connection Failed !!!", err);
})
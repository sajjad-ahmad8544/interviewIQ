import express from "express"
import { googleAuth, logOut } from "../controllers/auth.controller.js"

const authRouter = express.Router()


authRouter.post("/google",googleAuth)
authRouter.get("/logout",logOut)
authRouter.post("/logout",logOut)


export default authRouter
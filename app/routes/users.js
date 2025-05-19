import express from "express"
import {pool} from '../db.js'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid';
import {authenticateSession} from '../session.js'
import {checkAuthenticated, checkNotAuthenticated} from '../auth.js'

const UserRouter = express.Router()

UserRouter.get('/register',checkNotAuthenticated('/santa'), (req, res) => {
    return res.render('register',{formErrors: {},hideSidebar: true })
})

UserRouter.post('/register',checkNotAuthenticated('/santa'),async (req, res) => {
    let formErrors = {}
    if(req.body.password.length < process.env.minPasswordLength){
        formErrors.password = `Password must be at least ${process.env.minPasswordLength} characters long`;
    }
    if(req.body.username.trim().length < process.env.minUsernameLength){
        formErrors.username = `Username must be at least ${process.env.minUsernameLength} characters long`;
    }
    if(req.body.repeat_password != req.body.password){
        formErrors.repeatPassword = 'Password must be equal'
    }

    const respUser = await pool.query('select id from users where username = $1',[req.body.username.trim()])
    if(respUser.rowCount > 0){
        formErrors.username = 'User with this username already exists.'
    }

    if(Object.keys(formErrors).length > 0) {
        return res.render('register',{formErrors: formErrors, hideSidebar: true  })
    }

    // form is validate here
    let resp
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const userId = uuidv4()
    try{
        resp = pool.query(`
            insert into users (id,username,password) 
            values ($1,$2,$3)
            `,[userId,req.body.username.trim(),hashedPassword])
    }catch(e){
        console.error(e)
        return res.redirect('/user/register')
    }

    return res.redirect('/user/login')
})

UserRouter.get('/login',checkNotAuthenticated('/santa'), (req, res) => {
    return res.render('login', {formErrors: {},hideSidebar: true })
})

UserRouter.post('/login',checkNotAuthenticated('/santa'), async (req, res) => {
    let formErrors = {}
    const username = req.body.username.trim()
    
    let resp 
    try{
        resp = await pool.query(`
            select id,password
            from users
            where username = $1
            `,[username])
    }catch(e){
        console.error(e)
        return res.redirect('user/login')
    }
    const generalErrorMsg = `
    User with this username does not exits or the password is incorrect
    `

    if(resp.rowCount === 0){
        formErrors.generalError = generalErrorMsg
        return res.render('login', {formErrors: formErrors, hideSidebar: true })
    }

    const existingUser = resp.rows[0]
    const compare = await bcrypt.compare(req.body.password, existingUser.password)
    if(!compare){
        formErrors.generalError = generalErrorMsg
        return res.render('login', {formErrors: formErrors, hideSidebar: true })
    }

    const updateResp = await authenticateSession.call(req, existingUser.id)
    if(updateResp.rowCount === 0){
        console.error('session not found for session authentication')
        return res.redirect('/user/login')
    }
    return res.redirect('/santa')

})

UserRouter.get('/logout',checkAuthenticated(), async (req, res) => {
    try{
        await pool.query(`
            update sessions
            set valid_to = now() - interval '5 second'
            where id = $1 and user_id = $2
            `,[req.session.id, req.session.user_id])
    }catch(e){
        console.error(e)
        res.redirect('/santa')
    }
    res.redirect('/user/login')
})

export {UserRouter}
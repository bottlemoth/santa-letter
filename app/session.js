import {pool} from './db.js'
import { v4 as uuidv4 } from 'uuid';

async function createSession(sessionId,validTo){
    let resp
    try{
        resp = await pool.query('insert into sessions (id,valid_to) values ($1, $2)',[sessionId,  validTo])

    }catch(e){
        console.error(e)
    }
    return resp
}

async function getsession(sessionId){
    let session
    try{
        session = await pool.query(`
            select id, valid_to, user_id 
            from sessions 
            where 
                id = $1 
                and valid_to >= now()
            `, [sessionId])
    }catch(e){
        console.error(e)
        return undefined
    }
    if(session.rowCount===1)return session.rows[0]
    return undefined
}

async function issueSessionId() {
    const sessionId = uuidv4()
    let currentTime = new Date()
    const cookieage = process.env.COOKIE_AGE_IN_SECONDS || 600
    currentTime.setSeconds(currentTime.getSeconds()+process.env.COOKIE_AGE_IN_SECONDS)

    try{
        await createSession(sessionId, currentTime)
    }catch(e){
        console.error(e)
    }
    this.cookie('sessionId',sessionId, {
        maxAge:  1000* cookieage,
        httpOnly: true,
        signed: true
    })
    return{
        id: sessionId,
        valid_to: currentTime
    }
}

function session() {
    return async(req,res,next) => {
        req.session ={}
        const session = await getsession(req.signedCookies['sessionId'])

        if(session === undefined || req.signedCookies['sessionId'] === undefined){
            try{
                const newSession = await issueSessionId.call(res)
                req.session = newSession
            }catch(e){
                console.error(e)
            }
            return next()
            
        }
        req.session = session
        return next()
    }
    
}

async function authenticateSession(userId){
    if(!this.session) return console.error('Session is required for session authentication')
    
    let resp
    try {
        resp = await pool.query(`
            update sessions
            set user_id=$1
            where id = $2`,[userId,this.session.id])
    }catch(e){
        console.error(e)
    }
    this.session.user_id = userId
    return resp
}

export {createSession, getsession, issueSessionId, session, authenticateSession}
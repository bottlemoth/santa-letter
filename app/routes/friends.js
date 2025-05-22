import express from 'express'
import {pool} from '../db.js'
import { v4 as uuidv4 } from 'uuid';
import {checkAuthenticated} from '../auth.js'

const friendRouter = express.Router()

friendRouter.get('/',checkAuthenticated(),  async (req,res)=>{
    let users = { rows: [] }
    let friends = { rows: [] }
    
    try {

        users = await pool.query(`
            SELECT username
            FROM users
            WHERE username ILIKE '%' || $1 || '%'
            AND id != $2
            `, [req.query.username, req.session.user_id])
        friends = await pool.query(`
            SELECT id, friend_id
            FROM friends
            WHERE user_id = $1
            `,[req.session.user_id])
            
    }catch(e){
        console.log(e)
    }
    return res.render('friends', { users: users.rows , friends: friends.rows });
});

friendRouter.get('/:username',checkAuthenticated(),async (req,res)=>{
    let resp
    const username = req.params.username;
    
    if (!username) return res.render('profile',{presents: []} )
    try {
        resp = await pool.query(`
            SELECT presents.id,  presents.Link, presents.opis, presents.approved
            FROM presents
            INNER JOIN users ON presents.user_id = users.id
            WHERE username =$1
            `,[username])
            const presents = resp.rows
    }catch(e){
        console.log(e)
    }
    return res.render('profile',{presents : resp.rows, username : username} )
});

friendRouter.post('/',checkAuthenticated(), async (req,res)=>{
    const friendId = req.body.friends 
    try {
        await pool.query(`
            INSERT INTO friends (id, user_id, friend_id)
            VALUES ($1, $2, $3)
        `, [uuidv4(), req.session.user_id, friendId])

    } catch (e) {
        console.error('Error in POST /friends:', e)
    }

    return res.redirect('/friends')
});

friendRouter.delete('/:id',checkAuthenticated(), async (req,res) => {
    let resp 
    try{
      resp = await pool.query(`
        DELETE from friends 
        WHERE id = $1 AND user_id = $2
        `,[req.params.id,req.session.user_id]) 
    }catch (e){
      console.log(e)
    }
    return res.redirect('/friends')
});

friendRouter.put('/:username/:presentId',checkAuthenticated(), async (req,res) =>{
    const {username, presentId} = req.params
    try {
        await pool.query(`
            INSERT INTO taken(id, user_id, present_id)
            VALUES($1,$2,$3)
            `,[uuidv4(), req.session.user_id,presentId])

        await pool.query(`
            UPDATE presents
            SET approved = true
            FROM users
            WHERE presents.user_id = users.id
            AND users.username = $1
            AND presents.id = $2
            `,[username, presentId])
    }catch(e){
        console.log(e)
    }
    return res.redirect(`/friends/${username}`)
})
  

export {friendRouter}
import express from 'express'
import {pool} from '../db.js'
import {checkAuthenticated} from '../auth.js'

const validRouter = express.Router()

validRouter.get('/',checkAuthenticated(),async (req,res) => {
    let pres
    const username = req.session.user_id
    try {
        pres = await pool.query(`
            SELECT presents.id, presents.Link, presents.opis
            FROM presents
            INNER JOIN taken ON taken.present_id = presents.id
            WHERE presents.approved = true
            AND taken.user_id = $1
            `,[username])
    } catch (error) {
        console.log(error)
    }
    res.render('valid',{presents : pres.rows})
})
  

export {validRouter}
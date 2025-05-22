import express from 'express'
import {pool} from '../db.js'
import {checkAuthenticated} from '../auth.js'

const MyPresentsRouter = express.Router()

MyPresentsRouter.get('/',checkAuthenticated(), async (req, res) => {
    let resp
    try {
      resp = await pool.query(`
          SELECT id,Link,opis 
          FROM presents
          WHERE user_id = $1
        `,[req.session.user_id])
        } catch (e) {
      console.log(e)
    }
    
    return res.render('present',{presents : resp.rows} )
  });


export {MyPresentsRouter}
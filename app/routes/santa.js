import express from 'express'
import {pool} from '../db.js'
import { v4 as uuidv4 } from 'uuid';
import {checkAuthenticated} from '../auth.js'

const router = express.Router()

router.get('/',checkAuthenticated(), async (req, res) => {
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
    
    return res.render('index',{presents : resp.rows} )
  });

router.post('/',checkAuthenticated(), async (req,res)=>{
  
  let response
  try{
    const opis = req.body.opis || "prezent"
    response = await pool.query(`
      insert into presents (id,user_id,link,opis)
      values ($1,$2,$3,$4)
      `,[uuidv4(),req.session.user_id ,req.body.link, opis])
  }catch (e) {
    console.log(e)
  }
  return res.redirect('/santa')
});

router.delete('/:presentsid',checkAuthenticated(),async (req,res)=>{
  let resp 
  try{
        await pool.query(`
      DELETE FROM taken
      WHERE present_id = $1
      `,[req.params.presentsid])
    resp = await pool.query(`
      DELETE FROM presents 
      WHERE id = $1 and user_id = $2
      `,[req.params.presentsid, req.session.user_id])
  }catch (e){
    console.log(e)
  }
  return res.redirect('/santa')
})


export {router}
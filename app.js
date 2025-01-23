
import 'dotenv/config';
import pg from 'pg';
import express from "express";
const app = express();
const port = process.env.PORT || 3000;
app.set('view engine', 'ejs');
const { Pool } = pg;


const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: 'localhost',
    database: 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
    idleTimeoutMillis: 300
});

await pool.connect();

const result = await pool.query('select now()').then(
  res => console.log('Connected to the db'+res.rows[0].now)
);



app.get('/',async (req, res) => {
    let resp
    try {
      const resp = await pool.query('select id,Link,opis from presents')
        } catch (error) {
      console.log(e)
    }
    
    return res.render('index' , { presents: resp })
  });



  app.listen(port,()=>{
    console.log(`Example app listening on port ${port}`)
})


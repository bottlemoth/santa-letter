
import 'dotenv/config';
import express from "express";
import methodOverride from 'method-override'
import path from 'path';
import { fileURLToPath } from 'url';
import {session} from './session.js'
import cookieParser from 'cookie-parser'
import expressLayouts from 'express-ejs-layouts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;


app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'/views'))
app.use(express.static(path.join(__dirname + '/public')))
app.use(expressLayouts)
app.set('layout', './layouts/layout')
app.use((req, res, next) => {
  res.locals.hideSidebar = false;
  next();
});

app.use(methodOverride('_method'))
app.use(express.urlencoded({extended : false}))
app.use(cookieParser(process.env.SECRET))
app.use(session())

import {UserRouter} from './routes/users.js'
app.use('/user', UserRouter)
import {friendRouter} from './routes/friends.js'
app.use('/friends',friendRouter)
import {router} from './routes/santa.js'
app.use('/santa',router)
import {validRouter} from './routes/presents.js'
app.use('/valid',validRouter)

  app.listen(port,()=>{
    console.log(`Example app listening on port ${port}`)
    
})

export {app}
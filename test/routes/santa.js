import { use, expect, } from 'chai'
import chaiHttp from 'chai-http'

import {app} from '../../app/app.js' 
import {pool} from '../../app/db.js' 

const chai = use(chaiHttp)

const TESTING_SANTA_LETTER = {
    todo: 'testing santa-letter link'
}

describe('Testing app', () =>{
    before(async () => {
        await pool.query('delete from presents where Link = $1',[TESTING_SANTA_LETTER.presents])
        
    })


    describe('Testing GET endpoint', () => {
        it('HTML with correct response status', () => {
            chai.request.execute(app)
            .get('/santa')
            .end((_err,res)=>{
                expect(res).to.have.status(200)
                
            })
        })
    })
    describe('Test POST endpoint', () =>{
        it('Correct rediraction on santa creation', (done) => {
            chai.request.execute(app)
            .post('/santa')
            .type('form')
            .send(TESTING_SANTA_LETTER)
            .redirects(0)
            .end((_err,res) => {
                expect(res.redirect).to.equal(true)
                done()
            })
        })
    })

    describe('testing santa modification',()=>{

        let testingSantaID
        before(async () => {
            const resp = await pool.query('select id from presents where Link = $1',[TESTING_SANTA_LETTER.presents])
            testingSantaID = resp.rows[0]
        })

 
        describe('Test Delete endpoint', () =>{
            it('Correct rediraction on presents update', (done) => {
                chai.request.execute(app)
                .post('/santa/${testingSantaID}')
                .query({_method: 'DELETE'})
                .redirects(0)
                .end((_err,res) => {
                    expect(res.redirect).to.equal(true)
                    done()
                })
            })
            it('present was deleted', async () => {
                const resp = await pool.query(`select id from presents where link = $1`, [TESTING_SANTA_LETTER.presents])
                const status = resp.rows.length
                expect(status).to.equal(0)
            })
        })
    })
})
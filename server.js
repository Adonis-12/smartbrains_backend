const express = require('express');
const app = express();
const cors  = require('cors');
const knex = require('knex')
const bcrypt = require('bcryptjs')

const db =knex({
    client: 'pg',
  connection: {
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: 'toxication',
    database: 'smart_brain',
}
})
app.use(express.json())
app.use(cors())

app.get('/',(req,res)=> {
    res.json(database);
})
app.post('/signin',(req,res) => {
   const {email,password} = req.body;
   db.select('email','hash').from('login')
   .where('email','=',email)
   .then(user => {
    if(user.length<1){
        res.status(400).json("wrong credentials")
    }else{
       const isValid = bcrypt.compareSync(password, user[0].hash);
    console.log(user[0],isValid)
    if(isValid){
        db.select('*').from('users')
        .where('email','=', email)
        .then(user => 
            res.json(user[0])
        )
        .catch(err => res.json(err,"unable to sign in"))
        }else{
        res.json('unable to fetch user')
    }
    }
        })
        .catch(err => res.status(400).json(err,'error getting user'))
})

app.post('/register',(req,res) => {
    const {name,email,password} = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password,salt);
    db.transaction(trx => {
        trx.insert({
            hash:hash,
            email:email
        })
        .into('login')
        .returning('email')
        .then(loginEmail => {
            console.log(loginEmail)
           return trx('users')
                .returning('*')
                .insert({
                    email:loginEmail[0].email,
                    name:name,
                    joined:new Date()
                })
                .then(user =>  console.log(user))
                .catch(err => console.log(err,"eroor getting user"))
        })
        .then(trx.commit)
        .catch(trx.rollback)
    })
    
    
})

app.get('/profile/:id',(req,res) => {
    let found = false
    database.users.forEach((user) => {
        if(user.id === req.params.id){
            found=true
            return res.json(user)
        }
    })
    if(!found){
        res.status(404).json("user not found")
    }
})

app.put('/image',(req,res) => {
    const {id} =req.id;
    let found = false
 database.users.forEach((user => {
    if(user.id === id){
        found = true
      return  user.score ++
    }
 }))
 if(!found){
    res.status(404).json("user not found!");
 }
})
app.put('/profile')

app.listen(3000,()=>{
    console.log("sever is started");
})
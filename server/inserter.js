const express =require('express');
const bodyParser= require('body-parser');
const mysql= require('mysql');
const app = express();

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "admin",
    database:"timetablegenerator"
  });
  
  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });

app.use(bodyParser.urlencoded({extended: false}))
app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/form.html');
})

app.post('/subject',(req,res)=>{
    const s= req.body;
    // const code=req.body.code;
    // const faculty=req.body.faculty;
    // const credits=req.body.credits;
    // const hasLab=req.body.hasLab;
    // const hasJ= req.body.hasJ;
    // const slots=req.body.slots;
    console.log(s);
    con.query(`insert into subjects values('${s.code}',${s.credits},'${s.slots}','${s.faculty}',${s.hasLab},${s.hasJ});`, (err, result)=>{
        if(err) throw err;
        res.redirect('/');
    });
})

app.post('/labs',(req,res)=>{
    const s= req.body;
    // const code=req.body.code;
    // const faculty=req.body.faculty;
    // const credits=req.body.credits;
    // const hasLab=req.body.hasLab;
    // const hasJ= req.body.hasJ;
    // const slots=req.body.slots;
    console.log(s);
    con.query(`insert into labs values('${s.faculty}','${s.slots}','${s.code}',${s.credits});`, (err, result)=>{
        if(err) throw err;
        res.redirect('/');
    });
})




app.listen(3000,()=>{
    console.log("Server listening at port 3000!");
})
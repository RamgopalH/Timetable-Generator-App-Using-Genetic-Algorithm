const express = require('express');
const {spawn} = require('child_process');
const cors= require('cors');
const mysql = require('mysql');
const app = express();
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();
app.use(cors());
app.use(express.json());

var con = mysql.createConnection({
    host: "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database:"timetablegenerator"
});

const clean = (strings)=> {
    for(var s of strings) {
        s = s.replace(' ', '-');
    }
    return strings;
}
  
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});


app.get('/', (req, res)=> {
    var dataToSend;
    const python = spawn('python', ['timetable.py', 'Morning', '23', '92iijs7yta,a0s0a8ssbsd,nahs75a5sg', 'a0s0a8ssbsd,nahs75a5sg,16hbajsabsd']);
    python.stdout.on('data', (data)=> {
        console.log("Pipe data from python script...");
        dataToSend = JSON.parse(data);
        console.log(dataToSend);
    });

    python.on('close', (code)=> {
        console.log(`Chld Process closed all stdio with code ${code}`);
        res.send({data:dataToSend});
    })
})

app.post('/',(req,res)=>{
        var dataToSend;
        console.log(req.body.subjects);
        console.log(req.body.faculty);
        console.log(req.body.time);
        console.log(req.body.credits);
        const string = ['timetable.py', `${req.body.time}`, `${req.body.credits}`, clean(req.body.faculty).join(','), clean(req.body.subjects).join(',')].join(' ');
        console.log(string)
    const python = spawn('python', ['timetable.py', `${req.body.time}`, `${req.body.credits}`, req.body.faculty.join(','), req.body.subjects.join(',')]);
    python.stdout.on('data', (data)=> {
        console.log("Pipe data from python script...");
        dataToSend = JSON.parse(data);
        console.log(dataToSend);
    });

    python.on('close', (code)=> {
        console.log(`Child Process closed all stdio with code ${code}`);
        res.send(dataToSend);
    })
});

app.post('/fac', (req, res)=> {
    console.log(req.body);
    const codes = req.body.codes.join(',');
    con.query(`call distinctFac('${codes}')`, (err, result, fields)=> {
        // console.log(result[0]);
        res.send({faculty:result[0]});
    });

});

app.get('/start', (req, res)=> {
    con.query("select code as id, concat(code,' - ',name) as name from (select code, name from subjects union select code, name from labs) sub;", (err, result,fields)=> {
        console.log(result);
        res.send(result)
    })
});

app.listen(process.env.SERVER_PORT, ()=> {
    console.log("Server listening on port 3000");
});
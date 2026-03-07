const fs = require('fs');
const express = require('express');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');


// ✅ Helper function to safely read JSON
function readData(filePath){
    if(!fs.existsSync(filePath)){
        fs.writeFileSync(filePath,'[]');
    }
    return JSON.parse(fs.readFileSync(filePath));
}

// ✅ Helper function to safely write JSON
function writeData(filePath,data){
    fs.writeFileSync(filePath, JSON.stringify(data,null,2));
}


// ================= HOME =================
app.get('/', (req,res)=>{

    try{

        if(!fs.existsSync('./data/events.json')){
            fs.writeFileSync('./data/events.json','[]');
        }

        let events = JSON.parse(
            fs.readFileSync('./data/events.json')
        );

        res.render('home',{events});

    }catch(err){
        console.log("Home Load Error:", err);
        res.send("Events file corrupted ⚠");
    }

});


// ================= AUTH =================
app.get('/signup', (req,res)=>{
    res.render('signup');
});

app.get('/login', (req,res)=>{
    res.render('login');
});

app.post('/signup', (req,res)=>{
    let users = readData('./data/users.json');

    users.push(req.body);

    writeData('./data/users.json', users);

    res.send("Signup Successful 🎉");
});

app.post('/login', (req,res)=>{
    let users = readData('./data/users.json');

    let user = users.find(u =>
        u.email == req.body.email &&
        u.password == req.body.password
    );

    if(user){
        let events = readData('./data/events.json');

        res.render('home',{
            username:user.name,
            events
        });
    } else {
        res.send("Invalid Credentials ❌");
    }
});


// ================= PAGES =================
app.get('/about', (req,res)=>{
    res.render('about');
});

app.get('/contact', (req,res)=>{
    res.render('contact');
});


// ================= CONTACT =================
app.post('/contact',(req,res)=>{
    let msgs = readData('./data/messages.json');

    msgs.push(req.body);

    writeData('./data/messages.json', msgs);

    res.send("Message Saved ✅");
});


// ================= ADMIN =================
app.get('/admin',(req,res)=>{
    let msgs = readData('./data/messages.json');
    res.render('admin',{messages:msgs});
});


// ================= EVENT REGISTRATION =================
app.post('/register-event', (req,res)=>{
    let regs = readData('./data/registrations.json');

    regs.push({
        event: req.body.eventName,
        time: new Date()
    });

    writeData('./data/registrations.json', regs);

    res.send("Registered Successfully 🎉");
});

app.get('/registrations',(req,res)=>{
    let regs = readData('./data/registrations.json');
    res.render('registrations',{regs});
});


// ================= ADD EVENT =================
app.get('/add-event', (req,res)=>{
    res.render('addEvent');   // make sure file name is addEvent.ejs
});

app.post('/add-event', (req,res)=>{
    let events = readData('./data/events.json');

    let newEvent = {
        title: req.body.title,
        date: req.body.date,
        venue: req.body.venue
    };

    events.push(newEvent);

    writeData('./data/events.json', events);

    res.redirect('/');   // ✅ FIXED
});


// ================= SERVER =================
const http = require('http');

const server = http.createServer(app);

server.listen(3000, () => {
    console.log("Server running on port 3000 🚀");
});
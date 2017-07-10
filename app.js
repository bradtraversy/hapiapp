const Hapi = require('hapi');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/hapidb', { useMongoClient: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error(err));

// Create Task Model
const Task = mongoose.model('Task', {text:String});

// Init Server
const server = new Hapi.Server();

// Add Connection
server.connection({
    port: 8000,
    host:'localhost'
});

// Home Route
server.route({
    method:'GET',
    path:'/',
    handler: (request, reply) => {
        //reply('<h1>Hello World</h1>');
        reply.view('index',{
            name:'John Doe'
        });
    }
});

// Dynamic Route
server.route({
    method:'GET',
    path:'/user/{name}',
    handler: (request, reply) => {
        reply('Hello, '+request.params.name);
    }
});

// GET Tasks Route
server.route({
    method:'GET',
    path:'/tasks',
    handler: (request, reply) => {
        let tasks = Task.find((err, tasks) => {
            //console.log(tasks);
            reply.view('tasks', {
                tasks:tasks
            });
        });
        /*
        reply.view('tasks',{
            tasks:[
                {text:'Task One'},
                {text:'Task Two'},
                {text:'Task Three'}
            ]
        });
        */
    }
});

// POST Tasks Route
server.route({
    method:'POST',
    path:'/tasks',
    handler: (request, reply) => {
        let text = request.payload.text;
        let newTask= new Task({text:text});
        newTask.save((err, task) => {
            if(err) return console.log(err);
            return reply.redirect().location('tasks');
        });
    }
});


// Static Routes
server.register(require('inert'), (err) => {
    if(err){
        throw err;
    }

    server.route({
        method:'GET',
        path:'/about',
        handler: (request, reply) => {
            reply.file('./public/about.html');
        }
    });

    server.route({
        method:'GET',
        path:'/image',
        handler: (request, reply) => {
            reply.file('./public/hapi.png');
        }
    });
});

// Vision Templates
server.register(require('vision'), (err) => {
    if(err){
        throw err;
    }

    server.views({
        engines: {
            html:require('handlebars')
        },
        path: __dirname + '/views'
    });
});


// Start Server
server.start((err) => {
    if(err){
        throw err;
    }

    console.log(`Server started at: ${server.info.uri}`);
});
const Hapi = require('hapi')
const mongoose = require('mongoose')
mongoose
  .connect('mongodb://localhost/hapidb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('mongo db connected'))
  .catch(err => console.log(err))

//create task model
const Task = mongoose.model('Task', { text: String })

const init = async () => {
  //Init server
  const server = new Hapi.server({
    port: 8000,
    host: 'localhost'
  })

  await server.register(require('inert'))
  await server.register(require('vision'))

  server.route({
    method: 'GET',
    path: '/',
    handler: (req, h) => h.view('index', { name: 'Damianek' })
  })

  //Get task route
  server.route({
    method: 'GET',
    path: '/tasks',
    handler: async (req, h) => {
      let tasks = await Task.find((err, tasks) => {
        console.log(tasks)
      })
      return h.view('tasks', {
        tasks: tasks
      })
    }

    //   h.view('tasks', {
    //     tasks: [
    //       { text: 'task one' },
    //       { text: 'task two' },
    //       { text: 'task three' }
    //     ]
    //   })
  })

  //Post task route
  server.route({
    method: 'POST',
    path: '/tasks',
    handler: async (req, h) => {
      let text = req.payload.text
      let newTask = new Task({ text: text })
      await newTask.save((err, task) => {
        if (err) return console.log(err)
      })

      return h.redirect().location('tasks')
    }
  })

  server.route({
    method: 'GET',
    path: '/user/{name}',
    handler: (req, h) => {
      return `Hello world, ${req.params.name}`
    }
  })

  server.route({
    method: 'GET',
    path: '/about',
    handler: (req, h) => {
      return h.file('./public/about.html')
    }
  })

  server.route({
    method: 'GET',
    path: '/image',
    handler: (req, h) => {
      return h.file('./public/hapijs.jpeg')
    }
  })

  server.views({
    engines: {
      html: require('handlebars')
    },
    relativeTo: __dirname,
    path: 'views'
  })

  await server.start()

  console.log(`Server is running on ${server.info.uri}`)
}

init().catch(err => console.log(err))

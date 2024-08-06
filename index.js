require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')
const app = express()

app.use(express.json())
app.use(express.static('dist'))
app.use(cors())

morgan.token('post-data', function (req) {
    return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'))

let persons = []

const generateId = () => Math.floor(Math.random() * 1000).toString();

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
  })

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        response.json(person)
    })
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    //console.log("Person to be added: ", body)

    if (!body.name) {
        return response.status(400).json({
            error: "Person's name missing"
        })
    } else if (!body.phonenumber) {
        return response.status(400).json({
            error: "Person's phonenumber missing"
        })
    } else if (persons.find(person => person.name === body.name)) {
        return response.status(400).json({
            error: "Name must be unique"
        })
    }
    const person = new Person({
        name: body.name,
        phonenumber: body.phonenumber
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => console.log(error))
})

app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>`)
})

const PORT = process.env.PORT
    app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
const express = require('express')
const app = express()

app.use(express.json())

let persons = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "phonenumber": "040-123456"
    },
    {
        "id": "2",
        "name": "Ada Lovelace",
        "phonenumber": "39-44-5323523"
    },
    {
        "id": "3",
        "name": "Dan Abramov",
        "phonenumber": "12-43-234345"
    },
    {
        "id": "4",
        "name": "Mary Poppendieck",
        "phonenumber": "39-23-6423122"
    }
]

const generateId = () => Math.floor(Math.random() * 1000).toString();

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
  })

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    console.log("Person to be added: ", body)

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
    const person = {
        id: generateId(),
        name: body.name,
        phonenumber: body.phonenumber
    }

    persons = persons.concat(person)
    response.json(person)
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

app.get('/info', (request, response) => {
    response.send(`<p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>`)
})

const PORT = 3001
    app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
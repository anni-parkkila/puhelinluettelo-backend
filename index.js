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

app.get('/api/persons', async (request, response) => {
  await Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', async (request, response, next) => {
  await Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', async (request, response, next) => {
  const { name, phonenumber } = request.body

  if (!name) {
    return response.status(400).json({
      error: 'Person\'s name missing'
    })
  } else if (!phonenumber) {
    return response.status(400).json({
      error: 'Person\'s phonenumber missing'
    })
  } else if (await Person.exists({ name })) {
    return response.status(400).json({
      error: 'Name must be unique'
    })
  }

  new Person({ name, phonenumber })
    .save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', async (request, response, next) => {
  const { name, phonenumber } = request.body

  await Person.findByIdAndUpdate(
    request.params.id,
    { name, phonenumber },
    { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.get('/info', async (request, response, next) => {
  await Person.countDocuments({})
    .then(numberOfPersons => {
      response.send(
        `<p>Phonebook has info for ${numberOfPersons} people</p>
        <p>${new Date()}</p>`
    )})
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
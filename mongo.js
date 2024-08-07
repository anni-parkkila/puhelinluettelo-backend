const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Required to give password as argument')
  process.exit(1)
} else if (process.argv.length === 4) {
  console.log('Required to give password, person name and phonenumber as arguments to add a person to db')
  process.exit(1)
} else if (process.argv.length > 5) {
  console.log('Too many parameters! Only password, person name and phonenumber allowed.')
  console.log('Use quotation marks to add a two-part name or a number with spaces.')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://parkkilaanni:${password}@cluster0.ar8adej.mongodb.net/telefooniApp?retryWrites=true&w=majority&appName=TelefooniApp`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  phonenumber: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  Person.find({}).then(result => {
    console.log('Phonebook:')
    result.forEach(person => {
      console.log(person.name, person.phonenumber)
    })
    mongoose.connection.close()
  })
} else if (process.argv.length === 5) {
  const person = new Person({
    name: process.argv[3],
    phonenumber: process.argv[4]
  })

  person.save().then(() => {
    console.log('Added', person.name, 'number', person.phonenumber, 'to phonebook')
    mongoose.connection.close()
  })
} else {
  console.log('Wrong number of parameters, closing connection')
  mongoose.connection.close()
}

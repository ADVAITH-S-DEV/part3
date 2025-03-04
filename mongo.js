const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}


const password = process.argv[2]

const url =
  `mongodb+srv://advaithdevdas007:${password}@cluster0.dosqb.mongodb.net/phonebook?retryWrites=true&w=majority&appName=phonebook`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if(process.argv.length > 3){
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
  })

  person.save().then((person) => {
    console.log('added ' + person.name + ' ' + person.number + ' to phonebook')
    mongoose.connection.close()
  })

}else{
  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(person)
    })
    mongoose.connection.close()
  })
}


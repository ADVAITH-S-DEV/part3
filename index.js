const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const dotenv = require('dotenv')
const app = express()
app.use(express.static('dist'))
app.use(express.json())

app.use(cors())
const Person = require('./models/person')

dotenv.config({
  path: './.env'

})
morgan.token('body',(req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ' '
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


app.get('/api/persons',(request,response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

app.get('/info',async (req, res) => {
  const now = new Date()
  const formattedDate = now.toString() 
  const personsLength= await Person.countDocuments({})
    .then(count => {
      console.log('Total Persons:', count)
      return count
    })
    .catch(error => {
      console.error('Error counting documents:', error)
    })

  res.send(`<p>
            Phonebook has info for ${personsLength} people <br />
            ${formattedDate}
        </p>`)
})

app.get('/api/persons/:id',(request,response,next) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  }).catch(error => {
    next(error)
  })
})

app.delete('/api/persons/:id',(req,res,next) => {
  const id = req.params.id
  Person.findByIdAndDelete(id).then((person) => {
    if(!person){
      return res.status(404).json({ error: `person with ${id} not found` })
    }
    console.log(`Person with id ${id} deleted`)
    res.status(204).end()
  }).catch(error => {
    next(error)
  })
})

app.post('/api/persons', (req, res, next) => {
  const { name, number } = req.body

  if (!name) {
    return res.status(400).json({ error: 'Name is missing' })
  }
  if (!number) {
    return res.status(400).json({ error: 'Number is missing' })
  }

  Person.findOne({ name })
    .then(existingPerson => {
      if (existingPerson) {
        return res.status(409).json({ error: 'Person already exists' })
      }
      const person = new Person({ name, number })
      return person.save()
    })
    .then(savedPerson => {
      if (savedPerson) {
        res.status(201).json(savedPerson)
      }
    })
    .catch(error => {
      next(error)
    })
})




app.put('/api/persons/:id', (req, res, next) => {
  const id = req.params.id
  const { name, number } = req.body

  if (!name || !number) {
    return res.status(400).json({ error: 'Name and number are required' })
  }

  Person.findByIdAndUpdate(
    id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      if (!updatedPerson) {
        return res.status(404).json({ error: 'Person not found' })
      }
      res.status(200).json(updatedPerson)
    })
    .catch(error => {
      next(error)
    })
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT,() => {
  console.log(`App running on port ${PORT}`)
})
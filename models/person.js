const mongoose = require('mongoose')
const dotenv = require('dotenv')
mongoose.set('strictQuery', false)
dotenv.config({
  path: './.env'

})

const url = process.env.MONGODB_URI


console.log('connecting to', url)

mongoose.connect(url)

  .then(result => {
    console.log('connected to MongoDB',result)
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [3, 'Name must be at least 3 characters long']
  },
  number: {
    type: String,
    required: [true, 'Number is required'],
    validate: {
      validator: function(value) {
        return /^\d{2,3}-\d{5,}$/.test(value)
      },
      message: props => `${props.value} is not a valid phone number! Format should be XX-XXXXX or XXX-XXXXX`
    }
  }
})


personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model('Person', personSchema)
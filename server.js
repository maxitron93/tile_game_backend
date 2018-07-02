const express = require('express')
const app = express()
const Joi = require('joi')
// 1. Need mongoose to connect to the database
const mongoose = require('mongoose')

// 2. Connect to the database called 'playground'. If 'playground' doesn't exist, it will be made automatically
mongoose.connect('mongodb://localhost/tile_game') 
.then(() => {
  console.log('Connected to MongoDB...')

  // 3. Start the server once it's connected to the database
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`)
  })

})
.catch((error) => {
  console.log('Could not connect to MongoDB', error)
})


// 4. We need a schema that defines the shape of movie documents in the mongoDB database 
const scoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 63
  },
  score: {
    type: Number,
    required: true
  }
})

// 5. We need to compile the schema into a model (which is a JS class)
const Score = mongoose.model('Score', scoreSchema)


// Function to validate the incoming score object. Joi library used to do the validation
const validateScore = (score) => {
  const schema = {
    name: Joi.string().required().min(2).max(63),
    score: Joi.number().required()
  }

  return result = Joi.validate(score, schema)
}

// Use middleware to enable the parsing of JSON
app.use(express.json())


//////////////////////////
///// ROUTE HANDLERS /////
//////////////////////////

// Request: All the scores
// Operation: None
// Response: All the scores
app.get('/api/scores', async (req, res) => {
  const scores = await Score.find()

  res.send(scores)
})

// Request: Create a new score object and store it in the array
// Operation: Create a new score in the array
// Response: The newly created score
app.post('/api/scores', async (req, res) => {
  // 1. Check if the score object passes the validation
  const { error, value } = validateScore(req.body)

  // 2. If it doesn't pass, send back 400 (bad request)
  if (error) {
    return res.status(400).send(error.details[0].message)
  }

  // 3. If it passes, create a new score object
  const newScore = new Score({
    name: value.name,
    score: value.score
  })
  

  try {
    // 4. Push the new score into the array 
    const result = await newScore.save()

    // 5. Send back the newly created score
    return res.send(result)

  } catch (error) {
    // 6. If error, send back the error
    res.status(400).send(error)
  }
  
})



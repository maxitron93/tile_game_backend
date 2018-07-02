const express = require('express')
const app = express()
const Joi = require('joi')
// 1. Need mongoose to connect to the database
const mongoose = require('mongoose')
// jsonwebtoken used to create json web tokens
const jwt = require('jsonwebtoken')

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
  // 1. Get all the scores from the database
  const scores = await Score.find()

  // 2. Generate a JSON web token
  const token = jwt.sign({ _id: this._id}, process.env.JWTKEY)

  // 3. Send back the scores and the token in the header
  res.header('x-auth-token', token).send(scores)
})

// Request: Create a new score object and store it in the array
// Operation: Create a new score in the array
// Response: The newly created score
app.post('/api/scores', async (req, res) => {
  // 1. Get the token from the request header.
  const token = req.header('x-auth-token')

  // 2. If the token doesn't exist, return 401 (unauthorized)
  if (!token) {
    return res.status(401).send('Access denied. No token provided')
  }

  try {
    // 3. If the token exists, verify the token. If the token is not valid, an exception will be thrown that will be handled by 'catch'
    const decodedPayload = jwt.verify(token, process.env.JWTKEY)

    // 4. If it's a valid token, check if the score object passes the validation. 
    const { error, value } = validateScore(req.body)

    // 5. If it doesn't pass, send back 400 (bad request)
    if (error) {
      return res.status(400).send(error.details[0].message)
    }

    // 6. If it passes, create a new score object
    const newScore = new Score({
      name: value.name,
      score: value.score
    })
    

    try {
      // 7. Save the score object into the database 
      const result = await newScore.save()

      // 8. Send back the newly created score
      return res.send(result)

    } catch (error) {
      
      // 6. If error, send back the error
      res.status(400).send(error)
    }

  } catch (error) {
    // 6. If error (token not valid) send back 400 (bad request)
    return res.status(400).send('Invalid token')
  }












  
  
})



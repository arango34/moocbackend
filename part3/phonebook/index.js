const express = require('express')
require('dotenv').config()
const app = express()
const morgan = require('morgan')

const Contact = require('./models/contact')

// let contacts = [
//   {
//     id: 1,
//     name: 'Arto Hellas',
//     number: '040-123456',
//   },
//   {
//     id: 2,
//     name: 'Ada Lovelace',
//     number: '39-44-5323523',
//   },
//   {
//     id: 3,
//     name: 'Dan Abramov',
//     number: '12-43-234345',
//   },
//   {
//     id: 4,
//     name: 'Mary Poppendieck',
//     number: '39-23-6423122',
//   },
// ];

app.use(express.json())
app.use(express.static('build'))

morgan.token('contact', function getContact(req) {
  return JSON.stringify(req.body)
})

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :contact'
  )
)

// const generateId = () => {
//   const maxId =
//     contacts.length > 0
//       ? Math.max(...contacts.map((contact) => contact.id))
//       : 0;
//   return maxId + 1;
//   return Math.random(4000);
// };

app.get('/info', (req, res, next) => {
  const received = new Date()
  Contact.find({})
    .then((contacts) => {
      const val = `<p>Phonebook has info for ${contacts.length} people</p>
    <p>${received}</p>`
      res.status(200).send(val)
    })
    .catch((err) => next(err))
})

app.get('/api/persons', (req, res, next) => {
  Contact.find({})
    .then((contacts) => {
      if (!contacts) return res.status(404).json({ error: 'No contacts found' })
      res.status(200).json(contacts)
    })
    .catch((err) => next(err))
})

app.get('/api/persons/:id', (req, res, next) => {
  Contact.findById(req.params.id)
    .then((contact) => {
      if (!contact) return res.status(404).json({ error: 'No contact found' })

      res.status(200).json(contact)
    })
    .catch((err) => next(err))
})

app.delete('/api/persons/:id', (req, res, next) => {
  const { id } = req.params
  Contact.findByIdAndDelete(id)
    .then(() => {
      res.status(204).end()
    })
    .catch((err) =>
      // res.status(400).json({ error: 'Could not delete contact' });
      next(err)
    )
})

app.put('/api/persons/:id', (req, res, next) => {
  const { id } = req.params
  // req.body.id = undefined;
  // delete req.body.id;

  Contact.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
    .then((result) => {
      console.log(result)
      if (!result) throw new Error('here is new error')
      res.status(204).end()
    })
    .catch((err) =>
      // res.status(400).json({ error: 'Could not delete contact' });
      next(err)
    )
})

app.post('/api/persons', (req, res, next) => {
  let sameName = false
  if (!req.body.name || !req.body.number)
    return res.status(400).json({ error: 'Name or number missing' })

  Contact.find({})
    .then((contacts) => {
      contacts.forEach((contact) => {
        if (contact.name === req.body.name) {
          sameName = true
          res.status(400).json({ error: 'Name must be unique.' })
          return
        }
      })

      if (sameName) return

      const newContact = new Contact({
        name: req.body.name,
        number: req.body.number,
      })

      newContact
        .save()
        .then((saved) => res.status(201).json(saved))
        .catch((err) => next(err))
    })
    .catch((err) => next(err))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send('<h1 style="margin: 2rem;">Page Not Found</h1>')
}

app.use(unknownEndpoint)

const errorHandler = (error, request, res) => {
  if (error.name === 'ValidationError' || error.name === 'CastError')
    return res.status(400).json({ error: error.message })

  res.status(500).json({ error: 'Internal servor error' })
}

app.use(errorHandler)

const PORT = process.env.PORT || '8080'

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`)
})

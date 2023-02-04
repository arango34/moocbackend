const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

if (process.argv.length < 3) {
  console.log(
    'Please provide the password as an argument: node mongo.js <password>'
  )
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://kevin:${password}@nodeexpressprojects.4bak8.mongodb.net/PHONEBOOK?retryWrites=true&w=majority`

const contactSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Contact = mongoose.model('Contact', contactSchema)

if (process.argv.length === 3) {
  mongoose
    .connect(url)
    .then(() => {
      console.log('connected')

      Contact.find({}).then((result) => {
        console.log('phonebook:')
        result.forEach((contact) => {
          console.log(contact.name, contact.number)
        })
        mongoose.connection.close()
      })
    })
    .catch((err) => console.log(err))
} else {
  mongoose
    .connect(url)
    .then(() => {
      console.log('connected')

      const name = process.argv[3]
      const number = process.argv[4]

      const contact = new Contact({ name, number })

      return contact.save()
    })
    .then((res) => {
      console.log(`added ${res.name} number ${res.number} to phonebook`)
      return mongoose.connection.close()
    })
    .catch((err) => console.log(err))
}

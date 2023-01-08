const express = require('express');
const app = express();
const morgan = require('morgan');

let contacts = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

app.use(express.json());

morgan.token('contact', function getContact(req) {
  return JSON.stringify(req.body);
});

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :contact'
  )
);

const generateId = () => {
  const maxId =
    contacts.length > 0
      ? Math.max(...contacts.map((contact) => contact.id))
      : 0;
  return maxId + 1;
};

app.get('/info', (req, res) => {
  const received = new Date();
  const val = `<p>Phonebook has info for ${contacts.length} people</p>
    <p>${received}</p>`;
  res.status(200).send(val);
});

app.get('/api/persons', (req, res) => {
  res.status(200).json(contacts);
});

app.get('/api/persons/:id', (req, res) => {
  const { id } = req.params;
  contacts.forEach((contact) => {
    if (Number(id) === contact.id) {
      return res.status(200).json(contact);
    }
  });
  res.status(404).end();
});

app.delete('/api/persons/:id', (req, res) => {
  const { id } = req.params;
  contacts = contacts.filter((contact) => Number(id) !== contact.id);
  res.status(204).end();
});

app.post('/api/persons', (req, res) => {
  let sameName = false;
  if (!req.body.name || !req.body.number)
    return res.status(400).json({ error: 'Name or number missing' });

  contacts.forEach((contact) => {
    if (contact.name === req.body.name) {
      sameName = true;
      res.status(400).json({ error: 'Name must be unique.' });
      return;
    }
  });

  if (sameName) return;

  const contact = {
    id: generateId(),
    name: req.body.name,
    number: req.body.number,
  };

  contacts.push(contact);

  res.status(201).json(contact);
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});

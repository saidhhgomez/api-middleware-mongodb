const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = 5559;


//middleware
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));


//conexión a mongo db
mongoose.connect('mongodb://localhost:27017/biblioteca',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//esquema de la colección productos de la biblioteca
const librosSchema = new mongoose.Schema({
    titulo: String,
    autor: String,
    categoria: String,
    editorial: String,
    anio_publicacion: Number,
    isbn: String,
    stock: Number
});


const Libro = mongoose.model('Libro', librosSchema);

// Rutas API REST

// Obtener todos los libros
app.get('/libros', async (req, res) => {
  try {
    const libros = await Libro.find();
    res.json(libros);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener libros' });
  }
});

// Crear un nuevo libro
app.post('/libros', async (req, res) => {
  const {
    titulo,
    autor,
    categoria = '',
    editorial = '',
    anio_publicacion,
    isbn = '',
    stock = 0,
  } = req.body;

  try {
    const nuevoLibro = new Libro({
      titulo,
      autor,
      categoria,
      editorial,
      anio_publicacion,
      isbn,
      stock,
    });

  await nuevoLibro.save();
    res.status(201).json(nuevoLibro);
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar el libro' });
  }
});

// Actualizar un libro
app.put('/libros/:id', async (req, res) => {
  const { id } = req.params;
  const {
    titulo,
    autor,
    categoria,
    editorial,
    anio_publicacion,
    isbn,
    stock,
  } = req.body;

  try {
    const libroActualizado = await Libro.findByIdAndUpdate(
      id,
      {
        titulo,
        autor,
        categoria,
        editorial,
        anio_publicacion,
        isbn,
        stock,
      },
      { new: true }
    );
    res.json(libroActualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el libro' });
  }
});

// Eliminar un libro
app.delete('/libros/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Libro.findByIdAndDelete(id);
    res.json({ mensaje: 'Libro eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el libro' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});

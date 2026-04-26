const express = require('express');
const Book = require('../models/Book');

const router = express.Router();

const validateBook = (data) => {
  const errors = {};

  if (!data.title || !String(data.title).trim()) {
    errors.title = 'Title is required';
  }

  if (!data.author || !String(data.author).trim()) {
    errors.author = 'Author is required';
  }

  if (!data.category || !String(data.category).trim()) {
    errors.category = 'Category is required';
  }

  const price = Number(data.price);
  if (Number.isNaN(price) || price <= 0) {
    errors.price = 'Price must be greater than 0';
  }

  const publishedYear = Number(data.publishedYear);
  if (
    Number.isNaN(publishedYear) ||
    publishedYear < 1000 ||
    publishedYear > 9999
  ) {
    errors.publishedYear = 'Published year must be a valid year';
  }

  const rank = Number(data.rank);
  if (Number.isNaN(rank) || rank < 1) {
    errors.rank = 'Rank must be at least 1';
  }

  return errors;
};

router.get('/', async (req, res) => {
  try {
    const { search = '', category = '', sort = '' } = req.query;

    const filter = {};

    if (search.trim()) {
      filter.title = { $regex: search.trim(), $options: 'i' };
    }

    if (category.trim()) {
      filter.category = category.trim();
    }

    let query = Book.find(filter);

    if (sort === 'price_asc') {
      query = query.sort({ price: 1 });
    } else if (sort === 'price_desc') {
      query = query.sort({ price: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const books = await query;
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch books' });
  }
});

router.post('/', async (req, res) => {
  try {
    const errors = validateBook(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const book = await Book.create({
      title: req.body.title.trim(),
      author: req.body.author.trim(),
      category: req.body.category.trim(),
      price: Number(req.body.price),
      publishedYear: Number(req.body.publishedYear),
      rank: Number(req.body.rank),
    });

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create book' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const errors = validateBook(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title.trim(),
        author: req.body.author.trim(),
        category: req.body.category.trim(),
        price: Number(req.body.price),
        publishedYear: Number(req.body.publishedYear),
        rank: Number(req.body.rank),
      },
      { new: true, runValidators: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update book' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);

    if (!deletedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete book' });
  }
});

module.exports = router;

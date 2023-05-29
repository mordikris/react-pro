import express from 'express';
import Product from '../models/productModel.js';
import { isAdmin, isAuth } from '../utils.js';

const productRouter = express.Router();

productRouter.get('/', async (req, res) => {
    const products = await Product.find();
    res.send(products);
});

productRouter.post('/', isAuth, isAdmin, async (req, res) => {

  const newProduct = new Product({
      name: 'sample name ' + Date.now(),
      slug: 'sample-name-' + Date.now(),
      image: '/images/p1.jpg',
      price: 0,
      category: 'sample category',
      brand: 'sample brand',
      countInStock: 0,
      rating: 0,
      numReviews: 0,
      description: 'sample description',
  });

  const product = await newProduct.save();
  res.send({ message: 'Product Created', product });
   }
 );


 productRouter.put('/product/:id', isAuth, isAdmin, async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  if (product) {
      product.name = req.body.name;
      product.slug = req.body.slug;
      product.price = req.body.price;
      product.image = req.body.image;
      product.images = req.body.images;
      product.category = req.body.category;
      product.brand = req.body.brand;
      product.countInStock = req.body.countInStock;
      product.description = req.body.description;
      await product.save();
      res.send({ message: 'Product Updated' });
  } else {
      res.status(404).send({ message: 'Product Not Found' });
  }
   }
);



// נוכל להגדיר את כמות המוצרים אשר יוצגו בעמוד אחד במקרה זה 2 מוצרים לעמוד אחד - //

const PAGE_SIZE = 2;

productRouter.get('/admin', isAuth, isAdmin, async (req, res) => {
  const { query } = req;
  const page = query.page || 1;
  const pageSize = query.pageSize || PAGE_SIZE;

  const products = await Product.find()
      .skip(pageSize * (page - 1))
      .limit(pageSize);
  const countProducts = await Product.countDocuments();
  res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
  });
   }
);

productRouter.get("/search", async (req, res) => {

    //  נקבל משם את הערכים לכל פרמטר URL כל מה שנשלח מהצד שרת ב- //

    const { query } = req;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || "";
    const price = query.price || "";
    const rating = query.rating || "";
    const order = query.order || "";
    const searchQuery = query.query || "";

    //לא נבצע סינון על פי שם המוצר כך  all לא קיים או שווה ל searchQuery אם//

    const queryFilter =
    searchQuery && searchQuery !== "all"
      ? {
          name: {
            $regex: searchQuery,
            $options: "i",
          },
        }
      : {};

    //לא נבצע סינון על פי שם המוצר כך  all לא קיים או שווה ל category אם//

    const categoryFilter = category && category !== "all" ? { category } : {};
    const ratingFilter =
      rating && rating !== "all"
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};

    //לא נבצע סינון על פי שם המוצר כך  all לא קיים או שווה ל price אם//

  const priceFilter =
    price && price !== "all"
      ? {
          // 1-50
          price: {
            $gte: Number(price.split("-")[0]),
            $lte: Number(price.split("-")[1]),
          },
        }
      : {};

    // ככה נבצע סינון על פי מחיר הכי נמוך / גבוה, כמות הביקורות והמוצר הכי חדש - //

    const sortOrder =
        order === "featured"
            ? { featured: -1 }
            : order === "lowest"
                ? { price: 1 }
                : order === "highest"
                    ? { price: -1 }
                    : order === "toprated"
                        ? { rating: -1 }
                        : order === "newest"
                            ? { createdAt: -1 }
                            : { _id: -1 };

    //וכל השאר לשאילתא של חיפוש המוצר queryFillter, categoryFilter  נכיל את הפרמטרים של הסינון -//

    const products = await Product.find({
        ...queryFilter,
        ...categoryFilter,
        ...priceFilter,
        ...ratingFilter,
    })
        // sortOrder נסדר אותם על סמך  - //

        .sort(sortOrder)

        // ככה נגדיר את כמות העמודים לשאילתא ששלחנו - //

        .skip(pageSize * (page - 1))
        .limit(pageSize);

    const countProducts = await Product.countDocuments({
        ...queryFilter,
        ...categoryFilter,
        ...priceFilter,
        ...ratingFilter,
    });
    res.send({
        products,
        countProducts,
        page,
        pages: Math.ceil(countProducts / pageSize),
    });
}
);


productRouter.get('/categories', async (req, res) => {
    const categories = await Product.find().distinct('category');
    res.send(categories);
});


productRouter.get('/:slug', async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug });
    if (product) {
        res.send(product);
    } else {
        res.status(404).send({ message: 'Product Not Found' });
    }
});

productRouter.get('/product/:id', async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        res.send(product);
    } else {
        res.status(404).send({ message: 'Product Not Found' });
    }
});

productRouter.delete('/product/:id', isAuth, isAdmin, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
      await product.remove();
      res.send({ message: 'Product Deleted' });
  } else {
      res.status(404).send({ message: 'Product Not Found' });
  }
}
);


productRouter.post('/product/:id/reviews', isAuth, async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  if (product) {
      if (product.reviews.find((x) => x.username === req.user.username)) {
          return res.status(400).send({ message: 'You already submitted a review' });
      }
      const review = { username: req.user.username, rating: Number(req.body.rating), comment: req.body.comment, };
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating = product.reviews.reduce((a, c) => c.rating + a, 0) / product.reviews.length;
      const updatedProduct = await product.save();
      res.status(201).send({
          message: 'Review Created',
          review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
          numReviews: product.numReviews,
          rating: product.rating,
      });
  } else {
      res.status(404).send({ message: 'Product Not Found' });
  }
});





export default productRouter;
import axios from 'axios';
import React, { useContext } from 'react'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import { Store } from '../Store';
import Rating from './Rating';

function Product(props) {
    const { product } = props;

    const { state, dispatch: ctxDispatch } = useContext(Store);
    const {
        cart: { cartItems },
    } = state;

    const addToCartHandler = async (product) => {

        const existItem = cartItems.find((x) => x._id === product._id);
        const quantity = existItem ? existItem.quantity + 1 : 1;
        const { data } = await axios.get(`/api/products/product/${product._id}`);
        
        
        if (data.countInStock < quantity) {
            window.alert('Sorry. Product is out of stock');
            return;
        }
        ctxDispatch({
            type: 'CART_ADD_ITEM',
            payload: { ...product, quantity },
        });
    }


    return (
        <Card>
            <Link to={`/product/${product.slug}`} className='prod-img'>
                <img src={product.image} alt="" className="card-img-top" />
            </Link>
            <Card.Body>
                <Link to={`/product/${product.slug}`}>
                    <Card.Title>{product.name}</Card.Title>
                </Link>
                <Rating rating={product.rating} numReviews={product.numReviews}></Rating>

                <Card.Text>${product.price}</Card.Text>

                {product.countInStock === 0 ? (
                    <Button variant="light" disabled>
                        Out Of Stock
                    </Button>
                ) : (
                    <Button onClick={() => addToCartHandler(product)}>Add To Cart</Button>
                )}
            </Card.Body>
        </Card>)
}

export default Product;
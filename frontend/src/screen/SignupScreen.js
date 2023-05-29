import React, { useContext, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Form from 'react-bootstrap/Form'; 
import { Store } from '../Store';
import { toast } from 'react-toastify';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import { Helmet } from 'react-helmet-async';
import { getError } from '../Utils';
import Button from 'react-bootstrap/Button';

export default function SignupScreen() {


    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const { search } = useLocation();
    const redirectInUrl = new URLSearchParams(search).get('redirect');
    const redirect = redirectInUrl ? redirectInUrl : '/';


    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { userInfo } = state;


    const submitHandler = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            const { data } = await axios.post('/api/users/signup', {
                firstName,
                lastName,
                username,
                email,
                password,
            });
            ctxDispatch({ type: 'USER_SIGNIN', payload: data });
            localStorage.setItem('userInfo', JSON.stringify(data));
            navigate(redirect || '/');
        } catch (err) {
            toast.error(getError(err));
        }
    };



    return (
        <Container className="small-container">
            <Helmet>
                <title>Sign Up</title>
            </Helmet>
            <h1 className="my-3">Sign Up</h1>
            <Form onSubmit={submitHandler}>
                <Form.Group className="mb-3" controlId="firstName">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control onChange={(e) => setFirstName(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="lastName">
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control onChange={(e) => setLastName(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="username">
                    <Form.Label>Username</Form.Label>
                    <Form.Control onChange={(e) => setUsername(e.target.value)} required />
                </Form.Group>
                <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" required onChange={(e) => setEmail(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" required onChange={(e) => setPassword(e.target.value)} />
                    <Form.Group className="mb-3" controlId="confirmPassword">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control type="password" onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </Form.Group>

                    <Form.Group className="form-check mb-3" controlId="agreeTerms">
                        <input
                            type="checkbox"
                            required
                            className="form-check-input"
                        />
                        <Form.Label className="form-check-label" >
                          By clicking the following, you accept our <Link to={`/terms-of-service`}>Terms Of Service</Link>.
                        </Form.Label>
                    </Form.Group>

                </Form.Group>
                <div className="mb-3">
                    <Button type="submit">Sign Up</Button>
                </div>
                <div className="mb-3">
                    Already a user?{' '}
                    <Link to={`/signin?redirect=${redirect}`}>Sign-In</Link>
                </div>
            </Form>
        </Container>

    )
}


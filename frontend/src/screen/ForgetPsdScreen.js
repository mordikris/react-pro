import React, { useEffect, useState } from 'react';
import Form from 'react-bootstrap/Form';
import { getError } from '../Utils';
import { toast } from 'react-toastify';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from "react-router-dom";


const ForgetPsdScreen = () => { // screen_component

    const [randomCode, setRandomCode] = useState('');
    const [code, setCode] = useState('');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState('');
    var [validEmail, setValidEmail] = useState(false);
    var [validCode, setValidCode] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');

    const navigate = useNavigate();


    const generateCode = (length) => { // יצירת קוד
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    useEffect(() => {
        setRandomCode(generateCode(5));

    }, []);
    // console.log(randomCode);



    const codeCheck = () => {
        if (code !== randomCode || code.length <= 0) {
            toast.error("Code is not valid, Check your email");
            return;
        }
        else {
            setValidCode(true);
        }
    };


    const confirmMail = async (e) => {
        e.preventDefault();

        try {
            await axios.post('/api/users/forgetPsd', { email, },)
            setValidEmail(true)
            window.Email.send({
                Host: "smtp.elasticemail.com",
                Username: `${process.env.REACT_APP_MAIL_USERNAME}`,
                Password: `${process.env.REACT_APP_MAIL_PASSWORD}`,
                To: email,
                From: `${process.env.REACT_APP_MAIL_USERNAME}`,
                Subject: "Code For Password Reset",
                Body: `Your Code Is: ${randomCode}`
            });

        } catch (err) {
            toast.error("Email is not defind");
        }
    }


    const submitHandler = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Password does not match");
            return;
        }

        else if (password.length < 8) {
            toast.error("Password should be 8 characters at least");
            return;
        }

        else {
            try {
                await axios.put('/api/users/forgetPsd', { email, password },);
                toast.success("Password Updated Successfully");

                setTimeout(() => {
                    navigate("/signin");
                }, 1500);

            } catch (err) {
                toast.error(getError(err));
            }
        };
    }



    return (
        <div className='width'> 
            <Helmet>
                <title>reset password</title>
            </Helmet>

            <ListGroup>
                <ListGroup.Item>
                    <h5>Reset Password:</h5>
                </ListGroup.Item>

                <form>
                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label><br/><h5>Enter Email:</h5><br/></Form.Label>
                        <Form.Control
                            type="email"
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={"Enter your mail:"}
                            autoComplete="off"
                        />
                        <br/>
                        <Button type="button" onClick={confirmMail}>confirm</Button>
                    </Form.Group>
                </form>

                {validEmail && (
                    <form>
                        <Form.Group className="mb-3" controlId="code">
                            <Form.Label>Check your email and enter the code:</Form.Label>
                            <Form.Control
                                type="text"
                                onChange={(e) => setCode(e.target.value)}
                                autoComplete="off"
                                required
                            />
                        </Form.Group>
                        <div className="mb-3">
                            <Button type="button" onClick={codeCheck} disabled={!code.length}>Validate Code</Button>
                        </div>
                    </form>)}

                {validCode && (
                    <Form onSubmit={submitHandler}>
                        <Form.Group className="mb-3" controlId="password">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                                type="password"
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="off"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="confirmPassword">
                            <Form.Label>Confirm New Password</Form.Label>
                            <Form.Control
                                type="password"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                autoComplete="off"
                                required
                            />
                        </Form.Group>
                        <div className="mb-3">
                            <Button type="submit" disabled={!password.length || !confirmPassword.length}>Update</Button>
                        </div>
                    </Form>
                )}
            </ListGroup>
        </div>
    )
}

export default ForgetPsdScreen
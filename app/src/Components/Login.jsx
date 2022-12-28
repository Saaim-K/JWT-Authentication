import { React, useState, useContext } from 'react'
import { GlobalContext } from '../Context/Context';
import axios from 'axios';
import { TextField, Button } from '@mui/material';

let baseUrl = '';
if (window.location.href.split(':')[0] === 'http') { baseUrl = 'http://localhost:4444' }


const Login = () => {
    let { state, dispatch } = useContext(GlobalContext);
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [result, setResult] = useState('')

    const loginHandler = async (e) => {
        e.preventDefault();
        try {
            let response = await axios.post(`${baseUrl}/login`, {
                email: email,
                password: password
            }, {
                withCredentials: true
            })

            dispatch({
                type: 'USER_LOGIN',
                payload: null
            })


            console.log("login successful");
            setResult("login successful")

        } catch (e) {
            console.log("e: ", e);
        }
    }

    return (
        <>
            <form onSubmit={loginHandler}>
                <TextField type='text' label="E-Mail" variant="outlined" color='secondary' onChange={(e) => { setEmail(e.target.value) }} /><br /><br />
                <TextField type='password' label="Password" variant="outlined" color='secondary' onChange={(e) => { setPassword(e.target.value) }} /><br /><br />
                <Button type='submit' color='success' variant="contained" size='medium'>Login</Button>
            </form>
            <h1>{result}</h1>
        </>
    )
}

export default Login
import { React, useState } from 'react'
import { TextField, Button } from '@mui/material';
import axios from 'axios'

let baseUrl = '';
if (window.location.href.split(':')[0] === 'http') { baseUrl = 'http://localhost:4444' }

const Signup = () => {
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [result, setResult] = useState('')


    const signUp = async (e) => {
        e.preventDefault();
        try {
            let response = await axios.post(`${baseUrl}/signup`, {
                firstName, lastName, email, password
            }, {
                withCredentials: true
            })
            console.log('Signed IN')
            setResult("SignUp Successful")
        }
        catch (e) {
            console.log("Error: ", e)
        }
    }

    return (
        <>
            <form onSubmit={signUp}>
                <TextField type='text' label="First Name" variant="outlined" color='secondary' onChange={(e) => { setFirstName(e.target.value) }} /><br /><br />
                <TextField type='text' label="Last Name" variant="outlined" color='secondary' onChange={(e) => { setLastName(e.target.value) }} /><br /><br />
                <TextField type='text' label="E-Mail" variant="outlined" color='secondary' onChange={(e) => { setEmail(e.target.value) }} /><br /><br />
                <TextField type='password' label="Password" variant="outlined" color='secondary' onChange={(e) => { setPassword(e.target.value) }} /><br /><br />
                <Button color='success' variant="contained" size='medium' type='submit'>Sign Up</Button>
            </form>
            <h1>{result}</h1>
        </>
    )
}

export default Signup
import { useState } from 'react';
import './LoginPage.css';

function LoginPage()
{
    //variables for holding in user input, and also telling incorrect login and stuff
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    return (
        <div className = "login-page">
            
            <div className = "card">

                {/* The main like title of the card */}
                <div className="titleBox">
                    <h1>Midas<span>Cloud</span></h1>
                </div>

                {/* The underline and main prompt for good looks*/}
                <div className="underline"></div>
                <p className ="tagline">Sign into your vault</p>
                
                {/* This is the thing holding both input fields, its a form with the embedded items for input*/}
                <form>

                    {/*The username part of log in*/}
                    <div className='field'>
                        <label htmlFor="username">Username: </label>
                        <input 
                        type="text"
                        id="username"
                        value = {username}
                        placeholder='your username'
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete='username'></input>
                    </div>

                    {/*The password part of log in*/}
                    <div className='field'>
                        <label htmlFor="username">Password: </label>
                        <input
                        type="password"
                        id="password"
                        placeholder='**********'
                        autoComplete='current-password'>

                        </input>
                    </div>

                    <button type="submit" classNam = "submitButton"> Submit</button>
                    <br></br>
                    <button type="button" classNam = "registerButton"> Register</button>

                </form>


            </div>

        </div>
    );
}

export default LoginPage
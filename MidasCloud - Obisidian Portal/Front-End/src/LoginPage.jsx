import { useState, useEffect } from 'react';
import './LoginPage.css';
import { Link, useNavigate } from 'react-router-dom';

function LoginPage()
{
    //variables for holding in user input, and also telling incorrect login and stuff
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    //star array for background star constellation
    const [stars] = useState(() =>
    Array.from({ length: 250 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 4 + 1,
    }))
    );

    //program state for rendering the revealing text
    const fullText = "Sync Your Notes using Obsidian";
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true)

    //use effect state that does the actual animation
    useEffect(() =>{
        let index = 0; //where in text u are

        const interval = setInterval(() => {
            setDisplayedText(fullText.slice(0, index+1)); //update the visual using react state and increment location
            index++;
            
            //reset and draw the next letter every 80 ms until you reach full text length
            if(index === fullText.length)
            {
                clearInterval(interval);
                setIsTyping(false);
            }
            }, 80) //a part of the set interval function up there
         

            return () => clearInterval(interval); //clean up so no memory leak occurs (screw you react)
        }, []); //[] because it's what react uses to only run this on start up apparently


    const parseResponse = (data) => {

        //log message to see we got through for now
        console.log(data.message);

        //check to see if user needs to update pwd, if so, redirect
        if(data.mustChangePwd)
        {
            navigate("/changePWD");
        }
        else if (data.pending)
        {
            setError('Your account is still pending approval with an admin. Please check back later! Thank You!');
        }
        else if (data.vaultLink)
        {
            //actually navigate someone to their site eventually
            window.location.href = data.vaultLink;
        }
    };

    //handle the checking for when someone submits on login page
    const handleSubmit = async (e) =>
    {
        e.preventDefault();

        //check both fields are filled out
        if(!username || !password)
        {
            setError('Please make sure both fields are filled in');
            return;
        }

        //reset the error state
        setError('');

        //just use local host now for testing
        //TODO: change to real url when deployed
        try
        {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({
                    uname: username,
                    pwd: password
                })
            })

            //convert response data
            const data = await response.json();

            //check data is there
            if(!data.success)
            {
                setError(data.message);
                return
            }

            //handle data after you know you have it (mostly happens in backend, so just update UI)
            parseResponse(data);
        }
        catch (err)
        {
            setError('Something went wrong in communicating with server, Please try again');
            console.error("Log in request failed:", err)
        }

        return;
    }


    //---------------------------------------------------------main html structure of the website---------------------------------------------------------
    return (
        
        <div className = "login-page">

            <div className = "welcomeText">
                {displayedText}
                {isTyping && <span className='cursor'>|</span>}
            </div>

            {/* update the random star field  */}
            <div className = "stars">
                {stars.map((star) => (
                    <div
                        key = {star.id}
                        className="star"
                            style={{
                            top: `${star.top}%`,
                            left: `${star.left}%`,
                            width: `${star.size}px`,
                            height: `${star.size}px`,
                        }}
                    />
                ))}
            </div>

            {/* ------------------------------------------------------------------------------- */}

            <div className = "card">

                {/* The main like title of the card */}
                <div className="titleBox">
                    <a href = "https://midascloud.net/">
                        <h1>Midas<span>Cloud</span></h1>
                    </a>
                </div>

                {/* The underline and main prompt for good looks*/}
                <div className="underline"></div>
                <p className ="tagline">Sign into your vault</p>
                

                {/* ----------------------------------------------------------------------------------------- */}
                {/* This is the thing holding both input fields, its a form with the embedded items for input*/}
                <form onSubmit={handleSubmit}>

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
                        <label htmlFor="password">Password: </label>
                        <div className = "password-wrapper">
                            {/*Actual Input field for entering password*/}
                            <input
                            type= {showPassword ? 'text' : 'password'}
                            id="password"
                            placeholder='**********'
                            autoComplete='current-password'
                            value = {password}
                            onChange={(e) => setPassword(e.target.value)}>

                            </input>

                            {/*Password visibilty button*/}
                            <button type="button" className="showPasswordButton" onClick={ () => setShowPassword(!showPassword)}>
                                {showPassword ? 'Hide' : 'Show'}
                            </button>

                        </div>
                    </div>


                    {/* --------------------------------------Button & Error Msg-------------------------------------------- */}
                    {error && <div className="errorMsg"><span>Try again: </span>{error}</div>}
                    <button type="submit" className = "submitButton"> Submit</button>
                </form>

                <div className = "registerDiv">
                    <label htmlFor="register">Want Access...?</label>
                    <Link to="/register" className="registerLink" >Request to Register</Link>
                </div>


            </div>

        </div>
    );
}

export default LoginPage
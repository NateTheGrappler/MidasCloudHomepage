import { useState, useEffect } from 'react';
import './RegisterPage.css';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage()
{
    const [emailField, setEmailField] = useState('');
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [submitOccured, setSubmitOccured] = useState(false);


    //re-render stars differently for dynamic effect
    const [stars] = useState(() =>
        Array.from({length: 250}, (_, i) => ({
            id: i,
            top: Math.random() * 100,
            left: Math.random() * 100,
            size: Math.random() * 4 + 1,
        }))
    );

    //onclick button function to go back
    const navigate = useNavigate();


    //-------------------------------Handle Register attempts and back-end communication--------------------------------//

    const parseResponse = (data) =>
    {
        //log message just for now
        console.log(data.message);

    }

    //handle register attempt
    const handleRegister = async (e) => 
    {
        e.preventDefault();
        
        //check filled fields
        if(!emailField || !username)
        {
            setError('Please fill out both fields');
            return;
        }

        //check for valid email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(emailField)) 
        {
            setError('Please enter a valid email address');
            return;
        }

        setError('');

        //console.log(submitOccured);
        //Hook up the backend fetch call here when that comes
        try
        {
            //get data and parse it
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/register`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    username: username,
                    email: emailField,
                    optionalRequest: message
                })

            });
            const data = await response.json();

            //handle if the request was successful in the backend or not
            if(!data.success)
            {
                setError(data.message);
                return
            }

            //actually do something with the data
            parseResponse(data);

            //change display screen to show authenication request is sent to admin
            setSubmitOccured(true);

        }
        catch (err)
        {
            setError('Something went wrong in communicating with server, Please try again');
            console.error("Register Request Failed:", err)
            setSubmitOccured(false);

        }


    }

    return (
        <div className = "RegisterPage">

            {/* Top Logo image inspired by nextcloud log in page */}
            <div className = "RegisterImg">
                <img src = "src/assets/goldenCloud.png" alt="Image of a textured looking golden cloud"></img>
            </div>

            {/*Basically the same thing as in login, set up the star array to render it*/}
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


            {/*------------------Up top card decorations---------*/}
            <div className = "RegisterCard">

                {/* Reuse the old code for good design practices */}
                <div className="DecorationText">
                    {/*back button*/}
                    <button className="backButton" aria-label="Go back" onClick={() => navigate(-1)}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <a href = "https://midascloud.net/">
                        <h1>Midas<span>Cloud</span></h1>
                    </a>
                </div>

                <div className="underline"></div>
                {submitOccured ? (<p className ="tagline">Almost There!</p>) : (<p className ="tagline">Please Register with Us</p>) }


                {/*------------------Actual User Input Area---------*/}
                {submitOccured ? 
                (
                    <div className='pendingApproval'>
                        <h2>Request Sent!</h2>
                        <p>Thanks for signing up. An email has been sent to <a href={`mailto:${emailField}`} className="emailHighlight">{emailField}</a> with a temporary password.
                        </p>
                        <Link to="/" className="submitButton">
                            Login
                        </Link>

                    </div> 
                )    
                : 
                (<form onSubmit={handleRegister}>
                    {/*The email address field so you can contact the person*/}
                    <div className='field'>
                        <label htmlFor = "emailAddress">Email Address: </label>
                        <input 
                        type="email"
                        id = "emailAddress"
                        value = {emailField}
                        placeholder='example@gmail.com'
                        onChange={(e) => setEmailField(e.target.value)}
                        ></input>
                    </div>

                    {/*The username field so you know what to toss into the database name and basically that*/}
                    <div className='field'>
                        <label htmlFor = "username">Username: </label>
                        <input 
                        type="text"
                        id = "username"
                        value = {username}
                        placeholder='YourUser'
                        onChange={(e) => setUsername(e.target.value)}
                        ></input>
                    </div>

                    {/* line break between options*/}
                    <div className = "linebreak"></div>

                    {/*The extra input field incase someone wants to given a reason as to why they want this*/}
                    <div className='registerFieldOptional'>
                        <label htmlFor = "reason"> Reason for Request?:</label>
                        <span>(Filling out is more likely for approval!)</span>
                        <textarea
                            id="reason"
                            value={message}
                            placeholder='(Optional)'
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/*------------Button For Submitting Request-----------*/}
                    {error && <div className="errorMsg"><span>Please Try again: </span>{error}</div>}
                    <button type="submit" className = "submitButton"> Register</button>

                </form> )}
            </div>

        </div>
    );
}

export default RegisterPage;
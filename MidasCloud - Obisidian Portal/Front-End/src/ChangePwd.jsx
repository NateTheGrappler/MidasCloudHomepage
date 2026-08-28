import {useState, useEffect } from 'react';
import './ChangePwd.css';
import { useNavigate, Link } from 'react-router-dom';



function ChangePwdPage()
{
    //set the state for the passwords so you can send them to backend
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setnewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [matchError, setMatchError] = useState('');
    const [submitError, setSubmitError] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setConfirmShowNewPassword] = useState(false);

    const [submitOccured, setSubmitOccured] = useState(false);


    useEffect(()=>{
        if(confirmNewPassword.length === 0)
        {
            //dont just pop up whenever its empty
            setMatchError('');
        }
        else if (newPassword !== confirmNewPassword)
        {
            //actual error msg
            setMatchError('Passwords do not match.');
        }
        else
        {
            //reset the old gal
            setMatchError('');
        }
    }, [newPassword, confirmNewPassword]); //only run this whenever the state of those two variables changes


    //password checking for valid submit options moved here from login because it feels more appropriate here
    function checkPassword()
    {
        if (newPassword.length < 8) return 'New password must be at least 8 characters';
        if (newPassword.length > 20) return 'New password must be less than 20 characters';
        if (!/\d/.test(newPassword)) return 'New password must include at least one number';
        if (!/[!@#$%^&*(),.?":{}_|<>]/.test(newPassword)) return 'New password must include at least one special character'; //some real JS fuckshit here ngl, the jumbled mess a character class
        return null; //valid pswd
    }
    const handleSubmit = async (e) =>
    {
        e.preventDefault();

        //check all fields are filled out
        if(!oldPassword || !newPassword || !confirmNewPassword)
        {
            setSubmitError('Please make sure all fields are filled in');
            return;
        }

        const passwordError = checkPassword();
        if(passwordError)
        {
            setSubmitError(passwordError);
            return;
        }

        if(newPassword !== confirmNewPassword)
        {
            setSubmitError('Passwords do not match');
            return;
        }

        //reset the error state
        setSubmitError('');

        //fetch call goes here when backend hooked up
        console.log('ran passed all submit function checks')

        try
        {
            const response = await fetch('http://localhost:3000/api/change-pwd', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include', //this makes sure the cookies from the login session where saved, might need to change if I ever add a `forgot password thing`
                body: JSON.stringify({
                    oldPwd: oldPassword,
                    newPwd: newPassword,
                    confirmNewPwd: confirmNewPassword
                })
            })
            const data = await response.json();

            //handle if the request was successful in the backend or not
            if(!data.success)
            {
                setSubmitError(data.message);
                return
            }

            //update the UI to let the user know that their vault creation is in fact processing
            setSubmitOccured(true);

        }
        catch (err)
        {
            setSubmitError('Something went wrong in communicating with server, Please try again');
            console.error("Change Password Failed:", err);
            setSubmitOccured(true);
        }

        return;
    }


    const [stars] = useState(() =>
        Array.from({length: 250}, (_, i) => ({
            id: i,
            top: Math.random() * 100,
            left: Math.random() * 100,
            size: Math.random() * 4 + 1,
        }))
    );


    return (
        <div className = "ChangePwdPage">

            

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

            {/*--------------Card Decorations----------------*/}
            <div className='RegisterCard'>
                <div className="DecorationText">
                    <a href = "https://midascloud.net/">
                        <h1>Midas<span>Cloud</span></h1>
                    </a>

                    <div className='underline'></div>
                    <p className='tagline'>Please Change Your Previous Password.</p>
                </div>


            {/*--------------Input Fields----------------*/}
            {submitOccured ? 
            (
                <div className='pendingApproval'>
                    <h2>Password Changed!</h2>
                    <p>Thank you for changing your password. If this is your first time creating an account, you must wait until an admin creates
                        an obsidian vault for you. You will be notified when this occurs, and then access your vault with your new password
                    </p>
                    <Link to="https://midascloud.net" className="submitButton">
                        Return To MidasCloud Homepage
                    </Link>
                </div> 
            ) 
            : 
            ( <form onSubmit={handleSubmit}>
                {/*The Current Password Field*/}
                <div className='changePwdField'>
                    <label>Old Password:</label>
                    <input
                    type= {showPassword ? 'text' : 'password'}
                    id = "oldPassword"
                    value = {oldPassword}
                    placeholder='**********'
                    onChange={(e) => setOldPassword(e.target.value)}
                    >
                    </input>

                    {/*Password visibilty button*/}
                    <button type="button" onClick={ () => setShowPassword(!showPassword)}>
                        {showPassword ? 'Hide' : 'Show'}
                    </button>
                </div>

                {/*The New Password Field*/}
                <div className='changePwdField'>
                    <label>New Password:</label>
                    <input
                    type= {showNewPassword ? 'text' : 'password'}
                    id = "newPassword"
                    value = {newPassword}
                    placeholder='**********'
                    onChange={(e) => setnewPassword(e.target.value)}
                    >
                    </input>

                    {/*Password visibilty button*/}
                    <button type="button" onClick={ () => setShowNewPassword(!showNewPassword)}>
                        {showNewPassword ? 'Hide' : 'Show'}
                    </button>
                </div>

                {/*The Confirm New Password Field*/}
                <div className='changePwdField'>
                    <label>Confirm Password:</label>
                    <input
                    type= {showConfirmNewPassword ? 'text' : 'password'}
                    id = "confirmNewPassword"
                    value = {confirmNewPassword}
                    placeholder='**********'
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    >
                    </input>

                    <button type="button" onClick={ () => setConfirmShowNewPassword(!showConfirmNewPassword)}>
                        {showConfirmNewPassword ? 'Hide' : 'Show'}
                    </button>

                </div>
                    {matchError && <div className="errorMsg"><span>Try again: </span>{matchError}</div>}
                    {submitError && <div className="errorMsg"><span>Try again: </span>{submitError}</div>}
                    <button type="submit" className = "submitButton"> Change My Password</button>

            </form> )}

            </div>
        </div>
    );
}

export default ChangePwdPage;
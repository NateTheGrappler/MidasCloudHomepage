import {useState, useEffect } from 'react';
import './ChangePwd.css';
import { useNavigate } from 'react-router-dom';



function ChangePwdPage()
{
    //set the state for the passwords so you can send them to backend
    const {oldPassword, setOldPassword} = useState('');
    const {newPassword, setnewPassword} = useState('');
    const {confirmNewPassword, setConfirmNewPassword} = useState('');

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
            <form>
                {/*The Current Password Field*/}
                <div className='changePwdField'>
                    <label>Old Password</label>
                    <input
                    type= "text"
                    id = "username"
                    value = {oldPassword}
                    placeholder='**********'
                    onChange={(e) => setOldPassword(e.target.value)}
                    >
                    </input>
                </div>

                {/*The New Password Field*/}
                <div className='changePwdField'>
                    <label>New Password</label>
                    <input
                    type= "text"
                    id = "username"
                    value = {newPassword}
                    placeholder='**********'
                    onChange={(e) => setnewPassword(e.target.value)}
                    >
                    </input>
                </div>

                {/*The Confirm New Password Field*/}
                <div className='changePwdField'>
                    <label>Confirm Password</label>
                    <input
                    type= "text"
                    id = "username"
                    value = {confirmNewPassword}
                    placeholder='**********'
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    >
                    </input>
                </div>

            </form>


            </div>
        </div>
    );
}

export default ChangePwdPage;
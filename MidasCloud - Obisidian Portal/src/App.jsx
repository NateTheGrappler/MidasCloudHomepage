import { useState } from 'react'
import { Routes, Route } from 'react-router-dom';
import './App.css'
import LoginPage from './LoginPage.jsx'
import RegisterPage from './RegisterPage.jsx';

function App() {
  
  //use the router extension to load in both of the given apps at different paths within of the file since cloudflare doesnt care about
  //something like the internal react routing
  return (
    <Routes>
      <Route path="/" element={<LoginPage/>}/>
      <Route path="/register" element={<RegisterPage/>}/>
    </Routes>
  );
}

export default App

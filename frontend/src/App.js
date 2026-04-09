import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Submit from './pages/Submit';
import Verify from './pages/Verify';
import Explorer from './pages/Explorer';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/submit" element={<Submit />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/explorer" element={<Explorer />} />
      </Routes>
    </BrowserRouter>
  );
}

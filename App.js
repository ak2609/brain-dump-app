// App.js — the entry point.
// Keeps it simple: just render the HomeScreen.
// As your app grows and you add more screens, this is where you'd 
// set up navigation (like React Navigation's stack or tab navigator).

import React from 'react';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return <HomeScreen />;
}
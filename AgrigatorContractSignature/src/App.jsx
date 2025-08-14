import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SinglePriceComponent from './SinglePriceComponent';
import BatchPriceComponent from './BatchPriceComponent';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      
      <BatchPriceComponent />
    </>
  )
}

export default App

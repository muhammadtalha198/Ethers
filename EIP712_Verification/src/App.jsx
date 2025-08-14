import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SinglePriceComponent from './SinglePriceComponent';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <SinglePriceComponent />
    </>
  )
}

export default App

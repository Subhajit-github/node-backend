import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios'

function App() {
  const [jokes, setJokes] = useState([])

  useEffect(() => {
    axios.get('/api/jokes')
    .then((response) => {
      setJokes(response.data)
    })
    .catch((error) => {
      console.log(error)
    })
  })

  return (
    <>
      <h1>Basic FrontEnd</h1>
      <p>JOKES: {jokes.length}</p>

      {
        jokes.map((joke) =>(
          <div key={joke.id}>
          <p>{joke.setup}</p>
          <p>{joke.punchline}</p>
        </div>
        )
        )
      }
    </>
  )
}

export default App

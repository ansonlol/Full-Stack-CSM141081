import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App'
import './index.css'

axios.get(`${process.env.REACT_APP_API_URL}/api/persons`).then(response => {
  const notes = response.data
  ReactDOM.createRoot(document.getElementById('root')).render(<App notes={notes} />)
})

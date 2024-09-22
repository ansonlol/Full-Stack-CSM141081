import { useState } from 'react'

const StatisticLine = ({text, value}) =>{
  return(
    <tr>
       <td>{text}</td>
       <td>{value}</td>
    </tr>
  )
}
const Statistics= ({good, neutral, bad, total, average, positive}) =>{

  if (total === 0) {
    return <p>No feedback given</p>;
  }

  return(
    <div>
    <StatisticLine text="good" value ={good} />
    <StatisticLine text="neutral" value ={neutral} />
    <StatisticLine text="bad" value ={bad} />
    <StatisticLine text="all" value ={total} />
    <StatisticLine text="average" value ={average} />
    <StatisticLine text="positive" value={`${positive} %`} />
    </div>
  )
}
const App = () => {
  // save clicks of each button to its own state
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)


  const [average, setAverage] = useState(0)
  const [total, setTotal] = useState(0)
  const [positive, setPositive] = useState(0)

  const handlegood =()=>{
    const newGood = good +1
    setGood(newGood)
    update(newGood, neutral, bad)
  }
  const handleneutral =()=>{
    const newNeutral = neutral +1
    setNeutral(newNeutral)
    update(good, newNeutral, bad)
  }
  const handlebad =()=>{
    const newBad = bad+1
    setBad(newBad)
    update(good, neutral, newBad)
  }
  const update =(good, neutral, bad)=>{
    const newtotal = good+bad+neutral
    setTotal(newtotal)
    const newAverage =((good-bad)/newtotal)
    setAverage(newAverage)
    const newPositive = (good*100/newtotal)
    setPositive(newPositive)

  }

  return (
    <div>
      <h1>give feedback</h1>
      <button onClick={handlegood}>good</button>
      <button onClick={handleneutral}>neutral</button>
      <button onClick={handlebad}>bad</button>
      <h1>statistics</h1>
      <Statistics good={good} 
        neutral={neutral} 
        bad={bad} 
        total={total} 
        average={average} 
        positive={positive} 
        />


    </div>
  )
}

export default App
import { useState } from 'react'

const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
}

const Maxvote= ({anecdotes, vote})=>{
  return(
    <div>
      <h3>{anecdotes[vote.indexOf(Math.max(...vote))]}</h3>
    </div>
  )
}

const App = () => {
  const anecdotes = [
    'If it hurts, do it more often.',
    'Adding manpower to a late software project makes it later!',
    'The first 90 percent of the code accounts for the first 90 percent of the development time...The remaining 10 percent of the code accounts for the other 90 percent of the development time.',
    'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    'Premature optimization is the root of all evil.',
    'Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.',
    'Programming without an extremely heavy use of console.log is same as if a doctor would refuse to use x-rays or blood tests when diagnosing patients.',
    'The only way to go fast, is to go well.'
  ]
   
  const [selected, setSelected] = useState(0)
  const [vote, setVote] = useState(Array(anecdotes.length).fill(0))

  const nextline = () => {
    const randomIndex = getRandomNumber(0, anecdotes.length);
    setSelected(randomIndex);
  }

  const handlevote = ()=>{
    const copy = [...vote]
    copy[selected] +=1
    setVote(copy)
  }

  return (
    <div>
      <h2>Anecdote of the day</h2>
      <h3>{anecdotes[selected]}</h3>
      <h3>has {vote[selected]} votes</h3>
      <button onClick={handlevote}>vote</button>
      <button onClick={nextline}>next anecdotes</button>
      <h2>Anecdote with the most votes</h2>
      <Maxvote anecdotes={anecdotes} vote={vote}/>
    </div>
  )
}

export default App
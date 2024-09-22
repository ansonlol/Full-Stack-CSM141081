const Header = ({ courseName }) => <h2>{courseName}</h2>

const Total = ({ sum }) => <h3>Total of {sum} exercises</h3>

const Part = ({ part }) => 
  <p>
    {part.name} {part.exercises}
  </p>

const Content = ({ parts }) => 
  <>
    {parts.map(part=>(
      <Part key={parts.id} part ={part}/>
    ))}   
  </>

const Course = ({course}) =>{
  const total = course.parts.reduce((sum, part) => sum += part.exercises, 0)

  return(
    <div>
      <Header courseName={course.name}/>
      <Content parts={course.parts}/>
      <Total sum={total}/>
    </div>
  )
}

export default Course
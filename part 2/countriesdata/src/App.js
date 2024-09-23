import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Listcountry = ({countries, handleShowCountry}) =>{

  if(countries.length === 1){
    return <Onecountry country={countries[0]}/>
  }
  else if(countries.length >=11){
    return(<p>Too many matches, specify another filter</p>)
  }
  else{
    return(
    <ul>
      {countries.map((country) => <li key={country.name.common}>{country.name.common}
      <button onClick={()=>handleShowCountry(country)}>show</button>
      </li>)}
      
    </ul>
    )
  }
}

const Onecountry = ({country}) =>{
  return(
    <div>
      <h2>{country.name.common}</h2>
      <p>Capital: {country.capital}</p>
      <p>Area: {country.area}</p>
      <h3>Languages:</h3>
      <ul>
      {Object.values(country.languages).map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      <img src={country.flags.png} alt={`Flag of ${country.name.common}`} width="150" />
    </div>
  )
}


const App = () =>{
  const [query, setQuery] = useState('')
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);

  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then((response) => {
        setCountries(response.data);
      });
  }, []);

  useEffect(()=>{
    if(query===''){
      setFilteredCountries([])
    }
    else{
      const lowercaseQuery = query.toLowerCase()
      const matchedCountries = countries.filter((c) => 
      c.name.common.toLowerCase().includes(lowercaseQuery))
      setFilteredCountries(matchedCountries)
    }
  }, [query, countries])

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  const handleShowCountry = (country) => {
    setFilteredCountries([country]);
  };

  return(
    <div>
      find countries <input value = {query} onChange = {handleQueryChange}/>
      <Listcountry countries={filteredCountries} handleShowCountry={handleShowCountry}/>
    </div>
  )
}

export default App;
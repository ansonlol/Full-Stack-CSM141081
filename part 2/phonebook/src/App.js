import { useState, useEffect } from 'react';
import axios from 'axios';
import personService from './personService';

const Filter = ({ search, handleSearch }) => {
  return (
    <div>
      filter shown with:
      <input value={search} onChange={handleSearch} />
    </div>
  );
};

const PersonForm = ({ addName, newName, handleChange, newPhone, handlePhone }) => {
  return (
    <form onSubmit={addName}>
      <div>
        name: <input value={newName} onChange={handleChange} />
      </div>
      <div>
        number: <input value={newPhone} onChange={handlePhone} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  );
};

const Persons = ({ filterPerson, handleRemove }) => {
  return (
    <div>
      {filterPerson.map((person) => (
        <h3 key={person.id}>
          {person.name} {person.number}
          <button onClick={() => handleRemove(person.id)}>delete</button>
        </h3>
      ))}
    </div>
  );
};

const Notification = ({ successMessage, errorMessage }) => {
  if (errorMessage) {
    return <div className="errorMessage">{errorMessage}</div>;
  } else if (successMessage) {
    return <div className="sucessMessage">{successMessage}</div>;
  } else {
    return null; // No message to show
  }
};

const App = () => {
  const [persons, setPersons] = useState([]); // Start with an empty array
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [search, setSearch] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Fetch data from the server
    personService.getAll().then((initialPersons) => {
      setPersons(initialPersons);
    });
  }, []);

  const addName = (event) => {
    event.preventDefault();

    const checkexist = persons.find((person) => person.name === newName);

    if (checkexist) {
      if (
        window.confirm(
          `${newName} is already added to the phonebook, replace the old number with a new one?`
        )
      ) {
        const existperson = { ...checkexist, number: newPhone };
        personService.update(checkexist.id, existperson).then((returnedPerson) => {
          setPersons(
            persons.map((p) => (p.id !== checkexist.id ? p : returnedPerson))
          );
          setNewName('');
          setNewPhone('');
          setSuccessMessage(`Updated ${newName}`);
          setTimeout(() => {
            setSuccessMessage(null);
          }, 5000);
        })
        .catch((error)=>{
          setErrorMessage(`Information of ${newName} has already been removed from the server`)
          setPersons(persons.filter((p) => p.id !== checkexist.id)); // Remove the deleted person from UI
            setTimeout(() => {
              setErrorMessage(null);
            }, 5000)
        })
      }
    } else {
      const newPerson = { name: newName, number: newPhone }; // Unique ID

      personService.create(newPerson).then((returnedPerson) => {
        setPersons(persons.concat(returnedPerson));
        setNewName('');
        setNewPhone('');
        setSuccessMessage(`Added ${newName}`);
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      })
      .catch((error)=>{
        setErrorMessage(`Failed to add ${newName}`)
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000);
      })
    }
  };

  const handleChange = (event) => {
    setNewName(event.target.value);
  };

  const handlePhone = (event) => {
    setNewPhone(event.target.value);
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  const handleRemove = (id) => {
    const personToDelete = persons.find((p) => p.id === id);
    if (window.confirm(`Delete ${personToDelete.name}?`)) {
      personService.remove(id).then(() => {
      setPersons(persons.filter((person) => person.id !== id));
        
      })
      .catch((error) => {
        setErrorMessage(`Failed to delete ${personToDelete.name}. The person may have already been removed.`);
        setTimeout(() => {
          setErrorMessage(null);
        }, 5000)
      })
    }
  };

  const filterPerson = persons.filter((person) =>
    person.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification successMessage={successMessage} errorMessage={errorMessage}/>
      
      <Filter search={search} handleSearch={handleSearch} />
      <h2>Add a new</h2>
      <PersonForm
        addName={addName}
        newName={newName}
        handleChange={handleChange}
        newPhone={newPhone}
        handlePhone={handlePhone}
      />
      <h2>Numbers</h2>
      <Persons filterPerson={filterPerson} handleRemove={handleRemove} />
    </div>
  );
};

export default App;

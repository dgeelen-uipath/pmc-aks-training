// App.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");

  useEffect(() => {
    axios.get("http://localhost:3000/api/todo")
      .then(res => {
        setTodos(res.data);
      });
  }, []);

  function addTodo() {
    axios.post("http://localhost:3000/api/todo", { title: newTodo })
      .then(res => {
        setTodos([...todos, { id: res.data, title: newTodo }]);
        setNewTodo("");
      });
  }

  function deleteTodo(id) {
    axios.delete(`http://localhost:3000/api/todo/${id}`)
      .then(() => {
        setTodos(todos.filter(todo => todo.id !== id));
      });
  }

  return (
    <div>
      <h1>Todo App</h1>
      <input 
        value={newTodo} 
        onChange={e => setNewTodo(e.target.value)} 
        type="text" 
        placeholder="Add a todo" 
      />
      <button onClick={addTodo}>Add Todo</button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.title}
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
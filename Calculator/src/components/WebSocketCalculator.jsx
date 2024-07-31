import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './Calculator.css';

const WebSocketCalculator = () => {
  const [display, setDisplay] = useState('');
  const [logs, setLogs] = useState([]);
  const socket = io('http://localhost:5000'); // Ensure this matches your server's address

  useEffect(() => {
    socket.on('log', (log) => {
      setLogs((prevLogs) => [log, ...prevLogs]);
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  const appendCharacter = (char) => {
    setDisplay(display + char);
  };

  const clearDisplay = () => {
    setDisplay('');
  };

  const deleteLast = () => {
    setDisplay(display.slice(0, -1));
  };

  const calculate = async () => {
    if (!display) {
      alert('Expression is empty');
      return;
    }

    let isValid = true;
    let output;
    try {
      output = eval(display);
      setDisplay(output.toString());
    } catch (e) {
      isValid = false;
      output = null;
      alert('Expression is invalid');
    }

    try {
      await axios.post('http://localhost:5000/api/logs', {
        expression: display,
        isValid,
        output
      });
    } catch (error) {
      console.error('Error logging expression:', error);
    }
  };

  return (
    <div className="container">
      <div className="calculator">
        <div className="display">
          <input type="text" value={display} readOnly />
        </div>
        <div>
          <button onClick={clearDisplay}>AC</button>
          <button onClick={deleteLast}>DC</button>
          <button onClick={() => appendCharacter('.')}>.</button>
          <button onClick={() => appendCharacter('/')}>/</button>
        </div>
        <div>
          <button onClick={() => appendCharacter('7')}>7</button>
          <button onClick={() => appendCharacter('8')}>8</button>
          <button onClick={() => appendCharacter('9')}>9</button>
          <button onClick={() => appendCharacter('*')}>*</button>
        </div>
        <div>
          <button onClick={() => appendCharacter('4')}>4</button>
          <button onClick={() => appendCharacter('5')}>5</button>
          <button onClick={() => appendCharacter('6')}>6</button>
          <button onClick={() => appendCharacter('-')}>-</button>
        </div>
        <div>
          <button onClick={() => appendCharacter('1')}>1</button>
          <button onClick={() => appendCharacter('2')}>2</button>
          <button onClick={() => appendCharacter('3')}>3</button>
          <button onClick={() => appendCharacter('+')}>+</button>
        </div>
        <div>
          <button onClick={() => appendCharacter('00')}>00</button>
          <button onClick={() => appendCharacter('0')}>0</button>
          <button className="equal" onClick={calculate}>=</button>
        </div>
      </div>
      <div className="log-table-container">
        <table className="log-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Expression</th>
              <th>Is Valid</th>
              <th>Output</th>
              <th>Created On</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log._id}>
                <td>{log._id}</td>
                <td>{log.expression}</td>
                <td>{log.is_valid ? 'Yes' : 'No'}</td>
                <td>{log.output}</td>
                <td>{new Date(log.created_on).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WebSocketCalculator;

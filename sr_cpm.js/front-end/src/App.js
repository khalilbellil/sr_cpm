import React, { Component } from 'react';
import './App.css';
import Cpm from './components/Cpm';
import { Row } from 'reactstrap';

class App extends Component {
  state = {
    
  }

  componentDidMount(){
    
  }

  render() {
    return (
      <div className="App container-fluid" style={{width:"100%"}}>
        <Cpm />
      </div>
    );
  }
}

export default App;

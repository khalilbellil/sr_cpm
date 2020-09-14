import React, { Component } from 'react';
import './App.css';
import Cpm from './components/Cpm';
import UploadFile from './components/UploadFile';
import AddressAutoComplete from './components/AddressAutoComplete';

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
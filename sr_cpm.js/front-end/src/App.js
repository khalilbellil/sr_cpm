import React, { Component } from 'react';
import './App.css';
import Cpm from './components/Cpm';
import UploadFile from './components/UploadFile';
import {PlacesAutocomplete} from './components/PlacesAutocomplete'

class App extends Component {
  state = {
    
  }

  componentDidMount(){
  }

  render() {
    return (
      <div className="App container-fluid" style={{width:"100%"}}>
        <PlacesAutocomplete />
      </div>
    );
  }
}

export default App;
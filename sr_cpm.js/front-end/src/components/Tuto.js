import React, { Component } from 'react';
import './App.css';

class Tuto extends Component {

  state = {
    tutos: [],
    tuto: {
      id: '',
      title: 'title',
      description: 'description'
    }
  }

  componentDidMount(){
    this.getTutorials()
  }

  getTutorials = _ => {
    fetch('http://localhost:4000/tuto')
    .then(response => response.json())
    .then(response => this.setState({ tutos: response.data}))
    .catch(err => console.log(err))
  }

  renderUser = ({ id, title, description}) => <div key={id}>{title} | {description}</div>

  addUser = _ => {
    const { tuto } = this.state
    fetch(`http://localhost:4000/tuto/add?title=${tuto.title}&email=${tuto.description}`)
    .then(this.getUsuarios)
    .catch( err => console.log(err))
  }

  render() {
    const { tutos, tuto } = this.state
    return (
      <div className="App">
        {tutos.map(this.renderUser)}

        <div>
            <input
            value={tuto.title}
            onChange={e => this.setState({ tuto: {...tuto, title:e.target.value}})} />
            <input
            value={tuto.description}
            onChange={e => this.setState({ tuto: {...tuto, description:e.target.value}})} />
            <button onClick={this.addUser}> Nouveau tuto</button>
        </div>
      </div>
    );
  }
}

export default Tuto;

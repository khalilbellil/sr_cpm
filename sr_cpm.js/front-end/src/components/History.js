import React, { Component } from 'react';
import { Row, Col, Table } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import "../styles/cpm.css";

class History extends Component {
  constructor(props) {
    super(props);
    this.state = {
        uid_client: (props.uid_client)?props.uid_client:0,
        history: []
    };
  }

  componentDidMount(){
    this.getHistory()
  }

  getHistory(){
    fetch(`http://localhost:4000/client_history/get?uid_client=${this.state.uid_client}`)
    .then(response => response.json())
    .then(response => this.setState({ history: response.data}))
    .catch(err => console.log(err))
  }

  render() {
    return (
        <Row>
            <Col style={{textAlign:"center", color:"#F9B233", padding:0, border: "solid 2px #F9B233", borderRadius: "6px"}}>
                <h3 style={{textShadow: "2px 2px #118BCF"}}>Historique</h3>
                <Table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Action</th>
                            <th>Par</th>
                        </tr>
                    </thead>
                    <tbody>
                    {this.state.history.map((h) => {
                        return (
                        <tr>
                            <td>{h.sn_cdate}</td>
                            <th scope="row">{h.msg}</th>
                            <td>{h.followup_agent}</td>
                        </tr>
                        )})
                    }

                    </tbody>
                </Table>
            </Col>
        </Row>
    );
  }
}

export default History;

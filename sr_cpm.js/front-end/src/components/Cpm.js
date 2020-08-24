import React, { Component } from 'react';
import { Row, Input, Col } from 'reactstrap';
import Client from './Client';
import Project from './Project';
import History from './History';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import "../styles/cpm.css";

class Cpm extends Component {
  constructor(props) {
    super(props);
    this.state = {
        uid_client: (props.uid_client)?props.uid_client:0
    };
  }

  render() {
    return (
      <Row>
        <div className="col-2">
          <History />
        </div>
        <Col>
            <Client uid_client={this.state.uid_client} ref="clientPanel"/>
            <Row style={{paddingLeft:"1%",paddingRight:"1%"}}>
                <Input className="col-2 btn btn-primary" type="button" onclick="getNextClient()" value="Next Client" 
                    style={{border:"solid 3px #118BCF",backgroundColor:"#F9B233",color:"#00517E",boxShadow:"0px 6px 6px rgba(0, 0, 0, 0.35)",borderRadius: "25px"}}
                />
                <div className="col-7"></div>
                <p className="col-2" style={{fontSize:"12px",backgroundColor:"#F9B233",border:"solid 3px #118BCF",boxShadow:"0px 6px 6px rgba(0, 0, 0, 0.35)",
                color:"#00517E",borderRadius: "25px"}}>Client <b id="b_client_uid" ref={this.b_client_uid}>{this.state.uid_client}</b></p>
                <div className="col-1">
                    <FontAwesomeIcon icon={faEyeSlash} style={{backgroundColor:"#F9B233",fontSize:"20px",border:"solid 3px #118BCF",
                    boxShadow:"0px 6px 6px rgba(0, 0, 0, 0.35)",cursor: "pointer",color:"#00517E",borderRadius: "25px"}} 
                    />
                </div>
            </Row>
            <br />
            <Row style={{paddingLeft:"1%", paddingRight:"1%", paddingBottom:"3%"}}>
              <Project uid_project="206763" />
            </Row>
        </Col>
      </Row>
    );
  }
}

export default Cpm;

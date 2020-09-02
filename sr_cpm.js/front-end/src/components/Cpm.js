import React, { Component } from 'react';
import { Row, Input, Col } from 'reactstrap';
import Client from './Client';
import Project from './Project';
import History from './History';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import "../styles/cpm.css";
import down_arrow_icon from "../img/right-arrow.png";

class Cpm extends Component {
  constructor(props) {
    super(props);
    this.state = {
        uid_client: (props.uid_client)?props.uid_client:0,
        uids_projects:[],
        history:[],
        reload_history: false
    };
  }
  
  componentDidMount() {
    this.setState({reload_history: true})
  }

  setStateValue(actual_object, object_name, variable, value){
    if (actual_object !== undefined){
      actual_object[variable] = value
      switch (object_name) {
        case "history":
          this.setState({history:actual_object})
          break;
      }
    }
  }
  setStateObject(object_name, object_value){
    let actual_state = this.state
    actual_state[object_name] = object_value
    this.setState(actual_state);
  }
  setStateObjects(object_name, object_values){
    let actual_state = this.state

    object_values.map((s, i) =>
    {
      actual_state[object_name][i] = s
    }
    )
    
    this.setState(actual_state);
  }
  saveAjax(table, uid, one, one_val){
    fetch(`http://localhost:4000/update/one?table=${table}&uid=${uid}&one=${one}&one_val=${one_val}`)
    .then(response => response.json())
    .catch(err => console.log(err))
  }
  showHideElement(uid_element){
    var element = document.getElementById(uid_element)
    if (element.style.display === "none")
      element.style.display = "block"
    else
      element.style.display = "none"
  }
  hidePanel(){
    this.showHideElement("tohide_history");
    this.showHideElement("toshow_history");
  }

  handleHistoryChange = (value) =>{
    if (this.state.reload_history === true){
      this.setState({reload_history: true})
      this.setState({reload_history: false})
    }
    else{
      this.setState({reload_history: true})
    }
  }

  render() {
    return (
      <Row>
        <div className="col-1" id="toshow_history" style={{display:"none", maxWidth:"50px"}}>
          <img width="40px" src={down_arrow_icon} alt="Cacher" onClick={() => this.hidePanel()}></img>
        </div>
        <div className="col-3" id="tohide_history">
          <History uid_client={this.state.uid_client} reload_history={this.state.reload_history}/>
          
        </div>
        <Col>
            <Client uid_client={this.state.uid_client} ref="clientPanel"/>
            
            <Row style={{paddingLeft:"1%",paddingRight:"1%",paddingTop:"1%"}} className="cpm_btns">
                <Input className="col btn sr-btn" type="button" id="b_client_uid" value={"Client #"+this.state.uid_client}
                    style={{fontSize:"15px", border:"solid 3px #393939",backgroundColor:"#00517E",color:"white",boxShadow:"0px 6px 6px rgba(0, 0, 0, 0.35)",borderRadius: "10px"}}
                />
                <div className="col-8"></div>
                <Input className="col-2 btn sr-btn" type="button" onclick="" value="Next Client" 
                    style={{fontSize:"15px", border:"solid 3px #393939",backgroundColor:"#00517E",color:"white",boxShadow:"0px 6px 6px rgba(0, 0, 0, 0.35)",borderRadius: "10px"}}
                />
            </Row>
            <br />
            <Row style={{paddingLeft:"1%", paddingRight:"1%", paddingBottom:"3%"}}>
              <Project uid_project="206763" onReloadHistory={this.handleHistoryChange}/>
            </Row>
        </Col>
      </Row>
    );
  }
}

export default Cpm;

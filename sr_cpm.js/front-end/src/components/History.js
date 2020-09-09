import React, { Component } from 'react';
import { Row, Col, Table } from 'reactstrap';
import "../styles/cpm.css";
import { format } from 'date-fns';
import top_arrow_icon from "../img/left-arrow.png";

class History extends Component {
  constructor(props) {
    super(props);
    this.state = {
        uid_client: props.uid_client,
        history: [],
        reload: props.reload_history
    };
  }

  componentDidMount(){ 
  }
  componentWillReceiveProps(props){
    if (props.reload_history === true){
      this.getHistory(props.uid_client);
    }
    if (this.state.reload === false)
      this.setState({reload: props.reload_history})
    if (props.uid_client !== this.state.uid_client){
      this.getHistory(props.uid_client)
    }
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

  addHistory(uid_msg, comments){
    fetch(`http://localhost:4000/client_history/add?uid_msg=${uid_msg}&uid_client=${this.state.project.uid_client}&uid_project=${this.state.uid_project}
    &username=${this.state.username}&comments=${comments}`)
    .catch(err => alert.log(err))
  }
  getHistory(uid){
    this.state.history = []
    fetch(`http://localhost:4000/client_history/get_by_client?uid_client=${uid}
    &lg=fr`)
    .then(response => response.json())
    .then(response => this.setStateObjects("history", response.data))
    .catch(err => console.log(err))
  }
  hidePanel(){
    this.showHideElement("tohide_history");
    this.showHideElement("toshow_history");
  }

  render() {
    return (
        <Row id="history_pane">
            <Col style={{textAlign:"center", color:"#393939", padding:0, border: "solid 6px #393939", borderRadius: "6px"}}>
                <h3>Historique <img width="40px" id="hide_history" src={top_arrow_icon} alt="Cacher" onClick={() => this.hidePanel()}></img></h3>
                <Table style={{fontSize:"12px"}}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Action</th>
                            <th>Par</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                      this.state.history.map((h) => {
                          if (this.state.reload === true){
                            return (
                            <tr>
                                <td>{format(new Date(h.sn_cdate), 'yyyy-MM-dd hh:mm:ss a')}</td>
                                <th scope="row">{h.msg}</th>
                                <td>{h.followup_agent}</td>
                            </tr>
                            )
                          }
                      })
                    }
                    </tbody>
                </Table>
            </Col>
        </Row>
    );
  }
}

export default History;
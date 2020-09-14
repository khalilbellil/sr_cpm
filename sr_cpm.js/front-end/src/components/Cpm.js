import React, { Component } from 'react';
import { Row, Col, Input, Button, Card, CardTitle, CardText} from 'reactstrap';
import Popup from "reactjs-popup";
import Client from './Client';
import Project from './Project';
import History from './History';
import "../styles/cpm.css";
import down_arrow_icon from "../img/right-arrow.png";

class Cpm extends Component {
  constructor(props) {
    super(props);
    this.state = {
        uid_client: props.uid_client,
        uids_projects:[],
        history:[],
        reload_history: false,
        username: "Khalil",
        already_locked: "yes",
        popup_open_search_client: false,
        search_value: ""
    };
  }
  
  componentDidMount() {
    if (this.state.uid_client === undefined){
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('uid_client') !== null){
        this.setState({uid_client: urlParams.get('uid_client')})
        this.setState({reload_history: true})
        this.unlockClient()
        this.lockClient(urlParams.get('uid_client'))
      }
    }
  }
  setStateValue(actual_object, object_name, variable, value){
    if (actual_object !== undefined){
      actual_object[variable] = value
      switch (object_name) {
        case "history":
          this.setState({history:actual_object})
          break;
          
        default:
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
  getClientProjectsUids(uid){
    this.state.uids_projects = []
    fetch('http://localhost:4000/client/get_projects?uid_client='+uid)
    .then(response => response.json())
    .then(response => this.setStateObjects("uids_projects", response.data))
    .catch(err => alert(err))
  }
  createProject(){
    fetch('http://localhost:4000/projects/new?uid_client='+this.state.uid_client)
    .then(() => {
      this.setState({reload_history: true})
      this.unlockClient()
      this.lockClient(this.state.uid_client)
    })
    .catch(err => alert(err))
  }
  lockClient(uid_client){
    if(uid_client !== undefined){
      fetch(`http://localhost:4000/clients/lock?uid_client=${uid_client}&origin=gestion-client&username=${this.state.username}`)
      .then(response => response.json())
      .then(response => {
        (response.data.already_locked === "no")?this.getClientProjectsUids(uid_client):alert("Client déjà verrouillé")
        this.setState({already_locked: response.data.already_locked})
      })
      .catch(err => alert(err))
    }
  }
  unlockClient(){
    fetch(`http://localhost:4000/clients/unlock?origin=gestion-client&username=${this.state.username}`)
    .catch(err => alert(err))
  }
  getNextClient(){
    fetch(`http://localhost:4000/clients/get_next_client?username=${this.state.username}&origin=gestion-client&lg=fr`)
    .then(response => response.json())
    .then(response => {
      if (response.data.found !== "no"){
        this.getClientProjectsUids(response.data[0].uid)
        this.setState({uid_client: response.data[0].uid})
        this.setState({reload_history: true})
        this.unlockClient()
        this.lockClient(response.data[0].uid)
      }else{
        alert("Aucun client trouvé")
      }
    })
    .catch(err => alert(err))
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
  searchClient(new_tab){
    if (this.state.search_value !== ""){
      if (this.state.search_value[0] === ":"){

      }else if (this.state.search_value[0] === "#"){

      }else{
        var url = window.location.href.split('?')[0] + "?uid_client=" + this.state.search_value
        if (new_tab){
          window.open(url, "_blank")
        }else{
          window.open(url, "_self")
        }
      }
    }
    this.setState({ popup_open_search_client: false })
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
            <Client uid_client={this.state.uid_client} already_locked={this.state.already_locked} ref="clientPanel"/>
            <Row style={{paddingLeft:"1%",paddingRight:"1%",paddingTop:"1%"}} className="cpm_btns">
                <Input className="col-3 btn sr-btn" type="button" id="b_client_uid" value={(this.state.uid_client !== undefined)?"Client #"+this.state.uid_client:"Aucun"}
                    style={{fontSize:"15px", border:"solid 3px #393939",backgroundColor:"#00517E",color:"white",boxShadow:"0px 6px 6px rgba(0, 0, 0, 0.35)",borderRadius: "10px"}}/>
                <div className="col-1"></div>
                {(this.state.uid_client === undefined)?(
                  <Input className="col-2 btn sr-btn" type="button" value="Nouveau projet" onClick={() => this.createProject()} 
                  style={{fontSize:"15px", border:"solid 3px #393939",backgroundColor:"#00517E",color:"white",boxShadow:"0px 6px 6px rgba(0, 0, 0, 0.35)",borderRadius: "10px"}} disabled/>
                ):(
                  <Input className="col-2 btn sr-btn" type="button" value="Nouveau projet" onClick={() => this.createProject()} 
                  style={{fontSize:"15px", border:"solid 3px #393939",backgroundColor:"#00517E",color:"white",boxShadow:"0px 6px 6px rgba(0, 0, 0, 0.35)",borderRadius: "10px"}}/>
                )}
                <div className="col-1"></div>
                <Input className="col-2 btn sr-btn" type="button" value="Recherche client" onClick={() => this.setState({ popup_open_search_client: true })} 
                style={{fontSize:"15px", border:"solid 3px #393939",backgroundColor:"#00517E",color:"white",boxShadow:"0px 6px 6px rgba(0, 0, 0, 0.35)",borderRadius: "10px"}} />
                <Popup
                  onClose={() => this.setState({ popup_open_search_client: false })}
                  closeOnDocumentClick
                  open={this.state.popup_open_search_client}
                >
                  <span>
                    <Card body inverse style={{ backgroundColor: '#393939', borderColor: '#F9B233', borderWidth: "4px", padding:"10px", color: "white" }}>
                      <CardTitle id="popupbox_title" style={{textAlign:"center"}}>Recherche client</CardTitle>
                      <Input type="text" placeholder="client(35702),projet(#12321),tel(:5142134323)" value={this.state.search_value} onChange={(val)=>{this.setState({search_value: val.target.value});}}/>
                      <br/>
                      <Row>
                        <Button className="col ml-3" id="popupbox_button" onClick={()=> {this.searchClient(true)}}>Rechercher(Nouvelle fenêtre)</Button>
                        <Button className="col ml-1" id="popupbox_button" onClick={()=> {this.searchClient(false)}}>Rechercher(Même fenêtre)</Button>
                        <Button className="col ml-1 mr-3" id="popupbox_button" onClick={()=> {this.setState({ popup_open_search_client: false })}}>Annuler</Button>
                      </Row>
                    </Card>
                  </span>
                </Popup>
                <div className="col-1"></div>
                <Input className="col-2 btn sr-btn" type="button" onClick={() => this.getNextClient()} value="Next Client" 
                    style={{fontSize:"15px", border:"solid 3px #393939",backgroundColor:"#00517E",color:"white",boxShadow:"0px 6px 6px rgba(0, 0, 0, 0.35)",borderRadius: "10px"}}/>
            </Row>
            <br />
            {
              this.state.uids_projects.map((p, i) =>
              (
                <Row style={{paddingLeft:"1%", paddingRight:"1%", paddingBottom:"3%"}}>
                  <Project uid_project={p.uid} onReloadHistory={this.handleHistoryChange}/>
                </Row>
              )
            )}
        </Col>
      </Row>
    );
  }
}

export default Cpm;

import React, { Component} from 'react';
import { Row, Col, Input, Label, Form, FormGroup, Button, Card, CardTitle, CardText} from 'reactstrap';
import { Editor } from '@tinymce/tinymce-react';
import google_map_logo from "../img/google-maps-round.png";
import call_logo from "../img/call.png";
import call_back_later_logo from "../img/call_back_later_logo.png";
import activate_logo from "../img/activate_logo.png";
import cancel_logo from "../img/cancel_logo.png";
import email_logo from "../img/email_logo.png";
import clipart from "../img/clipart.png";
import duplicate_logo from "../img/duplicate_logo.png";
import flag_for_review_logo from "../img/flag_for_review_logo.png";
import flag_for_review_logo_green from "../img/flag_for_review_logo_green.png";
import top_arrow_icon from "../img/top_arrow_icon.png";
import down_arrow_icon from "../img/down_arrow_icon.png";
import { format } from 'date-fns';
import Popup from "reactjs-popup";
import $ from "jquery";
import "../styles/cpm.css";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";
import useOnclickOutside from "react-cool-onclickoutside";

class Project extends Component 
{
  constructor(props) {
        super(props);
        this.state = {
            uid_project: (props.uid_project)?props.uid_project:0,
            username: "Khalil",
            uid_user: 335,
            project: [],
            services: [],
            subservices: [],
            address: [],
            complete_address: "",
            service_questions: [],
            popup_open_send_questions: false,
            popup_open_call_back_later: false,
            popup_open_flag_for_review: false,
            callbacklater:[],
            flagforreview:"",
            uid_cancel_reason: undefined,
            message_cancel_reason: undefined,
            cancel_reasons: [],
            message_question: "",
            nb_files: 0,
            popup_open_files: false
        };
  }
  componentDidMount() {
    this.getProject(this.state.uid_project);
  }

//#region FUNCTIONS
  setStateValue(actual_object, object_name, variable, value){
    if (actual_object !== undefined){
      actual_object[variable] = value
      switch (object_name) {
        case "project":
          this.setState({project:actual_object})
          break;
      
        case "address":
          this.setState({address:actual_object})
          break;
  
        case "history":
          this.setState({history:actual_object})
          break;

        case "cancel_reasons":
          this.setState({cancel_reasons:actual_object})
          break;

        case "callbacklater":
          this.setState({callbacklater:actual_object})
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
    fetch(`http://ssrv5.sednove.com:4000/update/one?table=${table}&uid=${uid}&one=${one}&one_val=${one_val}`)
    .then(response => response.json())
    .catch(err => console.log(err))
  }
  
  getProject = (uid) => {
    fetch('http://ssrv5.sednove.com:4000/projects/get?uid='+uid)
    .then(response => response.json())
    .then(response => {this.setStateObject("project", response.data[0])})
    .then(() => {this.getServices()})
    .then(() => {this.getSubServices()})
    .then(() => {this.getAddress()})
    .then(() => {
      if(this.state.project.delay_from !== undefined && this.state.project.delay_from !== null && this.state.project.delay_from !== "0000-00-00"){
        this.setStateValue(this.state.project, "project", "delay_from", format(new Date(this.state.project.delay_from), 'yyyy-MM-dd'))
      }
      if(this.state.project.delay_to !== undefined && this.state.project.delay_to !== null && this.state.project.delay_to !== "0000-00-00"){
        this.setStateValue(this.state.project, "project", "delay_to", format(new Date(this.state.project.delay_to), 'yyyy-MM-dd'))
      }
      if(this.state.project.sn_cdate !== undefined && this.state.project.sn_cdate !== null && this.state.project.sn_cdate !== "0000-00-00"){
        this.setStateValue(this.state.project, "project", "sn_cdate", format(new Date(this.state.project.sn_cdate), 'yyyy-MM-dd hh:mm:ss a'))
      }
      this.countFiles()
    })
    .then(() => this.getCallBackLater())
    .then(() => this.getFlagForReview())
    .then(() => this.getCancelReasons())
    .catch(err => alert("getProject, err: " + err))
  }
  countFiles(){
    var count = 0;
    if (this.state.project.file1 !== undefined && this.state.project.file1 !== null && this.state.project.file1 !== ""){
      count ++;
    }
    if (this.state.project.file2 !== undefined && this.state.project.file2 !== null && this.state.project.file2 !== ""){
      count ++;
    }
    if (this.state.project.file3 !== undefined && this.state.project.file3 !== null && this.state.project.file3 !== ""){
      count ++;
    }
    if (this.state.project.file4 !== undefined && this.state.project.file4 !== null && this.state.project.file4 !== ""){
      count ++;
    }
    if (this.state.project.file5 !== undefined && this.state.project.file5 !== null && this.state.project.file5 !== ""){
      count ++;
    }
    this.setState({nb_files: count})
  }
  getAddress(){
    fetch('http://ssrv5.sednove.com:4000/address?uid='+this.state.project.uid_address)
    .then(response => response.json())
    .then(response => {
      if (response.data[0] !== undefined){
        this.setStateObject("address", response.data[0])
        this.setState({complete_address: this.state.address.street_no + " " +this.state.address.street + " " + this.state.address.city + " " + this.state.address.province + " " + this.state.address.zip})
      }
    })
    .catch(err => alert(err))
  }
  saveAjaxAddress(table, uid, one, one_val){
    if (this.state.address.uid !== undefined){
      fetch(`http://ssrv5.sednove.com:4000/update/one?table=${table}&uid=${uid}&one=${one}&one_val=${one_val}`)
      .then(response => response.json())
      .catch(err => console.log(err))
    }else{
      fetch(`http://ssrv5.sednove.com:4000/address/add?one=${one}&one_val=${one_val}&uid_client=${this.state.project.uid_client}`)
      .then(response => response.json())
      .then(response => {
        alert(response.data.uid_address)
        this.setStateValue(this.state.project, "project", "uid_address", response.data.uid_address);
        this.saveAjax("sr_project", this.state.uid_project, "uid_address", response.data.uid_address)
        this.getAddress()
      })
      .catch(err => console.log(err))
    }
  }
  getServices(){
    fetch('http://ssrv5.sednove.com:4000/services')
    .then(response => response.json())
    .then(response => this.setStateObjects("services", response.data))
    .then(()=>{
      this.getServiceQuestions();
    })
    .catch(err => alert(err))
  }
  getSubServices(){
    if(this.state.project.uid_service !== undefined)
      fetch('http://ssrv5.sednove.com:4000/subservices?uid_service='+this.state.project.uid_service)
      .then(response => response.json())
      .then(response => this.setStateObjects("subservices", response.data))
      .catch(err => alert(err))
  }
  getNewSubServices(uid){
      fetch('http://ssrv5.sednove.com:4000/subservices?uid_service='+uid)
      .then(response => response.json())
      .then(response => this.setStateObjects("subservices", response.data))
      .then(response => {this.setStateValue(this.state.project, "project", "uid_service", uid);document.getElementById("subservice_"+this.state.uid_project).value="0"})
      .then(() => this.getServiceQuestions())
      .catch(err => alert(err))
  }
  getServiceQuestions(){
    this.state.service_questions = []
    fetch('http://ssrv5.sednove.com:4000/service_questions?uid_service='+this.state.project.uid_service)
    .then(response => response.json())
    .then(response => this.setStateObjects("service_questions", response.data))
    .catch(err => alert(err))
  }
  getCancelReasons(){
    fetch('http://ssrv5.sednove.com:4000/projects/get_cancel_reasons')
    .then(response => response.json())
    .then(response => this.setStateObjects("cancel_reasons", response.data))
    .catch(err => alert(err))
  }
  activateProject(){
    if(this.state.project.status !== "active")
      fetch('http://ssrv5.sednove.com:4000/projects/activate?uid='+this.state.uid_project)
      .then(() => {
        console.log("(TODO) automail::projectActivatedClient(uid) or projectActivatedEmpoyee(uid) then automail::projectActivatedAdmin(uid)");
        this.getProject(this.state.uid_project);
        this.addHistory("8", "")
        this.setState({ popup_open_activate: false })
      })
      .catch(err => console.log(err))
    else
      alert("Project already activated !")
  }
  cancelProject(){
    if(this.state.project.status !== "cancelled-before-qualification" && this.state.project.status !== "cancelled-after-qualification")
      fetch(`http://ssrv5.sednove.com:4000/projects/cancel?uid=${this.state.uid_project}&status=${this.state.project.status}&uid_cancel_reason=${(this.state.uid_cancel_reason === undefined)?"0":this.state.uid_cancel_reason}
      &message=${this.state.message_cancel_reason}&uid_client=${this.state.project.uid_client}&uid_user=${this.state.uid_user}`)
      .then(() => {
        console.log("(TODO) automail::projectCanceled(uid)");
        this.getProject(this.state.uid_project);
        this.addHistory("7", "")
        this.setState({ popup_open_cancel: false })
      })
      .catch(err => alert(err))
    else
      alert("Projet déjà annulé !")
  }
  showHideElement(uid_element){
    var element = document.getElementById(uid_element)
    if (element.style.display === "none")
      element.style.display = "block"
    else
      element.style.display = "none"
  }
  getCheckedQuestions(){
    var uid_questions = ""
    var i = 0;
    var checkboxes = [];
    $("input:checkbox[name=question]:checked").each(function(){
      checkboxes.push(this);
    });
    for (var checkbox of checkboxes) {
        var str = checkbox.id
        var final_id = str.replace("question_","")
        uid_questions += final_id
        if (i !== checkboxes.length - 1 && checkboxes.length !== 1)
          uid_questions += ","
        i++
    }
    this.sendQuestionsEmail("clientsProjectQuestions", uid_questions)
  }
  sendQuestionsEmail(name, uid_questions){
    fetch(`http://ssrv5.sednove.com:4000/nodemailer/sendquestions?uid_client=${this.state.project.uid_client}&uid_questions=${uid_questions}&uid_service=${this.state.project.uid_service}
    &message=${this.state.message_question}&name=${name}`)
    .then(() => {
      this.addHistory("2", "");
      this.setState({ popup_open_send_questions: false });
    })
    .catch(err => alert(err))
  }
  addHistory(uid_msg, comments){
    fetch(`http://ssrv5.sednove.com:4000/client_history/add?uid_msg=${uid_msg}&uid_client=${this.state.project.uid_client}&uid_project=${this.state.uid_project}
    &username=${this.state.username}&comments=${comments}`)
    .then(() => {
      this.props.onReloadHistory(true)
    })
    .catch(err => alert(err))
  }
  hideProject(){
    this.showHideElement("tohide_"+this.state.uid_project);
    var arrow = document.getElementById("hide_"+this.state.uid_project);
    if (arrow.src === top_arrow_icon)
      arrow.src = down_arrow_icon
    else
      arrow.src = top_arrow_icon
  }
  handleEditorChange = (content, editor) => {
    this.setStateValue(this.state.project, "project", "description", content)
    this.saveAjax("sr_project", this.state.uid_project, "description", content)
  } 
  getPrice(uid){
    fetch('http://ssrv5.sednove.com:4000/subservices/get?uid='+uid)
    .then(response => response.json())
    .then(response => {
      this.setStateValue(this.state.project, "project", "lead_price", response.data[0].lead_price)
      this.setStateValue(this.state.project, "project", "estimated_value", response.data[0].estimated_value)
      this.saveAjax("sr_project",this.state.uid_project,"lead_price",response.data[0].lead_price)
      this.saveAjax("sr_project",this.state.uid_project,"estimated_value",response.data[0].estimated_value)
    })
    .catch(err => alert(err))
  }
  handleDelayChange(){
    var sdate = new Date();
    var edate = new Date();
    var delay_from;
    var delay_to;
    var filter = this.state.project.delay_options;
    if (filter === "1"){
      edate.setDate(edate.getDate() + 10);
      delay_from = sdate.getFullYear() + '-' + ('0' + (sdate.getMonth() + 1)).slice(-2) + '-' + ('0' + sdate.getDate()).slice(-2)
      delay_to = edate.getFullYear() + '-' + ('0' + (edate.getMonth() + 1)).slice(-2) + '-' + ('0' + edate.getDate()).slice(-2)
    }else if(filter === "2"){
        edate.setDate(sdate.getDate() + 15);
        delay_from = sdate.getFullYear() + '-' + ('0' + (sdate.getMonth() + 1)).slice(-2) + '-' + ('0' + sdate.getDate()).slice(-2);
        delay_to = edate.getFullYear() + '-' + ('0' + (edate.getMonth() + 1)).slice(-2) + '-' + ('0' + edate.getDate()).slice(-2);
    }else if(filter === "3"){
        sdate.setDate(sdate.getDate() + 0);
        edate.setDate(edate.getDate() + 30);
        delay_from = sdate.getFullYear() + '-' + ('0' + (sdate.getMonth() + 1)).slice(-2) + '-' + ('0' + sdate.getDate()).slice(-2);
        delay_to = edate.getFullYear() + '-' + ('0' + (edate.getMonth() + 1)).slice(-2) + '-' + ('0' + edate.getDate()).slice(-2);
    }else if(filter === "4"){
        sdate.setDate(sdate.getDate() + 0);
        edate.setDate(edate.getDate() + 60);
        delay_from = sdate.getFullYear() + '-' + ('0' + (sdate.getMonth() + 1)).slice(-2) + '-' + ('0' + sdate.getDate()).slice(-2);
        delay_to = edate.getFullYear() + '-' + ('0' + (edate.getMonth() + 1)).slice(-2) + '-' + ('0' + edate.getDate()).slice(-2);
    }else if(filter === "5"){
        sdate.setDate(sdate.getDate() + 0);
        edate.setDate(edate.getDate() + 130);
        delay_from = sdate.getFullYear() + '-' + ('0' + (sdate.getMonth() + 1)).slice(-2) + '-' + ('0' + sdate.getDate()).slice(-2);
        delay_to = edate.getFullYear() + '-' + ('0' + (edate.getMonth() + 1)).slice(-2) + '-' + ('0' + edate.getDate()).slice(-2);
    }else if(filter === "6"){
        sdate.setDate(sdate.getDate() + 180);
        edate.setDate(edate.getDate() + 365);
        delay_from = sdate.getFullYear() + '-' + ('0' + (sdate.getMonth() + 1)).slice(-2) + '-' + ('0' + sdate.getDate()).slice(-2);
        delay_to = edate.getFullYear() + '-' + ('0' + (edate.getMonth() + 1)).slice(-2) + '-' + ('0' + edate.getDate()).slice(-2);
    }else if(filter === "7"){
        sdate.setDate(sdate.getDate() + 365);
        edate.setDate(edate.getDate() + 1000)
        delay_from = sdate.getFullYear() + '-' + ('0' + (sdate.getMonth() + 1)).slice(-2) + '-' + ('0' + sdate.getDate()).slice(-2);
        delay_to = edate.getFullYear() + '-' + ('0' + (edate.getMonth() + 1)).slice(-2) + '-' + ('0' + edate.getDate()).slice(-2);
    }else if(filter === "8"){
        edate.setDate(edate.getDate() + 90)
        delay_from = sdate.getFullYear() + '-' + ('0' + (sdate.getMonth() + 1)).slice(-2) + '-' + ('0' + sdate.getDate()).slice(-2);
        delay_to = edate.getFullYear() + '-' + ('0' + (edate.getMonth() + 1)).slice(-2) + '-' + ('0' + edate.getDate()).slice(-2);
    }
    if (delay_from !== undefined){
      this.setStateValue(this.state.project, "project", "delay_from", delay_from)
      this.saveAjax("sr_project",this.state.uid_project,"delay_from",delay_from)
      this.setStateValue(this.state.project, "project", "delay_to", delay_to)
      this.saveAjax("sr_project",this.state.uid_project,"delay_to",delay_to)
    }
  }
  callBackLater(){
    var date_callbacklater = document.getElementById("date_callbacklater").value;
    var time_callbacklater = document.getElementById("time_callbacklater").value;
    var comment_callbacklater = document.getElementById("comment_callbacklater").value;
    var call_back_date = date_callbacklater + " " + time_callbacklater + ":00";
    if(this.state.callbacklater === undefined){
      fetch(`http://ssrv5.sednove.com:4000/callbacklater/add?uid_project=${this.state.uid_project}&uid_client=${this.state.project.uid_client}&call_back_date=${call_back_date}&followup_agent=${this.state.username}&comments=${comment_callbacklater}`)
      .then(() => {
        this.addHistory("3", "")
        this.setState({ popup_open_call_back_later: false })
      })
      .catch(err => alert(err))
    }else{
      fetch(`http://ssrv5.sednove.com:4000/callbacklater/update?uid_project=${this.state.uid_project}&uid_client=${this.state.project.uid_client}&call_back_date=${call_back_date}&followup_agent=${this.state.username}&comments=${comment_callbacklater}`)
      .then(() => {
        this.addHistory("3", "")
        this.setState({ popup_open_call_back_later: false })
      })
      .catch(err => alert(err))
    }
  }
  getCallBackLater(){
    fetch(`http://ssrv5.sednove.com:4000/callbacklater/get?uid_project=${this.state.uid_project}`)
    .then(response => response.json())
    .then(response => {
      this.setStateObject("callbacklater", response.data[0])
    })
    .catch(err => alert(err))
  }
  flagForReview(){
    if(this.state.flagforreview !== "1"){
      fetch(`http://ssrv5.sednove.com:4000/flagforreview/update?uid_project=${this.state.uid_project}&followup_agent=${this.state.username}`)
      .then(() => {
        //this.addHistory("3", "")
        this.setState({ popup_open_flag_for_review: false, flagforreview: 1 })
      })
      .catch(err => alert(err))
    }
  }
  getFlagForReview(){
    fetch(`http://ssrv5.sednove.com:4000/flagforreview/get?uid_project=${this.state.uid_project}`)
    .then(response => response.json())
    .then(response => {
      this.setState({flagforreview: response.data[0].flag_for_review})
    })
    .catch(err => alert(err))
  }
  openGoogleMap(){
    window.open("https://www.google.com/maps/place/"+this.state.complete_address, '_blank');
  }
  duplicateProject(){
    fetch('http://ssrv5.sednove.com:4000/projects/duplicate?uid='+this.state.project.uid)
    .then(() => {
      var url = window.location.href.split('?')[0] + "?uid_client=" + this.state.project.uid_client
      window.location.href = url;
    })
    .catch(err => alert(err))
  }
//#endregion

  render() {
    return (
      <Col className="project-panel" id={"project_panel_" + this.state.uid_project} style={{display:"block", borderRadius: "25px", position: "relative", 
      background: "#00517E", border: "6px solid #393939", boxSizing: "border-box", boxShadow: "0px 6px 6px rgba(0, 0, 0, 0.35)", paddingTop: "1%", color:"white"}}>
        <Row className="buttons_panel">
          <Col>
            <img width="40px" src={activate_logo} alt="Activer" onClick={() => this.setState({ popup_open_activate: true })}></img>
            <Popup
              onClose={() => this.setState({ popup_open_activate: false })}
              closeOnDocumentClick
              open={this.state.popup_open_activate}
            >
              <span>
                <Card body inverse style={{ backgroundColor: '#393939', borderColor: '#F9B233', borderWidth: "4px", padding:"10px" }}>
                  <CardTitle id="popupbox_title" style={{textAlign:"center"}}>Activer le projet</CardTitle>
                  <CardText style={{textAlign:"center"}}>Etes-vous sûre ?</CardText>
                  <Row>
                    <Button className="col ml-3" id="popupbox_button" onClick={()=> {this.activateProject()}}>Oui</Button>
                    <Button className="col ml-2 mr-3" id="popupbox_button" onClick={()=> {this.setState({ popup_open_activate: false })}}>Annuler</Button>
                  </Row>
                </Card>
              </span>
            </Popup>
          </Col>
          <Col>
            <img width="40px" src={cancel_logo} alt="Annuler" onClick={() => this.setState({ popup_open_cancel: true })}></img>
            <Popup
              onClose={() => this.setState({ popup_open_cancel: false })}
              closeOnDocumentClick
              open={this.state.popup_open_cancel}
            >
              <span>
                  {(this.state.project.status === "cancelled-after-qualification" || this.state.project.status === "cancelled-before-qualification")?(
                    <Card body inverse style={{ backgroundColor: '#393939', borderColor: '#F9B233', borderWidth: "4px", padding:"10px" }}>
                      <CardTitle id="popupbox_title" style={{textAlign:"center"}}>Le projet a déjà été annulé !</CardTitle>
                    </Card>
                  ):(
                    <Card body inverse style={{ backgroundColor: '#393939', borderColor: '#F9B233', borderWidth: "4px", padding:"10px" }}>
                      <CardTitle id="popupbox_title" style={{textAlign:"center"}}>Annuler le projet !</CardTitle>
                      <CardText style={{textAlign:"center"}}>Merci de choisir la raison d'annulation et/ou remplir la case autre:</CardText>
                      <Input type="select" value={this.state.uid_cancel_reason} onChange={(val)=>{this.setState({uid_cancel_reason: val.target.value});}}>
                        <option value="0">Choisir une raison d'annulation</option>
                        {this.state.cancel_reasons.map((s, i) =>
                        (
                          <option value={s.uid}>{s.reason_fr}</option>
                        )
                        )}
                      </Input>
                      <i style={{paddingTop:"5px"}}>Si tu ne choisis aucune raison de la liste aucun courriel ne sera envoyé automatiquement au client.</i>
                      <Label style={{paddingTop:"5px"}}>Autre :</Label>
                      <Input type="textarea" value={this.state.message_cancel_reason} onChange={(val)=>{this.setState({message_cancel_reason: val.target.value});}}></Input>
                      <br/>
                      <Row>
                        <Button className="col ml-3" id="popupbox_button" onClick={()=> {this.cancelProject()}}>Oui</Button>
                        <Button className="col ml-2 mr-3" id="popupbox_button" onClick={()=> {this.setState({ popup_open_cancel: false })}}>Annuler</Button>
                      </Row>
                    </Card>
                  )}
              </span>
            </Popup>
          </Col>
          <Col>
            <img width="40px" src={email_logo} alt="Courriel" onClick={() => this.setState({ popup_open_send_questions: true })}></img>
            <Popup
              onClose={() => this.setState({ popup_open_send_questions: false })}
              closeOnDocumentClick
              open={this.state.popup_open_send_questions}
            >
              <span>
                <Card body inverse style={{ backgroundColor: '#393939', borderColor: '#F9B233', borderWidth: "4px", padding:"10px" }}>
                  <CardTitle id="popupbox_title" style={{textAlign:"center"}}>Envoyer un courriel avec les questions suivantes:</CardTitle>
                  <CardText id="popupbox_content">
                  {
                    this.state.service_questions.map((sq, i) =>
                    (
                      <Col>
                        <Input type="checkbox" name="question" id={"question_"+sq.uid} />
                        <Label for={"question_"+sq.uid}>{sq.question_fr}</Label>
                      </Col>
                    )
                    )}
                    <Label>Question personnalisée :</Label>
                    <Input type="textarea" value={this.state.message_question} onChange={(val)=>{this.setState({message_question: val.target.value});}}></Input>
                  </CardText>
                  <Button id="popupbox_button" onClick={()=> {this.getCheckedQuestions()}}>Envoyer</Button>
                </Card>  
              </span>
            </Popup>
          </Col>
          <Col>
            <img width="40px" src={call_back_later_logo} alt="Appeler plus tard" onClick={() => this.setState({ popup_open_call_back_later: true })}></img>
            <Popup
              onClose={() => this.setState({ popup_open_call_back_later: false })}
              closeOnDocumentClick
              open={this.state.popup_open_call_back_later}
            >
              <span>
                <Card body inverse style={{ backgroundColor: '#393939', borderColor: '#F9B233', borderWidth: "4px", padding:"10px" }}>
                  <CardTitle id="popupbox_title" style={{textAlign:"center"}}>Rappeler plus tard:</CardTitle>
                  <i>Note: Le projet sera remit dans les nouveaux clients 5 min avant l'heure de rappel.</i>
                  <Label for="date_callbacklater">Date:</Label>
                  <Input type="date" id="date_callbacklater" />
                  <Label for="time_callbacklater">Heure:</Label>
                  <Input type="time" id="time_callbacklater" />
                  <Label for="comment_callbacklater">Commentaire / Raison:</Label>
                  <Input type="textarea" id="comment_callbacklater" />
                  <br/>
                  <Button id="popupbox_button" onClick={()=> {this.callBackLater()}}>Confirmer</Button>
                </Card>
              </span>
            </Popup>
          </Col>
          <Col>
            <img width="40px" src={call_logo} alt="Appeler" onClick={() => window.open('tel:'+this.state.address.phone1, "_self")}></img>
          </Col>
          <Col>
            <img width="40px" src={google_map_logo} alt="Google Map" onClick={() => this.openGoogleMap()}></img>
          </Col>
          <Col>
            <img width="40px" src={duplicate_logo} alt="Copier" onClick={() => this.duplicateProject()}></img>
          </Col>
          <Col>
          {(this.state.flagforreview === 1)?(
            <img width="40px" src={flag_for_review_logo_green} alt="Flag for review" onClick={() => this.setState({ popup_open_flag_for_review: true })}></img>
          ):(
            <img width="40px" src={flag_for_review_logo} alt="Flag for review" onClick={() => this.setState({ popup_open_flag_for_review: true })}></img>
          )}
          <Popup
              onClose={() => this.setState({ popup_open_flag_for_review: false })}
              closeOnDocumentClick
              open={this.state.popup_open_flag_for_review}
            >
          {(this.state.flagforreview === 1)?(
              <span>
                <Card body inverse style={{ backgroundColor: '#393939', borderColor: '#F9B233', borderWidth: "4px", padding:"10px" }}>
                  <CardTitle id="popupbox_title" style={{textAlign:"center"}}>Le projet a déjà été signalé pour être revu !</CardTitle>
                </Card>
              </span>
          ):
          (
            <span>
              <Card body inverse style={{ backgroundColor: '#393939', borderColor: '#F9B233', borderWidth: "4px", padding:"10px" }}>
                  <CardTitle id="popupbox_title" style={{textAlign:"center"}}>Rappeler plus tard:</CardTitle>
                  <CardText style={{textAlign:"center"}}>Etes-vous sûre de vouloir marquer ce projet pour qu'il puisse etre revu ?</CardText>
                  <br/>
                  <Row>
                    <Button className="col ml-3" id="popupbox_button" onClick={()=> {this.flagForReview()}}>Oui</Button>
                    <Button className="col ml-2 mr-3" id="popupbox_button" onClick={()=> {this.setState({ popup_open_flag_for_review: false })}}>Annuler</Button>
                  </Row>
              </Card>
            </span>
          )}
          </Popup>
          </Col>
          <Col>
            <img width="40px" id={"hide_"+this.state.uid_project} src={down_arrow_icon} alt="Cacher" onClick={() => this.hideProject()}></img>
          </Col>
        </Row>
        
        <Row className="status_panel pt-2 pb-1">
          <div className="col">
            <b>Status:</b> <b style={{color:"#F9B233"}}>{this.state.project.status}</b>
          </div>
          <div className="col text-center">
            <b>Date de soumission:</b> <b style={{color:"#F9B233"}}>{this.state.project.sn_cdate}</b>
          </div>
          <div className="col-2 text-right">
            <b style={{color:"#F9B233"}}>{this.state.nb_files}</b>&nbsp;<img width="20px" src={clipart} alt="Fichiers joints" 
            onClick={() => this.setState({popup_open_files: true})} style={{cursor: "pointer"}}></img>
            <Popup
              onClose={() => this.setState({ popup_open_files: false })}
              closeOnDocumentClick
              open={this.state.popup_open_files}
            >
              <span>
                <Card body inverse style={{ backgroundColor: '#393939', borderColor: '#F9B233', borderWidth: "4px", padding:"10px" }}>
                  <CardTitle id="popupbox_title" style={{textAlign:"center"}}>Fichiers joints</CardTitle>
                  <CardText style={{textAlign:"center"}}>
                    {(this.state.project.file1)?(<img width="375px" onClick={() => window.open("https://soumissionrenovation.ca"+this.state.project.file1, "_blank")} src={"https://soumissionrenovation.ca"+this.state.project.file1} style={{cursor: "pointer"}}></img>):(null)}
                    {(this.state.project.file2)?(<img width="375px" onClick={() => window.open("https://soumissionrenovation.ca"+this.state.project.file2, "_blank")} src={"https://soumissionrenovation.ca"+this.state.project.file2} style={{cursor: "pointer"}}></img>):(null)}
                    {(this.state.project.file3)?(<img width="375px" onClick={() => window.open("https://soumissionrenovation.ca"+this.state.project.file3, "_blank")} src={"https://soumissionrenovation.ca"+this.state.project.file3} style={{cursor: "pointer"}}></img>):(null)}
                    {(this.state.project.file4)?(<img width="375px" onClick={() => window.open("https://soumissionrenovation.ca"+this.state.project.file4, "_blank")} src={"https://soumissionrenovation.ca"+this.state.project.file4} style={{cursor: "pointer"}}></img>):(null)}
                    {(this.state.project.file5)?(<img width="375px" onClick={() => window.open("https://soumissionrenovation.ca"+this.state.project.file5, "_blank")} src={"https://soumissionrenovation.ca"+this.state.project.file5} style={{cursor: "pointer"}}></img>):(null)}
                  </CardText>
                  <Row>
                    <Button className="col ml-3 mr-3" id="popupbox_button" onClick={()=> {this.setState({ popup_open_files: false })}}>OK</Button>
                  </Row>
                </Card>
              </span>
            </Popup>
          </div>
          <div className="col-2 text-right">
            <b style={{color:"#F9B233"}}>#{this.state.uid_project}</b>
          </div>
        </Row>
        
        <div id={"tohide_"+this.state.uid_project} style={{display:"none"}}>
          <Row>
            <Col>
              <hr style={{borderTop:"white 1px solid"}} />
              <h6 style={{textAlign:"center"}}>Description</h6>
              <hr style={{borderTop:"white 1px solid"}} />
              <Editor
                apiKey="rpg0vwsws34iize77k9uf2afya24z2f7wqq3i3rg84evn1k3" 
                initialValue={this.state.project.description}
                value={this.state.project.description}
                init={{
                  height: 400,
                  menubar: false,
                  plugins: [
                    'advlist autolink lists link image charmap print preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table paste code help wordcount'
                  ],
                  toolbar:
                    'undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help'
                }}
                onEditorChange={this.handleEditorChange}
              />
            </Col>
          </Row>
          <br/>
          <Row>
            <Col>
              <hr style={{borderTop:"white 1px solid"}} />
              <h6 style={{textAlign:"center"}}>Informations du 2e formulaire</h6>
              <hr style={{borderTop:"white 1px solid"}} />
              <Form>
                <FormGroup>
                  <Label>Durée du projet:</Label>
                  <Input type="text" value={this.state.project.estimate_duration} disabled/>
                </FormGroup>
                <FormGroup>
                  <Label>Propriétaire:</Label>
                  <Input type="text" value={this.state.project.is_owner} disabled/>
                </FormGroup>
                <FormGroup>
                  <Label>Budget:</Label>
                  <Input type="text" value={this.state.project.budget} disabled/>
                </FormGroup>
                <FormGroup>
                  <Label>Type de budget:</Label>
                  <Input type="text" value={this.state.project.budget_type} disabled/>
                </FormGroup>
                <FormGroup>
                  <Label>Type de propriété:</Label>
                  <Input type="text" value={this.state.project.property_type} disabled/>
                </FormGroup>
                <FormGroup>
                  <Label>Préférence du type d'entrepreneur:</Label>
                  <Input type="text" value={this.state.project.contractor_type} disabled/>
                </FormGroup>
                <FormGroup>
                  <Label>Raison de la demande de soumission / Quand seriez-vous prêt à recevoir la visite d'un entrepreneur pour obtenir une soumission détaillée?</Label>
                  <Input type="text" value={this.state.project.quote_reason} disabled/>
                </FormGroup>
                <FormGroup>
                  <Label>Commentaires additionnels:</Label>
                  <Input type="text" value={this.state.project.additional_comments} disabled/>
                </FormGroup>
                <FormGroup>
                  <Label>Premier URL:</Label>
                  <Input type="text" value="" disabled/>
                </FormGroup>
                <FormGroup>
                  <Label>Infos Adwords:</Label>
                  <p>Region: - Keyword: - Campaign:</p>
                  <Label>Infos adresse IP:</Label>
                  <p>Region: - Rayon de confiance:</p>
                </FormGroup>
              </Form>
                <hr style={{borderTop:"white 1px solid"}} />
            </Col>
            <Col>
              <hr style={{borderTop:"white 1px solid"}} />
              <h6 style={{textAlign:"center"}}>Qualification du projet</h6>
              <hr style={{borderTop:"white 1px solid"}} />
              <Form>
                <FormGroup>
                  <Label className="mr-4" for={"employee_"+this.state.uid_project}>Employé ?</Label>
                  <Input type="checkbox" name="employee" id={"employee_"+this.state.uid_project} value={this.state.project.employee} checked={(this.state.project.employee === "yes")?true:false} onChange={(val)=>{(val.target.checked === true)?val.target.value = "yes":val.target.value = "no";this.setStateValue(this.state.project, "project", "employee", val.target.value);this.saveAjax("sr_project",this.state.uid_project,"employee",val.target.value);}}/>
                </FormGroup>
                <FormGroup>
                  <Label for="service">Service*</Label>
                  <Input type="select" name="service" value={this.state.project.uid_service} 
                  onChange={(val)=>{this.setStateValue(this.state.project, "project", "uid_service", val.target.value);
                  this.saveAjax("sr_project",this.state.uid_project,"uid_service",val.target.value);this.getNewSubServices(val.target.value);}}>
                    <option value="0">Choisir un service</option>
                    {this.state.services.map((s, i) =>
                    (
                      <option value={s.uid}>{s.name_long_fr}</option>
                    )
                    )}
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="sub_service">Sous-service*</Label>
                  <Input type="select" name="sub_service" id={"subservice_"+this.state.uid_project} value={this.state.project.uid_subservice} onChange={(val)=>{this.setStateValue(this.state.project, "project", "uid_subservice", val.target.value);this.saveAjax("sr_project",this.state.uid_project,"uid_subservice",val.target.value);this.getPrice(val.target.value)}}>
                    <option value="0">Choisir un sous-service</option>
                    {
                    this.state.subservices.map((s, i) =>
                    (
                      <option value={s.uid}>{s.name_fr}</option>
                    )
                    )}
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="secondary_service">Service secondaire</Label>
                  <Input type="select" name="secondary_service" value={this.state.project.uid_secondary_service} onChange={val=>{this.setStateValue(this.state.project, "project", "uid_secondary_service", val.target.value);this.saveAjax("sr_project",this.state.uid_project,"uid_secondary_service",val.target.value);}}>
                    <option value="0">Choisir un service secondaire</option>
                    {
                    this.state.services.map((s, i) =>
                    (
                      <option value={s.uid}>{s.name_long_fr}</option>
                    )
                    )}
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="quality">Qualité du projet</Label>
                  <Input type="select" name="quality" value={this.state.project.quality} onChange={val=>{this.setStateValue(this.state.project, "project", "quality", val.target.value);this.saveAjax("sr_project",this.state.uid_project,"quality",val.target.value);}}>
                    <option value="0">Choisir une option</option>
                    <option value="upmarket">Haut-de-gamme</option>
                    <option value="standard">Standard</option>
                    <option value="cheap">Economique</option>
                  </Input>
                </FormGroup>
                <FormGroup className="row">
                  <Col>
                    <Label for="lead_price">Prix*</Label>
                    <Input type="text" name="lead_price" id={"lead_price_"+this.state.uid_project} value={this.state.project.lead_price} onChange={(val)=>{this.setStateValue(this.state.project, "project", "lead_price", val.target.value);this.saveAjax("sr_project",this.state.uid_project,"lead_price",val.target.value);}}/>
                  </Col>
                  <Col>
                    <Label for="estimated_value">Valeur estimée*</Label>
                    <Input type="text" name="estimated_value" value={this.state.project.estimated_value} disabled/>
                  </Col>
                </FormGroup>
                <FormGroup>
                  <Label for="shared_budget">Budget partagé</Label>
                  <Input type="text" name="shared_budget" placeholder="ex: 1000$ à 3000$ (main d'oeuvre et materiaux)" value={this.state.project.shared_budget} onChange={(val)=>{this.setStateValue(this.state.project, "project", "shared_budget", val.target.value);this.saveAjax("sr_project",this.state.uid_project,"shared_budget",val.target.value);}}/>
                </FormGroup>
                <FormGroup>
                  <Label for="uid_project_type">Type de projet*</Label>
                  <Input type="select" name="uid_project_type" value={this.state.project.uid_project_type} onChange={(val)=>{this.setStateValue(this.state.project, "project", "uid_project_type", val.target.value);this.saveAjax("sr_project",this.state.uid_project,"uid_project_type",val.target.value);}}>
                    <option value="0">Choisir un type</option>
                    <option value="1">Résidentiel</option>
                    <option value="2">Commercial</option>
                    <option value="4">Construction neuve</option>
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="comments">Commentaire interne</Label>
                  <Input type="textarea" name="comments" value={this.state.project.comments} onChange={(val)=>{this.setStateValue(this.state.project, "project", "comments", val.target.value);this.saveAjax("sr_project",this.state.uid_project,"comments",val.target.value);}}/>
                </FormGroup>
                <FormGroup>
                  <Label for="additional_info">Informations additionnelles</Label>
                  <Input type="textarea" name="additional_info" placeholder="Ces informations seront disponibles pour l'entrepreneur une fois le projet acheté" value={this.state.project.additional_info} onChange={(val)=>{this.setStateValue(this.state.project, "project", "additional_info", val.target.value);this.saveAjax("sr_project",this.state.uid_project,"additional_info",val.target.value);}}/>
                </FormGroup>
                <FormGroup>
                  <Label for="due_date">Date d'échéance*</Label>
                  <Input type="text" name="due_date" placeholder="ex: Prêt à débuter les travaux selon les disponibilités des entrepreneurs" value={this.state.project.due_date} onChange={(val)=>{this.setStateValue(this.state.project, "project", "due_date", val.target.value);this.saveAjax("sr_project",this.state.uid_project,"due_date",val.target.value);}}/>
                </FormGroup>
                <FormGroup>
                  <Label for="delay_options">Délais de traitement*</Label>
                  <Input type="select" name="delay_options" value={this.state.project.delay_options} onChange={(val)=>{this.setStateValue(this.state.project, "project", "delay_options", val.target.value);this.saveAjax("sr_project",this.state.uid_project,"delay_options",val.target.value);this.handleDelayChange()}}>
                    <option value='0'>Choisir un filtre</option>
                    <option value='1'>D'ici à une semaine/Urgent</option>
                    <option value='2'>Dans 1 à 2 semaines</option>
                    <option value='3'>Dans 3 à 4 semaines</option>
                    <option value='4'>Dans 1 à 2 mois</option>
                    <option value='5'>Dans 3 à 4 mois</option>
                    <option value='6'>Dans 6 à 12 mois</option>
                    <option value='7'>Dans 12+ mois</option>
                    <option value='8'>Flexible, suivant la disponibilité de l'entrepreneur</option>
                  </Input>
                </FormGroup>
                <FormGroup className="row">
                  <Col>
                      <Label for="delay_from">Début</Label>
                      <Input type="date" name="delay_from" value={this.state.project.delay_from} disabled onChange={(val)=>{this.setStateValue(this.state.project, "project", "delay_from", val.target.value);this.saveAjax("sr_project",this.state.uid_project,"delay_from",val.target.value);}}/>
                  </Col>
                  <Col>
                      <Label for="delay_to">Fin</Label>
                      <Input type="date" name="delay_to" value={this.state.project.delay_to} disabled onChange={(val)=>{this.setStateValue(this.state.project, "project", "delay_to", val.target.value);this.saveAjax("sr_project",this.state.uid_project,"delay_to",val.target.value);}}/>
                  </Col>
                </FormGroup>
                <FormGroup className="row">
                  <Col>
                    <Label for="phone1">Téléphone*</Label>
                    <Input type="phone" name="phone1" value={this.state.address.phone1} onChange={(val)=>{this.setStateValue(this.state.address, "address", "phone1", val.target.value);this.saveAjax("sr_address",this.state.address.uid,"phone1",val.target.value);}}/>
                  </Col>
                  <Col>
                    <Label for="phone2">Autre téléphone</Label>
                    <Input type="phone" name="phone2" value={this.state.address.phone2} onChange={(val)=>{this.setStateValue(this.state.address, "address", "phone2", val.target.value);this.saveAjax("sr_address",this.state.address.uid,"phone2",val.target.value);}}/>
                  </Col>
                </FormGroup>
                <FormGroup>
                  <Label for="complete_address">Adresse*</Label>
                  <Input type="text" name="complete_address" value={this.state.complete_address} onChange={(val)=>{this.setState({complete_address: val.target.value})}}/>
                </FormGroup>
                <FormGroup className="row">
                  <Col>
                    <Label for="street_no">No. de rue*</Label>
                    <Input type="text" name="street_no" value={this.state.address.street_no} onChange={(val)=>{this.setStateValue(this.state.address, "address", "street_no", val.target.value);this.saveAjaxAddress("sr_address",this.state.address.uid,"street_no",val.target.value);}}/>
                  </Col>
                  <Col>
                    <Label for="street">Rue*</Label>
                    <Input type="text" name="street" value={this.state.address.street} onChange={(val)=>{this.setStateValue(this.state.address, "address", "street", val.target.value);this.saveAjaxAddress("sr_address",this.state.address.uid,"street",val.target.value);}}/>
                  </Col>
                </FormGroup>
                <FormGroup>
                  <Label for="zip">Code postal*</Label>
                  <Input type="text" name="zip" value={this.state.address.zip} onChange={(val)=>{this.setStateValue(this.state.address, "address", "zip", val.target.value);this.saveAjaxAddress("sr_address",this.state.address.uid,"zip",val.target.value);}}/>
                </FormGroup>
                <FormGroup>
                  <Label for="uid_city">Ville*</Label>
                  <Input type="select" name="uid_city" value={this.state.address.uid_city} onChange={(val)=>{this.setStateValue(this.state.address, "address", "uid_city", val.target.value);this.saveAjaxAddress("sr_address",this.state.address.uid,"uid_city",val.target.value);}}>
                      <option value="0">Choisir une ville</option>
                      <option value="27">Mascouche</option>
                  </Input>
                </FormGroup>
              </Form>
              <hr style={{borderTop:"white 1px solid"}} />
            </Col>
          </Row>
        </div>
      </Col>
    );
  }
}
  
export default Project;
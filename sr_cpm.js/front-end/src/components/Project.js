import React, { Component} from 'react';
import { Row, Col, Input, Label, Form, FormGroup, Button, Card, CardTitle, CardText} from 'reactstrap';
import { Editor } from '@tinymce/tinymce-react';
import google_map_logo from "../img/google-maps-round.png";
import call_logo from "../img/call.png";
import call_back_later_logo from "../img/call_back_later_logo.png";
import activate_logo from "../img/activate_logo.png";
import cancel_logo from "../img/cancel_logo.png";
import email_logo from "../img/email_logo.png";
import save_logo from "../img/save_logo.png";
import duplicate_logo from "../img/duplicate_logo.png";
import flag_for_review_logo from "../img/flag_for_review_logo.png";
import top_arrow_icon from "../img/top_arrow_icon.png";
import down_arrow_icon from "../img/down_arrow_icon.png";


class Project extends Component 
{
  constructor(props) {
        super(props);
        this.state = {
            uid_project: (props.uid_project)?props.uid_project:0,
            username: "Khalil",
            project: [],
            history: [],
            services: [],
            subservices: [],
            uid_subservice: 0,
            address: []
        };
  }
  componentDidMount() {
    this.getProject(this.state.uid_project);
    this.getServices();
    if(this.state.project.uid_subservice !== undefined)
      this.getSubServices(this.state.project.uid_service);
  }
  
  getProject = (uid) => {
    fetch('http://localhost:4000/projects/get?uid='+uid)
    .then(response => response.json())
    .then(response => {this.setState({ project: response.data[0], uid_subservice: response.data[0].uid_subservice});this.getAddress(this.state.project.uid_address);})
    .catch(err => console.log(err))
  }
  getServices(){
    fetch('http://localhost:4000/services')
    .then(response => response.json())
    .then(response => {this.setState({ services: response.data });})
    .catch(err => alert(err))
  }
  getAddress(uid){
    fetch('http://localhost:4000/address?uid='+uid)
    .then(response => response.json())
    .then(response => {this.setState({ address: response.data[0] });this.getSubServices()})
    .catch(err => alert(err))
  }
  getSubServices(uid){
    if(this.state.project.uid_service !== undefined)
      fetch('http://localhost:4000/subservices?uid_service='+uid)
      .then(response => response.json())
      .then(response => {
        this.setState({ subservices: response.data });
      })
      .catch(err => alert(err))
  }
  activateProject(){
    if(this.state.project.status === "new")
      fetch('http://localhost:4000/projects/activate?uid='+this.state.uid_project)
      .then(() => {
        console.log("(TODO) automail::projectActivatedClient(uid) or projectActivatedEmpoyee(uid) then automail::projectActivatedAdmin(uid)");
        this.getProject(this.state.uid_project);
      })
      .catch(err => console.log(err))
    else
      alert("Project already activated !")
  }
  cancelProject(){
    if(this.state.project.status !== "cancelled-before-qualification" && this.state.project.status !== "cancelled-after-qualification")
      fetch('http://localhost:4000/projects/cancel?uid='+this.state.uid_project + '&status='+this.state.project.status)
      .then(() => {
        console.log("(TODO) automail::projectCanceled(uid)");
        this.getProject(this.state.uid_project);
      })
      .catch(err => console.log(err))
    else
      alert("Project already canceled !")
  }
  showHideElement(uid_element){
    var element = document.getElementById(uid_element)
    if (element.style.display === "none")
      element.style.display = "block"
    else
      element.style.display = "none"
  }
  setPopupBox(_title, _content, _btn_content, _btn_onclick){
    document.getElementById("popupbox_title").innerHTML = _title
    document.getElementById("popupbox_content").innerHTML = _content
    document.getElementById("popupbox_button").innerHTML = _btn_content
    document.getElementById("popupbox_button").onclick = _btn_onclick
  }
  sendEmail(){
    alert("test")
  }
  showSendEmail(){
    this.setPopupBox("Envoyer un courriel (#"+ this.state.uid_project +")", "allo", "Envoyer", ()=>this.sendEmail())
    this.showHideElement("popupbox")
  }
  addHistory(uid_msg, comments){
    fetch(`http://localhost:4000/client_history/add?uid_msg=${uid_msg}&uid_client=${this.state.project.uid_client}&uid_project=${this.state.uid_project}
    &username=${this.state.username}&comments=${comments}`)
    .then(response => response.json())
    .then(response => this.setState({ history: response.data[0]}))
    .catch(err => console.log(err))
  }
  saveAjax(table, uid, one, one_val){
    fetch(`http://localhost:4000/update/one?table=${table}&uid=${uid}&one=${one}&one_val=${one_val}`)
    .then(response => response.json())
    .catch(err => console.log(err))
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
    this.state.project.description = content
    this.saveAjax("sr_project", this.state.uid_project, "description", content)
  } 

  render() {
    return (
      <Col className="project-panel" id={"project_panel_" + this.state.uid_project} style={{display:"block", borderRadius: "25px", position: "relative", 
      background: "#00517E", border: "6px solid #118bcf", boxSizing: "border-box", boxShadow: "0px 6px 6px rgba(0, 0, 0, 0.35)", paddingTop: "1%", color:"white"}}>
        
        {/* Popup Box */}
        <Row>
          <Col id="popupbox" style={{zIndex:"101", height:"auto", width:"600px", top:"5px", display:"none"}}>
            <Card body inverse style={{ backgroundColor: '#17A2B8', borderColor: '#F9B233', borderWidth: "4px", padding:"10px" }}>
              <CardTitle id="popupbox_title" style={{textAlign:"center"}}>Title</CardTitle>
              <CardText id="popupbox_content">Content</CardText>
              <Button id="popupbox_button">Button</Button>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col id="popupbox_email" style={{zIndex:"101", height:"auto", width:"600px", top:"5px", display:"none"}}>
            <Card body inverse style={{ backgroundColor: '#17A2B8', borderColor: '#F9B233', borderWidth: "4px", padding:"10px" }}>
              <CardTitle id="popupbox_title" style={{textAlign:"center", color:"#F9B233"}}>Envoyer un courriel (# {this.state.uid_project})</CardTitle>
              <CardText id="popupbox_content">
                <h5>Merci de bien vouloir sélectionner les questions à envoyer:</h5>
                <Row>
                  <Col className="col-1">aa</Col>
                  <Col>aaaaaaaaaa</Col>
                </Row>
              </CardText>
              <Button id="popupbox_button">Button</Button>
            </Card>
          </Col>
        </Row>

        <Row className="buttons_panel">
          <Col>
            <img width="40px" src={activate_logo} alt="Activer" onClick={() => this.activateProject()}></img>
          </Col>
          <Col>
            <img width="40px" src={cancel_logo} alt="Annuler" onClick={() => this.cancelProject()}></img>
          </Col>
          <Col>
          <img width="40px" src={email_logo} alt="Courriel" onClick={() => this.showSendEmail()}></img>
          </Col>
          <Col>
            <img width="40px" src={call_logo} alt="Appeler" href={"tel:"+this.state.address.phone1}></img>
          </Col>
          <Col>
            <img width="40px" src={call_back_later_logo} alt="Appeler plus tard" onClick={() => this.callBackLater()}></img>
          </Col>
          <Col>
            <img width="40px" src={google_map_logo} alt="Google Map" onClick={() => this.openGoogleMap()}></img>
          </Col>
          <Col>
            <img width="40px" src={save_logo} alt="Sauvegarder" onClick={() => this.saveProject()}></img>
          </Col>
          <Col>
            <img width="40px" src={duplicate_logo} alt="Copier" onClick={() => this.duplicateProject()}></img>
          </Col>
          <Col>
            <img width="40px" src={flag_for_review_logo} alt="Flag for review" onClick={() => this.flagForReview()}></img>
          </Col>
          <Col>
            <img width="40px" id={"hide_"+this.state.uid_project} src={top_arrow_icon} alt="Cacher" onClick={() => this.hideProject()}></img>
          </Col>
        </Row>
        <Row>
          <Col className="col-2">
            <b>Status:</b> <b style={{color:"#F9B233"}}>{this.state.project.status}</b>
          </Col>
          <Col className="col">
          </Col>
          <Col className="col-2 text-center">
            <b style={{color:"#F9B233"}}>#{this.state.uid_project}</b>
          </Col>
        </Row>
        
        <div id={"tohide_"+this.state.uid_project}>
          <Row>
            <Col>
              <Editor
                initialValue={this.state.project.description}
                        init={{
                          height: 400,
                          menubar: false,
                          plugins: [
                            'advlist autolink lists link image charmap print preview anchor',
                            'searchreplace visualblocks code fullscreen',
                            'insertdatetime media table paste code help wordcount'
                          ],
                          toolbar:
                            'undo redo | formatselect | bold italic backcolor | \
                            alignleft aligncenter alignright alignjustify | \
                            bullist numlist outdent indent | removeformat | help'
                        }}
                onEditorChange={this.handleEditorChange}
              />
            </Col>
          </Row>
          <br/>
          <Row>
            <Col>
              <hr style={{borderTop:"white 1px solid"}} />
              <h4 style={{textAlign:"center"}}>Information du 2e formulaire</h4>
              <hr style={{borderTop:"white 1px solid"}} />
              <FormGroup>
                  <Label>Durée du projet:</Label>
                  <p></p>
                  <Label>Propriétaire:</Label>
                  <p></p>
                  <Label>Budget:</Label>
                  <p></p>
                  <Label>Type de budget:</Label>
                  <p></p>
                  <Label>Type de propriété:</Label>
                  <p></p>
                  <Label>Préférence du type d'entrepreneur:</Label>
                  <p></p>
                  <Label>Raison de la demande de soumission / Quand seriez-vous prêt à recevoir la visite d'un entrepreneur pour obtenir une soumission détaillée?</Label>
                  <p></p>
                  <Label>Commentaires additionnels:</Label>
                  <p></p>
                  <Label>Premier URL:</Label>
                  <p></p>
                  <Label>Infos Adwords:</Label>
                  <p>Region: - Keyword: - Campaign:</p>
                  <hr style={{borderTop:"white 1px solid"}} />
                  <Label>Infos adresse IP:</Label>
                  <p>Region: - Rayon de confiance:</p>
                </FormGroup>
                <hr style={{borderTop:"white 1px solid"}} />
            </Col>
            <Col>
              <Form>
                <FormGroup>
                  <Label for="due_date">Date d'échéance*</Label>
                  <Input type="text" name="due_date" id="due_date" placeholder="ex: Prêt à débuter les travaux selon les disponibilités des entrepreneurs" onChange={(val)=>this.saveAjax("sr_project",this.state.uid_project,"due_date",val.target.value)} value={this.state.project.due_date}/>
                </FormGroup>
                <FormGroup>
                  <Label for="service">Service*</Label>
                  <Input type="select" name="service" value={this.state.project.uid_service} onChange={(val)=>{this.setState({project:{uid_service: val.target.value}});this.saveAjax("sr_project",this.state.uid_project,"uid_service",val.target.value);this.getSubServices(val.target.value);}}>
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
                  <Input type="select" name="sub_service" value={this.state.project.uid_subservice} onChange={(val)=>{this.setState({project:{uid_subservice: val.target.value}});this.saveAjax("sr_project",this.state.uid_project,"uid_subservice",val.target.value)}}>
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
                  <Input type="select" name="secondary_service" value={this.state.project.uid_secondary_service} onChange={val=>{this.setState({project:{uid_secondary_service: val.target.value}});this.saveAjax("sr_project",this.state.uid_project,"uid_secondary_service",val.target.value);}}>
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
                  <Label for="project_quality">Qualité du projet</Label>
                  <Input type="select" name="project_quality" id="project_quality" multiple>
                    <option>Haut-de-gamme</option>
                    <option>Standard</option>
                    <option>Economique</option>
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="lead_price">Prix*</Label>
                  <Input type="text" name="lead_price" id="lead_price" />
                </FormGroup>
                <FormGroup>
                  <Label for="estimate">Valeur estimée*</Label>
                  <Input type="text" name="estimate" id="estimate" />
                </FormGroup>
                <FormGroup>
                  <Label for="shared_budget">Budget partagé</Label>
                  <Input type="text" name="shared_budget" id="shared_budget" placeholder="ex: 1000$ à 3000$ (main d'oeuvre et materiaux)" />
                </FormGroup>
                <FormGroup>
                  <Label for="project_type">Type de projet*</Label>
                  <Input type="select" name="project_type" id="project_type">
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="comment">Commentaire interne</Label>
                  <Input type="textarea" name="comment" id="comment" />
                </FormGroup>
                <FormGroup>
                  <Label for="info_add">Informations additionnelles</Label>
                  <Input type="textarea" name="info_add" id="info_add" placeholder="Ces informations seront disponibles pour l'entrepreneur une fois le projet acheté" />
                </FormGroup>
              </Form>
            </Col>
          </Row>
        </div>

      </Col>
    );
  }
}
  
  export default Project;
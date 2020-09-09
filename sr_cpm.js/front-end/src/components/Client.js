import React, { Component} from 'react';
import { Input, Col, Row, Label } from 'reactstrap';
import $ from "jquery";

class Client extends Component {
    constructor(props) {
        super(props);
        this.state = {
            uid_client: props.uid_client,
            client: [],
            phone: "",
            uid_address: "",
            already_locked: (props.already_locked)?props.already_locked:"no"
        };
    }

    componentDidMount() {
        if (this.state.uid_client !== undefined)
            this.getClient(this.state.uid_client);
        if (this.state.already_locked === "yes"){
            $(`#client-panel :input`).attr("disabled", true)
        }else{
            $(`#client-panel :input`).attr("disabled", false)
        }
    }
    componentWillReceiveProps(props){
        if (props.uid_client !== this.state.uid_client){
            this.setState({uid_client: props.uid_client})
            this.getClient(props.uid_client)
        }
        if (props.already_locked === "yes"){
            $(`#client-panel :input`).attr("disabled", true)
        }else{
            $(`#client-panel :input`).attr("disabled", false)
        }
    }

    setStateValue(actual_object, object_name, variable, value){
        if (actual_object !== undefined){
          actual_object[variable] = value
          switch (object_name) {
            case "client":
              this.setState({client:actual_object})
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
    getClient = (uid) => {
        fetch('http://localhost:4000/clients/get?uid='+uid)
        .then(response => response.json())
        .then(response => {
            if (response.data[0] !== undefined){
                this.setState({ client: response.data[0]})
            }else{
                this.setState({ client: []})
                alert("Client introuvable !")
            }
        })
        .then(() => this.getPhone())
        .catch(err => alert(err))
    }
    getPhone(){
        fetch('http://localhost:4000/client_phone?uid_client='+this.state.uid_client)
        .then(response => response.json())
        .then(response => this.setState({ phone: response.data[0].phone1, uid_address: response.data[0].uid}))
        .catch(err => console.log(err))
    }

    render() {
      return (
            <Row className="client-panel-fix" id="client-panel" style={{fontSize:"14px",paddingLeft:"1%",paddingRight:"1%", color:"white"}}>
                <Col className="sr_space_box client-panel-hidethis pt-1 pb-2" style={{display:"block", borderRadius: "25px", position: "relative", 
                        background: "#00517E", border: "6px solid #393939", boxSizing: "border-box", boxShadow: "0px 6px 6px rgba(0, 0, 0, 0.35)", padding:"3%"}}>
                    <Row>
                        <Label className="col-3" for="i_client_firstname">Firstname* :</Label>
                        <Label className="col-3" for="i_client_lastname">Lastname :</Label>
                        <Label className="col-2" for="i_client_gender">Gender :</Label>
                        <Label className="col-2" for="i_client_firstlang">First lg* :</Label>
                        <Label className="col-2" for="i_client_spokenlang">Spoken lg* :</Label>
                    </Row>
                    <Row>
                        <Input className="col-3" type="text" id="i_client_firstname" value={this.state.client.firstname} 
                        onChange={(val)=>{this.setStateValue(this.state.client, "client", "firstname", val.target.value);this.saveAjax("sr_client",this.state.uid_client,"firstname",val.target.value);}}/>
                        <Input className="col-3" type="text" id="i_client_lastname" value={this.state.client.lastname} 
                        onChange={(val)=>{this.setStateValue(this.state.client, "client", "lastname", val.target.value);this.saveAjax("sr_client",this.state.uid_client,"lastname",val.target.value);}}/>
                        <Input className="col-2" type="select" name="select" id="i_client_gender" value={this.state.client.gender} 
                        onChange={(val) =>{this.setStateValue(this.state.client, "client", "gender", val.target.value);this.saveAjax("sr_client",this.state.uid_client,"gender",val.target.value);}} >
                            <option value="m">Male</option>
                            <option value="f">Female</option>
                        </Input>
                        <Input className="col-2" type="select" name="select" id="i_client_firstlang" value={this.state.client.lang} 
                        onChange={(val) =>{this.setStateValue(this.state.client, "client", "lang", val.target.value);this.saveAjax("sr_client",this.state.uid_client,"lang",val.target.value);}}>
                            <option value="fr">FR</option>
                            <option value="en">EN</option>
                        </Input>
                        <Input className="col-2" type="select" name="select" id="i_client_spokenlang" value={this.state.client.languages} 
                        onChange={(val) =>{this.setStateValue(this.state.client, "client", "languages", val.target.value);this.saveAjax("sr_client",this.state.uid_client,"languages",val.target.value);}}>
                            <option value="1">FR</option>
                            <option value="2">EN</option>
                            <option value="3">Bilingue</option>
                        </Input>
                    </Row>
                    <Row>
                        <Label className="col-6" for="i_client_email">Email* :</Label>
                        <Label className="col-6" for="i_client_phone">Phone* :</Label>
                    </Row>
                    <Row>
                        <Input className="col-6" type="email" id="i_client_email" value={this.state.client.email} 
                        onChange={(val) =>{this.setStateValue(this.state.client, "client", "email", val.target.value);this.saveAjax("sr_client",this.state.uid_client,"email",val.target.value);}}/>
                        <Input className="col-6" type="phone" id="i_client_phone" value={this.state.phone} 
                        onChange={(val) =>{this.setState({phone: val.target.value});this.saveAjax("sr_address",this.state.uid_address,"phone1",val.target.value);}}/>
                    </Row>
                    <Row>
                        <Label className="col-6" for="i_client_when_to_call">When to call :</Label>
                        <Label className="col-6" for="i_client_comments">Comments :</Label>
                    </Row>
                    <Row>
                        <Input className="col-6" type="phone" id="i_client_when_to_call" value={this.state.client.when_to_call} 
                        onChange={(val) =>{this.setStateValue(this.state.client, "client", "when_to_call", val.target.value);this.saveAjax("sr_client",this.state.uid_client,"when_to_call",val.target.value);}}/>
                        <Input className="col-6" type="phone" id="i_client_comments" value={this.state.client.comments} 
                        onChange={(val) =>{this.setStateValue(this.state.client, "client", "comments", val.target.value);this.saveAjax("sr_client",this.state.uid_client,"comments",val.target.value);}}/>
                    </Row>
                </Col>
            </Row>
      );
    }
}
  
export default Client;
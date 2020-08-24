import React, { Component} from 'react';
import { Input, Col, Row, Label } from 'reactstrap';

class Client extends Component {
    constructor(props) {
        super(props);
        this.state = {
            uid_client: props.uid_client,
            client: []
        };
    }

    componentDidMount() {
        this.getClient(this.state.uid_client);
    }

    getClient = (uid) => {
        fetch('http://localhost:4000/clients/get?uid='+uid)
        .then(response => response.json())
        .then(response => this.setState({ client: response.data[0]}))
        .catch(err => console.log(err))
    }

    render() {
      return (
            <Row className="client-panel-fix" id="client-panel" style={{fontSize:"14px",paddingLeft:"1%",paddingRight:"1%", color:"white"}}>
                <Col className="sr_space_box client-panel-hidethis pt-1 pb-2" style={{display:"block", borderRadius: "25px", position: "relative", 
                        background: "#00517E", border: "6px solid #118bcf", boxSizing: "border-box", boxShadow: "0px 6px 6px rgba(0, 0, 0, 0.35)", padding:"3%"}}>
                    <Row>
                        <Label className="col-3" for="i_client_firstname">Firstname* :</Label>
                        <Label className="col-3" for="i_client_lastname">Lastname :</Label>
                        <Label className="col-2" for="i_client_gender">Gender :</Label>
                        <Label className="col-2" for="i_client_firstlang">First lg* :</Label>
                        <Label className="col-2" for="i_client_spokenlang">Spoken lg* :</Label>
                    </Row>
                    <Row>
                        <Input className="col-3" type="text" id="i_client_firstname" value={this.state.client.firstname}/>
                        <Input className="col-3" type="text" id="i_client_lastname" value={this.state.client.lastname}/>
                        <Input className="col-2" type="select" name="select" id="i_client_gender" value={this.state.client.gender}>
                            <option value="m">Male</option>
                            <option value="f">Female</option>
                        </Input>
                        <Input className="col-2" type="select" name="select" id="i_client_firstlang" value={this.state.client.firstlang}>
                            <option value="fr">FR</option>
                            <option value="en">EN</option>
                        </Input>
                        <Input className="col-2" type="select" name="select" id="i_client_spokenlang" value={this.state.client.spokenlang}>
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
                        <Input className="col-6" type="email" id="i_client_email" value={this.state.client.email}/>
                        <Input className="col-6" type="phone" id="i_client_phone" value={this.state.client.phone}/>
                    </Row>
                    <Row>
                        <Label className="col-6" for="i_client_when_to_call">When to call :</Label>
                        <Label className="col-6" for="i_client_comments">Comments :</Label>
                    </Row>
                    <Row>
                        <Input className="col-6" type="phone" id="i_client_when_to_call" value={this.state.client.when_to_call}/>
                        <Input className="col-6" type="phone" id="i_client_comments" value={this.state.client.comments}/>
                    </Row>
                </Col>
            </Row>
      );
    }
}
  
export default Client;
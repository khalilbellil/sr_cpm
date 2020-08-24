import React, { Component } from 'react';
import { Navbar, NavbarBrand, Container } from 'reactstrap';
import { Form, FormGroup, Input, Button, Col, Card } from 'reactstrap';
import logo from './logo.png';

class HeaderNavigation extends Component {
  render() {
    return (
      <Col>
      <Navbar href="/">
        <NavbarBrand>
          <img alt="" src={logo} />
        </NavbarBrand>
      </Navbar>
      </Col>
    );
  }
}

export default HeaderNavigation;

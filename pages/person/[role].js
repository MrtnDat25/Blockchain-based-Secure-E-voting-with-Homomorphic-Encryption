import React, { Component } from "react";

import {
  Container,
  Card,
  Header,
  Button,
  Icon,
} from "semantic-ui-react";

import Cookies from "js-cookie";

import Router, {
  withRouter,
} from "next/router";

class PersonInfor extends Component {

  state = {
    role: "",
    email: "",
    election_address: "",
  };

  componentDidMount() {

    const role =
      this.props.router.query.role;

    const address =
      Cookies.get("address");

    // ====================
    // COMPANY
    // ====================

    if (role === "company") {

      const companyEmail =
        Cookies.get("company_email");

      if (!companyEmail) {

        alert("Please login");

        Router.push("/company_login");

        return;
      }

      this.setState({
        role: "Company",
        email: companyEmail,
        election_address: address,
      });
    }

    // ====================
    // VOTER
    // ====================

    else if (role === "voter") {

      const voterEmail =
        Cookies.get("voter_email");

      if (!voterEmail) {

        alert("Please login");

        Router.push("/voter_login");

        return;
      }

      this.setState({
        role: "Voter",
        email: voterEmail,
        election_address: address,
      });
    }

    // ====================
    // INVALID ROUTE
    // ====================

    else {

      alert("Invalid role");

      Router.push("/homepage");
    }
  }

  render() {

    return (

      <Container
        style={{
          marginTop: "50px",
        }}
      >

        <Header as="h1">

          <Icon name="user circle" />

          <Header.Content>
            Personal Information
          </Header.Content>

        </Header>

        <Card fluid>

          <Card.Content>

            <Card.Header>
              {this.state.role}
            </Card.Header>

            <Card.Meta>
              User Profile
            </Card.Meta>

            <Card.Description>

              <p>
                <strong>Email:</strong>{" "}
                {this.state.email}
              </p>

              <p>
                <strong>
                  Election Address:
                </strong>{" "}
                {
                  this.state
                    .election_address
                }
              </p>

            </Card.Description>

          </Card.Content>

          <Card.Content extra>

            <Button
              primary
              onClick={() =>
                Router.push("/homepage")
              }
            >
              <Icon name="home" />
              Home
            </Button>

          </Card.Content>

        </Card>

      </Container>
    );
  }
}

export default withRouter(PersonInfor);
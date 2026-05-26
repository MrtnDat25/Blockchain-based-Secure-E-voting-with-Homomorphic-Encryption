import React, { Component } from "react";
import Cookies from "js-cookie";

import {
  Card,
  Header,
  Form,
  Button,
} from "semantic-ui-react";

class PersonInfor extends Component {

  state = {
    company_email: "",
    election_address: "",

    old_password: "",
    new_password: "",

    loading: false,
  };

  componentDidMount() {

    this.setState({
      company_email: Cookies.get("company_email"),
      election_address: Cookies.get("address"),
    });
  }

  changePassword = async () => {

    this.setState({
      loading: true,
    });

    try {

      const response = await fetch(
        "/api/person/change_password",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email:
              this.state.company_email,

            old_password:
              this.state.old_password,

            new_password:
              this.state.new_password,
          }),
        }
      );

      const data =
        await response.json();

      alert(data.message);

    } catch (err) {

      console.log(err);

      alert("Change password failed");
    }

    this.setState({
      loading: false,
    });
  };

  render() {

    return (
      <div style={{ padding: "30px" }}>

        <Header as="h2">
          Person Information
        </Header>

        <Card fluid>

          <Card.Content>

            <Card.Header>
              Company Account
            </Card.Header>

            <Card.Description>

              <p>
                <strong>Email:</strong>{" "}
                {this.state.company_email}
              </p>

              <p>
                <strong>Election Address:</strong>{" "}
                {this.state.election_address}
              </p>

            </Card.Description>

          </Card.Content>

        </Card>

        <br />

        <Card fluid>

          <Card.Content>

            <Card.Header>
              Change Password
            </Card.Header>

            <br />

            <Form>

              <Form.Input
                type="password"
                label="Old Password"
                placeholder="Enter old password"
                onChange={(event) =>
                  this.setState({
                    old_password:
                      event.target.value,
                  })
                }
              />

              <Form.Input
                type="password"
                label="New Password"
                placeholder="Enter new password"
                onChange={(event) =>
                  this.setState({
                    new_password:
                      event.target.value,
                  })
                }
              />

              <Button
                primary
                loading={this.state.loading}
                onClick={this.changePassword}
              >
                Change Password
              </Button>

            </Form>

          </Card.Content>

        </Card>

      </div>
    );
  }
}

export default PersonInfor;
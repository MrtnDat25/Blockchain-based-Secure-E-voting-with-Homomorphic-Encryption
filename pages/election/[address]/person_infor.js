import React, { Component } from "react";
import Router from "next/router";
import Cookies from "js-cookie";

import {
  Card,
  Header,
  Form,
  Button,
} from "semantic-ui-react";

import web3 from "/Ethereum/web3";

import Election_Factory
from "/Ethereum/election_factory";

class PersonInfor extends Component {

  state = {

    role: "",

    company_email: "",
    voter_email: "",

    election_address: "",

    old_password: "",
    new_password: "",

    loading: false,
  };

  componentDidMount() {

    const company_email =
      Cookies.get("company_email");

    const voter_email =
      Cookies.get("voter_email");

    this.setState({

      company_email,

      voter_email,

      election_address:
        Cookies.get("address"),

      role:
        company_email
          ? "company"
          : "voter",
    });
  }

  changePassword = async () => {

    this.setState({
      loading: true,
    });

    try {

      const {
        role,
        company_email,
        voter_email,
        election_address,
        old_password,
        new_password,
      } = this.state;

      // =====================
      // COMPANY
      // =====================

      if (role === "company") {

        await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        const accounts =
          await web3.eth.getAccounts();

        await Election_Factory.methods
          .updatePassword(
            company_email,
            old_password,
            new_password
          )
          .send({
            from: accounts[0],
          });

        alert(
          "Company password updated"
        );
      }

      // =====================
      // VOTER
      // =====================

      else {

        const response = await fetch(
          "/api/voter/change_password",
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email: voter_email,

              oldPassword:
                old_password,

              newPassword:
                new_password,

              election_address,
            }),
          }
        );

        const data =
          await response.json();

        alert(data.message);
      }

      this.setState({
        old_password: "",
        new_password: "",
      });

    } catch (err) {

      console.log(err);

      if (
        err.message?.includes(
          "Wrong old password"
        )
      ) {

        alert(
          "Wrong old password"
        );

      } else {

        alert(
          err.message ||
          "Change password failed"
        );
      }
    }

    this.setState({
      loading: false,
    });
  };

  render() {

    const {
      role,
      company_email,
      voter_email,
      election_address,
    } = this.state;

    return (

      <div style={{
        padding: "30px",
      }}>

        <Header as="h2">
          Person Information
        </Header>

        <Card fluid>

          <Card.Content>

            <Card.Header>

              {
                role === "company"
                  ? "Company Account"
                  : "Voter Account"
              }

            </Card.Header>

            <Card.Description>

              <p>

                <strong>Email:</strong>{" "}

                {
                  role === "company"
                    ? company_email
                    : voter_email
                }

              </p>

              <p>

                <strong>
                  Election Address:
                </strong>{" "}

                {election_address}

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
                value={
                  this.state.old_password
                }
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
                value={
                  this.state.new_password
                }
                onChange={(event) =>
                  this.setState({
                    new_password:
                      event.target.value,
                  })
                }
              />

              <Button
                primary
                loading={
                  this.state.loading
                }
                onClick={
                  this.changePassword
                }
              >
                Change Password
              </Button>
            <Button
              style={{ marginLeft: "10px" }}
              onClick={() => Router.back()}
            >
              Back
            </Button>

            </Form>

          </Card.Content>

        </Card>

      </div>
    );
  }
}

export default PersonInfor;
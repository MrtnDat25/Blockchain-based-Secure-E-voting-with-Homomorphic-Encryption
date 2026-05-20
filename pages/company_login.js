import React, { Component } from "react";
import {
  Button,
  Divider,
  Transition,
  Form,
  Grid,
  Segment,
} from "semantic-ui-react";

import Router from "next/router";
import web3 from "../Ethereum/web3";
import Election_Factory from "../Ethereum/election_factory";
import Head from "next/head";

class DividerExampleVerticalForm extends Component {
  state = { visible: true, email: "" };

  toggleVisibility = () =>
    this.setState({ visible: !this.state.visible });

  returnBackImage = () => (
    <div className="login-form">
      <style jsx>{`
        .login-form {
          width: 100vw;
          height: 100vh;
          position: absolute;
          background: url("/blockchain.jpg") no-repeat;
          z-index: -1;
        }
      `}</style>
    </div>
  );

  // 🔥 SIGNUP = CREATE ON BLOCKCHAIN
  signup = async () => {
    try {
      const email = document.getElementById("signup_email").value;
      const password = document.getElementById("signup_password").value;
      const repeat = document.getElementById("signup_repeat_password").value;

      if (password !== repeat) {
        alert("Passwords do not match");
        return;
      }

      await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const accounts = await web3.eth.getAccounts();

      await Election_Factory.methods
        .createElection(email, "Election", "Created from UI")
        .send({ from: accounts[0] });

      alert("Election created on blockchain!");
      this.setState({ visible: true });
    } catch (err) {
      console.log(err);
      alert("Signup failed");
    }
  };

  // 🔥 SIGNIN = READ FROM BLOCKCHAIN
  signin = async () => {
    try {
      const email = document.getElementById("signin_email").value;

      this.setState({ email });

      await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const accounts = await web3.eth.getAccounts();

      const summary = await Election_Factory.methods
        .getDeployedElection(email)
        .call({ from: accounts[0] });

      console.log("SUMMARY:", summary);

      if (summary[2] === "Create an election.") {
        Router.push("/election/create_election");
      } else {
        Router.push(`/election/${summary[0]}/company_dashboard`);
      }
    } catch (err) {
      console.log(err);
      alert("Signin failed");
    }
  };

  render() {
    const { visible } = this.state;

    return (
      <div>
        <Head>
          <title>Company Login</title>
        </Head>

        <link
          rel="stylesheet"
          href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"
        />

        {this.returnBackImage()}

        <Button.Group style={{ marginLeft: "43%" }}>
          <Button
            primary
            content={visible ? "Sign in" : "Sign up"}
            onClick={this.toggleVisibility}
          />
        </Button.Group>

        <Divider />

        <Grid>
          <Grid.Row>
            <Grid.Column width={5} style={{ marginLeft: "33%", marginTop: "10%" }}>
              <Segment placeholder>
                {/* 🔥 SIGN IN */}
                <Transition visible={!visible} animation="scale" duration={300}>
                  <Form size="large">
                    <h3>Sign in</h3>

                    <Form.Input
                      id="signin_email"
                      placeholder="Email"
                    />

                    <Form.Input
                      id="signin_password"
                      type="password"
                      placeholder="Password"
                    />

                    <Button fluid color="blue" onClick={this.signin}>
                      Submit
                    </Button>
                  </Form>
                </Transition>

                {/* 🔥 SIGN UP */}
                <Transition visible={visible} animation="scale" duration={300}>
                  <Form size="large">
                    <h3>Sign up</h3>

                    <Form.Input
                      id="signup_email"
                      placeholder="Email"
                    />

                    <Form.Input
                      id="signup_password"
                      type="password"
                      placeholder="Password"
                    />

                    <Form.Input
                      id="signup_repeat_password"
                      type="password"
                      placeholder="Repeat Password"
                    />

                    <Button fluid color="blue" onClick={this.signup}>
                      Submit
                    </Button>
                  </Form>
                </Transition>
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

export default DividerExampleVerticalForm;
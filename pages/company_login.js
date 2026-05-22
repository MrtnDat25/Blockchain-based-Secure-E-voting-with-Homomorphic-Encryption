import React, { Component } from "react";


import {
  Button,
  Divider,
  Transition,
  Form,
  Grid,
  Icon,
  Segment,
} from "semantic-ui-react";

import Router from "next/router";
import web3 from "../Ethereum/web3";
import Election_Factory from "../Ethereum/election_factory";
import Head from "next/head";
import Cookies from "js-cookie";
import Link from "next/link";


class DividerExampleVerticalForm extends Component {
  state = { visible: false, email: "" };

  toggleVisibility = () =>
    this.setState({ visible: !this.state.visible });

  returnBackImage = () => (
    <div className="login-form">
      <style jsx>{`
        .login-form {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("/blockchain.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #000; /* nền đen phần dư */
  z-index: -1;
}
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

    if (!email || !password) {
      alert("Missing fields");
      return;
    }

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

    alert("Election created!");

    this.setState({ visible: true });

  } catch (err) {
    console.log(err);
    alert("Signup failed");
  }
};

signin = async () => {
  try {
    const email = document.getElementById("signin_email").value;

    if (!email) {
      alert("Please enter email");
      return;
    }

    // 1. connect wallet
    await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const accounts = await web3.eth.getAccounts();

    if (!accounts || !accounts[0]) {
      alert("No wallet found");
      return;
    }

    // 2. get election
    const summary = await Election_Factory.methods
      .getDeployedElection(email)
      .call({ from: accounts[0] });

    console.log("SUMMARY:", summary);

    // 3. validate result
    if (!summary || !summary[0]) {
      alert("Election not found");
      return;
    }

    const address = summary[0];
    Cookies.set("address", address, {
      expires: 7,
      path: "/",
    });

    // 4. IMPORTANT: DO NOT RELY ON COOKIE
    Cookies.set("company_email", email, {
      expires: 7,
      path: "/",
    });

    // 5. SAFE ROUTE PUSH
    Router.push({
      pathname: "/election/[address]/company_dashboard",
      query: { address },
    });

  } catch (err) {
    console.log("SIGNIN ERROR:", err);
    alert(err?.message || "Signin failed");
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

      <Grid>
        <Grid.Row>
          <Grid.Column
            width={5}
            style={{
              marginLeft: "33%",
              marginTop: "8%",
            }}
          >
            {/* 🔥 HOME + SIGN IN/SIGN UP */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              <Link href="/homepage">
                <Button
                  color="grey"
                  basic
                  icon
                  labelPosition="left"
                >
                  <Icon name="home" />
                  Home
                </Button>
              </Link>

              <Button
                primary
                content={visible ? "Sign in" : "Sign up"}
                onClick={this.toggleVisibility}
              />
            </div>

            <Segment placeholder>
              {/* 🔥 SIGN IN */}
              <Transition
                visible={!visible}
                animation="scale"
                duration={300}
              >
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
              <Transition
                visible={visible}
                animation="scale"
                duration={300}
              >
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
}}

export default DividerExampleVerticalForm;
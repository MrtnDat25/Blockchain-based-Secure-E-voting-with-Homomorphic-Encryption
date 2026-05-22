import React, { Component } from "react";
import {
  Button,
  Form,
  Grid,
  Header,
  Segment,
  Icon,
} from "semantic-ui-react";

import Cookies from "js-cookie";
import Router from "next/router";
import Head from "next/head";
import Link from "next/link";

class LoginForm extends Component {
  state = {
    loading: false,
  };

  returnBackground = () => (
    <div className="login-form">
      <style jsx>{`
        .login-form {
          width: 100vw;
          height: 100vh;
          position: absolute;
          background: url("/blockchain.jpg") no-repeat;
          background-size: cover;
          z-index: -1;
        }
      `}</style>
    </div>
  );

  signin = async () => {
    try {
      this.setState({ loading: true });

      const email = document.getElementById("signin_email").value;
      const password = document.getElementById("signin_password").value;

      if (!email || !password) {
        alert("Please enter email and password");
        return;
      }

      const response = await fetch("/voter/authenticate", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `email=${encodeURIComponent(
          email
        )}&password=${encodeURIComponent(password)}`,
      });

      const data = await response.json();

      console.log("LOGIN RESPONSE:", data);

      if (data.status === "success") {
        Cookies.set("voter_email", email, {
          expires: 7,
          path: "/",
        });

        Cookies.set("address", data.data.election_address, {
          expires: 7,
          path: "/",
        });

        Router.push({
          pathname: "/election/[address]/vote",
          query: {
            address: data.data.election_address,
          },
        });
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.log(err);
      alert("Signin failed");
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    return (
      <div>
        <Head>
          <title>Voter Login</title>

          <link
            rel="stylesheet"
            href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"
          />

          <link
            rel="shortcut icon"
            type="image/x-icon"
            href="/logo3.png"
          />
        </Head>

        {this.returnBackground()}

        <Grid
          textAlign="center"
          style={{ height: "100vh" }}
          verticalAlign="middle"
        >
          <Grid.Column style={{ maxWidth: 400 }}>
            
            {/* 🔥 HOME BUTTON */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
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
            </div>

            <Form size="large">
              <Segment stacked>
                <Header
                  as="h2"
                  color="blue"
                  textAlign="center"
                >
                  Voter Login
                </Header>

                <Form.Input
                  id="signin_email"
                  fluid
                  icon="user"
                  iconPosition="left"
                  placeholder="Email"
                />

                <Form.Input
                  id="signin_password"
                  fluid
                  icon="lock"
                  iconPosition="left"
                  placeholder="Password"
                  type="password"
                />

                <Button
                  color="blue"
                  fluid
                  size="large"
                  loading={this.state.loading}
                  onClick={this.signin}
                >
                  Submit
                </Button>
              </Segment>
            </Form>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default LoginForm;
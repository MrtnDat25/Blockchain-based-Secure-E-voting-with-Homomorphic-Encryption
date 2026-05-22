import React, { Component } from 'react';
import { Grid, Header, Button, Form, Input, Icon, Menu, Modal, Sidebar, Container, Card } from 'semantic-ui-react';
import Layout from '../../../components/Layout';
import Cookies from 'js-cookie';
import Link from 'next/link'
import Head from 'next/head';
import Election from '../../../Ethereum/election';
import Router from 'next/router';
import { withRouter } from "next/router";
class VotingList extends Component { 

        state = {
          loading: false,
          election_address: Cookies.get('address'),
          election_name: '',
          election_description: '',
          voters: [],
          item: []
        }

async componentDidMount() {

  let add = this.props.router?.query?.address;

  // NEXT ROUTER LOAD CHẬM
  if (!add) {
    add = window.location.pathname.split("/")[2];
  }

  // fallback cookie
  if (!add) {
    add = Cookies.get("address");
  }

  console.log("ADDRESS:", add);

  if (!add || add === "undefined") {
    return;
  }

  try {

    const election = Election(add);

    const summary = await election.methods
      .getElectionDetails()
      .call();

    this.setState({
      election_address: add,
      election_name: summary[0],
      election_description: summary[1]
    });

    // API
    const response = await fetch('/voter/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'election_address=' + add
    });

    const data = await response.json();

    let voters = [];

    if (data.status === "success") {
      voters = data.data.voters;
    }

    const items = voters.map(voter => ({
      header: voter.email,
      description: (
        <div>

          <Modal
            size="tiny"
            trigger={
              <Button basic color="green">
                Edit
              </Button>
            }
            closeIcon
          >

            <Modal.Header>
              Edit E-mail ID
            </Modal.Header>

            <Modal.Content>
              <Input
                id={`EmailVal${voter.id}`}
                placeholder='E-mail ID'
              />
            </Modal.Content>

            <Modal.Actions>
              <Button
                positive
                onClick={() => this.updateEmail(voter.id)}
              >
                Yes
              </Button>

              <Button negative>
                No
              </Button>

            </Modal.Actions>

          </Modal>

          <Button
            negative
            basic
            onClick={() => this.deleteEmail(voter.id)}
          >
            Delete
          </Button>

        </div>
      )
    }));

    this.setState({
      item: items
    });

  } catch (err) {

    console.log(err);

    alert("Cannot load election");

  }
}

      updateEmail = async (id) => {
      const email = document.getElementById(`EmailVal${id}`).value;

      const http = new XMLHttpRequest();
      http.open("PUT", `/voter/${id}`, true);

      http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

      http.onreadystatechange = function () {
        if (http.readyState === 4 && http.status === 200) {
          const res = JSON.parse(http.responseText);
          alert(res.message);
        }
      };

      const params =
        "email=" + email +
        "&election_name=" + this.state.election_name +
        "&election_description=" + this.state.election_description;

      http.send(params);
    };

    deleteEmail = async (id) => {
    const http = new XMLHttpRequest();
    http.open("DELETE", `/voter/${id}`, true);

    http.onreadystatechange = function () {
      if (http.readyState === 4 && http.status === 200) {
        const res = JSON.parse(http.responseText);
        alert(res.message);
      }
    };

    http.send();
  };

    renderTable = () => {
        return (<Card.Group items={this.state.item}/>)
    } 

    GridExampleGrid = () => <Grid>{columns}</Grid>
    SidebarExampleVisible = () => (
      <Sidebar.Pushable>
        <Sidebar as={Menu} animation='overlay' icon='labeled' inverted vertical visible width='thin' style={{ backgroundColor: 'white', borderWidth: "10px" }}>
        <Menu.Item as='a' style={{ color: 'grey' }} >
        <h2>MENU</h2><hr/>
        </Menu.Item>      
        <Link href={{
          pathname: "/election/[address]/company_dashboard",
          query : { address: this.props.router.query.address }
        }}>
        <a>
          <Menu.Item style={{ color: 'grey', fontColor: 'grey' }}>
            <Icon name='dashboard'/>
            Dashboard
          </Menu.Item>
          </a>
          </Link>
          <Link href={
            {
              pathname: "/election/[address]/candidate_list",
              query : { address: this.props.router.query.address }
            }
          }>
          <a>
          <Menu.Item as='a' style={{ color: 'grey' }}>
            <Icon name='user outline' />
            Candidate List
          </Menu.Item>
          </a>
          </Link>
          <Link href={
            {
              pathname : "/election/[address]/voting_list",
              query : { address: this.props.router.query.address }
            }
          }>
          <a>
          <Menu.Item as='a' style={{ color: 'grey' }}>
            <Icon name='list' />
            Voter List
          </Menu.Item>
          </a>
          </Link>
          <hr/>
          <Button onClick={this.signOut} style={{backgroundColor: 'white'}}>
          <Menu.Item as='a' style={{ color: 'grey' }}>
            <Icon name='sign out' />
            Sign Out
          </Menu.Item>       
          </Button>  
        </Sidebar>
      </Sidebar.Pushable>
    )
signOut = () => {
  Cookies.remove('address');
  Cookies.remove('company_email');
  Cookies.remove('company_id');
  alert("Logging out....")
  Router.push('/homepage');
};

register = async (event) => {

  event.preventDefault();

  this.setState({
    loading: true
  });

  try {

    const email = document.getElementById(
      "register_voter_email"
    ).value;

    const add =
      this.state.election_address ||
      this.props.router.query.address;

    console.log("EMAIL:", email);
    console.log("ADDRESS:", add);

    const response = await fetch(
      "/voter/register",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded"
        },

        body:
          `email=${email}` +
          `&election_address=${add}` +
          `&election_name=${this.state.election_name}` +
          `&election_description=${this.state.election_description}`
      }
    );

    console.log("STATUS:", response.status);

    const data = await response.json();

    console.log("DATA:", data);

    if (response.ok) {

      alert(data.message);

      window.location.reload();

    } else {

      alert(data.message || "Register failed");

    }

  } catch (err) {

    console.log("REGISTER ERROR:", err);

    alert(err.message);

  }

  this.setState({
    loading: false
  });
};
	
  render() {      
    return (
      <div>
          <Head>
            <title>Voting list</title>
            <link rel="shortcut icon" type="image/x-icon" href="../../public/logo3.png" />
          </Head>
        <Grid>
          <Grid.Row>
            <Grid.Column width={2}>
              {this.SidebarExampleVisible()}
            </Grid.Column>
            <Layout>                      
              <br />
              <br />
              <Grid.Column width={14} style={{ minHeight: '630px' }}>
                <Grid.Column style={{ float: 'left', width: '60%' }}>
                  <Header as='h2' color='black'>
                    Voter List
              </Header>
                  <Container>                      
                      <table>
                      {this.renderTable()}
                      </table>                                        
                  </Container>
                </Grid.Column>
                <Grid.Column style={{ float: 'right', width: '30%' }}>
                  <Container style={{}}>
                    <Header as='h2' color='black'>
                      Register Voter
                       </Header>
                    <Card style={{ width: '100%' }}>
                      <br/>
                      <Form size='large' style={{ marginLeft: '15%', marginRight: '15%' }} >
                        <Form.Input
						              style={{marginTop: '10px'}}
                          fluid
                          id='register_voter_email'
                          label='Email:'
                          placeholder='Enter your email.'
                          textAlign='center'
                        />

                        <br /><br />
                        <Button
                          primary
                          loading={this.state.loading}
                          onClick={this.register}
                          style={{
                            marginBottom: '15px'
                          }}
                        >
                          Register
                        </Button>
                      </Form>
                    </Card>
                  </Container>
                </Grid.Column>                
              </Grid.Column>
            </Layout>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}


export default withRouter(VotingList);
// export default VotingList
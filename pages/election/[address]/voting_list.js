import React, { Component } from 'react';
import { Grid, Header, Button, Form, Input, Icon, Menu, Modal, Sidebar, Container, Card } from 'semantic-ui-react';
import Layout from '../../../components/Layout';
import Cookies from 'js-cookie';
import Link from 'next/link'
import Head from 'next/head';
import Election from '../../../Ethereum/election';
import Router from 'next/router';
import { withRouter } from "next/router";


import * as XLSX from "xlsx"
import axios from "axios";
class VotingList extends Component { 

        state = {
          loading: false,
          election_address: Cookies.get('address'),
          election_name: '',
          election_description: '',
          excelLoading: false,
          voters: [],
          item: []
        }

async componentDidMount() {
  try {
    let add = this.props.router?.query?.address;

    if (!add) {
      add = window.location.pathname.split("/")[2];
    }

    if (!add) {
      add = Cookies.get("address");
    }

    if (!add) return;

    const election = Election(add);

    const summary = await election.methods.getElectionDetails().call();

    this.setState(
      {
        election_address: add,
        election_name: summary[0],
        election_description: summary[1],
      },
      () => {
        this.loadVoters();
      }
    );
  } catch (err) {
    console.error(err);
  }
}

loadVoters = async () => {
  try {
    const body = new URLSearchParams({
      election_address: this.state.election_address,
    });

    const res = await fetch("/api/voter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const data = await res.json();

    let voters = data?.data?.voters || [];

    const items = voters.map((voter) => {

      console.log(voter);

      return {
        header: voter.email,
        description: (
          <div>
            <Button
              negative
              basic
              onClick={() => this.deleteEmail(voter.id)}
            >
              Delete
            </Button>
          </div>
        ),
      };
    });

    this.setState({
      voters, 
      item: items });
  } catch (err) {
    console.error(err);
  }
};



      updateEmail = async (id) => {
      const email = document.getElementById(`EmailVal${id}`).value;

      const http = new XMLHttpRequest();
      http.open("PUT", `/voter/${id}`, true);

      http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

      http.onreadystatechange = () => {
        if (http.readyState === 4 && http.status === 200) {
          const res = JSON.parse(http.responseText);
          alert(res.message);
          this.loadVoters()
        }
      };

      const params =
        "email=" + email +
        "&election_name=" + this.state.election_name +
        "&election_description=" + this.state.election_description;

      http.send(params);
    };

 deleteEmail = async (id) => {
  try {

    const response = await fetch(`/api/voter/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (response.ok) {

      alert(data.message);

      this.loadVoters();

    } else {

      alert(data.message || "Delete failed");
    }

  } catch (err) {

    console.error(err);

    alert("Server error");
  }
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
          <Menu.Item style={{ color: 'grey', fontColor: 'grey' }}>
            <Icon name='dashboard'/>
            Dashboard
          </Menu.Item>
          
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
        Cookies.remove('companyid');
        alert("Logging out....")
        Router.push('/homepage');
      };

      register = async (event) => {
        event.preventDefault();
        this.setState({ loading: true });

        try {
          const email = document
            .getElementById("register_voter_email")
            ?.value?.trim();

          const add = this.state.election_address;

          if (!email || !add) {
            alert("Missing email or election address");
            return;
          }

          const body = new URLSearchParams({
            email,
            election_address: add,
            election_name: this.state.election_name,
            election_description: this.state.election_description,
          });

          const response = await fetch("/api/voter/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body.toString(),
          });

          const data = await response.json();

          if (response.ok && data.status === "success") {
            alert(data.message);
            this.loadVoters(); // reload list
          } else {
            alert(data.message || "Register failed");
          }
        } catch (err) {
          console.error(err);
          alert(err.message);
          // alert("Error register");
        } finally {
          this.setState({ loading: false });
        }
      };

      handleExcelUpload = async (event) => {

        const file = event.target.files[0];

        if (!file) return;

        this.setState({ excelLoading: true });

        try {

          const data = await file.arrayBuffer();

          const workbook = XLSX.read(data);

          const sheetName = workbook.SheetNames[0];

          const worksheet = workbook.Sheets[sheetName];

          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          console.log(jsonData);

          for (const row of jsonData) {

            const email = row.email || row.Email || row.EMAIL;

            if (!email) continue;

            const body = new URLSearchParams({
              email: email,
              election_address: this.state.election_address,
              election_name: this.state.election_name,
              election_description: this.state.election_description,
            });

            const response = await fetch("/api/voter/register", {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/x-www-form-urlencoded",
              },
              body: body.toString(),
            });

            const result = await response.json();

            console.log(result);
          }

          alert("Import voters successfully!");

          this.loadVoters();

        } catch (err) {

          console.log(err);

          alert("Excel import failed");

        }

        this.setState({ excelLoading: false });
      };


      handleExcelImport = async (event) => {

  const file = event.target.files[0];

  if (!file) return;

  const formData = new FormData();

  formData.append("file", file);

  formData.append(
    "election_address",
    this.state.election_address
  );

  try {

    this.setState({
      loading: true,
    });

    const response = await axios.post(
      "/api/voter/import",
      formData
    );

    alert(
      `Imported ${response.data.inserted} voters`
    );

    this.loadVoters();

  } catch (err) {

    console.log(err);

    alert("Import failed");

  }

  this.setState({
    loading: false,
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
                  {this.renderTable()}

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
                          style={{ textAlign: 'center' }}
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
                        <br />

                        <p>Import Excel</p>

                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={this.handleExcelImport}
                        />
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
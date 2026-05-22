import React, { Component } from 'react';
import { Grid, Table, Button, Form, Image, Header, Icon, Menu, Modal, Sidebar, Container, Card } from 'semantic-ui-react';
import Layout from '../../../components/Layout';
import web3 from '../../../Ethereum/web3';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Router from 'next/router';
import Election from '../../../Ethereum/election';

import Head from "next/head";

import { uploadToPinata } from "../../../pinata";


class VotingList extends Component { 

    state = {
      election_address: Cookies.get('address'),
      election_name: '',
      election_description: '',
      candidates: [],
      cand_name: '',
      cand_desc: '',
      file: null,
      pinataHash: null,
      loading: false
    }

    async componentDidMount() {
        try {
            const add = Cookies.get('address');
            const election = Election(add);
            const summary = await election.methods.getElectionDetails().call();
            this.setState({
                election_name: summary[0],
                election_description: summary[1]
            });            
            const c = await election.methods.getNumOfCandidates().call();
            if(c == 0)
                alert("Register a candidate first!");

            let candidates = [];
            for(let i=0 ; i<c; i++) {
                candidates.push(await election.methods.getCandidate(i).call());
            }
        let i=-1;
        const items = candidates.map(candidate => {
            i++;
            console.log(candidate[2]);
            return {
              header: candidate[0],
              description: candidate[1],
              image: (
                  <Image src={`https://gateway.pinata.cloud/ipfs/${candidate[2]}`} />
                ),
              extra: (
                  <div>
                    <Icon name='pie graph' iconPostion='left'/>  
                    {candidate[3].toString()}  
                </div>
              ) 
            };
            
        });
        this.setState({item: items}); 
        } catch(err) {
            console.log(err.message);
            alert("Redirecting you to login page...");
            Router.push('/company_login');
        }
    }
    getElectionDetails = () => {
        const {
            election_name,
            election_description
        } = this.state;
    
        return (
          <div style={{marginLeft: '45%',marginBottom: '2%',marginTop: '2%'}}>
            <Header as="h2">
              <Icon name="address card" />
              <Header.Content>
                {election_name}
                <Header.Subheader>{election_description}</Header.Subheader>
              </Header.Content>
            </Header>
          </div>
        );
      }

    renderTable = () => {
        return (<Card.Group items={this.state.item}/>)
    } 

    captureFile = (event) => {
      event.stopPropagation();
      event.preventDefault();

      const file = event.target.files[0];

      if (!file) {
        alert("No file selected");
        return;
      }

      let reader = new FileReader();

      reader.readAsArrayBuffer(file);

      reader.onloadend = () => {
        const buffer = Buffer.from(reader.result);

        this.setState({
          file: file,
          buffer: buffer
        });
      };
    };

    
onSubmit = async (event) => {
  event.preventDefault();
  this.setState({ loading: true });

  try {
    const accounts = await web3.eth.getAccounts();

    const { file, cand_name, cand_desc } = this.state;

    if (!file) {
      alert("Please upload image first");
      this.setState({ loading: false });
      return;
    }

    // 1. upload Pinata
    const hash = await uploadToPinata(file);

    // 2. save hash state (optional)
    this.setState({ pinataHash: hash });

    // 3. check election address
    // const add = Cookies.get("address");

    if (!add) {
      alert("Missing election address");
      Router.push("/company_login");
      return;
    }

    const election = Election(add);

    // 4. blockchain call
    await election.methods
      .addCandidate(
        cand_name,
        cand_desc,
        hash,
        document.getElementById("email").value
      )
      .send({
        from: accounts[0],
      });

    alert("Added successfully!");

    // 5. backend call
    const email = document.getElementById("email").value;

    const params =
      "email=" +
      email +
      "&election_name=" +
      this.state.election_name;

    const http = new XMLHttpRequest();
    http.open("POST", "/candidate/registerCandidate", true);
    http.setRequestHeader(
      "Content-type",
      "application/x-www-form-urlencoded"
    );

    http.onreadystatechange = function () {
      if (http.readyState === 4 && http.status === 200) {
        const responseObj = JSON.parse(http.responseText);
        alert(responseObj.message);
      }
    };

    http.send(params);

  } catch (err) {
    console.log(err);
    alert(err?.message || "Upload failed");
  }

  this.setState({ loading: false });
};
    
    GridExampleGrid = () => <Grid>{columns}</Grid>
    SidebarExampleVisible = () => (
        <Sidebar.Pushable>
          <Sidebar as={Menu} animation='overlay' icon='labeled' inverted vertical visible width='thin' style={{ backgroundColor: 'white', borderWidth: "10px" }}>
          <Menu.Item as='a' style={{ color: 'grey' }} >
          <h2>MENU</h2><hr/>
          </Menu.Item>      
          <Link href={
            {
              pathname : "/election/[address]/company_dashboard",
              query : { address: Cookies.get('address')}
            }
          }>
          
          <a>
            <Menu.Item style={{ color: 'grey' }}>
              <Icon name='dashboard'/>
              Dashboard
            </Menu.Item>
            </a>
            </Link>
            <Link href={
            {
              pathname : "/election/[address]/candidate_list",
              query : { address: Cookies.get('address')}
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
              query : { address: Cookies.get('address')}
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

	alert('Logging out.');

	Router.push('/homepage');
};
  

  render() {
      const {Body, Row, HeaderCell, Header} = Table;
    return (
      <div>
          <Head>
            <title>Candidate list!</title>
            <link rel="shortcut icon" type="image/x-icon" href="../../public/logo3.png" />
          </Head>
        <Grid>
          <Grid.Row>
            <Grid.Column width={2}>
              {this.SidebarExampleVisible()}
            </Grid.Column>
            <Layout>
                {this.getElectionDetails()}                      
              <br />
              <br />
              <Grid.Column width={14} style={{ minHeight: '630px' }}>
                <Grid.Column style={{ float: 'left', width: '60%' }}>
                  <Header as='h2' color='black'>
                    Candidate List
              </Header>
                  <Container>                      
                      <table>
                      {this.renderTable()}
                      </table>                                        
                  </Container>
                </Grid.Column>
                <Grid.Column style={{ float: 'right', width: '30%' }}>
                <Container style={{marginLeft:'50px'}}>                      
                <Header as='h2' color='black' textAlign='center'>                 
                        Add Candidate
                       </Header>
                       <Card style={{width: '100%'}}>      
                       
                       <Form.Group size='large'style={{marginLeft: '15%',marginRight: '15%'}} >                       
                       <br/>
                       <Form.Input
                        fluid
                        label='Name:'
                        placeholder='Enter your name.'
                        onChange={event => this.setState({ cand_name: event.target.value })}
                        textAlign='center'
                       
                    />        
                        
                        <p>Image:</p>
                       
                        
                        <div className="ui fluid" style={{ borderWidth: '0px', marginRight: '20%' }}>
                          <input
                              type="file"
                              id="embedpollfileinput"
                              onChange={this.captureFile}
                            />

                            <label htmlFor="embedpollfileinput">
                              Upload image
                            </label>
                        </div><br /><br /><br />
                        <p>Description:</p>
                        <Form.Input as='TextArea'
                         fluid
                         label='Description:'                         
                         placeholder='Describe here.'
                         style={{width: '100%'}}
                         centered={true}
                         onChange={event => this.setState({ cand_desc: event.target.value })}
                          />
                       <br/><br/>
                       <p>E-mail ID: </p>
                       <Form.Input fluid
                         id="email"
                         placeholder="Enter your e-mail"
                       />
                       <br/>
                       <Button primary onClick={this.onSubmit} loading={this.state.loading} style={{Bottom: '10px',marginBottom: '10px'}}>Register</Button>
                        </Form.Group>                                  
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


export default VotingList
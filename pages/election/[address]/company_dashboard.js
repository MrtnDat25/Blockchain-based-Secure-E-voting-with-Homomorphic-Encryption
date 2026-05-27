import React, { Component } from 'react';
import {
	Grid,
	Step,
	Icon,
	Menu,
	Sidebar,
	Card,
	Header,
	Button,
} from 'semantic-ui-react';

import Layout from '../../../components/Layout';
import { Bar } from 'react-chartjs-2';
import 'chartjs-plugin-annotation';

import Election from '../../../Ethereum/election';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Router from 'next/router';
import Head from 'next/head';

class ContainerExampleContainer extends Component {
	state = {
		election_address: '',
		election_name: '',
		election_desc: '',
		voters: 0,
		candidates: 0,
		totalRegisteredVoters: 0,
		loading: false,
		graphEmail: [],
		graphVotes: [],
	};

	async componentDidMount() {
		try {
			const add = Cookies.get('address');

			console.log('Address:', add);

			// check login
			if (!add || add === "undefined" || add === null) {
				alert('Please login first');
				Router.push('/company_login');
				return;
			}

			this.setState({
				election_address: add,
			});

			// voter count API
			const http = new XMLHttpRequest();

			http.open('POST', '/voter/', true);

			http.setRequestHeader(
				'Content-type',
				'application/x-www-form-urlencoded'
			);

			http.onreadystatechange = () => {
				if (http.readyState === 4 && http.status === 200) {
					const responseObj = JSON.parse(http.responseText);

					if (responseObj.status === 'success') {
						this.setState({
							totalRegisteredVoters: responseObj.count,
						});
					}
				}
			};

			http.send(`election_address=${add}`);

			// blockchain
			const election = Election(add);

			const summary = await election.methods
				.getElectionDetails()
				.call();

			const voters = Number(
			await election.methods
				.getNumOfVoters()
				.call()
			);

			const candidates = Number(
			await election.methods
				.getNumOfCandidates()
				.call()
			);

			let graphEmail = [];
			let graphVotes = [];

			for (let i = 0; i < candidates; i++) {
				const tp = await election.methods
					.getCandidate(i)
					.call();

				graphEmail.push(tp[0]);
				graphVotes.push(Number(tp[3]));
			}

			this.setState({
				election_name: summary[0],
				election_desc: summary[1],
				voters,
				candidates,
				graphEmail,
				graphVotes,
			});
		} catch (err) {
			console.log(err);

			alert('Something went wrong');

			Router.replace('/company_login');
		}
	}

	signOut = () => {
		Cookies.remove('address');
		Cookies.remove('company_email');
		Cookies.remove('company_id');

		alert('Logging out');

		Router.push('/homepage');
	};

	endElection = async () => {
		try {
			this.setState({
				loading: true,
			});

			const add = Cookies.get('address');

			if (!add || add === "undefined" || add === null) {
				Router.push('/company_login');
				return;
			}

			const election = Election(add);

			const candidateIndex = await election.methods
				.winnerCandidate()
				.call();

			const cand = await election.methods
				.getCandidate(candidateIndex)
				.call();

			const http = new XMLHttpRequest();

			http.open('POST', '/voter/resultMail', true);

			http.setRequestHeader(
				'Content-type',
				'application/x-www-form-urlencoded'
			);

			http.onreadystatechange = () => {
				if (http.readyState === 4 && http.status === 200) {
					const responseObj = JSON.parse(http.responseText);

					if (responseObj.status === 'success') {
						alert('Mail sent!');
					} else {
						alert(responseObj.message);
					}
				}
			};

			const params =
				`election_address=${add}` +
				`&election_name=${this.state.election_name}` +
				`&candidate_email=${cand[4]}` +
				`&winner_candidate=${cand[0]}`;

			http.send(params);

			this.setState({
				loading: false,
			});
		} catch (err) {
			console.log(err);

			this.setState({
				loading: false,
			});
		}
	};

	renderGraph() {
		const data = {
			labels: this.state.graphEmail,
			datasets: [
				{
					label: 'Vote Counts',
					backgroundColor: 'rgba(255,99,132,0.2)',
					borderColor: 'rgba(255,99,132,1)',
					borderWidth: 2,
					data: this.state.graphVotes,
				},
			],
		};

		const options = {
			responsive: true,
			maintainAspectRatio: true,
		};

		return (
			<Bar
				data={data}
				options={options}
				width={120}
				height={50}
			/>
		);
	}

	render() {
		const { election_address } = this.state;

		return (
			<div>
				<Head>
					<title>Dashboard</title>
				</Head>

				<Grid>
					<Grid.Row>
						<Grid.Column width={2}>
							<Sidebar.Pushable>
								<Sidebar
									as={Menu}
									animation="overlay"
									icon="labeled"
									inverted
									vertical
									visible
									width="thin"
									style={{
										backgroundColor: 'white',
									}}
								>
									<Menu.Item>
										<h2 style={{ color: 'grey' }}>
											MENU
										</h2>
									</Menu.Item>

									<Link
										href={
											{
												pathname : "/election/[address]/company_dashboard",
												query: { address: this.state.election_address }
											}
										}
									>
										<Menu.Item
											style={{ color: 'grey' }}
										>
											<Icon name="dashboard" />
											Dashboard
										</Menu.Item>
									</Link>

									<Link
										href={
											{
												pathname : "/election/[address]/candidate_list",
												query: { address: this.state.election_address }
											}
										}
									>
										<Menu.Item
											style={{ color: 'grey' }}
										>
											<Icon name="user outline" />
											Candidate List
										</Menu.Item>
									</Link>

									<Link
										href={{
											pathname: "/election/[address]/voting_list",
											query: { address: this.state.election_address }
										}}
										>
										<Menu.Item
											style={{ color: 'grey' }}
										>
											<Icon name="list" />
											Voter List
										</Menu.Item>
									</Link>
									<Link
										href={{
											pathname: "/election/[address]/person_infor",
											query: { address: Cookies.get("address") },
										}}
										>
										<a>
											<Menu.Item as="a" style={{ color: "grey" }}>
											<Icon name="id card" />
											Person Information
											</Menu.Item>
										</a>
									</Link>

									<Button
										onClick={this.signOut}
										style={{
											backgroundColor: 'white',
										}}
									>
										<Icon name="sign out" />
										Sign Out
									</Button>
								</Sidebar>
							</Sidebar.Pushable>
						</Grid.Column>

						<Layout>
							<Grid.Column width={16}>
								<div
									style={{
										marginTop: '20px',
										marginBottom: '20px',
									}}
								>
									<Header as="h2">
										<Icon name="address card" />

										<Header.Content>
											{
												this.state
													.election_name
											}

											<Header.Subheader>
												{
													this.state
														.election_desc
												}
											</Header.Subheader>
										</Header.Content>
									</Header>
								</div>

								<Button
									negative
									float="right"
									onClick={this.endElection}
									loading={this.state.loading}
								>
									End Election
								</Button>

								<Step.Group>
									<Step
										icon="users"
										title="Voters"
										description={
											this.state
												.totalRegisteredVoters
										}
									/>

									<Step
										icon="user outline"
										title="Candidates"
										description={
											this.state.candidates
										}
									/>

									<Step
										icon="chart bar outline"
										title="Total Votes"
										description={
											this.state.voters
										}
									/>
								</Step.Group>

								<Card.Group />

								<div
									style={{
										marginTop: '30px',
									}}
								>
									{this.renderGraph()}
								</div>
							</Grid.Column>
						</Layout>
					</Grid.Row>
				</Grid>
			</div>
		);
	}
}

export default ContainerExampleContainer;
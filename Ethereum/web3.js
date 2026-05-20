import Web3 from 'web3';

let web3;

if (
	typeof window !== 'undefined' &&
	typeof window.ethereum !== 'undefined'
) {
	web3 = new Web3(window.ethereum);
} else {
	web3 = new Web3(
		'https://sepolia.infura.io/v3/29bcae4ee7454a118a2b0f0f4d86c0e0'
	);
}

export default web3;
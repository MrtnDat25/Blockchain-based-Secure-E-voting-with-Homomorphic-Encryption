import web3 from './web3';
import ElectionFactory from '../artifacts/contracts/Election.sol/ElectionFactory.json';
const instance = new web3.eth.Contract(
  ElectionFactory.abi,
  '0x5043f9573Da5e51b8bE72b3A3FDf2Fdf71925505'
);

export default instance;

// Contract deployed to: 0x5043f9573Da5e51b8bE72b3A3FDf2Fdf71925505
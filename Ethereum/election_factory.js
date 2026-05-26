import web3 from './web3';
import ElectionFactory from '../artifacts/contracts/Election.sol/ElectionFactory.json';
const instance = new web3.eth.Contract(
  ElectionFactory.abi,
  '0xc8ceA21404F54A3Aa42730a9A0726F3d71aB76B4'
);

export default instance;


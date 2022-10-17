import { HttpException, Injectable } from '@nestjs/common';
import { ethers } from "ethers";

import * as ERC20VotesJson from './assets/MyERC20Votes.json';
import * as TokenizedBallotJson from './assets/TokenizedBallot.json';
import * as dotenv from "dotenv";
dotenv.config();

const ERC20_TOKEN_ADDR = "0x054C163B212fFF59Cb42aEAC9EF27C6803F490Cc";
const TOKENIZED_BALLOT_ADDR = "0x84DC87068c4642D4BcFFFC6aaC737Ec3dd592778";
const REFERENCE_BLOCK = "7746117";

export class RequestPaymenDTO {
  id: string;
  secret: string;
  address: string;
}
export class PaymentOrder {
  id: string;
  secret: string;
  amount: string;
}

export class Proposal {
  name: string;
  voteCount: number;
}

@Injectable()
export class AppService {
  provider: ethers.providers.Provider;
  erc20Contract: ethers.Contract;
  tokenizedBallotContract: ethers.Contract;

  database: PaymentOrder[];

  constructor(){
    this.provider = ethers.getDefaultProvider("goerli");
    this.erc20Contract = new ethers.Contract(ERC20_TOKEN_ADDR, ERC20VotesJson.abi, this.provider);
    this.tokenizedBallotContract = new ethers.Contract(TOKENIZED_BALLOT_ADDR, TokenizedBallotJson.abi, this.provider);
    this.database = [];
  }

  async castVote(proposal: string) {
    const seed = process.env.MNEMONIC
    const wallet = ethers.Wallet.fromMnemonic(seed);
    const signer = wallet.connect(this.provider);
    const signedContract = this.tokenizedBallotContract.connect(signer);

    const votingPower = await this.erc20Contract.getPastVotes(signer.address, REFERENCE_BLOCK);
    const castVote = await signedContract.vote(proposal, votingPower);
    await castVote.wait();

    return {
      message: `A vote has succesfully been casted for proposal ${proposal}. Txn Hash: ${castVote.hash}`
    }
  }


  async getWinningProposal() {
    const seed = process.env.MNEMONIC
    const wallet = ethers.Wallet.fromMnemonic(seed);
    const signer = wallet.connect(this.provider);
    const signedContract = this.tokenizedBallotContract.connect(signer);

    const winningProposal = await this.tokenizedBallotContract.winnerName();

    return {
      winningProposal: winningProposal
    }

  }


  async totalSupply(){
    const totalSupply = await this.erc20Contract.totalSupply();
    const totalSupplyConverted = ethers.utils.formatEther(totalSupply);

    return totalSupplyConverted;
  }

  async allowance(owner:string, spender:string){
    const allowanceBN = await this.erc20Contract.allowance(owner, spender);
    const allowance = ethers.utils.formatEther(allowanceBN);

    return allowance;
  }

  getTransactionByHash(txHash: string){
    return this.provider.getTransaction(txHash)
  }

  async getTransactionByReceipt(txHash: string){
    const tx = await this.getTransactionByHash(txHash);
    return await tx.wait();
  }

  getPaymentOrderById(id: string){
    const element = this.database.find((el) => el.id === id);
    if(!element) throw new HttpException("Payment Order not found", 404);
    return { id: element.id, amount: element.amount }
  }

  getAllPaymentOrders(){
    const filteredDatabase = [];

    this.database.forEach( (element) =>
      filteredDatabase.push({ id: element.id, amount: element.amount}),
    );

    return filteredDatabase;
  }

  createPaymentOrder(body: PaymentOrder){
    this.database.push(body);
    return this.database.length;
  }

  async requestPayment(body: RequestPaymenDTO) {
    const paymentEntry = this.database.find((el) => el.id === body.id);
    if(!paymentEntry) throw new HttpException('Payment Order not', 404);
    if(paymentEntry.secret != body.secret) throw new HttpException(' Wrong Secret ', 401);

    const seed = "";
    const wallet = ethers.Wallet.fromMnemonic(seed);
    const signer = wallet.connect(this.provider);
    const signedContract = this.erc20Contract.connect(signer);
    
    // TODO: mint token
    const tx = await signedContract.mint(body.address, ethers.utils.parseEther(paymentEntry.amount.toString()));

    return tx;
  }

}

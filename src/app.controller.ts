import { Controller, Get, Param, Query, Body, Post, HttpException } from '@nestjs/common';
import { AppService, PaymentOrder, RequestPaymenDTO } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService){}
    
  @Get("total-supply")
  totalSupply(){
    return this.appService.totalSupply();
  }

  @Get("winning-proposal")
  getWinningProposal(){
    return this.appService.getWinningProposal();
  }

  @Get('allowance')
  allowance(@Query("owner") owner:string, @Query("spender") spender:string){
    return this.appService.allowance(owner, spender)
  }

  @Get('get-transaction-by-hash/:hash')
  getTransactionByHash(@Param("hash") hash:string){
    return this.appService.getTransactionByHash(hash);
  }

  @Get('get-transaction-receipt-by-hash/:hash')
  async getTransactionReceiptByHash(@Param("hash") hash: string){
    return this.appService.getTransactionByReceipt(hash);
  }

  @Get('get-all-payment-orders')
  getAllPaymentOrders(){
      return this.appService.getAllPaymentOrders();
  }

  @Get("get-paymen-odrer-by-id/:id")
  getPaymentOrderById(@Query("id") id: string){
    return this.appService.getPaymentOrderById(id);
  }

  @Post('create-payment-order')
  createPaymentOrder(@Body() body: PaymentOrder){
    return this.appService.createPaymentOrder(body);
  }

  @Post('request-payment')
  requestPayment(@Body() body: RequestPaymenDTO){
    this.appService.requestPayment(body);
  }

  @Post('cast-vote')
  castVote(@Param() proposal: string){
    return this.appService.castVote(proposal);
  }
}

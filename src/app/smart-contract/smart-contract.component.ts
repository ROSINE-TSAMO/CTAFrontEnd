import { Component, OnInit } from '@angular/core';
import { WinRefService } from'../../services/win-ref.service';
import { LambdaApiService } from '../../services/lambda-api.service';
import {ethers} from 'ethers';
import StandardPack from '../../contracts/StandardPack.json';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TermsConditionsComponent } from '../terms-conditions/terms-conditions.component';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-smart-contract',
  templateUrl: './smart-contract.component.html',
  styleUrls: ['./smart-contract.component.scss']
})


export class SmartContractComponent implements OnInit {
  
  encryptMsg: any;
  images = ['../../assets/images/booster-rouge.gif','../../assets/images/booster-bleu.gif','../../assets/images/booster-vert.gif'];
  wallet :any;
  signer : any;
  addresses = "0xFe602439187c5b3d64085c7e2038089B2069C711";
  ctaContract: any;
  mintNft: any;
  responseFromLambda: any;
  
  idPolygon: number = 139;

  promotionCard = new Map<string, number>([
    ["apprentice", 100],
    ["disciple", 250],
    ["primus"  , 500]
  ])
  
  constructor(private winref: WinRefService, public modalService: NgbModal, private apiService: LambdaApiService) {
    this.wallet = winref.window.ethereum;    
  }

  async ngOnInit() {
      this.connectPolygon()
      //if variable localStorage is null, call the modal windows 
      if(localStorage.getItem('terminiCondizioni') == null){
         this.openModal();
      }
  }

  //Add network polygon to network
  async connectPolygon(){
    //Parameters of polygon network
    const networks = {
      polygon: {
        chainId: `0x${Number(137).toString(16)}`,
        chainName: "Polygon Mainnet",
        nativeCurrency: {
          name: "MATIC",
          symbol: "MATIC",
          decimals: 18
        },
        rpcUrls: ["https://polygon-rpc.com/"],
        blockExplorerUrls: ["https://polygonscan.com/"]
      }
    }
    //if polygon is not installed, then open metamask window to add polygon network 
    await this.wallet.request({
      method: "wallet_addEthereumChain",
      params: [{ ...networks["polygon"]}]
      });     
  }

  //Communication between FE and samrt contract
  async smartContract(typeOfCard: any){
    try{
      if(this.wallet){
        const provider = new ethers.providers.Web3Provider(this.wallet);
        this.signer = provider.getSigner();
        
        let chainId= await this.signer.getChainId();
        if(chainId !==137){
          this.alertWhiteList("Please change your network to polygon");  
        }
        else{
          //console.log("id network:", chainId); 
          let userAddress = await this.signer.getAddress()
          //console.log("Account:",userAddress);  
          //check if is the date for minting 
          let mintingDay=  this.checkTime();
          if(mintingDay)
          {
              //Call the smart contract
              //this.ctaContract = new ethers.Contract(this.addresses,StandardPack.abi,this.signer);

              //check if user have enough matic for minting
              //let balance =ethers.utils.formatEther( await this.getBalance());
             
              //this.mintNft =  (await this.ctaContract.createPackage((await this.signer.getAddress(),{value: ethers.utils.parseEther('0.05'),})));
              //Wait execution of minting token
              /*let tx = await this.mintNft.wait();
              let event = tx.events[0];
              let value = event.args[2];
              let tokenId = value.toNumber;
              this.alertWhiteList("Your package has been minting");
              */
          }
          else{
            this.alertWhiteList("You can't mint this package because it's not a day of minting");
          }        
        }
      }
      else{
        this.alertWhiteList("Please Install metamask");
      }
    }
    catch(error)
    {
      this.alertWhiteList("Please Connect metamask");
    }
  }
  alertWhiteList(msg:any){
    Swal.fire({
      title: "<i class='fas fa-exclamation-triangle'></i> ops...",
      text:  msg,
      confirmButtonColor: '#02031f',
      heightAuto: false,
    })
  }
  openModal() {
    //ModalComponent is component name where modal is declare
    const modalRef = this.modalService.open(TermsConditionsComponent);
    modalRef.result.then((result) => {
      console.log(result);
    }).catch((error) => {
      console.log(error);
    });
  }

  //check if balance of user is enough
  async getBalance(){
    let [account] = await this.wallet.request({ method: 'eth_requestAccounts' });
    let provider = new ethers.providers.Web3Provider(this.wallet);
    let  balance = await provider.getBalance(account);
    return balance; 
  }

//check time
  checkTime(): boolean {
    let today = new Date();
    let check = false;
    if(today.getDay() == 5)
    {
      if (today.getHours() >= 10 && (today.getHours() <= 23 && today.getMinutes() < 59)){
        check= false;
      }
    }
    else if(today.getDay() == 6)
    {
      if (today.getHours() >= 0 && (today.getHours() < 9 && today.getMinutes() < 59))
      {
        check= false;
      }
    }
    else
    {
       check= true;
    }
    return check
  }
}

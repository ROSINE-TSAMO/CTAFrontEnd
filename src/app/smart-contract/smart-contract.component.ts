import { Component, OnInit } from '@angular/core';
import { WinRefService } from'../../services/win-ref.service';
import {ethers} from 'ethers';
import StandardPack from '../../contracts/StandardPack.json';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TermsConditionsComponent } from '../terms-conditions/terms-conditions.component';


@Component({
  selector: 'app-smart-contract',
  templateUrl: './smart-contract.component.html',
  styleUrls: ['./smart-contract.component.scss']
})


export class SmartContractComponent implements OnInit {
  
  textImage: string = '';
  images = ['../../assets/images/booster-rouge.gif','../../assets/images/booster-bleu.gif','../../assets/images/booster-vert.gif'];
  wallet :any;
  signer : any;
  addresses = "0xFe602439187c5b3d64085c7e2038089B2069C711";
  ctaContract: any;
  mintNft: any;
  public  matic: number = 0;
  idPolygon: number = 139;

  promotionCard = new Map<string, number>([
    ["bronze", 100],
    ["silver", 250],
    ["gold"  , 500]
  ])
  
  constructor(private winref: WinRefService, public modalService: NgbModal) {
    this.wallet = winref.window.ethereum;    
  }

  async ngOnInit() {
      //this.connectPolygon()

      //if variable localStorage is null, call the modal windows 
      if(localStorage.getItem('terminiCondizioni') == null){
         this.openModal();
      }
  }

 
  async getBalance(){
    let [account] = await this.wallet.request({ method: 'eth_requestAccounts' });
    let provider = new ethers.providers.Web3Provider(this.wallet);
    let  balance = await provider.getBalance(account);
    return balance; 
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
  async smartContract(typeOfCard: any/*type of package as parameters*/){
    try{
      console.log("Name of card:",typeOfCard);
      console.log("Price of card:",this.promotionCard.get(typeOfCard));

      if(this.wallet){
        const provider = new ethers.providers.Web3Provider(this.wallet);
        this.signer = provider.getSigner();
        let chainId= await this.signer.getChainId();
        if(chainId !== 137 /*80001*/){
          console.log("Please change your network to polygon");  
        }
        else{
          console.log("id network:", chainId);        

          //console.log("Balance:",balance );

          //Call the smart smart contract
          //this.ctaContract = new ethers.Contract(this.addresses,StandardPack.abi,this.signer);

          //check if user have enough matic for minting
          //let balance =ethers.utils.formatEther( await this.getBalance());
          /*if(parseFloat(balance)< this.promotionCard.bronze){
              console.log("Don't get enough matic to mint his card");
          }
          else{
            //this.mintNft =  (await this.ctaContract.createPackage((await this.signer.getAddress(),{value: ethers.utils.parseEther('0.05'),})));
            //Wait execution of minting token
            /*let tx = await this.mintNft.wait();
            let event = tx.events[0];
            let value = event.args[2];
            let tokenId = value.toNumber;
            console.log("Token from polygon network:",tokenId);
          }*/
        }
      }
      else{
        console.log("Please Install metamask");
      }
    }
    catch(error)
    {
      console.log("Something goes wrong:",error);
    }
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
}

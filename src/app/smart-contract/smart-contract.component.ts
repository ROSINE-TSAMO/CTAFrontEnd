import { Component, OnInit } from '@angular/core';
import { WinRefService } from '../../services/win-ref.service';
import { LambdaApiService } from '../../services/lambda-api.service';
import { ethers } from 'ethers';
import { Contract } from '../../contracts/StandardPack';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TermsConditionsComponent } from '../terms-conditions/terms-conditions.component';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-smart-contract',
  templateUrl: './smart-contract.component.html',
  styleUrls: ['./smart-contract.component.scss']
})


export class SmartContractComponent implements OnInit {
  encryptMsg: any;
  images = ['../../assets/images/booster-rouge.gif', '../../assets/images/booster-vert.gif', '../../assets/images/booster-bleu.gif'];
  wallet: any;
  signer: any;
  //addressesContract = "0x66d1bbf7Ad44491468465F56bf092F74ff84d6Ef";   //this is for polygon

  addressesContract = "0x591D63bd26b370BB2C67a52c942D024a08E2fcD5"; //this is for mumbai


  ctaContract: any;
  mintNft: any;
  responseFromLambda: any;

  spinner = false;
  promotionCard = new Map<string, string>([
    ["0", "61"],
    ["1", "153"],
    ["2", "304"]
  ])
  /* promotionCard = new Map<string, string>([
    ["0", '1'],
    ["1", '1'],
    ["2", '2']
  ]) */

  constructor(private winref: WinRefService, private modalService: NgbModal, private spinnerService: NgxSpinnerService, private lambdaApi: LambdaApiService) {
  }

  async ngOnInit() {

    this.wallet = this.winref.window.ethereum;

    //this.connectPolygon()
    this.connectMumbai();
    this.connectWallet();
    //if variable localStorage is null, call the modal windows 
    if (localStorage.getItem('terminiCondizioni') == null) {
      this.openModal();
    }
  }

  //Add network polygon to metamask
  async connectPolygon() {
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
    try {
      await this.wallet.request({
        method: "wallet_addEthereumChain",
        params: [{ ...networks["polygon"] }]
      });
    }
    catch (error) {
      this.alertWhiteList("Problem to add polygon on Metamask, try later")
    }
  }

  //Communication between FE and samrt contract
  async smartContract(typeOfCard: any) {
    try {
      if (this.wallet) {
        const provider = new ethers.providers.Web3Provider(this.wallet);
        this.signer = provider.getSigner();
        let chainId = await this.signer.getChainId();
        //console.log("chainId", chainId)
        if (chainId !== 80001    /*137*/) {
          //this.alertWhiteList("Please change your network to polygon");
          this.alertWhiteList("Please change your network to mumbai");
        }
        else {
          let userAddress = await this.signer.getAddress()
          //check if is the date for minting 
          let mintingDay = this.checkTime();
          if (mintingDay) {
            try {
              //Set the smart contract
              this.ctaContract = new ethers.Contract(this.addressesContract, Contract.abi, this.signer);

              /*****This code for test mumbai */

              this.mintNft = (await this.ctaContract.create(Number(typeOfCard), userAddress, { value: ethers.utils.parseEther('1000') }));
              this.spinner = true;
              this.showSpinner();
              //Wait execution of minting token
              let tx = await this.mintNft.wait();
              let event = tx.events[0];

              let transactionHash = event.transactionHash;
              this.spinner = false
              this.hideSpinner()
              let url = "https://mumbai.polygonscan.com/tx/" + transactionHash;

              Swal.fire({
                title: 'NFT minted!',
                html: '<a target="bank" href="' + url + '">Click here to see details of NFT here</a>',
                confirmButtonColor: '#02031f',
                heightAuto: false,
              })

              /**End code for mumbai */



              //Call the api here
              // this.sendMessage(userAddress).subscribe(async (res) => {
              //   let response = JSON.parse(JSON.stringify(res))
              //   if (response.body != 'null') {
              //     //Call the function of smart contract
              //     this.mintNft = (await this.ctaContract.create(Number(typeOfCard), JSON.parse(response.body), { value: ethers.utils.parseEther(this.promotionCard.get(typeOfCard)!) }));
              //     this.spinner = true;
              //     this.showSpinner();
              //     //Wait execution of minting token
              //     let tx = await this.mintNft.wait();
              //     let event = tx.events[0];

              //     let transactionHash = event.transactionHash;
              //     this.spinner = false
              //     this.hideSpinner()
              //     let url = "https://polygonscan.com/tx/" + transactionHash;

              //     Swal.fire({
              //       title: 'NFT minted!',
              //       html: '<a target="bank" href="' + url + '">Click here to see details of NFT here</a>',
              //       confirmButtonColor: '#02031f',
              //       heightAuto: false,
              //     })
              //   } else {
              //     this.alertWhiteList("Your wallet address is not whitelisted");
              //   }
              // })
            }
            catch (error: any) {
              //catch error from metamask and see if user have enough fund to mint or user have already minted a package
              if (typeof error === 'object' && error["data"]["message"].includes('insufficient funds for gas')) {
                this.alertWhiteList("Your Matic balance is insufficient to operate transaction");
              }
              else if (typeof error === 'object' && error["data"]["message"].includes('already has just buy a Pack')) {
                this.alertWhiteList('Address already has Just buy a pack');
              }
              else if (typeof error === 'object' && error["data"]["message"].includes('invalid signature')) {
                this.alertWhiteList('You illegally attempt to mint this pack');
              }
              else {
                this.alertWhiteList('Something went wrong, try to mint later');
              }
            }
          }
          else {
            this.alertWhiteList("You can't mint this package because it's not a day of minting");
          }
        }
      }
      else {
        this.alertWhiteList("Please Install metamask");
      }

    }
    catch (error) {
      this.alertWhiteList("Connect manually the site with metamask");
      //this.alertWhiteList("Please connect the site to metamask");

    }
  }
  //call the the api to send message
  sendMessage(address: any) {
    return this.lambdaApi.sendMsg(address)
  }

  alertWhiteList(msg: any) {
    Swal.fire({
      title: "<i  class='fas fa-exclamation-triangle'></i> ops...",
      text: msg,
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

  //check time
  checkTime(): boolean {
    let today = new Date();
    let check = false;
    if (today.getDay() == 5) {
      if (today.getHours() >= 10 && (today.getHours() <= 23 && today.getMinutes() < 59)) {
        check = false;
      }
    }
    else if (today.getDay() == 6) {
      if (today.getHours() >= 0 && (today.getHours() < 9 && today.getMinutes() < 59)) {
        check = false;
      }
    }
    else {
      check = true;
    }
    return check
  }

  //Display spinner during the creation of nft
  public showSpinner(): void {
    this.spinnerService.show();
  }
  //Hide spinner during the creation of nft
  public hideSpinner() {
    this.spinnerService.hide()
  }

  async connectWallet() {
    const accounts = await this.wallet.request({ method: 'eth_requestAccounts' });
    const account = accounts[0];
    if (accounts.length === 0) {
      //console.log('your are not logging on polygon')
      console.log('your are not logging on mumbai')
    } else {
      //console.log('your are  logging on polygon')
      console.log('your are logging on mumbai')
    }

  }

  async connectMumbai() {
    //Parameters of polygon network
    const networks = {
      mumbai: {
        chainId: `0x${Number(80001).toString(16)}`,
        chainName: "Mumbai",
        nativeCurrency: {
          name: "MATIC",
          symbol: "MATIC",
          decimals: 18
        },
        rpcUrls: ["https://rpc-mumbai.matic.today/"],
        blockExplorerUrls: ["https://rpc-mumbai.matic.today"]
      }
    }
    //if polygon is not installed, then open metamask window to add polygon network  
    try {
      await this.wallet.request({
        method: "wallet_addEthereumChain",
        params: [{ ...networks["mumbai"] }]
      });
    }
    catch (error) {
      this.alertWhiteList("Problem to add mumbai on Metamask, try later")
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { WinRefService } from '../services/win-ref.service';
import { LambdaApiService } from '../services/lambda-api.service';
import { ethers } from 'ethers';
import { Contract } from '../../contracts/PremiumPack';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TermsConditionsComponent } from '../terms-conditions/terms-conditions.component';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { connect } from 'http2';
import { GoogleAnalyticsService } from '../services/google-analytics.service';


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
  provider: any;
  addressesContract = "0xb6041EAe62C4591458AF480679c6A497EDA6CfcD";   //this is for polygon

  ctaContract: any;
  mintNft: any;
  isConnect = false
  disableConnect: any;
  account: any;
  balance: any;

  spinner = false;
  promotionCard = new Map<string, string>([
    ["0", "152"],
    ["1", "379"],
    ["2", "758"]
  ]);


  constructor(private winref: WinRefService, private modalService: NgbModal, private spinnerService: NgxSpinnerService, private lambdaApi: LambdaApiService) { }

  async ngOnInit() {
    this.wallet = this.winref.window.ethereum;

    if (!this.checkTime()) {
      this.showAlertClosedSale('Next sale will open soon. Please check our social media for announcement!');
      this.disableConnect = true
    }
    else {
      this.connectPolygon()
      this.connectWallet();
      this.loadData();
      this.disableConnect = false
    }

    //if variable localStorage is null
    if (localStorage.getItem('terminiCondizioni') == null) {
      this.openModal();
    }
  }

  //Communication between FE and samrt contract
  async smartContract(typeOfCard: any) {
    try {
      if (this.wallet) {
        this.provider = new ethers.providers.Web3Provider(this.wallet);
        this.signer = this.provider.getSigner();
        let chainId = await this.signer.getChainId();
        if (chainId !== 137) {
          this.alertError("Please change your network to polygon");
        }
        else {
          let userAddress = await this.signer.getAddress()
          //check if is the date for minting 
          let mintingDay = this.checkTime();
          if (mintingDay) {
            try {
              //Set the smart contract //
              this.ctaContract = new ethers.Contract(this.addressesContract, Contract.abi, this.signer);

              this.sendMessage(userAddress).subscribe(async (res) => {
                //Check if user is on whitelist
                let response = JSON.parse(JSON.stringify(res))
                if (response.body != 'null' && response.body != null) {
                  try {
                    this.mintNft = (await this.ctaContract.createPack(Number(typeOfCard), response.body, { value: ethers.utils.parseEther(this.promotionCard.get(typeOfCard)!) }));
                    this.spinner = true;
                    this.showSpinner();
                    //Wait execution of minting token
                    let tx = await this.mintNft.wait();
                    let event = tx.events[0];
                    let transactionHash = event.transactionHash;
                    this.spinner = false
                    this.hideSpinner()
                    let url = "https://polygonscan.com/tx/" + transactionHash; //For polygon
                    Swal.fire({
                      title: 'NFT minted!',
                      html: '<a target="bank" href="' + url + '">Click here to see details of NFT here</a>',
                      confirmButtonColor: '#02031f',
                      heightAuto: false,
                    })
                  }
                  catch (error: any) {
                    //catch error from metamask and see if user have enough fund to mint or user have already minted a package
                    if (typeof error === 'object' && error["data"]["message"].includes('insufficient funds for gas')) {
                      this.alertError("Your Matic balance is insufficient to operate transaction");
                    }
                    else if (typeof error === 'object' && error["data"]["message"].includes('has already minted')) {
                      this.alertError('Address has already been used');
                    }
                    else if (typeof error === 'object' && error["data"]["message"].includes('nvalid package type')) {
                      this.alertError('Invalid package type');
                    }
                    else if (typeof error === 'object' && error["data"]["message"].includes('supply reached')) {
                      this.alertError('Max supply reached!');
                    }
                    else if (typeof error === 'object' && error["data"]["message"].includes(' is not open')) {
                      this.alertError('Sale is not open!');
                    } else if (typeof error === 'object' && error["data"]["message"].includes('invalid signature')) {
                      this.alertError('You attempt to mint this pack abnormally!');
                    }
                    else {
                      this.alertError('Something went wrong, try to mint later');
                    }
                  }
                } else {
                  this.alertError("Your wallet address is not whitelisted");
                }
              })
            }
            catch (error: any) {
              console.log("Error", error)
            }
          }
          else {
            this.alertError("You can't mint this package because it's not a day of minting");
          }
        }
      }
      else {
        this.alertError("Please Install metamask");
      }
    }
    catch (error) {
      this.alertError("Open pending request on metamask");
      this.connectWallet();
    }
  }
  //call the the api to send message
  sendMessage(address: any) {
    return this.lambdaApi.sendMsg(address)
  }

  alertError(msg: any) {
    Swal.fire({
      title: "<i  class='fas fa-exclamation-triangle'></i> ops...",
      text: msg,
      confirmButtonColor: '#02031f',
      heightAuto: false,
    })
  }

  showAlertClosedSale(msg: any) {
    Swal.fire({
      title: "<i  class='fa-light fa-face-pensive'></i> SALE WILL OPEN SOON",
      text: msg,
      heightAuto: false,
      showConfirmButton: false,
      backdrop: false
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
    //friday is a minting day:Opensale at 17:00
    if (today.getDay() == 5) {

      if (today.getHours() <= 16 && today.getMinutes() <= 59) {
        check = false;
      }
      /*else if (today.getHours() == 16 && (today.getMinutes() >= 0 && today.getMinutes() <= 54)) {
        check = false
      }*/
      else
        check = true;
    }
    //saturday and sunday are  minting day
    else if (today.getDay() == 6 || today.getDay() == 0) {
      check = true;
    }
    //Monday is  minting day
    else if (today.getDay() == 1) {
      if (today.getHours() >= 0 && (today.getHours() <= 16 && today.getMinutes() <= 59)) {
        check = true;
      } else { check = false }
    }
    else {
      check = false;
    }
    return check;
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
    if (this.wallet) {
      this.connectPolygon();

      let accounts = await this.wallet.request({ method: 'eth_requestAccounts' });
      let connectAccount = accounts[0];
      this.account = connectAccount.substring(0, 4) + "..." + connectAccount.substring(connectAccount.length - 4);
      this.isConnect = true;
    }
  }

  async loadData() {
    this.provider = new ethers.providers.Web3Provider(this.wallet);

    let accountsOnLoad = await this.provider.listAccounts();
    if (accountsOnLoad.length !== 0) {
      this.account = accountsOnLoad[0].substring(0, 4) + "..." + accountsOnLoad[0].substring(accountsOnLoad[0].length - 4);
      this.isConnect = true;
    }
  }


  //Add network polygon to metamask
  async connectPolygon() {
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
      // this.alertError("Problem to add polygon on Metamask, try later")
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
      //this.alertError("Problem to add mumbai on Metamask, try later")
    }
  }

}


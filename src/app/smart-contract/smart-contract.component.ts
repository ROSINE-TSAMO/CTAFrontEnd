import { Component, OnInit } from '@angular/core';
import { WinRefService } from '../../services/win-ref.service';
import { LambdaApiService } from '../../services/lambda-api.service';
import { ethers } from 'ethers';
import StandardPack from '../../contracts/StandardPack.json';
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
  images = ['../../assets/images/booster-rouge.gif', '../../assets/images/booster-bleu.gif', '../../assets/images/booster-vert.gif'];
  wallet: any;
  signer: any;
  addressesContract = "0x591D63bd26b370BB2C67a52c942D024a08E2fcD5";

  ctaContract: any;
  mintNft: any;
  responseFromLambda: any;

  spinner = false;
  promotionCard = new Map<string, string>([
    ["0", "100"],
    ["1", "250"],
    ["2", "500"]
  ])

  constructor(private winref: WinRefService, private modalService: NgbModal, private spinnerService: NgxSpinnerService, private lambdaApi:LambdaApiService) {
  }

  async ngOnInit() {
    this.wallet = this.winref.window.ethereum;
    
    //this.connectPolygon()
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
    await this.wallet.request({
      method: "wallet_addEthereumChain",
      params: [{ ...networks["polygon"] }]
    });
  }

  //Communication between FE and samrt contract
  async smartContract(typeOfCard: any) {
    if (this.wallet) {
      const provider = new ethers.providers.Web3Provider(this.wallet);
      this.signer = provider.getSigner();
      let chainId = await this.signer.getChainId();
      //console.log("chainId", chainId)
      if (chainId !== 80001   /*137*/) {
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
            this.ctaContract = new ethers.Contract(this.addressesContract, StandardPack.abi, this.signer);
            //Call the function of smart contract
            this.mintNft = (await this.ctaContract.create(Number(typeOfCard), userAddress, { value: ethers.utils.parseEther('0.0001'), }));
            //this.mintNft = (await this.ctaContract.create(Number(typeOfCard), userAddress, { value: ethers.utils.parseEther(this.promotionCard.get(typeOfCard)!), }));
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
          } catch (err: any) {
            this.alertWhiteList(err["data"]["message"]);
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
  //call the the api to send message
  sendMessages() {
    this.lambdaApi.getMessage()
    .subscribe(data => 
      console.log("Msg from api:",data))
  }
  
  alertWhiteList(msg: any) {
    Swal.fire({
      title: "<i class='fas fa-exclamation-triangle'></i> ops...",
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
}

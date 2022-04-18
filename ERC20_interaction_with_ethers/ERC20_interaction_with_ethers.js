


async function connectMetaMask (){

    if(typeof window.ethereum !== "undefined"){
        try
        {
            await ethereum.request({ method: "eth_requestAccounts" });
        }
        catch (error) {
            console.log(error);
        }
       
        document.getElementById("connectButton").innerHTML = "Connected";
        
        const accounts = await ethereum.request({ method: "eth_accounts" });
        console.log(accounts);
    }
    else {
        document.getElementById("connectButton").innerHTML ="Please install MetaMask";
      }
}



async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum); // get the connected node of any connected network
        const signer = provider.getSigner(); //this is going to get the connected account.

        const balance = await signer.getBalance();
        const convertIntoEth = 1e18;
        console.log("accounts balance will be: ", balance.toString()/convertIntoEth);
    }else {
        document.getElementById("getBalance").innerHTML ="Please install MetaMask";
    }

}




const contractAddress = "0x95840c938De40b8023f81e4ffCa9a502fadC2711";

const contractAbi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_owner","type":"address"},{"indexed":true,"internalType":"address","name":"_spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_from","type":"address"},{"indexed":true,"internalType":"address","name":"_to","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"_this_account","type":"address"}],"name":"BalanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"address","name":"_spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"address","name":"_spender","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_token_name","type":"string"}],"name":"setTokenName","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_token_symbol","type":"string"}],"name":"setTokenSymbol","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_total_generated_tokens","type":"uint256"}],"name":"setTotalGenerateTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_upto_decimals","type":"uint256"}],"name":"setUptodecimal","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"token_name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"token_symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"total_generated_tokens","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"real_owner","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"upto_decimals","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];

const provider = new ethers.providers.Web3Provider(window.ethereum); // get the connected node of any connected network
const signer = provider.getSigner(); //this is going to get the connected account.
const contract = new ethers.Contract(contractAddress, contractAbi, signer);

async function setTokenName(){
    if (typeof window.ethereum !== "undefined") {
        
        await contract.setTokenName("Muhammad");

    }else {
        document.getElementById("getBalance").innerHTML ="Please install MetaMask";
    }
}

async function setTokenSymbol(){
    if (typeof window.ethereum !== "undefined") {
       
        await contract.setTokenSymbol("MT");
    }else {
        
        document.getElementById("getBalance").innerHTML ="Please install MetaMask";
    }
}

async function setUptodecimal(){
    if (typeof window.ethereum !== "undefined") {
        
        await contract.setUptodecimal(18);
    }else {
        
        document.getElementById("getBalance").innerHTML ="Please install MetaMask";
    }
}

async function setTotalGenerateTokens(){
    if (typeof window.ethereum !== "undefined") {
        
        await contract.setTotalGenerateTokens(100000000000000000000n);
        
    }else {
        document.getElementById("getBalance").innerHTML ="Please install MetaMask";
    }
}


async function getTotalSupply(){
    if (typeof window.ethereum !== "undefined") {
        
        const totalSupply = await contract.totalSupply();
        console.log("The total Supply will be: ",totalSupply.toString());
        
    }else {
        
        document.getElementById("getBalance").innerHTML ="Please install MetaMask";
    }
}

async function BalanceOf(){
    if (typeof window.ethereum !== "undefined") {
       
        const BalanceOf = await contract.BalanceOf("0x1D375435c8EfA3e489ef002d2d0B1E7Eb3CC62Fe");
        console.log("The total Supply will be: ",BalanceOf.toString());
        
    }else {
        
        document.getElementById("getBalance").innerHTML ="Please install MetaMask";
    }
}

async function get_total_generated_tokens(){
    if (typeof window.ethereum !== "undefined") {
        
        const total_generated_tokens = await contract.total_generated_tokens();
        console.log("Symbol will be :", total_generated_tokens.toString());
    }else {
        
        document.getElementById("getBalance").innerHTML ="Please install MetaMask";
    }
}

async function get_owner(){
    if (typeof window.ethereum !== "undefined") {
        
        const contractOwner = await contract.owner();
        console.log(`name = ${contractOwner}`);
        
    }else {
        
        document.getElementById("getBalance").innerHTML ="Please install MetaMask";
    }
}


async function get_token_name(){
    if (typeof window.ethereum !== "undefined") {
        
        const name = await contract.token_name();
        console.log(`name = ${name}`);
        
    }else {
        
        document.getElementById("getBalance").innerHTML ="Please install MetaMask";
    }
}

async function get_token_symbol(){
    if (typeof window.ethereum !== "undefined") {
        
        const symbol = await contract.token_symbol();
        console.log("Symbol will be :", symbol);
    }else {
        
        document.getElementById("getBalance").innerHTML ="Please install MetaMask";
    }
}

async function get_upto_decimals(){
    if (typeof window.ethereum !== "undefined") {
        
        const decimals = await contract.upto_decimals();
        console.log("decimals are : ", decimals.toString());
    }else {
        
        document.getElementById("getBalance").innerHTML ="Please install MetaMask";
    }
}

async function transferFrom(){
    if (typeof window.ethereum !== "undefined") {
        
       contract.transferFrom("0x1D375435c8EfA3e489ef002d2d0B1E7Eb3CC62Fe","0x5e0A462386EBe67B1EE951E491b45Beb8De8c705","5000000000000000000");
       //contract.connect(signer).transfer("0x1D375435c8EfA3e489ef002d2d0B1E7Eb3CC62Fe","0x5e0A462386EBe67B1EE951E491b45Beb8De8c705","5000000000000000000");

    }else {
        
        document.getElementById("getBalance").innerHTML ="Please install MetaMask";
    }
}

async function approve(){
    if (typeof window.ethereum !== "undefined") {
        
       contract.approve ("0x1D375435c8EfA3e489ef002d2d0B1E7Eb3CC62Fe","0x5e0A462386EBe67B1EE951E491b45Beb8De8c705","5000000000000000000");

    }else {
        
        document.getElementById("getBalance").innerHTML ="Please install MetaMask";
    }
}































// async function readDataFromContract(){
    //     if (typeof window.ethereum !== "undefined") {

//         const contractAddress = "0x95840c938De40b8023f81e4ffCa9a502fadC2711";

//         const contractAbi = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_owner","type":"address"},{"indexed":true,"internalType":"address","name":"_spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_from","type":"address"},{"indexed":true,"internalType":"address","name":"_to","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"_this_account","type":"address"}],"name":"BalanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"address","name":"_spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"address","name":"_spender","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_token_name","type":"string"}],"name":"setTokenName","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_token_symbol","type":"string"}],"name":"setTokenSymbol","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_total_generated_tokens","type":"uint256"}],"name":"setTotalGenerateTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_upto_decimals","type":"uint256"}],"name":"setUptodecimal","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"token_name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"token_symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"total_generated_tokens","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"real_owner","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"upto_decimals","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];

//         const provider = new ethers.providers.Web3Provider(window.ethereum); // get the connected node of any connected network
//         const signer = provider.getSigner(); //this is going to get the connected account.
//         const contract = new ethers.Contract(contractAddress, contractAbi, signer);

//          await contract.setTokenName("Muhammad");
//         await contract.setTokenSymbol("MT");
//          await contract.setUptodecimal(18);
//         // const decimals = await contract.setTotalGenerateTokens();

//         const name = await contract.token_name();
//         const symbol = await contract.token_symbol();
//         const decimals = await contract.upto_decimals();
//         // const decimals = await contract.total_generated_tokens();
//         //const totalSupply = await contract.totalSupply();
//        // const myBalance = await contract.balanceOf("0x06214f2E1e1896739D92F3526Bd496DC028Bd7F9");

//         console.log(`name = ${name}`);
//         console.log("Symbol will be :", symbol);
//         console.log(`decimals = ${decimals}`);
//         // console.log(`totalSupply = ${totalSupply / 1e6 }`);
//         // console.log(`myBalance = ${myBalance / 1e6}`);

//     }else {
    //         document.getElementById("getBalance").innerHTML ="Please install MetaMask";
    //     }
 // }
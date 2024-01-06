/*
Ethereum = 1
Goerli 테스트 네트워크 = 5
Polygon Mainnet = 137;
Polygon Mumbai testnet = 80001;
*/
const Network = 80001;

(async () => {
    setMintCount();
})();

var WalletAddress = "";
var WalletBalance = "";

async function connectWallet() {
    if (window.ethereum) {
        await window.ethereum.send('eth_requestAccounts');
        window.web3 = new Web3(window.ethereum);
        if (window.web3._provider.networkVersion != Network) {
            alert("Please connect correct network", "", "warning");
        }

        var accounts = await web3.eth.getAccounts();
        WalletAddress = accounts[0];
        WalletBalance = await web3.eth.getBalance(WalletAddress);

        contract = new web3.eth.Contract(ABI, ADDRESS); 
        tokenBalance = await contract.methods.balanceOf(WalletAddress).call();

        tokenBalanceInEther = web3.utils.fromWei(tokenBalance);

        console.log("Token Balance:", tokenBalanceInEther);

        if (web3.utils.fromWei(WalletBalance) < 0.0001) {
            alert("You need more Ethereum");
        } else {
            document.getElementById("txtWalletBalance").innerHTML = web3.utils.fromWei(WalletBalance).substr(0, 6);
            var txtAccount = accounts[0].substr(0, 5) + ' . . . . . . ' + accounts[0].substr(37, 42);
            document.getElementById("walletInfo").style.display = "block";
            document.getElementById("btnConnectWallet").style.display = "none";
            document.getElementById("txtWalletAddress").innerHTML = txtAccount;
            document.getElementById("balanceOfToken").innerHTML = tokenBalanceInEther;
        }
    }
}


// 입력값을 받아와서 0.0001을 곱한 후 결과를 업데이트하는 함수
function calculateResult() {
    // 입력값 가져오기
    var inputValue = document.getElementById("txtMintAmount").value;

    // 입력값이 비어있지 않은 경우에만 계산 수행
    if (inputValue !== "") {
        // 0.0001을 곱한 결과 계산
        var result = inputValue * 0.0001;
        var formattedResult = result.toFixed(4);

        // 결과를 화면에 업데이트
        document.getElementById("result").innerHTML = "필요한 ETH: " + formattedResult + " + gas fee";
    } else {
        // 입력값이 비어있을 경우 결과를 0으로 설정
        document.getElementById("result").innerHTML = "필요한 ETH:";
    }
}

async function setMintCount() {
    await window.ethereum.send('eth_requestAccounts');
    window.web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(ABI, ADDRESS);

    if (contract) {
        var totalSupply = await contract.methods.totalSupplyInToken().call();
        document.getElementById("txtTotalSupply").innerHTML = totalSupply;
        var totalSupply = await contract.methods.totalMaxSupplyInToken().call();
        document.getElementById("txtMaxSupply").innerHTML = totalSupply; 
        var totalSupply = await contract.methods.balanceOfInToken().call();
        document.getElementById("balanceOfInToken").innerHTML = totalSupply;
    }
}

/*
Token을 메타마스크에 추가하는 함수
*/
async function TokenAdd() {
    // Metamask에 추가할 토큰 정보
    const tokenInfo = {
        type: "ERC20", // 토큰 종류 (ERC20, BEP20 등)
        options: {
            address: ADDRESS, // 토큰의 스마트 컨트랙트 주소
            symbol: "SABU", // 토큰 심볼 (예: ETH, DAI)
            decimals: 18, // 토큰의 소수점 자리수
        },
    };

    try {
        // Metamask에 토큰 추가 요청
        await ethereum.request({
            method: 'wallet_watchAsset',
            params: tokenInfo,
        });

        alert("토큰이 메타마스크에 추가되었습니다.");
    } catch (error) {
        console.error("토큰 추가 오류:", error);
        alert("토큰 추가에 실패했습니다. 메타마스크 설정을 확인해주세요.");
    }
}

// 토큰 스왑
async function purchaseTokens() {
    await window.ethereum.send('eth_requestAccounts');
    window.web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(ABI, ADDRESS);

    if (contract) {
        var tokenAmount = document.getElementById("txtMintAmount").value;

        var transaction = await contract.methods.purchaseTokens(tokenAmount).send(
            {
                from: WalletAddress,
                value: web3.utils.toWei((0.0001 * tokenAmount).toFixed(4), 'ether') // 가격을 wei로 변환
            }
        ).on('error', function (error) {
            alert("먼저 지갑에 연결해주세요");
            console.log("Mint - 에러 : " + error);
        }).then(function (receipt) {
            alert("Mint Success!");
            console.log("Mint - 성공 : " + receipt);
        });
        console.log("Mint - 전송 : " + transaction);
    }
}

// admin_auth.js

const contractAddress = "0xd9145CCE52D386f254917e481eB44e9943F39138";
const contractABI = [
  {
    "inputs": [{"internalType": "address", "name": "_admin", "type": "address"}],
    "name": "addAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_admin", "type": "address"}],
    "name": "removeAdmin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "admins",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "isAdmin",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];

async function authenticateAdmin() {
  const status = document.getElementById("status");

  if (typeof window.ethereum !== "undefined") {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const userAddress = accounts[0];

      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(contractABI, contractAddress);

      const isAdmin = await contract.methods.isAdmin(userAddress).call();

      if (isAdmin) {
        status.textContent = "✅ Admin Verified! Redirecting...";
        status.style.color = "lime";
        setTimeout(() => {
          window.location.href = "admin.html";
        }, 2000);
      } else {
        status.textContent = "🚫 This wallet is not authorized as admin!";
        status.style.color = "red";
      }
    } catch (err) {
      console.error(err);
      status.textContent = "⚠️ Error during wallet authentication!";
      status.style.color = "orange";
    }
  } else {
    status.textContent = "🦊 MetaMask not detected!";
    status.style.color = "red";
  }
}

document.getElementById("connectWalletBtn").onclick = authenticateAdmin;

import axios from 'axios';

async function getEthBalance(walletAddress, network) {
    try {
        const rpcPool = [
            // "https://cloudflare-eth.com",
            // "https://eth.llamarpc.com",
            "https://rpc.ankr.com/eth",
            "https://1rpc.io/eth",
            "https://eth.rpc.blxrbdn.com",
            "https://eth-mainnet.public.blastapi.io"
            // Add more RPC URLs as needed
        ];

        const randomIndex = Math.floor(Math.random() * rpcPool.length);
        const rpcLink = rpcPool[randomIndex];

        const response = await axios.post(rpcLink, {
            jsonrpc: "2.0",
            method: "eth_getBalance",
            params: [walletAddress, "latest"],
            id: 1
        });

        let balance = response.data.result;
        return (parseInt(balance, 16) / 10 ** 18).toFixed(4);
    } catch (error) {
        console.error(error);
        return "Error";
    }
}

export default getEthBalance;
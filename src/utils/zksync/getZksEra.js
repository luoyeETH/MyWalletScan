import axios from 'axios';

async function getZksEra(address) {
    try {
        let url = "https://block-explorer-api.mainnet.zksync.io/address/" + address;
        const response = await axios.get(url);
        let tx2, balance2, usdcBalance, eraETH, ZK;
        if ("0x000000000000000000000000000000000000800A" in response.data.balances) {
            balance2 = (response.data.balances["0x000000000000000000000000000000000000800A"]
                .balance / 10 ** 18).toFixed(4)
        } else {
            balance2 = 0;
        }
        if ("0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4" in response.data.balances) {
            usdcBalance = (response.data.balances["0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4"]
                .balance / 10 ** 6).toFixed(2)
        } else {
            usdcBalance = 0;
        }
        if ("0x1BbD33384869b30A323e15868Ce46013C82B86FB" in response.data.balances) {
            eraETH = ((response.data.balances["0x1BbD33384869b30A323e15868Ce46013C82B86FB"]
                .balance / 10 ** 8) / 50).toFixed(4);
            eraETH = eraETH > 0 ? eraETH : 0;
        } else {
            eraETH = 0;
        }
        if ("0x0000000000000000000000000000000000000001" in response.data.balances) {
            ZK = ((response.data.balances["0x0000000000000000000000000000000000000001"]
                .balance / 10 ** 8) / 50).toFixed(4);
            ZK = ZK > 0 ? ZK : 0;
        } else {
            ZK = "TBA";
        }
        tx2 = response.data.sealedNonce;
        return {balance2, tx2, usdcBalance, eraETH, ZK};
    } catch (error) {
        console.error(error);
        return {balance2: "Error", tx2: "Error", usdcBalance: "Error", eraETH: "Error", ZK: "Error"};
    }
}

export default getZksEra;

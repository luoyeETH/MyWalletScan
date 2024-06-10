import axios from "axios";
import {ethers} from "ethers";
import price from '@utils/price.js';

function getDayNumber(d) {
    return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    let weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return d.getUTCFullYear() + "W" + weekNo;
}

function getMonthNumber(d) {
    return d.getUTCFullYear() + "-" + (d.getUTCMonth() + 1);
}

const getEthPrice = async () => {
    return price.ETH;
    // try {
    //     const options = {
    //         method: 'GET',
    //         url: 'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD',
    //     }
    //     let response = await axios.request(options)
    //     return response.data['USD']
    // } catch (e) {
    //     console.log(e)
    //     return "/"
    // }

}

function getZkSyncLastTX(lastTxDatetime) {
    if (lastTxDatetime === undefined) {
        return "无交易"
    }
    const date = new Date(lastTxDatetime);
    const offset = 8;
    const utc8Date = new Date(date.getTime() + offset * 3600 * 1000);
    const now = new Date();
    const utc8Now = new Date(now.getTime() + offset * 3600 * 1000);
    const diff = utc8Now - utc8Date;
    const diffInHours = Math.floor(diff / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays > 0) {
        // if (diffInDays > 7) {
        //     return `${parseInt(diffInDays / 7)} 周前`
        // }
        return `${diffInDays} 天前`
    } else if (diffInHours > 0) {
        return `${diffInHours} 小时前`
    } else {
        return "刚刚"
    }
}

async function getAmount(address) {
    const ethPrice = await getEthPrice();
    var currentDate = new Date();
    var formattedDate = currentDate.toISOString();
    var encodedDate = encodeURIComponent(formattedDate);
    const initUrl = `https://block-explorer-api.mainnet.zksync.io/address/${address}/transfers?toDate=${encodedDate}&limit=100&page=1`;
    const response = await axios.get(initUrl)
    var pageValue = parseInt(response.data.meta.totalPages);
    let totalExchangeAmount = 0;
    for (let i = 1; i <= pageValue; i++) {
        const url = `https://block-explorer-api.mainnet.zksync.io/address/${address}/transfers?toDate=${encodedDate}&limit=100&page=${i}`;
        const response = await axios.get(url);
        const list = response.data.items;
        for (let i = 0; i < list.length; i++) {
            if (list[i]['token'] !== null && list[i]['type'] == "transfer") {
                if (list[i]['from'].toLowerCase() === address.toLowerCase() && list[i]['to'].toLowerCase() !== "0x0000000000000000000000000000000000008001".toLowerCase() 
                && list[i]['to'].toLowerCase() !== address.toLowerCase()) {
                    const symbol = list[i]['token']['symbol']
                    if (symbol === "ETH") {
                        totalExchangeAmount += (list[i]['amount'] / 10 ** 18) * parseFloat(ethPrice)
                    } 
                    else if (list[i]['token']['symbol'] === "USDC") {
                        totalExchangeAmount += list[i]['amount'] / 10 ** 6
                    }
                    // else if (list[i]['token']['symbol'] === "USD+") {
                    //     totalExchangeAmount += list[i]['amount'] / 10 ** 6
                    // }
                }
            }
        }
    }
    return totalExchangeAmount;
}

async function processTransactions(
    zks2_last_tx,
    totalExchangeAmount,
    address,
    totalFee,
    contract,
    days,
    weeks,
    months,
    list,
    l1Tol2Times,
    l1Tol2Amount,
    l2Tol1Times,
    l2Tol1Amount,
    paymasterCount
) {
    for (let i = 0; i < list.length; i++) {
        if (list[i]['from'].toLowerCase() === address.toLowerCase()) {
            const receivedAt = new Date(Date.parse(list[i]['receivedAt']));
            if (zks2_last_tx === null) {
                zks2_last_tx = getZkSyncLastTX(list[i]['receivedAt']);
                console.log(zks2_last_tx)
            }
            const contractAddress = list[i]['to'];
            const fee = (parseInt(list[i]['fee'], 16) / 10 ** 18).toFixed(5)
            totalFee += parseFloat(fee);
            contract.add(contractAddress)
            days.add(getDayNumber(receivedAt));
            weeks.add(getWeekNumber(receivedAt));
            months.add(getMonthNumber(receivedAt));
        }
        if (list[i].isL1Originated === true) {
            l1Tol2Times++;
            const value = ethers.formatEther(list[i]['value'], "ether");
            l1Tol2Amount += parseFloat(value);
        } else if (
            list[i]['to'] ===
            "0x000000000000000000000000000000000000800A"
        ) {
            l2Tol1Times++;
            const value = ethers.formatEther(list[i]['value'], "ether");
            l2Tol1Amount += parseFloat(value);
        }
        if  (list[i]['type'] === 113) {
            paymasterCount++;
        }
    }
    return [zks2_last_tx, totalExchangeAmount, totalFee, contract, days, weeks, months, l1Tol2Times, l1Tol2Amount,
            l2Tol1Times, l2Tol1Amount, paymasterCount];
}

async function getZkSyncBridge(address) {
    try {
        let zks2_last_tx = null;
        let contract = new Set();
        let days = new Set();
        let weeks = new Set();
        let months = new Set();
        let dayActivity;
        let weekActivity;
        let monthActivity;
        let contractActivity;
        let totalFee = 0;
        let l1Tol2Times = 0;
        let l1Tol2Amount = 0;
        let l2Tol1Times = 0;
        let l2Tol1Amount = 0;
        let totalExchangeAmount = 0;
        let paymasterCount = 0;
        const initUrl = `https://block-explorer-api.mainnet.zksync.io/transactions?address=${address}&limit=100&page=1`;
        const response = await axios.get(initUrl)
        const pageValue = parseInt(response.data.meta.totalPages);
        for (let i = 1; i <= pageValue; i++) {
            const url = `https://block-explorer-api.mainnet.zksync.io/transactions?address=${address}&limit=100&page=${i}`;
            const response = await axios.get(url);
            const list = response.data.items;

            [zks2_last_tx,
                totalExchangeAmount, totalFee, contract, days, weeks, months, l1Tol2Times, l1Tol2Amount,
                l2Tol1Times, l2Tol1Amount, paymasterCount] =
                await processTransactions(
                    zks2_last_tx,
                    totalExchangeAmount,
                    address,
                    totalFee,
                    contract,
                    days,
                    weeks,
                    months,
                    list,
                    l1Tol2Times,
                    l1Tol2Amount,
                    l2Tol1Times,
                    l2Tol1Amount,
                    paymasterCount
                )
        }
        totalExchangeAmount = await getAmount(address);
        dayActivity = days.size;
        weekActivity = weeks.size;
        monthActivity = months.size;
        contractActivity = contract.size;
        // console.log("zks2_last_tx", zks2_last_tx);
        return {
            zks2_last_tx: zks2_last_tx === null ? "无交易" : zks2_last_tx,
            totalExchangeAmount: totalExchangeAmount.toFixed(2),
            totalFee: totalFee.toFixed(4),
            contractActivity,
            dayActivity,
            weekActivity,
            monthActivity,
            l1Tol2Times,
            l1Tol2Amount: l1Tol2Amount.toFixed(3),
            l2Tol1Times,
            l2Tol1Amount: l2Tol1Amount.toFixed(3),
            paymasterCount
        }
    } catch (e) {
        console.log(e);
        return {
            zks2_last_tx: "Error",
            totalExchangeAmount: "Error",
            totalFee: "Error",
            contractActivity: "Error",
            dayActivity: "Error", weekActivity: "Error", monthActivity: "Error",
            l1Tol2Times: "Error", l1Tol2Amount: "Error", l2Tol1Times: "Error", l2Tol1Amount: "Error", paymasterCount: "Error",
        }
    }
}

export default getZkSyncBridge;
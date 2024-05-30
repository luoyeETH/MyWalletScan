import React from 'react';
import {useEffect, useState} from 'react';
import {Layout, Typography, Button, message, Space, Card, Row, Col, notification} from 'antd';
import ReactEcharts from 'echarts-for-react';
import { getEthPrice } from '@/utils';

const {Content} = Layout;
const {Title, Text} = Typography;

const Overview = () => {
    
    const [latestVersion, setLatestVersion] = useState('');
    const [commitMessage, setCommitMessage] = useState('');

    useEffect(() => {
        // Function to fetch the latest version from GitHub API
        const fetchLatestVersion = () => {
          const url = "https://api.github.com/repos/luoyeETH/MyWalletScan/commits?per_page=1";
          fetch(url)
            .then(res => res.json())
            .then(res => {
              const version = res[0].sha;
              const message = res[0].commit.message;
              setLatestVersion(version);
              setCommitMessage(message);
            })
            .catch(error => {
              console.error('Error fetching latest version:', error);
            });
        };
    
        // Fetch the latest version on component mount
        fetchLatestVersion();
    
        // Schedule fetching the latest version every 10 mins
        const interval = setInterval(fetchLatestVersion, 600000);
    
        // Clean up the interval on component unmount
        return () => clearInterval(interval);
      }, []);
    
      // Function to compare the latest version with the locally stored version
      const checkVersion = () => {
        const locallyStoredVersion = localStorage.getItem('version');
        if (locallyStoredVersion && latestVersion && locallyStoredVersion !== latestVersion) {
          // Perform actions when a new version is available
          notification.info({
              message: '检查到页面有新的版本! 请刷新',
              description: (
                  <div>
                      {commitMessage}
                      <br />
                      {locallyStoredVersion.substring(0, 7)} -{'>'} {latestVersion.substring(0, 7)}
                  </div>
              ),
              duration: 0,
          });
          localStorage.setItem('version', latestVersion);
        }
      };
    
    useEffect(checkVersion, [latestVersion]);

    useEffect(() => {
        const fetchEthPrice = async () => {
            const ethPrice = await getEthPrice();
            setEthPrice(ethPrice);
        };
        fetchEthPrice();
    }, []);

    const [ethPrice, setEthPrice] = useState(0);

    const zksAddresses = localStorage.getItem('addresses');
    const l0Addresses = localStorage.getItem('l0_addresses');
    const lineaAddresses = localStorage.getItem('linea_addresses');
    const baseAddresses = localStorage.getItem('base_addresses');
    const scrollAddresses = localStorage.getItem('scroll_addresses');

    const zksAddressList = zksAddresses ? JSON.parse(zksAddresses) : [];
    const l0AddressList = l0Addresses ? JSON.parse(l0Addresses) : [];
    const lineaAddressList = lineaAddresses ? JSON.parse(lineaAddresses) : [];
    const baseAddressList = baseAddresses ? JSON.parse(baseAddresses) : [];
    const scrollAddressList = scrollAddresses ? JSON.parse(scrollAddresses) : [];

    const zksAddressCount = zksAddressList.length;
    const l0AddressCount = l0AddressList.length;
    const lineaAddressCount = lineaAddressList.length;
    const baseAddressCount = baseAddressList.length;
    const scrollAddressCount = scrollAddressList.length;
    const accountCount = zksAddressCount + l0AddressCount + lineaAddressCount + baseAddressCount + scrollAddressCount;
    const accountOption = {
        title : {
            text: '账号总览',
            subtext: `账号总数 ${accountCount}`,
            x:'center'
          },
        tooltip: {
          trigger: 'item',
          formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
          top: '5%',
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '账号总览',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 40,
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: zksAddressCount, name: 'zkSync Era' },
              { value: l0AddressCount, name: 'LayerZero' },
              { value: lineaAddressCount, name: 'Linea' },
              { value: baseAddressCount, name: 'Base' },
              { value: scrollAddressCount, name: 'Scroll' }
            ]
          }
        ]
      };
    
    const totalzksEthBalance = zksAddressList.reduce((total, addressData) => {
        const ethBalance = parseFloat(addressData.eth_balance || 0);
        return total + (isNaN(ethBalance) ? 0 : ethBalance);
    }, 0);
    const totalzks1Balance = zksAddressList.reduce((total, addressData) => {
        const zks1_balance = parseFloat(addressData.zks1_balance || 0);
        return total + (isNaN(zks1_balance) ? 0 : zks1_balance);
    }, 0);
    const totalzks2Balance = zksAddressList.reduce((total, addressData) => {
        const zks2_balance = parseFloat(addressData.zks2_balance || 0);
        return total + (isNaN(zks2_balance) ? 0 : zks2_balance);
    }, 0);
    const totalzks2UsdcBalance = zksAddressList.reduce((total, addressData) => {
        const zks2_usdcBalance = parseFloat(addressData.zks2_usdcBalance || 0);
        return total + (isNaN(zks2_usdcBalance) ? 0 : zks2_usdcBalance);
    }, 0);
    const totallineaEthBalance = lineaAddressList.reduce((total, addressData) => {
        const linea_eth_balance = parseFloat(addressData.linea_eth_balance || 0);
        return total + (isNaN(linea_eth_balance) ? 0 : linea_eth_balance);
    }, 0);
    const totallineaBusdBalance = lineaAddressList.reduce((total, addressData) => {
        const linea_busd_balance = parseFloat(addressData.linea_busd_balance || 0);
        return total + (isNaN(linea_busd_balance) ? 0 : linea_busd_balance);
    }, 0);
    const totallineaUsdcBalance = lineaAddressList.reduce((total, addressData) => {
        const linea_usdc_balance = parseFloat(addressData.linea_usdc_balance || 0);
        return total + (isNaN(linea_usdc_balance) ? 0 : linea_usdc_balance);
    }, 0);
    const totalbaseEthBalance = baseAddressList.reduce((total, addressData) => {
        const base_eth_balance = parseFloat(addressData.base_eth_balance || 0);
        return total + (isNaN(base_eth_balance) ? 0 : base_eth_balance);
    }, 0);
    const totalbaseUsdcBalance = baseAddressList.reduce((total, addressData) => {
        const base_usdc_balance = parseFloat(addressData.base_usdc_balance || 0);
        return total + (isNaN(base_usdc_balance) ? 0 : base_usdc_balance);
    }, 0);
    const totalscrollEthBalance = scrollAddressList.reduce((total, addressData) => {
        const scroll_eth_balance = parseFloat(addressData.scroll_eth_balance || 0);
        return total + (isNaN(scroll_eth_balance) ? 0 : scroll_eth_balance);
    }, 0);
    const totalscrollUsdcBalance = scrollAddressList.reduce((total, addressData) => {
        const scroll_usdc_balance = parseFloat(addressData.scroll_usdc_balance || 0);
        return total + (isNaN(scroll_usdc_balance) ? 0 : scroll_usdc_balance);
    }, 0);
    const totalscrollUsdtBalance = scrollAddressList.reduce((total, addressData) => {
        const scroll_usdt_balance = parseFloat(addressData.scroll_usdt_balance || 0);
        return total + (isNaN(scroll_usdt_balance) ? 0 : scroll_usdt_balance);
    }, 0);
    const totalEth = parseFloat(totalzksEthBalance + totalzks1Balance + totalzks2Balance + totallineaEthBalance + totalbaseEthBalance);
    const totalUsdc = parseFloat(totalzks2UsdcBalance + totallineaUsdcBalance + totalbaseUsdcBalance).toFixed(2);
    const totalUsdt = parseFloat(totalscrollUsdtBalance).toFixed(2);
    const totalDai = parseFloat(0).toFixed(2);
    const totalBusd = parseFloat(totallineaBusdBalance).toFixed(2);
    const totalBalance = parseFloat(Number(totalEth) * ethPrice + Number(totalUsdc) + Number(totalUsdt) + Number(totalDai) + Number(totalBusd)).toFixed(2);
    const valueOption = {
    title : {
        text: '资产总览',
        subtext: `资产总额 ${totalBalance}U L2资产总额 ${parseInt(Number(totalBalance) - Number(totalzksEthBalance) * ethPrice)}U\n\nETH(${totalEth}) 稳定币(${parseInt(Number(totalzks2UsdcBalance) + Number(totalUsdc) + Number(totalUsdt) + Number(totalDai) + Number(totallineaBusdBalance) + Number(totallineaUsdcBalance))})`,
        x:'center'
        },
    tooltip: {
        trigger: 'item',
        formatter: "{a} {b} <br/>价值 {c} ({d}%)"
    },
    legend: {
        top: '5%',
        orient: 'vertical',
        left: 'left'
    },
    series: [
        {
        name: '币种',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
        },
        label: {
            show: false,
            position: 'center'
        },
        left: 0,
        right: '35%',
        top: 0,
        bottom: 0,
        emphasis: {
            label: {
            show: true,
            fontSize: 40,
            fontWeight: 'bold'
            }
        },
        labelLine: {
            show: false
        },
        data: [
            { value: totalEth * ethPrice, name: 'ETH' },
            { value: totalUsdc, name: 'USDC' },
            { value: totalUsdt, name: 'USDT' },
            { value: totalDai, name: 'DAI' },
            { value: totalBusd, name: 'BUSD' }
        ]
        },
        {
        name: '链',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
        },
        label: {
            show: false,
            position: 'center'
        },
        left: "35%",
        right: 0,
        top: 0,
        bottom: 0,
        emphasis: {
            label: {
            show: true,
            fontSize: 40,
            fontWeight: 'bold'
            }
        },
        labelLine: {
            show: false
        },
        data: [
            { value: parseInt(totalzksEthBalance * ethPrice), name: 'Ethereum' },
            { value: parseInt(totalzks2Balance * ethPrice + totalzks2UsdcBalance), name: 'zkSync Era' },
            { value: parseInt(totalzks1Balance * ethPrice), name: 'zkSync Lite' },
            { value: parseInt(totallineaEthBalance * ethPrice + totallineaBusdBalance + totallineaUsdcBalance), name: 'Linea' },
            { value: parseInt(totalbaseEthBalance * ethPrice ), name: 'Base' },
            { value: parseInt(totalscrollEthBalance * ethPrice + totalscrollUsdcBalance + totalscrollUsdtBalance), name: 'Scroll' },
        ]
        }
    ]
    };
    const zksProgress = zksAddressList.reduce((acc, entry) => {
        console.log("zksp=",entry['progress'], entry)
        if ('progress' in entry) {
            acc.push(entry.progress);
        }
        return acc;
    }, []);
    const zksProgressIntervalCounts = zksProgress.reduce((acc, num) => {
        if (num >= 0 && num <= 10) {
            acc['0-10']++;
        } else if (num > 10 && num <= 20) {
            acc['10-20']++;
        } else if (num > 20 && num <= 30) {
            acc['20-30']++;
        } else if (num > 30 && num <= 40) {
            acc['30-40']++;
        } else if (num > 40 && num <= 50) {
            acc['40-50']++;
        } else if (num > 50 && num <= 60) {
            acc['50-60']++;
        } else if (num > 60 && num <= 70) {
            acc['60-70']++;
        } else if (num > 70 && num <= 80) {
            acc['70-80']++;
        } else if (num > 80 && num <= 90) {
            acc['80-90']++;
        } else if (num > 90 && num <= 100) {
            acc['90-100']++;
        }
        return acc;
      }, {
        '0-10': 0,
        '10-20': 0,
        '20-30': 0,
        '30-40': 0,
        '40-50': 0,
        '50-60': 0,
        '60-70': 0,
        '70-80': 0,
        '80-90': 0,
        '90-100': 0
      });
    const lineaProgress = lineaAddressList.reduce((acc, entry) => {
        console.log("lineap=",entry['progress'])
        if ('progress' in entry) {
            acc.push(entry.progress);
        }
        return acc;
    }, []);
    const lineaProgressIntervalCounts = lineaProgress.reduce((acc, num) => {
        if (num >= 0 && num <= 10) {
            acc['0-10']++;
        } else if (num > 10 && num <= 20) {
            acc['10-20']++;
        } else if (num > 20 && num <= 30) {
            acc['20-30']++;
        } else if (num > 30 && num <= 40) {
            acc['30-40']++;
        } else if (num > 40 && num <= 50) {
            acc['40-50']++;
        } else if (num > 50 && num <= 60) {
            acc['50-60']++;
        } else if (num > 60 && num <= 70) {
            acc['60-70']++;
        } else if (num > 70 && num <= 80) {
            acc['70-80']++;
        } else if (num > 80 && num <= 90) {
            acc['80-90']++;
        } else if (num > 90 && num <= 100) {
            acc['90-100']++;
        }
        return acc;
      }, {
        '0-10': 0,
        '10-20': 0,
        '20-30': 0,
        '30-40': 0,
        '40-50': 0,
        '50-60': 0,
        '60-70': 0,
        '70-80': 0,
        '80-90': 0,
        '90-100': 0
      });
    const baseProgress = baseAddressList.reduce((acc, entry) => {
        console.log("basep=",entry['progress'])
        if ('progress' in entry) {
            acc.push(entry.progress);
        }
        return acc;
    }, []);
    const baseProgressIntervalCounts = baseProgress.reduce((acc, num) => {
        if (num >= 0 && num <= 10) {
            acc['0-10']++;
        } else if (num > 10 && num <= 20) {
            acc['10-20']++;
        } else if (num > 20 && num <= 30) {
            acc['20-30']++;
        } else if (num > 30 && num <= 40) {
            acc['30-40']++;
        } else if (num > 40 && num <= 50) {
            acc['40-50']++;
        } else if (num > 50 && num <= 60) {
            acc['50-60']++;
        } else if (num > 60 && num <= 70) {
            acc['60-70']++;
        } else if (num > 70 && num <= 80) {
            acc['70-80']++;
        } else if (num > 80 && num <= 90) {
            acc['80-90']++;
        } else if (num > 90 && num <= 100) {
            acc['90-100']++;
        }
        return acc;
      }, {
        '0-10': 0,
        '10-20': 0,
        '20-30': 0,
        '30-40': 0,
        '40-50': 0,
        '50-60': 0,
        '60-70': 0,
        '70-80': 0,
        '80-90': 0,
        '90-100': 0
      });
    const progressOption = {
        title: {
            text: '任务进度分布',
            subtext: `zkSyncEra平均完成率 ${parseInt(zksProgress.reduce((acc, num) => acc + (isNaN(parseFloat(num)) ? 0 : parseFloat(num)), 0) / (zksProgress.length || 1))}% Linea平均完成率 ${parseInt(lineaProgress.reduce((acc, num) => acc + (isNaN(parseFloat(num)) ? 0 : parseFloat(num)), 0) / (lineaProgress.length || 1))}% Base平均完成率 ${parseInt(baseProgress.reduce((acc, num) => acc + (isNaN(parseFloat(num)) ? 0 : parseFloat(num)), 0) / (baseProgress.length || 1))}%`,
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c}"
        },
        legend: {
            top: '1%',
            orient: 'vertical',
            left: 'left',
            data: ['zkSync Era', 'Linea', 'Base']
        },
        xAxis: {
          type: 'category',
          data: ['0-10%', '10%-20%', '20%-30%', '30%-40%', '40%-50%', '50%-60%', '60%-70%', '70%-80%', '80%-90%', '90%-100%'],
          axisLabel:{
    		interval: 0
    	    }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'zkSync Era',
            data: [zksProgressIntervalCounts['0-10'], zksProgressIntervalCounts['10-20'], zksProgressIntervalCounts['20-30'], zksProgressIntervalCounts['30-40'], zksProgressIntervalCounts['40-50'], zksProgressIntervalCounts['50-60'], zksProgressIntervalCounts['60-70'], zksProgressIntervalCounts['70-80'], zksProgressIntervalCounts['80-90'], zksProgressIntervalCounts['90-100']],
            type: 'bar'
          },
          {
            name: 'Linea',
            data: [lineaProgressIntervalCounts['0-10'], lineaProgressIntervalCounts['10-20'], lineaProgressIntervalCounts['20-30'], lineaProgressIntervalCounts['30-40'], lineaProgressIntervalCounts['40-50'], lineaProgressIntervalCounts['50-60'], lineaProgressIntervalCounts['60-70'], lineaProgressIntervalCounts['70-80'], lineaProgressIntervalCounts['80-90'], lineaProgressIntervalCounts['90-100']],
            type: 'bar'
          },
          {
            name: 'Base',
            data: [baseProgressIntervalCounts['0-10'], baseProgressIntervalCounts['10-20'], baseProgressIntervalCounts['20-30'], baseProgressIntervalCounts['30-40'], baseProgressIntervalCounts['40-50'], baseProgressIntervalCounts['50-60'], baseProgressIntervalCounts['60-70'], baseProgressIntervalCounts['70-80'], baseProgressIntervalCounts['80-90'], baseProgressIntervalCounts['90-100']],
            type: 'bar'
          }
        ]
      };

    const zksTx = zksAddressList.reduce((acc, entry) => {
        if ('zks2_tx_amount' in entry) {
            if (typeof entry.zks2_tx_amount === 'number') {
                acc.push(entry.zks2_tx_amount);
            }
        }
        return acc;
    }, []);
    const zksTxIntervalCounts = zksTx.reduce((acc, num) => {
        if (num >= 0 && num <= 10) {
            acc['0-10']++;
        } else if (num > 10 && num <= 20) {
            acc['10-20']++;
        } else if (num > 20 && num <= 30) {
            acc['20-30']++;
        } else if (num > 30 && num <= 40) {
            acc['30-40']++;
        } else if (num > 40 && num <= 50) {
            acc['40-50']++;
        } else if (num > 50 && num <= 60) {
            acc['50-60']++;
        } else if (num > 60 && num <= 70) {
            acc['60-70']++;
        } else if (num > 70 && num <= 80) {
            acc['70-80']++;
        } else if (num > 80 && num <= 90) {
            acc['80-90']++;
        } else if (num > 90 && num <= 100) {
            acc['90-100']++;
        } else if (num > 100) {
            acc['100+']++;
        }
        return acc;
      }, {
        '0-10': 0,
        '10-20': 0,
        '20-30': 0,
        '30-40': 0,
        '40-50': 0,
        '50-60': 0,
        '60-70': 0,
        '70-80': 0,
        '80-90': 0,
        '90-100': 0,
        '100+': 0
      });
    const lineaTx = lineaAddressList.reduce((acc, entry) => {
        if ('linea_tx_amount' in entry) {
            if (typeof entry.linea_tx_amount === 'number') {
                acc.push(entry.linea_tx_amount);
            }
        }
        return acc;
    }, []);
    const lineaTxIntervalCounts = lineaTx.reduce((acc, num) => {
        if (num >= 0 && num <= 10) {
            acc['0-10']++;
        } else if (num > 10 && num <= 20) {
            acc['10-20']++;
        } else if (num > 20 && num <= 30) {
            acc['20-30']++;
        } else if (num > 30 && num <= 40) {
            acc['30-40']++;
        } else if (num > 40 && num <= 50) {
            acc['40-50']++;
        } else if (num > 50 && num <= 60) {
            acc['50-60']++;
        } else if (num > 60 && num <= 70) {
            acc['60-70']++;
        } else if (num > 70 && num <= 80) {
            acc['70-80']++;
        } else if (num > 80 && num <= 90) {
            acc['80-90']++;
        } else if (num > 90 && num <= 100) {
            acc['90-100']++;
        } else if (num > 100) {
            acc['100+']++;
        }
        return acc;
      }, {
        '0-10': 0,
        '10-20': 0,
        '20-30': 0,
        '30-40': 0,
        '40-50': 0,
        '50-60': 0,
        '60-70': 0,
        '70-80': 0,
        '80-90': 0,
        '90-100': 0,
        '100+': 0
      });
    
    const baseTx = baseAddressList.reduce((acc, entry) => {
        if ('base_tx_amount' in entry) {
            if (typeof entry.base_tx_amount === 'number') {
                acc.push(entry.base_tx_amount);
            }
        }
        return acc;
    }, []);
    const baseTxIntervalCounts = baseTx.reduce((acc, num) => {
        if (num >= 0 && num <= 10) {
            acc['0-10']++;
        } else if (num > 10 && num <= 20) {
            acc['10-20']++;
        } else if (num > 20 && num <= 30) {
            acc['20-30']++;
        } else if (num > 30 && num <= 40) {
            acc['30-40']++;
        } else if (num > 40 && num <= 50) {
            acc['40-50']++;
        } else if (num > 50) {
            acc['50+']++;
        }
        return acc;
    }, {
        '0-10': 0,
        '10-20': 0,
        '20-30': 0,
        '30-40': 0,
        '40-50': 0,
        '50+': 0
    });

    const txOption = {
        title: {
            text: 'Tx数分布',
            subtext: `zkSyncEra平均tx ${parseInt(zksTx.length ? zksTx.reduce((acc, num) => acc + num, 0) / zksTx.length : 0)}条  Linea平均tx ${parseInt(lineaTx.length ? lineaTx.reduce((acc, num) => acc + num, 0) / lineaTx.length : 0)}条 Base平均tx ${parseInt(baseTx.length ? baseTx.reduce((acc, num) => acc + num, 0) / baseTx.length : 0)}条`,
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c}"
        },
        legend: {
            top: '1%',
            orient: 'vertical',
            left: 'left',
            data: ['zkSync Era', 'Linea', 'Base']
        },
        xAxis: {
          type: 'category',
          data: ['0-10', '10-20', '20-30', '30-40', '40-50', '50-60', '60-70', '70-80', '80-90', '90-100', '100+'],
          axisLabel:{
    		interval: 0
    	    }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'zkSync Era',
            data: [zksTxIntervalCounts['0-10'], zksTxIntervalCounts['10-20'], zksTxIntervalCounts['20-30'], zksTxIntervalCounts['30-40'], zksTxIntervalCounts['40-50'], zksTxIntervalCounts['50-60'], zksTxIntervalCounts['60-70'], zksTxIntervalCounts['70-80'], zksTxIntervalCounts['80-90'], zksTxIntervalCounts['90-100'], zksTxIntervalCounts['100+']],
            type: 'bar'
          },
          {
            name: 'Linea',
            data: [lineaTxIntervalCounts['0-10'], lineaTxIntervalCounts['10-20'], lineaTxIntervalCounts['20-30'], lineaTxIntervalCounts['30-40'], lineaTxIntervalCounts['40-50'], lineaTxIntervalCounts['50-60'], lineaTxIntervalCounts['60-70'], lineaTxIntervalCounts['70-80'], lineaTxIntervalCounts['80-90'], lineaTxIntervalCounts['90-100'], lineaTxIntervalCounts['100+']],
            type: 'bar'
          },
          {
            name: 'Base',
            data: [baseTxIntervalCounts['0-10'], baseTxIntervalCounts['10-20'], baseTxIntervalCounts['20-30'], baseTxIntervalCounts['30-40'], baseTxIntervalCounts['40-50'], baseTxIntervalCounts['50-60'], baseTxIntervalCounts['60-70'], baseTxIntervalCounts['70-80'], baseTxIntervalCounts['80-90'], baseTxIntervalCounts['90-100'], baseTxIntervalCounts['100+']],
            type: 'bar'
          }
        ]
      };
    const zksDayActivity = zksAddressList.reduce((acc, entry) => {
        if ('dayActivity' in entry) {
            if (typeof entry.dayActivity === 'number') {
                acc.push(entry.dayActivity);
            }
        }
        return acc;
    }, []);
    const zksActivityIntervalCounts = zksDayActivity.reduce((acc, num) => {
        if (num >= 0 && num <= 10) {
            acc['0-10']++;
        } else if (num > 10 && num <= 20) {
            acc['10-20']++;
        } else if (num > 20 && num <= 30) {
            acc['20-30']++;
        } else if (num > 30 && num <= 40) {
            acc['30-40']++;
        } else if (num > 40 && num <= 50) {
            acc['40-50']++;
        } else if (num > 50) {
            acc['50+']++;
        }
        return acc;
      }, {
        '0-10': 0,
        '10-20': 0,
        '20-30': 0,
        '30-40': 0,
        '40-50': 0,
        '50+': 0
      });
    const lineaDayActivity = lineaAddressList.reduce((acc, entry) => {
        if ('dayActivity' in entry) {
            if (typeof entry.dayActivity === 'number') {
                acc.push(entry.dayActivity);
            }
        }
        return acc;
    }, []);
    const lineaActivityIntervalCounts = lineaDayActivity.reduce((acc, num) => {
        if (num >= 0 && num <= 10) {
            acc['0-10']++;
        } else if (num > 10 && num <= 20) {
            acc['10-20']++;
        } else if (num > 20 && num <= 30) {
            acc['20-30']++;
        } else if (num > 30 && num <= 40) {
            acc['30-40']++;
        } else if (num > 40 && num <= 50) {
            acc['40-50']++;
        } else if (num > 50) {
            acc['50+']++;
        }
        return acc;
      }, {
        '0-10': 0,
        '10-20': 0,
        '20-30': 0,
        '30-40': 0,
        '40-50': 0,
        '50+': 0,
      });
    const baseDayActivity = baseAddressList.reduce((acc, entry) => {
        if ('dayActivity' in entry) {
            if (typeof entry.dayActivity === 'number') {
                acc.push(entry.dayActivity);
            }
        }
        return acc;
    }, []);
    const baseActivityIntervalCounts = baseDayActivity.reduce((acc, num) => {
        if (num >= 0 && num <= 10) {
            acc['0-10']++;
        } else if (num > 10 && num <= 20) {
            acc['10-20']++;
        } else if (num > 20 && num <= 30) {
            acc['20-30']++;
        } else if (num > 30 && num <= 40) {
            acc['30-40']++;
        } else if (num > 40 && num <= 50) {
            acc['40-50']++;
        } else if (num > 50) {
            acc['50+']++;
        }
        return acc;
    }, {
        '0-10': 0,
        '10-20': 0,
        '20-30': 0,
        '30-40': 0,
        '40-50': 0,
        '50+': 0
    });
    const dayActivityOption = {
        title: {
            text: '日活跃天数分布',
            subtext: `zkSyncEra平均日活 ${parseInt(zksDayActivity.reduce((acc, num) => acc + num, 0) / zksDayActivity.length)}天  Linea平均日活 ${parseInt(lineaDayActivity.reduce((acc, num) => acc + num, 0) / lineaDayActivity.length)}天 Base平均日活 ${parseInt(baseDayActivity.reduce((acc, num) => acc + num, 0) / baseDayActivity.length)}天`,
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c}"
        },
        legend: {
            top: '1%',
            orient: 'vertical',
            left: 'left',
            data: ['zkSync Era', 'Linea', 'Base']
        },
        xAxis: {
          type: 'category',
          data: ['0-10', '10-20', '20-30', '30-40', '40-50', '50+'],
          axisLabel:{
    		interval: 0
    	    }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'zkSync Era',
            data: [zksActivityIntervalCounts['0-10'], zksActivityIntervalCounts['10-20'], zksActivityIntervalCounts['20-30'], zksActivityIntervalCounts['30-40'], zksActivityIntervalCounts['40-50'], zksActivityIntervalCounts['50+']],
            type: 'bar'
          },
          {
            name: 'Linea',
            data: [lineaActivityIntervalCounts['0-10'], lineaActivityIntervalCounts['10-20'], lineaActivityIntervalCounts['20-30'], lineaActivityIntervalCounts['30-40'], lineaActivityIntervalCounts['40-50'], lineaActivityIntervalCounts['50+']],
            type: 'bar'
          },
          {
            name: 'Base',
            data: [baseActivityIntervalCounts['0-10'], baseActivityIntervalCounts['10-20'], baseActivityIntervalCounts['20-30'], baseActivityIntervalCounts['30-40'], baseActivityIntervalCounts['40-50'], baseActivityIntervalCounts['50+']],
            type: 'bar'
          }
        ]
      };
    const zksExchangeAmount = zksAddressList.reduce((acc, entry) => {
        if ('totalExchangeAmount' in entry) {
            acc.push(entry.totalExchangeAmount);
        }
        return acc;
    }, []);
    const zksExchangeAmountIntervalCounts = zksExchangeAmount.reduce((acc, num) => {
        if (num >= 0 && num <= 1000) {
            acc['0-1k']++;
        } else if (num > 1000 && num <= 10000) {
            acc['1k-1w']++;
        } else if (num > 10000 && num <= 50000) {
            acc['1w-5w']++;
        } else if (num > 50000 && num <= 250000) {
            acc['5w-25w']++;
        } else if (num > 250000) {
            acc['25w+']++;
        }
        return acc;
      }, {
        '0-1k': 0,
        '1k-1w': 0,
        '1w-5w': 0,
        '5w-25w': 0,
        '25w+': 0
      });
    const lineaExchangeAmount = lineaAddressList.reduce((acc, entry) => {
        if ('totalExchangeAmount' in entry) {
            acc.push(entry.totalExchangeAmount);
        }
        return acc;
    }, []);
    const lineaExchangeAmountIntervalCounts = lineaExchangeAmount.reduce((acc, num) => {
        if (num >= 0 && num <= 1000) {
            acc['0-1k']++;
        } else if (num > 1000 && num <= 10000) {
            acc['1k-1w']++;
        } else if (num > 10000 && num <= 50000) {
            acc['1w-5w']++;
        } else if (num > 50000 && num <= 250000) {
            acc['5w-25w']++;
        } else if (num > 250000) {
            acc['25w+']++;
        }
        return acc;
      }, {
        '0-1k': 0,
        '1k-1w': 0,
        '1w-5w': 0,
        '5w-25w': 0,
        '25w+': 0
    });
    const baseExchangeAmount = baseAddressList.reduce((acc, entry) => {
        if ('totalExchangeAmount' in entry) {
            acc.push(entry.totalExchangeAmount);
        }
        return acc;
    }, []);
    const baseExchangeAmountIntervalCounts = baseExchangeAmount.reduce((acc, num) => {
        if (num >= 0 && num <= 1000) {
            acc['0-1k']++;
        } else if (num > 1000 && num <= 10000) {
            acc['1k-1w']++;
        } else if (num > 10000 && num <= 50000) {
            acc['1w-5w']++;
        } else if (num > 50000 && num <= 250000) {
            acc['5w-25w']++;
        } else if (num > 250000) {
            acc['25w+']++;
        }
        return acc;
    }, {
        '0-1k': 0,
        '1k-1w': 0,
        '1w-5w': 0,
        '5w-25w': 0,
        '25w+': 0
    });
    const exchangeAmountOption = {
        title: {
            text: '交易额分布',
            subtext: `zkSyncEra平均交易额 ${parseInt(zksExchangeAmount.reduce((acc, num) => acc + parseInt(num), 0) / zksExchangeAmount.length)}u  Linea平均交易额 ${parseInt(lineaExchangeAmount.reduce((acc, num) => acc + parseInt(num), 0) / lineaExchangeAmount.length)}u Base平均交易额 ${parseInt(baseExchangeAmount.reduce((acc, num) => acc + parseInt(num), 0) / baseExchangeAmount.length)}u`,
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c}"
        },
        legend: {
            top: '1%',
            orient: 'vertical',
            left: 'left',
            data: ['zkSync Era', 'Linea', 'Base']
        },
        xAxis: {
          type: 'category',
          data: ['0-1k', '1k-1w', '1w-5w', '5w-25w', '25w+'],
          axisLabel:{
    		interval: 0
    	    }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: 'zkSync Era',
            data: [zksExchangeAmountIntervalCounts['0-1k'], zksExchangeAmountIntervalCounts['1k-1w'], zksExchangeAmountIntervalCounts['1w-5w'], zksExchangeAmountIntervalCounts['5w-25w'], zksExchangeAmountIntervalCounts['25w+']],
            type: 'bar'
          },
          {
            name: 'Linea',
            data: [lineaExchangeAmountIntervalCounts['0-1k'], lineaExchangeAmountIntervalCounts['1k-1w'], lineaExchangeAmountIntervalCounts['1w-5w'], lineaExchangeAmountIntervalCounts['5w-25w'], lineaExchangeAmountIntervalCounts['25w+']],
            type: 'bar'
          },
          {
            name: 'Base',
            data: [baseExchangeAmountIntervalCounts['0-1k'], baseExchangeAmountIntervalCounts['1k-1w'], baseExchangeAmountIntervalCounts['1w-5w'], baseExchangeAmountIntervalCounts['5w-25w'], baseExchangeAmountIntervalCounts['25w+']],
            type: 'bar'
          }
        ]
      };
    // Function to preprocess the timestamp data and convert it into a format suitable for the heatmap
    function preprocessData(timeArray) {
        // Create an object to store the counts for each date
        const dateCounts = {};

        timeArray.forEach((timestamp) => {
            const date = new Date(timestamp);
            const formattedDate = date.toISOString().substring(0, 10);
            if (dateCounts[formattedDate]) {
                dateCounts[formattedDate]++;
            } else {
                dateCounts[formattedDate] = 1;
            }
        });

        const data = [];
        for (const date in dateCounts) {
            data.push([date, dateCounts[date]]);
        }
        return data;
    }

    const zksTimestampsList = localStorage.getItem('zks_timestamps') ? JSON.parse(localStorage.getItem('zks_timestamps')) : [];
    const lineaTimestampsList = localStorage.getItem('linea_timestamps') ? JSON.parse(localStorage.getItem('linea_timestamps')) : [];
    const baseTimestampsList = localStorage.getItem('base_timestamps') ? JSON.parse(localStorage.getItem('base_timestamps')) : [];
    const allTimestamps = zksTimestampsList.concat(lineaTimestampsList).concat(baseTimestampsList);

    const timeOption2023 = {
        title: {
            top: 30,
            left: 'center',
            // text: '黑奴工作量证明 (Proof of Gas)',
            // subtext: `2023年 日均交互次数 ${parseFloat(allTimestamps.length/365).toFixed(2) * accountCount}   zkSync Era ${(parseFloat(zksTimestampsList.length/365) * zksAddressCount).toFixed(2)} Linea ${parseInt(lineaTimestampsList.length/365)  * lineaAddressCount} Base ${parseInt(baseTimestampsList.length/365) * baseAddressCount}`,
        },
        tooltip: {
            position: 'top',
            formatter: function (p) {
                return `${p.data[0]}<br>tx: ${p.data[1]}`;
            }
        },
        visualMap: {
            type: 'piecewise',
            orient: 'vertical',
            left: 'left',
            show: false,
            top: "1%",
            pieces: [
                { min: 0, max: 3, label: '1-3', color: '#EAFCEA' },
                { min: 3, max: 10, label: '3-10', color: '#82C485' },
                { min: 10, max: 20, label: '10-20', color: '#52A86C' },
                { min: 20, max: 50, label: '20-50', color: '#1E703E' },
                { min: 50, max: 100, label: '50-100', color: '#008000' },
                { min: 100, max: 999, label: '金色传说 100+', color: '#FFDF00' },
            ],
        },
        calendar: {
            top: 20,
            left: 100,
            right: 100,
            cellSize: ['auto', 30],
            range: '2023',
            itemStyle: {
                borderWidth: 2,
                borderColor: '#F0F0F0',
            },
            yearLabel: { show: true },
            monthLabel: {
                nameMap: 'ZH',
                borderWidth: 0,
              },
            dayLabel: {
                nameMap: 'ZH',
            },
            splitLine: {
                lineStyle: {
                    color: '#F0F0F0',
                    width: 1.25
                }
            }
        },
        series: {
            type: 'heatmap',
            coordinateSystem: 'calendar',
            // Pass your timestamp data array to the preprocessData function
            data: preprocessData(allTimestamps),
        },
    };
    const timeOption2024 = {
        title: {
            top: 30,
            left: 'center',
            text: '黑奴工作量证明 (Proof of Gas)',
            // subtext: `2024年 日均交互次数 ${parseInt(allTimestamps.length/365)}   zkSync Era ${parseInt(zksTimestampsList.length/365)} Linea ${parseInt(lineaTimestampsList.length/365)} Base ${parseInt(baseTimestampsList.length/365)}`,
        },
        tooltip: {
            position: 'top',
            formatter: function (p) {
                return `${p.data[0]}<br>tx: ${p.data[1]}`;
            }
        },
        visualMap: {
            type: 'piecewise',
            orient: 'vertical',
            left: 'left',
            show: true,
            top: "1%",
            pieces: [
                { min: 0, max: 3, label: '1-3', color: '#EAFCEA' },
                { min: 3, max: 10, label: '3-10', color: '#82C485' },
                { min: 10, max: 20, label: '10-20', color: '#52A86C' },
                { min: 20, max: 50, label: '20-50', color: '#1E703E' },
                { min: 50, max: 100, label: '50-100', color: '#008000' },
                { min: 100, max: 999, label: '金色传说 100+', color: '#FFDF00' },
            ],
        },
        calendar: {
            top: 100,
            left: 100,
            right: 100,
            cellSize: ['auto', 30],
            range: '2024',
            itemStyle: {
                borderWidth: 2,
                borderColor: '#F0F0F0',
            },
            yearLabel: { show: true },
            monthLabel: {
                nameMap: 'ZH',
                borderWidth: 0,
              },
            dayLabel: {
                nameMap: 'ZH',
            },
            splitLine: {
                lineStyle: {
                    color: '#F0F0F0',
                    width: 1.25
                }
            }
        },
        series: {
            type: 'heatmap',
            coordinateSystem: 'calendar',
            // Pass your timestamp data array to the preprocessData function
            data: preprocessData(allTimestamps),
        },
    };
    const emptyOption = {
        title : {
            text: '暂无数据',
            x:'center'
            },
    };
    return (
        <Layout>
            <Content>
                <Row>
                    <Col span={12}>
                        <Card>
                            <ReactEcharts option={accountOption} style={{ height: '300px' }} />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card>
                            <ReactEcharts option={valueOption} style={{ height: '300px' }} />
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <Card>
                        <ReactEcharts option={progressOption} style={{ height: '400px' }} />
                            </Card>
                    </Col>
                    <Col span={12}>
                        <Card>
                        <ReactEcharts option={txOption} style={{ height: '400px' }} />
                            </Card>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                        <Card>
                        <ReactEcharts option={exchangeAmountOption} style={{ height: '400px' }} />
                            </Card>
                    </Col>
                    <Col span={12}>
                        <Card>
                        <ReactEcharts option={dayActivityOption} style={{ height: '400px' }} />
                            </Card>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Card>
                            <ReactEcharts option={timeOption2024} style={{ height: '400px' }} />
                            <ReactEcharts option={timeOption2023} style={{ height: '400px' }} />
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Card>
                        <ReactEcharts option={emptyOption} style={{ height: '200px' }} />
                            </Card>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
}

export default Overview;

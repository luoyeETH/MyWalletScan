import {
    Button,
    Input,
    Space,
    Table,
    Modal,
    Form,
    notification,
    Spin,
    Tag,
    Popconfirm,
    Row, Col, InputNumber, Badge, message, Switch, Pagination
} from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, FileSearchOutlined } from "@ant-design/icons"
import {
    getEthBalance,
    getTxCount,
    getZksEra,
    getZksLite,
    getZkSyncBridge,
    exportToExcel,
    calculateScore,
    getDebankValue,
    checkSybil
} from "@utils"
import {useEffect, useState} from "react";
import './index.css';
import {Layout, Card} from 'antd';
import { ethers } from 'ethers';

const {Content} = Layout;
import {
    DeleteOutlined,
    DownloadOutlined,
    EditOutlined,
    PlusOutlined, SettingOutlined,
    SyncOutlined,
    UploadOutlined
} from "@ant-design/icons";

const {TextArea} = Input;

function Zksync() {
    const [batchProgress, setBatchProgress] = useState(0);
    const [batchLength, setBatchLength] = useState(0);
    const [batchloading, setBatchLoading] = useState(false);
    const [zkSyncConfigStore, setZkSyncConfigStore] = useState({});
    const [data, setData] = useState([]);
    const [isBatchModalVisible, setIsBatchModalVisible] = useState(false);
    const [isWalletModalVisible, setIsWalletModalVisible] = useState(false);
    const [batchForm] = Form.useForm();
    const [walletForm] = Form.useForm();
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [hideColumn, setHideColumn] = useState(false);
    const [scoreData, setScoreData] = useState([]);
    const [tableHeight, setTableHeight] = useState(0);
    const [latestVersion, setLatestVersion] = useState('');
    const [commitMessage, setCommitMessage] = useState('');

    const toggleHideColumn = () => {
        setHideColumn(!hideColumn);
      };
    
    const getNftBalance = async (address) => {
        try {
        const provider = new ethers.JsonRpcProvider('https://mainnet.era.zksync.io');
        const ABI = [
            {
              inputs: [
                {
                  internalType: "address",
                  name: "owner",
                  type: "address",
                },
              ],
              name: "balanceOf",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
          ];
          const contractAddress = "0xd07180c423f9b8cf84012aa28cc174f3c433ee29";
          const contract = new ethers.Contract(contractAddress, ABI, provider);
          const result = await contract.balanceOf(address);
          return {zks_nft: result.toString()};
        } 
        catch (error) {
            console.log(error);
            return {zks_nft: "Error"};
        }
    }

    const getEyeIcon = () => {
    if (hideColumn) {
        return <EyeInvisibleOutlined />;
    }
    return <EyeOutlined />;
    };

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
  
    // Call the checkVersion function on component mount and whenever the latestVersion state changes
    useEffect(checkVersion, [latestVersion]);

    useEffect(() => {
        const handleResize = () => {
            setTableHeight(window.innerHeight - 210); // 减去其他组件的高度，如页眉、页脚等
        };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
        window.removeEventListener('resize', handleResize);
    };
    }, []);

    useEffect(() => {
        setBatchProgress(0);
        const zksync_config = localStorage.getItem('zksync_config');
        if (zksync_config) {
            const config = JSON.parse(zksync_config);
            setZkSyncConfigStore(config);
            walletForm.setFieldsValue(config);
        } else {
            setZkSyncConfigStore(
                {
                    "ETHTx": null,
                    "zkSyncLiteMinTx": null,
                    "zkSyncEraMinTx": null,
                    "zkSyncEraValue": null,
                    "dayMin": null,
                    "weekMin": null,
                    "monthMin": null,
                    "L1ToL2Tx": null,
                    "L2ToL1Tx": null,
                    "L1ToL2ETH": null,
                    "L2ToL1ETH": null,
                    "gasFee": null,
                    "contractMin": null,
                    "totalAmount": null,
                }
            )
        }
    }, []);
    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            if (values.address.length !== 42) {
                notification.error({
                    message: "错误",
                    description: "请输入正确的地址",
                }, 2);
                return;
            }
            setIsModalVisible(false);
            const index = data.findIndex(item => item.address === values.address);
            if (index !== -1) {
                setData(data.map((item, i) => {
                    if (i === index) {
                        return {
                            ...item,
                            name: values.name,
                        }
                    }
                    return item;
                }));
                const updatedData = [...data];
                getZksEra(values.address).then(({balance2, tx2, usdcBalance, eraETH}) => {
                    updatedData[index] = {
                        ...updatedData[index],
                        zks2_balance: balance2,
                        zks2_tx_amount: tx2,
                        zks2_usdcBalance: usdcBalance,
                        zks_eraETH: eraETH,
                    };
                    setData(updatedData);
                    localStorage.setItem('addresses', JSON.stringify(data));
                })
                getZksLite(values.address).then(({balance1, tx1}) => {
                    updatedData[index] = {
                        ...updatedData[index],
                        zks1_balance: balance1,
                        zks1_tx_amount: tx1,
                    };
                    setData(updatedData);
                    localStorage.setItem('addresses', JSON.stringify(data));

                })
                getEthBalance(values.address, "ethereum").then((eth_balance) => {
                    updatedData[index] = {
                        ...updatedData[index],
                        eth_balance,
                    };
                    setData(updatedData);
                    localStorage.setItem('addresses', JSON.stringify(data));

                })
                getTxCount(values.address, "ethereum").then((eth_tx_amount) => {
                    updatedData[index] = {
                        ...updatedData[index],
                        eth_tx_amount,
                    };
                    setData(updatedData);
                    localStorage.setItem('addresses', JSON.stringify(data));
                })
                getZkSyncBridge(values.address).then(({
                                                          zks2_last_tx,
                                                          totalExchangeAmount,
                                                          totalFee,
                                                          contractActivity,
                                                          dayActivity,
                                                          weekActivity,
                                                          monthActivity,
                                                          l1Tol2Times,
                                                          l1Tol2Amount,
                                                          l2Tol1Times,
                                                          l2Tol1Amount,
                                                          paymasterCount
                                                      }) => {
                    updatedData[index] = {
                        ...updatedData[index],
                        zks2_last_tx,
                        totalExchangeAmount,
                        totalFee,
                        contractActivity,
                        dayActivity,
                        weekActivity,
                        monthActivity,
                        l1Tol2Times,
                        l1Tol2Amount,
                        l2Tol1Times,
                        l2Tol1Amount,
                        paymasterCount
                    };
                    setData(updatedData);
                    localStorage.setItem('addresses', JSON.stringify(data));
                })
            } else {
                const newEntry = {
                    key: data.length.toString(),
                    name: values.name,
                    address: values.address,
                    eth_balance: null,
                    eth_tx_amount: null,
                    zks2_balance: null,
                    zks2_tx_amount: null,
                    zks2_usdcBalance: null,
                    zks_eraETH: null,
                    zks2_last_tx: null,
                    zks1_balance: null,
                    zks1_tx_amount: null,
                    dayActivity: null,
                    weekActivity: null,
                    monthActivity: null,
                    l1Tol2Times: null,
                    l1Tol2Amount: null,
                    l2Tol1Times: null,
                    l2Tol1Amount: null,
                    contractActivity: null,
                    totalFee: null,
                    totalExchangeAmount: null,
                    paymasterCount: null,
                };
                const newData = [...data, newEntry];
                setData(newData);
                getZksEra(values.address).then(({balance2, tx2, usdcBalance, eraETH}) => {
                    newEntry.zks2_balance = balance2;
                    newEntry.zks2_tx_amount = tx2;
                    newEntry.zks2_usdcBalance = usdcBalance;
                    newEntry.zks_eraETH = eraETH;
                    setData([...newData]);
                    localStorage.setItem('addresses', JSON.stringify(newData));
                })
                getZksLite(values.address).then(({balance1, tx1}) => {
                    newEntry.zks1_balance = balance1;
                    newEntry.zks1_tx_amount = tx1;
                    setData([...newData]);
                    localStorage.setItem('addresses', JSON.stringify(newData));

                })
                getEthBalance(values.address, "ethereum").then((eth_balance) => {
                    newEntry.eth_balance = eth_balance;
                    setData([...newData]);
                    localStorage.setItem('addresses', JSON.stringify(newData));

                })
                getTxCount(values.address, "ethereum").then((eth_tx_amount) => {
                    newEntry.eth_tx_amount = eth_tx_amount;
                    setData([...newData]);
                    localStorage.setItem('addresses', JSON.stringify(newData));
                })
                getZkSyncBridge(values.address).then(({
                                                          zks2_last_tx,
                                                          totalExchangeAmount,
                                                          totalFee,
                                                          contractActivity,
                                                          dayActivity,
                                                          weekActivity,
                                                          monthActivity,
                                                          l1Tol2Times,
                                                          l1Tol2Amount,
                                                          l2Tol1Times,
                                                          l2Tol1Amount,
                                                          paymasterCount
                                                      }) => {
                    newEntry.zks2_last_tx = zks2_last_tx;
                    newEntry.totalFee = totalFee;
                    newEntry.contractActivity = contractActivity;
                    newEntry.dayActivity = dayActivity;
                    newEntry.weekActivity = weekActivity;
                    newEntry.monthActivity = monthActivity;
                    newEntry.l1Tol2Times = l1Tol2Times;
                    newEntry.l1Tol2Amount = l1Tol2Amount;
                    newEntry.l2Tol1Times = l2Tol1Times;
                    newEntry.l2Tol1Amount = l2Tol1Amount;
                    newEntry.totalExchangeAmount = totalExchangeAmount;
                    newEntry.paymasterCount = paymasterCount;
                    setData([...newData]);
                    localStorage.setItem('addresses', JSON.stringify(newData));
                })
            }
        } catch (error) {
            notification.error({
                message: "错误",
                description: error.message,
            }, 2);
        } finally {
            form.resetFields();
        }
    }
    const handleCheck = async () => {
        if (!selectedKeys.length) {
            notification.error({
                message: "错误",
                description: "请先选择要查询的地址",
            }, 2);
            return;
        }
        setIsLoading(true);
        try {
            const newData = [...data];
            for (let key of selectedKeys) {
                const index = newData.findIndex(item => item.key === key);
                if (index !== -1) {
                    const item = newData[index];
                    item.sybil = false;
                    setData([...newData]);
                    const { sybil } = await checkSybil(item.address);
                    item.sybil = sybil;
                    setData([...newData]);
                    localStorage.setItem('addresses', JSON.stringify(data));
                }
            }
        } catch (error) {
            notification.error({
                message: "错误",
                description: error.message,
            }, 2);
        } finally {
            setIsLoading(false);
            setSelectedKeys([]);
        }
    };
    const handleRefresh = async () => {
        if (!selectedKeys.length) {
            notification.error({
                message: "错误",
                description: "请先选择要刷新的地址",
            }, 2);
            return;
        }
        setIsLoading(true);
        try {
            const limit = 50;
            let activePromises = 0;
            let promisesQueue = [];
            const newData = [...data];
            const processQueue = () => {
                while (activePromises < limit && promisesQueue.length > 0) {
                    const promise = promisesQueue.shift();
                    activePromises += 1;

                    promise().finally(() => {
                        activePromises -= 1;
                        processQueue();
                    });
                }
            };
            for (let key of selectedKeys) {
                const index = newData.findIndex(item => item.key === key);
                if (index !== -1) {
                    const item = newData[index];
                    // promisesQueue.push(() => {
                    //     item.debank = null;
                    //     return getDebankValue(item.address).then((debankValue) => {
                    //         item.debank = debankValue;
                    //         setData([...newData]);
                    //         localStorage.setItem('addresses', JSON.stringify(newData));
                    //     })
                    // })
                    promisesQueue.push(() => {
                        item.zks2_balance = null;
                        item.zks2_tx_amount = null;
                        item.zks2_usdcBalance = null;
                        item.zks_eraETH = null;
                        return getZksEra(item.address).then(({balance2, tx2, usdcBalance, eraETH}) => {
                            item.zks2_balance = balance2;
                            item.zks2_tx_amount = tx2;
                            item.zks2_usdcBalance = usdcBalance;
                            item.zks_eraETH = eraETH;
                            setData([...newData]);
                            localStorage.setItem('addresses', JSON.stringify(newData));
                        })
                    });
                    promisesQueue.push(async () => {
                        item.zks_nft = null;
                        return getNftBalance(item.address).then(({zks_nft}) => {
                            item.zks_nft = zks_nft;
                            setData([...newData]);
                            localStorage.setItem('addresses', JSON.stringify(newData));
                        })
                    })
                    promisesQueue.push(() => {
                        item.zks1_balance = null;
                        item.zks1_tx_amount = null;
                        return getZksLite(item.address).then(({balance1, tx1}) => {
                            item.zks1_balance = balance1;
                            item.zks1_tx_amount = tx1;
                            setData([...newData]);
                            localStorage.setItem('addresses', JSON.stringify(newData));
                        })
                    });
                    promisesQueue.push(() => {
                        item.eth_balance = null;
                        return getEthBalance(item.address, "ethereum").then((eth_balance) => {
                            item.eth_balance = eth_balance;
                            setData([...newData]);
                            localStorage.setItem('addresses', JSON.stringify(newData));
                        })
                    });
                    promisesQueue.push(() => {
                        item.eth_tx_amount = null;
                        return getTxCount(item.address, "ethereum").then((eth_tx_amount) => {
                            item.eth_tx_amount = eth_tx_amount;
                            setData([...newData]);
                            localStorage.setItem('addresses', JSON.stringify(newData));
                        })
                    });
                    promisesQueue.push(() => {
                        item.zks2_last_tx = null;
                        item.totalExchangeAmount = null;
                        item.totalFee = null;
                        item.contractActivity = null;
                        item.dayActivity = null;
                        item.weekActivity = null;
                        item.monthActivity = null;
                        item.l1Tol2Times = null;
                        item.l1Tol2Amount = null;
                        item.l2Tol1Times = null;
                        item.l2Tol1Amount = null;
                        item.paymasterCount = null;
                        return getZkSyncBridge(item.address).then(({
                                                                       zks2_last_tx,
                                                                       totalExchangeAmount,
                                                                       totalFee,
                                                                       contractActivity,
                                                                       dayActivity,
                                                                       weekActivity,
                                                                       monthActivity,
                                                                       l1Tol2Times,
                                                                       l1Tol2Amount,
                                                                       l2Tol1Times,
                                                                       l2Tol1Amount,
                                                                       paymasterCount
                                                                   }) => {
                            item.zks2_last_tx = zks2_last_tx;
                            item.totalExchangeAmount = totalExchangeAmount;
                            item.totalFee = totalFee;
                            item.contractActivity = contractActivity;
                            item.dayActivity = dayActivity;
                            item.weekActivity = weekActivity;
                            item.monthActivity = monthActivity;
                            item.l1Tol2Times = l1Tol2Times;
                            item.l1Tol2Amount = l1Tol2Amount;
                            item.l2Tol1Times = l2Tol1Times;
                            item.l2Tol1Amount = l2Tol1Amount;
                            item.paymasterCount = paymasterCount;
                            setData([...newData]);
                            localStorage.setItem('addresses', JSON.stringify(newData));
                        })
                    });
                }
                processQueue();
            }
            while (activePromises > 0 || promisesQueue.length > 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        } catch (error) {
            notification.error({
                message: "错误",
                description: error.message,
            }, 2);
        } finally {
            setIsLoading(false);
            setSelectedKeys([]);
            message.success("刷新成功");
        }
    };

    const handleBatchOk = async () => {
        try {
            setBatchLoading(true);
            setIsBatchModalVisible(false);
            const values = await batchForm.validateFields();
            const addressLines = values.addresses.split("\n");
            const wallets = addressLines.map(line => {
                const [address, name] = line.split(",");
                return { address: address.trim(), name: name ? name.trim() : ''  };
              });
            const addresses = wallets.map(obj => obj.address);
            const names = wallets.map(obj => obj.name);
            setBatchLength(addresses.length);
            const newData = [...data];
            const limit = 50;
            let activePromises = 0;
            let promisesQueue = [];
            setBatchProgress(0);
            const processQueue = () => {
                while (promisesQueue.length > 0 && activePromises < limit) {
                    const promise = promisesQueue.shift();
                    activePromises += 1;

                    promise().finally(() => {
                        activePromises -= 1;
                        processQueue();
                    });
                }
            };

            for (let address of addresses) {
                address = address.trim();
                let note = names[addresses.indexOf(address)];
                if (address.length !== 42) {
                    notification.error({
                        message: "错误",
                        description: "请输入正确的地址",
                    });
                    continue;
                }
                let promiseWithProgress = () => {
                    return new Promise((resolve, reject) => {
                        setBatchProgress(prevProgress => prevProgress + 1);
                        resolve();
                    });
                };
                const index = newData.findIndex(item => item.address === address);
                const item = index !== -1 ? newData[index] : {
                    key: newData.length.toString(),
                    address: address,
                    name: note,
                    eth_balance: null,
                    eth_tx_amount: null,
                    zks2_balance: null,
                    zks2_tx_amount: null,
                    zks2_usdcBalance: null,
                    zks_eraETH: null,
                    zks1_balance: null,
                    zks1_tx_amount: null,
                    zks2_last_tx: null,
                    dayActivity: null,
                    weekActivity: null,
                    monthActivity: null,
                    l1Tol2Times: null,
                    l1Tol2Amount: null,
                    l2Tol1Times: null,
                    l2Tol1Amount: null,
                    contractActivity: null,
                    totalFee: null,
                    totalExchangeAmount: null,
                    paymasterCount: null,
                };
                if (index === -1) {
                    newData.push(item);
                }
                promisesQueue.push(() => getZksEra(address).then(({balance2, tx2, usdcBalance, eraETH}) => {
                    item.zks2_balance = balance2;
                    item.zks2_tx_amount = tx2;
                    item.zks2_usdcBalance = usdcBalance;
                    item.zks_eraETH = eraETH;
                }));


                promisesQueue.push(() => getZksLite(address).then(({balance1, tx1}) => {
                    item.zks1_balance = balance1;
                    item.zks1_tx_amount = tx1;
                }));

                promisesQueue.push(() => getEthBalance(address, "ethereum").then((eth_balance) => {
                    item.eth_balance = eth_balance;
                }));

                promisesQueue.push(() => getTxCount(address, "ethereum").then((eth_tx_amount) => {
                    item.eth_tx_amount = eth_tx_amount;
                }));

                promisesQueue.push(() => getZkSyncBridge(address).then(({
                                                                            zks2_last_tx,
                                                                            totalExchangeAmount,
                                                                            totalFee,
                                                                            contractActivity,
                                                                            dayActivity,
                                                                            weekActivity,
                                                                            monthActivity,
                                                                            l1Tol2Times,
                                                                            l1Tol2Amount,
                                                                            l2Tol1Times,
                                                                            l2Tol1Amount,
                                                                            paymasterCount
                                                                        }) => {
                    item.zks2_last_tx = zks2_last_tx;
                    item.totalExchangeAmount = totalExchangeAmount;
                    item.totalFee = totalFee;
                    item.contractActivity = contractActivity;
                    item.dayActivity = dayActivity;
                    item.weekActivity = weekActivity;
                    item.monthActivity = monthActivity;
                    item.l1Tol2Times = l1Tol2Times;
                    item.l1Tol2Amount = l1Tol2Amount;
                    item.l2Tol1Times = l2Tol1Times;
                    item.l2Tol1Amount = l2Tol1Amount;
                    item.paymasterCount = paymasterCount;
                }));
                promisesQueue.push(promiseWithProgress);
                processQueue();

            }
            while (activePromises > 0 || promisesQueue.length > 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            setData(newData);
            localStorage.setItem('addresses', JSON.stringify(newData));
        } catch (error) {
            notification.error({
                message: "错误",
                description: error.message,
            });
        } finally {
            setBatchLoading(false);
            setBatchProgress(0);
            batchForm.resetFields();
            setSelectedKeys([]);
            message.success("批量添加成功");
        }
    };


    const showModal = () => {
        setIsModalVisible(true);
    };
    const showBatchModal = () => {
        setIsBatchModalVisible(true);
    };
    const exportToExcelFile = () => {
        exportToExcel(data, 'walletInfo');
    }
    useEffect(() => {
        setTableLoading(true);
        const storedAddresses = localStorage.getItem('addresses');
        setTimeout(() => {
            setTableLoading(false);
        }, 500);
        if (storedAddresses) {
            setData(JSON.parse(storedAddresses));
            setScoreData(JSON.parse(storedAddresses));
        }
    }, []);
    useEffect(() => {
        const newData = [...data];
      
        for (const item of newData) {
          setTimeout(async () => {
            const score = await calculateScore(item);
            item.zk_score = score;
            
            // 检查是否所有数据的评分都已计算完成
            const allScoresCalculated = newData.every(item => item.zk_score !== undefined);
            
            if (allScoresCalculated) {
              setData(newData);
            }
          }, 0);
        }
      }, [scoreData]);
    const handleCancel = () => {
        setIsModalVisible(false);
    };
    const handleDelete = (key) => {
        setData(data.filter(item => item.key !== key));
        localStorage.setItem('addresses', JSON.stringify(data.filter(item => item.key !== key)));
    }
    const handleDeleteSelected = () => {
        if (!selectedKeys.length) {
            notification.error({
                message: "错误",
                description: "请先选择要删除的地址",
            }, 2);
            return;
        }
        setData(data.filter(item => !selectedKeys.includes(item.key)));
        localStorage.setItem('addresses', JSON.stringify(data.filter(item => !selectedKeys.includes(item.key))));
        setSelectedKeys([]);
    }
    const rowSelection = {
        selectedRowKeys: selectedKeys,
        onChange: (selectedRowKeys) => {
            setSelectedKeys(selectedRowKeys);
        },
    };
    const handleBatchCancel = () => {
        setIsBatchModalVisible(false);
    };
    const [editingKey, setEditingKey] = useState(null);
    const columns = [
        {
            title: "#",
            key: "index",
            align: "center",
            render: (text, record, index) => index + 1,
            width: 40,
        },
        {
            title: "备注",
            dataIndex: "name",
            key: "name",
            align: "center",
            render: (text, record) => {
                const isEditing = record.key === editingKey;
                return isEditing ? (
                    <Input
                        placeholder="请输入备注"
                        defaultValue={text}
                        onPressEnter={(e) => {
                            record.name = e.target.value;
                            setData([...data]);
                            localStorage.setItem('addresses', JSON.stringify(data));
                            setEditingKey(null);
                        }}
                    />
                ) : (
                    <>
                        <Tag color="blue" onClick={() => setEditingKey(record.key)}>
                            {text}
                            </Tag>
                            {!text && (
                            <Button
                                shape="circle"
                                icon={<EditOutlined />}
                                size="small"
                                onClick={() => setEditingKey(record.key)}
                            />
                        )}
                    </>
                );
            },
            width: 75
        },
        {
            title: (
                <span>
                钱包地址
                    <span onClick={toggleHideColumn} style={{ marginLeft: 8, cursor: 'pointer' }}>
                        {getEyeIcon()}
                    </span>
                </span>
            ),
            dataIndex: "address",
            key: "address",
            align: "center",
            render: (text, record) => {
                if (hideColumn) {
                    return '***';
                  }
                return record.sybil ? <span style={{ color: 'red' }} dangerouslySetInnerHTML={{ __html: `${text}💥` }}></span> : 
                 isRowSatisfyCondition(record) ?
                    <div
                        style={{backgroundColor: '#bbeefa', borderRadius: '5px'}}
                    >
                        {text}</div> : text ||
                    <Spin/>;
            },
            width: 168
        },
        // {
        //     title: "余额",
        //     key: "debank",
        //     className: "debank",
        //     align: "center",
        //     sorter: (a, b) => a.debank - b.debank,
        //     render: (text, record) => {
        //         if (record.debank === undefined) {
        //             return <Spin/>;
        //         }
        //         return record.debank;
        //     },
        //     width: 60
        // },
        {
            title: "ETH",
            key: "eth_group",
            className: "zks_eth",
            children: [
                {
                    title: "ETH",
                    dataIndex: "eth_balance",
                    key: "eth_balance",
                    align: "center",
                    sorter: (a, b) => a.eth_balance - b.eth_balance,
                    render: (text, record) => (text === null ? <Spin/> : text),
                    width: 60
                },
                {
                    title: "Tx",
                    dataIndex: "eth_tx_amount",
                    key: "eth_tx_amount",
                    align: "center",
                    render: (text, record) => (text === null ? <Spin/> : text),
                    width: 40
                },
            ],
        },
        {
            title: "zkSyncLite",
            key: "zks_lite_group",
            className: "zks_lite",
            children: [
                {
                    title: "ETH",
                    dataIndex: "zks1_balance",
                    key: "zks1_balance",
                    align: "center",
                    render: (text, record) => (text === null ? <Spin/> : text),
                    width: 60
                },
                {
                    title: "Tx",
                    dataIndex: "zks1_tx_amount",
                    key: "zks1_tx_amount",
                    align: "center",
                    render: (text, record) => (text === null ? <Spin/> : text),
                    width: 34.5
                },
            ],
        },
        {
            title: "zkSync Era",
            key: "zks_era_group",
            className: "zks_era",
            children: [
                {
                    title: "ETH",
                    dataIndex: "zks2_balance",
                    key: "zks2_balance",
                    align: "center",
                    render: (text, record) => (text === null ? <Spin/> : text),
                    width: 60
                },
                {
                    title: "USDC",
                    dataIndex: "zks2_usdcBalance",
                    key: "zks2_usdcBalance",
                    align: "center",
                    render: (text, record) => (text === null ? <Spin/> : text),
                    width: 60
                },
                // {
                //     title: "eraETH",
                //     dataIndex: "zks_eraETH",
                //     key: "zks_eraETH",
                //     align: "center",
                //     render: (text, record) => (text === null ? <Spin/> : text),
                //     width: 60
                // },
                {
                    title: 'Tx',
                    dataIndex: 'zks2_tx_amount',
                    key: 'zks2_tx_amount',
                    align: 'center',
                    sorter: (a, b) => a.zks2_tx_amount - b.zks2_tx_amount,
                    render: (text, record) => {
                        if (text === null) {
                          return <Spin />;
                        }
                  
                        // 计算对数值
                        const logarithmValue = Math.log(text); // 使用自然对数（以e为底）
                        // const logarithmValue = Math.log10(text); // 使用常用对数（以10为底）
                  
                        // 归一化处理
                        const minValue = Math.log(1); // 最小值的对数
                        const maxValue = Math.log(100); // 最大值的对数
                        const normalizedValue = (logarithmValue - minValue) / (maxValue - minValue);
                  
                        // 计算透明度
                        const minOpacity = 0.1; // 最小透明度
                        const maxOpacity = 1; // 最大透明度
                        const opacity = normalizedValue * (maxOpacity - minOpacity) + minOpacity;
                  
                        const backgroundColor = `rgba(173, 216, 230, ${opacity})`; 
                  
                        return {
                          children: text,
                          props: {
                            style: {
                              background: backgroundColor,
                            },
                          },
                        };
                      },
                      width: 40
                    },
                {
                    title: "最后交易",
                    dataIndex: "zks2_last_tx",
                    key: "zks2_last_tx",
                    align: "center",
                    render: (text, record) => {
                        let textColor = "inherit";
                      
                        if (text === null) {
                          return <Spin />;
                        } else if (text?.includes("天") && parseInt(text) > 7) {
                            textColor = "red";
                        } else {
                          textColor = "#1677ff";
                        }
                      
                        return (
                          <a
                            href={"https://era.zksync.network/address/" + record.address}
                            target={"_blank"}
                            style={{ color: textColor }}
                          >
                            {text}
                          </a>
                        );
                      },
                    width: 70
                },
                {
                    title: <a href="https://docs.zksync.io/build/developer-reference/account-abstraction.html#paymasters"
                        target="_blank" rel="noopener noreferrer">Paymaster</a>,
                    dataIndex: "paymasterCount",
                    key: "paymasterCount",
                    align: "center",
                    render: (text, record) => (
                        <span style={{ color: text === 0 ? 'red' : 'inherit' }}>
                            {text === null ? <Spin /> : text}
                        </span>
                        ),
                    width: 60
                },
                {
                    title: "官方桥跨链Tx数",
                    key: "cross_chain_tx_count_group",
                    children: [
                        {
                            title: "L1->L2",
                            dataIndex: "l1Tol2Times",
                            key: "l1Tol2Times",
                            align: "center",
                            sorter: (a, b) => a.l1Tol2Times - b.l1Tol2Times,
                            render: (text, record) => (text === null ? <Spin/> : text),
                            width: 60
                        },
                        {
                            title: "L2->L1",
                            dataIndex: "l2Tol1Times",
                            key: "l2Tol1Times",
                            align: "center",
                            render: (text, record) => (text === null ? <Spin/> : text),
                            width: 50
                        },
                    ],
                },
                {
                    title: "官方桥跨链金额",
                    key: "cross_chain_amount_group",
                    children: [
                        {
                            title: "L1->L2",
                            dataIndex: "l1Tol2Amount",
                            key: "l1Tol2Amount",
                            align: "center",
                            render: (text, record) => (text === null ? <Spin/> : text),
                            width: 50
                        },
                        {
                            title: "L2->L1",
                            dataIndex: "l2Tol1Amount",
                            key: "l2Tol1Amount",
                            align: "center",
                            render: (text, record) => (text === null ? <Spin/> : text),
                            width: 50
                        },
                    ],
                },
                {
                    title: "活跃统计",
                    key: "activity_stats_group",
                    children: [
                        {
                            title: "日",
                            dataIndex: "dayActivity",
                            key: "dayActivity",
                            align: "center",
                            sorter: (a, b) => a.dayActivity - b.dayActivity,
                            render: (text, record) => (text === null ? <Spin/> : text),
                            width: 34
                        },
                        {
                            title: "周",
                            dataIndex: "weekActivity",
                            key: "weekActivity",
                            align: "center",
                            sorter: (a, b) => a.weekActivity - b.weekActivity,
                            render: (text, record) => (text === null ? <Spin/> : text),
                            width: 34
                        },
                        {
                            title: "月",
                            dataIndex: "monthActivity",
                            key: "monthActivity",
                            align: "center",
                            render: (text, record) => (text === null ? <Spin/> : text),
                            width: 34
                        },
                        {
                            title: "不同合约",
                            dataIndex: "contractActivity",
                            key: "contractActivity",
                            align: "center",
                            render: (text, record) => (text === null ? <Spin/> : text),
                            width: 70
                        },
                        {
                            title: "金额(U)",
                            dataIndex: "totalExchangeAmount",
                            key: "totalExchangeAmount",
                            align: "center",
                            sorter: (a, b) => a.totalExchangeAmount - b.totalExchangeAmount,
                            render: (text, record) => {
                                if (text === null) {
                                  return <Spin />;
                                }
                          
                                // 计算对数值
                                const logarithmValue = Math.log(text); // 使用自然对数（以e为底）
                                // const logarithmValue = Math.log10(text); // 使用常用对数（以10为底）
                          
                                // 归一化处理
                                const minValue = Math.log(1); // 最小值的对数
                                const maxValue = Math.log(100); // 最大值的对数
                                const normalizedValue = (logarithmValue - minValue) / (maxValue - minValue);
                          
                                // 计算透明度
                                const minOpacity = 0.1; // 最小透明度
                                const maxOpacity = 1; // 最大透明度
                                const opacity = normalizedValue * (maxOpacity - minOpacity) + minOpacity;
                          
                                const backgroundColor = `rgba(211, 211, 211, ${opacity})`; 
                          
                                return {
                                  children: text,
                                  props: {
                                    style: {
                                      background: backgroundColor,
                                    },
                                  },
                                };
                              },
                              width: 70
                            },
                        {
                            title: "FeeΞ",
                            dataIndex: "totalFee",
                            key: "totalFee",
                            align: "center",
                            render: (text, record) => (text === null ? <Spin/> : text),
                            width: 60
                        }
                    ],
                },
            ],
        },
        {
            title: "评分",
            dataIndex: "zk_score",
            key: "zk_score",
            align: "center",
            sorter: (a, b) => a.zk_score - b.zk_score,
            render: (text, record) => {
                if (text === null) {
                  return <Spin />;
                }
          
                // 计算对数值
                const logarithmValue = Math.log(text); // 使用自然对数（以e为底）
                // const logarithmValue = Math.log10(text); // 使用常用对数（以10为底）
          
                // 归一化处理
                const minValue = Math.log(1); // 最小值的对数
                const maxValue = Math.log(100); // 最大值的对数
                const normalizedValue = (logarithmValue - minValue) / (maxValue - minValue);
          
                // 计算透明度
                const minOpacity = 0.1; // 最小透明度
                const maxOpacity = 1; // 最大透明度
                const opacity = normalizedValue * (maxOpacity - minOpacity) + minOpacity;
          
                const backgroundColor = `rgba(240, 121, 78, ${opacity})`; 
          
                return {
                  children: text,
                  props: {
                    style: {
                      background: backgroundColor,
                    },
                  },
                };
              },
            width: 50
        },
        {
            title: "操作",
            key: "action",
            align: "center",
            render: (text, record) => (
                <Space size="small">
                    <Popconfirm title={"确认删除？"} onConfirm={() => handleDelete(record.key)}>
                        <Button icon={<DeleteOutlined/>}/>
                    </Popconfirm>
                </Space>
            ),
            width: 50
        },
    ];
    const handleWalletOk = () => {
        const values = walletForm.getFieldsValue();
        localStorage.setItem('zksync_config', JSON.stringify(values));
        setZkSyncConfigStore(values);
        setIsWalletModalVisible(false);
        console.log(zkSyncConfigStore)
    };
    const FormItem = ({name, addonBefore, addonAfter}) => (
        <Form.Item name={name}>
            <InputNumber min={0} style={{width: '100%'}}
                         addonBefore={addonBefore} addonAfter={addonAfter}
            />
        </Form.Item>
    );
    const isRowSatisfyCondition = (record) => {
        const conditionKeyMapping = {
            "ETHTx": "eth_tx_amount",
            "zkSyncLiteMinTx": "zks1_tx_amount",
            "zkSyncEraMinTx": "zks2_tx_amount",
            "zkSyncEraValue": "zks2_balance",
            "L1ToL2Tx": "l1Tol2Times",
            "L2ToL1Tx": "l2Tol1Times",
            "L1ToL2ETH": "l1Tol2Amount",
            "L2ToL1ETH": "l2Tol1Amount",
            "contractMin": "contractActivity",
            "dayMin": "dayActivity",
            "weekMin": "weekActivity",
            "monthMin": "monthActivity",
            "gasFee": "totalFee",
            "totalAmount": "totalExchangeAmount",
        };
        return Object.keys(conditionKeyMapping).every((conditionKey) => {
            if (!(conditionKey in zkSyncConfigStore) || zkSyncConfigStore[conditionKey] === null || zkSyncConfigStore[conditionKey] === undefined) {
                return true;
            }
            const recordKey = conditionKeyMapping[conditionKey];
            return Number(record[recordKey]) >= Number(zkSyncConfigStore[conditionKey])
        });
    };

    return (
        <div>
            <Content>
                <Modal title="批量添加地址" open={isBatchModalVisible} onOk={handleBatchOk}
                       onCancel={handleBatchCancel}
                       okButtonProps={{loading: isLoading}}
                       okText={"添加地址"}
                       cancelText={"取消"}
                    // style={{zIndex: 3}}
                >
                    <Form form={batchForm} layout="vertical">
                        <Form.Item label="地址" name="addresses" rules={[{required: true}]}>
                            <TextArea placeholder="请输入地址，每行一个  要添加备注时放在地址后以逗号(,)间隔" style={{width: "500px", height: "200px"}}/>
                        </Form.Item>
                    </Form>
                </Modal>
                <Modal title="添加地址" open={isModalVisible} onOk={handleOk} onCancel={handleCancel}
                       okButtonProps={{loading: isLoading}}
                       okText={"添加地址"}
                       cancelText={"取消"}
                    // style={{zIndex: 3}}
                >
                    <Form form={form} layout="vertical">
                        <Form.Item label="地址" name="address" rules={[{required: true}]}>
                            <Input placeholder="请输入地址"/>
                        </Form.Item>
                        <Form.Item label="备注" name="name">
                            <Input placeholder="请输入备注"/>
                        </Form.Item>
                    </Form>
                </Modal>
                <Modal title="zkSync"
                       open={isWalletModalVisible}
                       onOk={handleWalletOk}
                       onCancel={() => {
                           setIsWalletModalVisible(false);
                       }}
                       okText={"保存"}
                       cancelText={"取消"}
                       width={700}
                       style={{top: 10}}
                    // style={{zIndex: 3}}

                >
                    <Form form={walletForm} layout="vertical">
                        <Card title="设置钱包预期标准，若钱包达到设置标准，钱包地址背景会为蓝色，更清晰"
                              bordered={true}
                              style={{width: '100%'}}>
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <FormItem name="ETHTx" addonBefore="ETH Tx数量 ≥ "
                                              addonAfter="个"/>
                                    <FormItem name="zkSyncLiteMinTx" addonBefore="zkSyncLite Tx数量 ≥ "
                                              addonAfter="个"/>
                                    <FormItem name="zkSyncEraMinTx" addonBefore="zkSyncEra Tx数量 ≥ "
                                              addonAfter="个"/>
                                    <FormItem name="zkSyncEraValue" addonBefore="zkSyncEra 余额 ≥ "
                                              addonAfter="ETH"/>
                                    <FormItem name="dayMin" addonBefore="日活跃数 ≥ " addonAfter="天"/>
                                    <FormItem name="weekMin" addonBefore="周活跃数 ≥ " addonAfter="周"/>
                                    <FormItem name="monthMin" addonBefore="月活跃数 ≥ " addonAfter="月"/>
                                </Col>
                                <Col span={12}>
                                    <FormItem name="L1ToL2Tx" addonBefore="L1->L2跨链Tx ≥ " addonAfter="个"/>
                                    <FormItem name="L2ToL1Tx" addonBefore="L2->L1跨链Tx ≥ " addonAfter="个"/>
                                    <FormItem name="L1ToL2ETH" addonBefore="L1->L2跨链金额 ≥ " addonAfter="ETH"/>
                                    <FormItem name="L2ToL1ETH" addonBefore="L2->L1跨链金额 ≥ " addonAfter="ETH"/>
                                    <FormItem name="gasFee" addonBefore="消耗gasFee" addonAfter="ETH"/>
                                    <FormItem name="contractMin" addonBefore="不同合约数 ≥ " addonAfter="个"/>
                                    <FormItem name="totalAmount" addonBefore="总交易金额 ≥ " addonAfter="U"/>
                                </Col>
                            </Row>
                        </Card>
                    </Form>
                </Modal>
                <Spin spinning={tableLoading}>
                    <div style={{ width: '100%', margin: "0 auto" }}>
                    <span className="highlight-text">ZK is the Endgame.
                    </span>
                </div>
                    <Table
                        rowSelection={rowSelection}
                        dataSource={data}
                        pagination={false}
                        bordered={true}
                        style={{marginBottom: "0px", zIndex: 2}}
                        size={"small"}
                        columns={columns}
                        scroll={{
                            y: tableHeight
                          }}
                        // sticky
                        summary={pageData => {
                            let ethBalance = 0;
                            let zks1Balance = 0;
                            let zks2Balance = 0;
                            let zks2UsdcBalance = 0;
                            let zksEraETH = 0;
                            let totalFees = 0;
                            let avgTx = 0;
                            let avgDay = 0;
                            let avgWeek = 0;
                            let avgMonth = 0;
                            let avgContract = 0;
                            let avgAmount = 0;
                            let avgScore = 0;
                            pageData.forEach(({
                                eth_balance,
                                zks1_balance,
                                zks2_balance,
                                zks2_usdcBalance,
                                zks_eraETH,
                                zks2_tx_amount,
                                totalFee,
                                dayActivity,
                                weekActivity,
                                monthActivity,
                                contractActivity,
                                totalExchangeAmount,
                                zk_score
                            }) => {
                                ethBalance += Number(eth_balance);
                                zks1Balance += Number(zks1_balance);
                                zks2Balance += Number(zks2_balance);
                                zks2UsdcBalance += Number(zks2_usdcBalance);
                                zksEraETH += Number(zks_eraETH);
                                totalFees += Number(totalFee);
                                avgTx += Number(zks2_tx_amount);
                                avgDay += Number(dayActivity);
                                avgWeek += Number(weekActivity);
                                avgMonth += Number(monthActivity);
                                avgContract += Number(contractActivity);
                                avgAmount += Number(totalExchangeAmount);
                                avgScore += Number(zk_score);
                            })
                            avgTx = avgTx / pageData.length;
                            avgDay = avgDay / pageData.length;
                            avgWeek = avgWeek / pageData.length;
                            avgMonth = avgMonth / pageData.length;
                            avgContract = avgContract / pageData.length;
                            avgAmount = avgAmount / pageData.length;
                            avgScore = avgScore / pageData.length;
                            const emptyCells = Array(6).fill().map((_, index) => <Table.Summary.Cell key={index} index={index + 11}/>);

                            return (
                                <>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} colSpan={4}>总计</Table.Summary.Cell>
                                        <Table.Summary.Cell index={4}>{ethBalance.toFixed(4)}</Table.Summary.Cell>
                                        <Table.Summary.Cell index={5}/>
                                        <Table.Summary.Cell index={6}>{zks1Balance.toFixed(4)}</Table.Summary.Cell>
                                        <Table.Summary.Cell index={7}/>
                                        <Table.Summary.Cell index={8}>{zks2Balance.toFixed(4)}</Table.Summary.Cell>
                                        <Table.Summary.Cell index={9}>{zks2UsdcBalance.toFixed(2)}</Table.Summary.Cell>
                                        {/* <Table.Summary.Cell index={10}>{zksEraETH.toFixed(4)}</Table.Summary.Cell> */}
                                        <Table.Summary.Cell index={11}>-{avgTx.toFixed(0)}-</Table.Summary.Cell>
                                        {emptyCells}
                                        <Table.Summary.Cell index={17}>-{avgDay.toFixed(0)}-</Table.Summary.Cell>
                                        <Table.Summary.Cell index={18}>-{avgWeek.toFixed(0)}-</Table.Summary.Cell>
                                        <Table.Summary.Cell index={19}>-{avgMonth.toFixed(0)}-</Table.Summary.Cell>
                                        <Table.Summary.Cell index={20}>-{avgContract.toFixed(0)}-</Table.Summary.Cell>
                                        <Table.Summary.Cell index={21}>-{avgAmount.toFixed(0)}-</Table.Summary.Cell>
                                        <Table.Summary.Cell index={22}>{totalFees.toFixed(4)}</Table.Summary.Cell>
                                        <Table.Summary.Cell index={23}>-{avgScore.toFixed(0)}-</Table.Summary.Cell>
                                        <Table.Summary.Cell index={24}/>
                                    </Table.Summary.Row>
                                </>
                            )
                        }}
                        footer={() => (
                            <Card>
                                <div style={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    gap: '20px'
                                }}>
                                    <Button type="primary" onClick={handleRefresh} loading={isLoading}
                                            size={"large"}
                                            style={{width: "15%"}} icon={<SyncOutlined/>}>
                                        {isLoading ? "正在刷新" : "刷新选中地址"}
                                    </Button>
                                    <Button type="primary" danger onClick={handleCheck} loading={isLoading} size={"large"}
                                                style={{width: "15%"}}
                                                icon={<FileSearchOutlined />}>
                                            查询女巫(非本地)
                                    </Button>
                                    <Button type="primary" onClick={showModal} size={"large"} style={{width: "20%"}}
                                            icon={<PlusOutlined/>}>
                                        添加地址
                                    </Button>
                                    <Button type="primary" onClick={showBatchModal} size={"large"}
                                            style={{width: "15%"}}
                                            icon={<UploadOutlined/>}
                                            loading={batchloading}
                                    >
                                        {batchloading ? `添加中 进度:(${batchProgress}/${batchLength})` : "批量添加地址"}
                                    </Button>
                                    <Button type="primary" onClick={() => {
                                        setIsWalletModalVisible(true)
                                    }} size={"large"} style={{width: "15%"}}
                                            icon={<SettingOutlined/>}>
                                        配置
                                    </Button>
                                    <Popconfirm title={"确认删除" + selectedKeys.length + "个地址？"}
                                                onConfirm={handleDeleteSelected}>
                                        <Button type="primary" danger size={"large"}
                                                style={{width: "15%"}} icon={<DeleteOutlined/>}>
                                            删除选中地址
                                        </Button>
                                    </Popconfirm>
                                    <Button type="primary" icon={<DownloadOutlined/>} size={"large"}
                                            style={{width: "8%"}}
                                            onClick={exportToExcelFile}/>
                                </div>
                            </Card>
                        )
                        }
                    />
                </Spin>
            </Content>
        </div>
    );
}

export default Zksync;

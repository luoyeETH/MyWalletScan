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
import { EyeOutlined, EyeInvisibleOutlined, SlidersOutlined } from "@ant-design/icons"
import {
    getEthBalance,
    getTxCount,
    getZksEra,
    getZksLite,
    getZkSyncBridge,
    exportToExcel,
    calculateScore,
    getDebankValue,
    getScrollInfo,
    getScrollTx,
    getScrollERC20,
    getScrollBridge,
} from "@utils"
import {useEffect, useState} from "react";
import './index.css';
import {Layout, Card} from 'antd';
import { ethers } from 'ethers';
import axios from 'axios';

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

function Scroll() {
    const [batchProgress, setBatchProgress] = useState(0);
    const [batchLength, setBatchLength] = useState(0);
    const [batchloading, setBatchLoading] = useState(false);
    const [data, setData] = useState([]);
    const [isBatchModalVisible, setIsBatchModalVisible] = useState(false);
    const [batchForm] = Form.useForm();
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [hideColumn, setHideColumn] = useState(false);
    const [scoreData, setScoreData] = useState([]);
    const [tableHeight, setTableHeight] = useState(0);    
    const [changeApiForm] = Form.useForm();
    const [isChangeApiModalVisible, setIsChangeApiModalVisible] = useState(false);

    const toggleHideColumn = () => {
        setHideColumn(!hideColumn);
      };

    const getEyeIcon = () => {
    if (hideColumn) {
        return <EyeInvisibleOutlined />;
    }
    return <EyeOutlined />;
    };

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

    // const checkNftEligibility = async (address) => {
    //     try {
    //         const options = {
    //             method: 'GET',
    //             url: 'https://scroll.l2scan.co/api/beta/contracts?creator=' + address,
    //         }
    //         let response = await axios.request(options);
    //         console.log(response);
    //         if (response.data.items == "") {
    //             return false;
    //         } else {
    //             return true;
    //         }
    //     } catch (e) {
    //         console.log(e)
    //         return "/"
    //     }
    // }
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
            const limit = 2;
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
                if (promisesQueue.length > 0) {
                    setTimeout(processQueue, 2500);
                }
            };
            for (let key of selectedKeys) {
                const index = newData.findIndex(item => item.key === key);
                if (index !== -1) {
                    const item = newData[index];
                    promisesQueue.push(() => {
                        item.scroll_eth_balance = null;
                        return getScrollInfo(item.address).then(({balance}) => {
                            item.scroll_eth_balance = balance;
                            setData([...newData]);
                            localStorage.setItem('scroll_addresses', JSON.stringify(newData));
                        })
                    });
                    promisesQueue.push(async () => {
                        item.scroll_usdt_balance = null;
                        item.scroll_usdc_balance = null;
                        return getScrollERC20(item.address).then(({USDT, USDC}) => {
                            item.scroll_usdt_balance = USDT;
                            item.scroll_usdc_balance = USDC;
                            setData([...newData]);
                            localStorage.setItem('scroll_addresses', JSON.stringify(newData));
                        })
                    })
                    promisesQueue.push(() => {
                        item.scroll_tx_amount = null;
                        item.scroll_last_tx = null;
                        item.dayActivity = null;
                        item.weekActivity = null;
                        item.monthActivity = null;
                        item.contractActivity = null;
                        item.totalFee = null;
                        return getScrollTx(item.address).then(({scroll_tx_amount, scroll_last_tx, dayActivity, weekActivity, monthActivity, contractActivity, totalFee, totalExchangeAmount}) => {
                            item.scroll_tx_amount = scroll_tx_amount;
                            item.scroll_last_tx = scroll_last_tx;
                            item.dayActivity = dayActivity;
                            item.weekActivity = weekActivity;
                            item.monthActivity = monthActivity;
                            item.contractActivity = contractActivity;
                            item.totalFee = totalFee;
                            item.totalExchangeAmount = totalExchangeAmount;
                            setData([...newData]);
                            localStorage.setItem('scroll_addresses', JSON.stringify(newData));
                        })
                    });
                    // promisesQueue.push(() => {
                    //     item.scroll_nft = null;
                    //     return checkNftEligibility(item.address).then((result) => {
                    //         if (result === true) {
                    //             item.scroll_nft = "✅";
                    //         }
                    //         else if (result === false) {
                    //             item.scroll_nft = "❌";
                    //         }
                    // })});
                    promisesQueue.push(() => {
                        item.eth_balance = null;
                        return getEthBalance(item.address, "ethereum").then((eth_balance) => {
                            item.eth_balance = eth_balance;
                            setData([...newData]);
                            localStorage.setItem('scroll_addresses', JSON.stringify(newData));
                        })
                    });
                    promisesQueue.push(() => {
                        item.eth_tx_amount = null;
                        return getTxCount(item.address, "ethereum").then((eth_tx_amount) => {
                            item.eth_tx_amount = eth_tx_amount;
                            setData([...newData]);
                            localStorage.setItem('scroll_addresses', JSON.stringify(newData));
                        })
                    });
                    promisesQueue.push(() => {
                        item.l1Tol2Times = null;
                        item.l1Tol2Amount = null;
                        item.l2Tol1Times = null;
                        item.l2Tol1Amount = null;
                        return getScrollBridge(item.address).then(({l1Tol2Times, l1Tol2Amount, l2Tol1Times, l2Tol1Amount}) => {
                            item.l1Tol2Times = l1Tol2Times;
                            item.l1Tol2Amount = l1Tol2Amount;
                            item.l2Tol1Times = l2Tol1Times;
                            item.l2Tol1Amount = l2Tol1Amount;
                            setData([...newData]);
                            localStorage.setItem('scroll_addresses', JSON.stringify(newData));
                        })
                    });
                }
            }
            processQueue();
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
            const limit = 3;
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
                    scroll_eth_balance: null,
                    scroll_last_tx: null,
                    scroll_tx_amount: null,
                    scroll_usdt_balance: null,
                    scroll_usdc_balance: null,
                    scroll_usdtBalance: null,
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
                };
                if (index === -1) {
                    newData.push(item);
                }
                promisesQueue.push(() => getScrollInfo(address).then(({balance}) => {
                    item.scroll_eth_balance = balance;
                }));
    
                promisesQueue.push(() => getScrollERC20(address).then(({USDT, USDC}) => {
                    item.scroll_usdt_balance = USDT;
                    item.scroll_usdc_balance = USDC;
                }));

                promisesQueue.push(() => getEthBalance(address, "ethereum").then((eth_balance) => {
                    item.eth_balance = eth_balance;
                }));

                promisesQueue.push(() => getTxCount(address, "ethereum").then((eth_tx_amount) => {
                    item.eth_tx_amount = eth_tx_amount;
                }));

                promisesQueue.push(() => getScrollTx(address).then(({scroll_tx_amount, scroll_last_tx, dayActivity, weekActivity, monthActivity, contractActivity, totalFee, totalExchangeAmount}) => {
                    item.scroll_tx_amount = scroll_tx_amount;
                    item.scroll_last_tx = scroll_last_tx;
                    item.dayActivity = dayActivity;
                    item.weekActivity = weekActivity;
                    item.monthActivity = monthActivity;
                    item.contractActivity = contractActivity;
                    item.totalFee = totalFee;
                    item.totalExchangeAmount = totalExchangeAmount;
                }));

                // promisesQueue.push(() => checkNftEligibility(address).then((result) => {
                //     if (result === true) {
                //         item.scroll_nft = "✅";
                //     }
                //     else if (result === false) {
                //         item.scroll_nft = "❌";
                //     }
                // }));

                promisesQueue.push(() => getScrollBridge(address).then(({l1Tol2Times, l1Tol2Amount, l2Tol1Times, l2Tol1Amount}) => {
                    item.l1Tol2Times = l1Tol2Times;
                    item.l1Tol2Amount = l1Tol2Amount;
                    item.l2Tol1Times = l2Tol1Times;
                    item.l2Tol1Amount = l2Tol1Amount;
                }));

                // promisesQueue.push(() => checkNftEligibility(address).then((result) => {
                //     if (result === true) {
                //         item.scroll_nft = "✅";
                //     }
                //     else if (result === false) {
                //         item.scroll_nft = "❌";
                //     }
                // }));

                promisesQueue.push(promiseWithProgress);
                processQueue();

            }
            while (activePromises > 0 || promisesQueue.length > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            setData(newData);
            localStorage.setItem('scroll_addresses', JSON.stringify(newData));
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
            message.success("地址添加成功");
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
        const storedAddresses = localStorage.getItem('scroll_addresses');
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
            item.scroll_score = score;
            
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
        localStorage.setItem('scroll_addresses', JSON.stringify(data.filter(item => item.key !== key)));
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
        localStorage.setItem('scroll_addresses', JSON.stringify(data.filter(item => !selectedKeys.includes(item.key))));
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
            width: 70,
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
                            localStorage.setItem('scroll_addresses', JSON.stringify(data));
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
            width: 90
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
                const [ensData, setEnsData] = useState(null);

                useEffect(() => {
                    if (record.ens) {
                        setEnsData(record.ens);
                    } else {
                        const fetchENS = async (address) => {
                            try {
                                const response = await fetch(`https://api.ensideas.com/ens/resolve/${address}`);
                                const data = await response.json();
                                setEnsData(data);
                                if (data) {
                                    record.ens = data;
                                }
                            } catch (error) {
                                console.error("Error fetching ENS:", error);
                                setEnsData(null);
                            }
                        };

                        fetchENS(record.address);
                    }
                }, [record.address]);

                if (hideColumn) {
                    return '***';
                }

                const displayText = ensData ? ensData.displayName : text;

                return (
                    <span 
                        title={record.address}
                        onMouseEnter={(e) => e.target.innerHTML = `${displayText} (${record.address})`}
                        onMouseLeave={(e) => e.target.innerHTML = displayText}
                    >
                        {displayText}
                    </span>
                );
            },
            width: 85
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
        //     width: 80
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
                    render: (text, record) => (text === null ? <Spin/> : text),
                    width: 80
                },
                {
                    title: "Tx",
                    dataIndex: "eth_tx_amount",
                    key: "eth_tx_amount",
                    align: "center",
                    render: (text, record) => (text === null ? <Spin/> : text),
                    width: 80
                },
            ],
        },
        {
            title: "Scroll Mainnet",
            key: "zks_era_group",
            className: "zks_era",
            children: [
                {
                    title: "ETH",
                    dataIndex: "scroll_eth_balance",
                    key: "scroll_eth_balance",
                    align: "center",
                    render: (text, record) => (text === null ? <Spin/> : text),
                    width: 70
                },
                {
                    title: "USDC",
                    dataIndex: "scroll_usdc_balance",
                    key: "scroll_usdc_balance",
                    align: "center",
                    render: (text, record) => (text === null ? <Spin/> : text),
                    width: 70
                },
                {
                    title: "USDT",
                    dataIndex: "scroll_usdt_balance",
                    key: "scroll_usdt_balance",
                    align: "center",
                    render: (text, record) => (text === null ? <Spin/> : text),
                    width: 70
                },
                // {
                //     title: "USDT",
                //     dataIndex: "scroll_usdtBalance",
                //     key: "scroll_usdtBalance",
                //     align: "center",
                //     render: (text, record) => (text === null ? <Spin/> : text),
                //     width: 80
                // },
                {
                    title: 'Tx',
                    dataIndex: 'scroll_tx_amount',
                    key: 'scroll_tx_amount',
                    align: 'center',
                    sorter: (a, b) => a.scroll_tx_amount - b.scroll_tx_amount,
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
                      width: 50
                    },
                {
                    title: "最后交易",
                    dataIndex: "scroll_last_tx",
                    key: "scroll_last_tx",
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
                            href={"https://scrollscan.com/address/" + record.address}
                            target={"_blank"}
                            style={{ color: textColor }}
                          >
                            {text}
                          </a>
                        );
                      },
                    width: 85
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
                            render: (text, record) => (text === null ? "/" : text),
                            width: 75
                        },
                        {
                            title: "L2->L1",
                            dataIndex: "l2Tol1Times",
                            key: "l2Tol1Times",
                            align: "center",
                            render: (text, record) => (text === null ? "/" : text),
                            width: 55
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
                            render: (text, record) => (text === null ? "/" : text),
                            width: 55
                        },
                        {
                            title: "L2->L1",
                            dataIndex: "l2Tol1Amount",
                            key: "l2Tol1Amount",
                            align: "center",
                            render: (text, record) => (text === null ? "/" : text),
                            width: 55
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
                            width: 55
                        },
                        {
                            title: "周",
                            dataIndex: "weekActivity",
                            key: "weekActivity",
                            align: "center",
                            sorter: (a, b) => a.weekActivity - b.weekActivity,
                            render: (text, record) => (text === null ? <Spin/> : text),
                            width: 50
                        },
                        {
                            title: "月",
                            dataIndex: "monthActivity",
                            key: "monthActivity",
                            align: "center",
                            render: (text, record) => (text === null ? <Spin/> : text),
                            width: 50
                        },
                        {
                            title: "不同合约",
                            dataIndex: "contractActivity",
                            key: "contractActivity",
                            align: "center",
                            render: (text, record) => (text === null ? <Spin/> : text),
                            width: 85
                        },
                        {
                            title: "金额(U)",
                            dataIndex: "totalExchangeAmount",
                            key: "totalExchangeAmount",
                            align: "center",
                            sorter: (a, b) => a.totalExchangeAmount - b.totalExchangeAmount,
                            render: (text, record) => {
                                if (text === null) {
                                  return "/";
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
                              width: 90
                            },
                        {
                            title: "FeeΞ",
                            dataIndex: "totalFee",
                            key: "totalFee",
                            align: "center",
                            render: (text, record) => (text === null ? <Spin/> : text),
                            width: 80
                        }
                    ],
                },
            ],
        },
        // {
        //     title: "NFT资格",
        //     dataIndex: "scroll_nft",
        //     key: "scroll_nft",
        //     align: "center",
        //     render: (text, record) => (text === null ? <Spin/> : text),
        //     width: 80
        // },
        {
            title: "评分",
            dataIndex: "scroll_score",
            key: "scroll_score",
            align: "center",
            sorter: (a, b) => a.scroll_score - b.scroll_score,
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
            width: 70
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
            width: 70
        },
    ];

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
                <Spin spinning={tableLoading}>
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
                            let scrollEthBalance = 0;
                            let scrollUsdcBalance = 0;
                            let scrollUsdtBalance = 0;
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
                                scroll_eth_balance,
                                scroll_usdc_balance,
                                scroll_usdt_balance,
                                scroll_tx_amount,
                                totalFee,
                                dayActivity,
                                weekActivity,
                                monthActivity,
                                contractActivity,
                                totalExchangeAmount,
                                scroll_score
                            }) => {
                                ethBalance += Number(eth_balance);
                                scrollEthBalance += Number(scroll_eth_balance);
                                scrollUsdcBalance += Number(scroll_usdc_balance);
                                scrollUsdtBalance += Number(scroll_usdt_balance);
                                totalFees += Number(totalFee);
                                avgTx += Number(scroll_tx_amount);
                                avgDay += Number(dayActivity);
                                avgWeek += Number(weekActivity);
                                avgMonth += Number(monthActivity);
                                avgContract += Number(contractActivity);
                                avgAmount += Number(totalExchangeAmount);
                                avgScore += Number(scroll_score);
                            })
                            avgTx = avgTx / pageData.length;
                            avgDay = avgDay / pageData.length;
                            avgWeek = avgWeek / pageData.length;
                            avgMonth = avgMonth / pageData.length;
                            avgContract = avgContract / pageData.length;
                            avgAmount = avgAmount / pageData.length;
                            avgScore = avgScore / pageData.length;
                            const emptyCells = Array(5).fill().map((_, index) => <Table.Summary.Cell key={index} index={index + 11}/>);

                            return (
                                <>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} colSpan={4}>总计</Table.Summary.Cell>
                                        <Table.Summary.Cell index={4}>{ethBalance.toFixed(4)}</Table.Summary.Cell>
                                        <Table.Summary.Cell index={5}/>
                                        <Table.Summary.Cell index={8}>{scrollEthBalance.toFixed(4)}</Table.Summary.Cell>
                                        <Table.Summary.Cell index={9}>{scrollUsdcBalance.toFixed(2)}</Table.Summary.Cell>
                                        <Table.Summary.Cell index={10}>{scrollUsdtBalance.toFixed(2)}</Table.Summary.Cell>
                                        <Table.Summary.Cell index={11}>-{avgTx.toFixed(0)}-</Table.Summary.Cell>
                                        {emptyCells}
                                        <Table.Summary.Cell index={17}>-{avgDay.toFixed(0)}-</Table.Summary.Cell>
                                        <Table.Summary.Cell index={18}>-{avgWeek.toFixed(0)}-</Table.Summary.Cell>
                                        <Table.Summary.Cell index={19}>-{avgMonth.toFixed(0)}-</Table.Summary.Cell>
                                        <Table.Summary.Cell index={20}>-{avgContract.toFixed(0)}-</Table.Summary.Cell>
                                        <Table.Summary.Cell index={21}>-{avgAmount.toFixed(0)}-</Table.Summary.Cell>
                                        <Table.Summary.Cell index={23}>{totalFees.toFixed(4)}</Table.Summary.Cell>
                                        <Table.Summary.Cell index={24}>-{avgScore.toFixed(0)}-</Table.Summary.Cell>
                                        <Table.Summary.Cell index={25}/>
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
                                            style={{width: "20%"}} icon={<SyncOutlined/>}>
                                        {isLoading ? "正在刷新" : "刷新选中地址"}
                                    </Button>
                                    <Button type="primary" onClick={showBatchModal} size={"large"}
                                            style={{width: "20%"}}
                                            icon={<UploadOutlined/>}
                                            loading={batchloading}
                                    >
                                        {batchloading ? `添加中 进度:(${batchProgress}/${batchLength})` : "添加地址"}
                                    </Button>
                                    <Popconfirm title={"确认删除" + selectedKeys.length + "个地址？"}
                                                onConfirm={handleDeleteSelected}>
                                        <Button type="primary" danger size={"large"}
                                                style={{width: "20%"}} icon={<DeleteOutlined/>}>
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

export default Scroll;

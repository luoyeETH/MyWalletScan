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
    Row, Col, InputNumber, Badge, message, Switch, Pagination, Progress 
} from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons"
import {
    getEthBalance,
    getTxCount,
    getZksEra,
    getZksLite,
    getZkSyncBridge,
    exportToExcel,
    getZksTasks,
    getEthPrice
} from "@utils"
import {useEffect, useState} from "react";
import './index.css';
import {Layout, Card} from 'antd';

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

function ZkRank() {
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
    const [taskContracts, setTaskContracts] = useState(new Map());
    const [taskData, setTaskData] = useState([]);
    const [initialized, setInitialized] = useState(false);
    const [tableHeight, setTableHeight] = useState(0);
    const [hideColumn, setHideColumn] = useState(false);
    const [ethPrice, setEthPrice] = useState(3340);

    const txRanges = [
        [[0, 4], 0.284803826],
        [[5, 9], 0.069835762],
        [[10, 19], 0.096190808],
        [[20, 49], 0.202359715],
        [[50, 99], 0.186812618],
        [[100, 500], 0.156302289],
        [[500, 1000], 0.002913938],
      ];
    const totalExchangeAmountRanges = [
        [[0, 100], 0.215587839],
        [[100, 500], 0.15775077],
        [[500, 1000], 0.086988202],
        [[1000, 10000], 0.250124339],
        [[10000, 50000], 0.159977031],
        [[50000, 250000], 0.095633712],
        [[250000, 1000000], 0.02889356],
        [[1000000, 1000000000], 0.005044547],
      ];    
    const balanceRanges =  [
        [[0, 5], 0.675594397],
        [[5, 10], 0.046552006],
        [[10, 25], 0.072799158],
        [[25, 50], 0.099725011],
        [[50, 100], 0.061465943],
        [[100, 500], 0.039188811],
        [[500, 1000], 0.002593196],
        [[1000, 10000], 0.001962974],
        [[10000, 100000], 0.000102017],
        [[100000, 10000000], 0.0000160],
    ]; 
    const DaysRanges = [
        [[0, 1], 0.225835101],
        [[1, 2], 0.078415328],
        [[2, 3], 0.051108176],
        [[3, 4], 0.035680725],
        [[4, 5], 0.033092752],
        [[5, 6], 0.029164845],
        [[6, 7], 0.026007371],
        [[7, 8], 0.026886678],
        [[8, 9], 0.025720091],
        [[9, 10], 0.025532705],
        [[10, 11], 0.024335758],
        [[11, 12], 0.024411006],
        [[12, 13], 0.024575865],
        [[13, 14], 0.022134145],
        [[14, 15], 0.021908401],
        [[15, 16], 0.019724416],
        [[16, 17], 0.017854482],
        [[17, 18], 0.016897805],
        [[18, 19], 0.015216561],
        [[19, 20], 0.014273106],
        [[20, 21], 0.013863242],
        [[21, 22], 0.013114354],
        [[22, 23], 0.012150658],
        [[23, 24], 0.011153175],
        [[24, 25], 0.010901152],
        [[25, 26], 0.010362174],
        [[26, 27], 0.008979147],
        [[27, 28], 0.008407524],
        [[28, 29], 0.007820395],
        [[29, 30], 0.007599222],
        [[30, 31], 0.007108233],
        [[31, 32], 0.00681018],
        [[32, 33], 0.006263204],
        [[33, 34], 0.006000081],
        [[34, 35], 0.005815634],
        [[35, 36], 0.00580682],
        [[36, 37], 0.005554307],
        [[37, 38], 0.004894541],
        [[38, 39], 0.004479943],
        [[39, 40], 0.004203436],
        [[40, 41], 0.003945047],
        [[41, 42], 0.003760926],
        [[42, 43], 0.003475441],
        [[43, 44], 0.003262919],
        [[44, 45], 0.003088755],
        [[45, 46], 0.002841955],
        [[46, 47], 0.00262323],
        [[47, 48], 0.002462614],
        [[48, 49], 0.002408422],
        [[49, 50], 0.002279636],
        [[50, 51], 0.002163418],
        [[51, 52], 0.002038386],
        [[52, 53], 0.001984357],
        [[53, 54], 0.001894419],
        [[54, 55], 0.001757961],
        [[55, 56], 0.001729233],
        [[56, 57], 0.001597182],
        [[57, 58], 0.001507406],
        [[58, 59], 0.001427425],
        [[59, 60], 0.001299128],
        [[60, 61], 0.001277582],
        [[61, 62], 0.00116822],
        [[62, 63], 0.001134921],
        [[63, 64], 0.001091666],
        [[64, 65], 0.001016581],
        [[65, 66], 0.000959778],
        [[66, 67], 0.000946393],
        [[67, 68], 0.000902648],
        [[68, 69], 0.00089416],
        [[69, 70], 0.00085825],
        [[70, 71], 0.000830991],
        [[71, 72], 0.000807976],
        [[72, 73], 0.000775657],
        [[73, 74], 0.00077125],
        [[74, 75], 0.000726526],
        [[75, 76], 0.000663846],
        [[76, 77], 0.000635771],
        [[77, 78], 0.000603942],
        [[78, 79], 0.00058664],
        [[79, 80], 0.000561829],
        [[80, 81], 0.000525103],
        [[81, 82], 0.000527715],
        [[82, 200], 0.0142],
    ];
    const ContractRanges = [
        [[0, 2], 0.242288111],
        [[2, 5], 0.150707502],
        [[5, 10], 0.125525736],
        [[10, 50], 0.442264704],
        [[50, 100], 0.035079884],
        [[100, 500], 0.004134064],
    ];
    const toggleHideColumn = () => {
        setHideColumn(!hideColumn);
      };
    
    const getEyeIcon = () => {
    if (hideColumn) {
        return <EyeInvisibleOutlined />;
    }
    return <EyeOutlined />;
    };

    const initData = async () => {
        try {
            const newData = [...data];
            const promisesQueue = [];
            for (let item of newData) {
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = calculateRank(txRanges, item.zks2_tx_amount);
                        item.txRank = result;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = calculateRank(totalExchangeAmountRanges, item.totalExchangeAmount);
                        item.totalExchangeAmountRank = result;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const balance = parseFloat(item.zks2_balance) * ethPrice;
                        const result = calculateRank(balanceRanges, balance);
                        item.balanceRank = result;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = calculateRank(DaysRanges, item.dayActivity);
                        item.dayActivityRank = result;
                        resolve();
                    });
                });
                promisesQueue.push(() => {
                    return new Promise((resolve) => {
                        const result = calculateRank(ContractRanges, item.contractActivity);
                        item.contractRank = result;
                        resolve();
                    });
                });
                
            }
            await Promise.all(promisesQueue.map((promise) => promise()));
            setTaskData([...newData]);
            localStorage.setItem('addresses', JSON.stringify(newData));
        } catch (e) {
            console.error(e);
        }
        finally {
            setIsLoading(false);
        }
    }
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
          const newData = [...data];
          const promisesQueue = [];
          
            for (let key of selectedKeys) {
                const index = newData.findIndex(item => item.key === key);
                if (index !== -1) {
                    const item = newData[index];
                    const taskContractsMap = new Map();
                    const contractAddresses = await getZksTasks(item.address);
                    taskContractsMap.set(item.address, contractAddresses);
                    setTaskContracts(taskContractsMap);
                    await new Promise((resolve) => {
                        setTimeout(() => {
                            resolve();
                        }, 200);
                    });
                    
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = calculateRank(txRanges, item.zks2_tx_amount);
                            item.txRank = result;
                            resolve();
                        });
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = calculateRank(totalExchangeAmountRanges, item.totalExchangeAmount);
                            item.totalExchangeAmountRank = result;
                            resolve();
                        });
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const balance = parseFloat(item.zks2_balance) * ethPrice;
                            const result = calculateRank(balanceRanges, balance);
                            item.balanceRank = result;
                            resolve();
                        });
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = calculateRank(DaysRanges, item.dayActivity);
                            item.dayActivityRank = result;
                            resolve();
                        });
                    });
                    promisesQueue.push(() => {
                        return new Promise((resolve) => {
                            const result = calculateRank(ContractRanges, item.contractActivity);
                            item.contractRank = result;
                            resolve();
                        });
                    });
                }
            }

          await Promise.all(promisesQueue.map(promise => promise()));
          setTaskData([...newData]);
          localStorage.setItem('addresses', JSON.stringify(newData));
          message.success("刷新成功");
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
      
    const calculateRank = (ranges, value) => {
        let cumulativePercentage = 0;
      
        for (const range of ranges) {
          const [start, end] = range[0];
          const percentage = range[1];
      
          if (value >= start && value <= end) {
            const valuePercentage = (value - start) / (end - start) * percentage;
            cumulativePercentage += valuePercentage;
            break;
          } else {
            cumulativePercentage += percentage;
          }
        }
        const rankPercentage = ((1 - cumulativePercentage) * 100).toFixed(2);
        return rankPercentage;
    }
    
    useEffect(() => {
    const handleResize = () => {
        setTableHeight(window.innerHeight - 180); // 减去其他组件的高度，如页眉、页脚等
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
        window.removeEventListener('resize', handleResize);
    };
    }, []);

    useEffect(() => {
        setTableLoading(true);
        const storedAddresses = localStorage.getItem('addresses');
        setTimeout(() => {
            setTableLoading(false);
        }, 500);
        if (storedAddresses) {
            setData(JSON.parse(storedAddresses));
            setTaskData(JSON.parse(storedAddresses));
        }
    }, []);
    
    useEffect(() => {
        const fetchPrice = async () => {
            const price = await getEthPrice();
            setEthPrice(price);
        };
        fetchPrice();
    }, []);
    useEffect(() => {
        if (!initialized && data.length > 0) {
            initData()
            setInitialized(true); // 标记为已初始化
        }
      }, [data]);
   
    const rowSelection = {
        selectedRowKeys: selectedKeys,
        onChange: (selectedRowKeys) => {
            setSelectedKeys(selectedRowKeys);
        },
    };

    const [editingKey, setEditingKey] = useState(null);
    const columns = [
        {
            title: "#",
            key: "index",
            align: "center",
            render: (text, record, index) => index + 1,
            width: 34.5,
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
            width: 70
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
        //     title: "最后交易",
        //     dataIndex: "zks2_last_tx",
        //     key: "zks2_last_tx",
        //     align: "center",
        //     render: (text, record) => {
        //         let textColor = "inherit";
              
        //         if (text === null) {
        //           return <Spin />;
        //         } else if (text.includes("周")) {
        //           textColor = "red";
        //         } else {
        //           textColor = "#1677ff";
        //         }
              
        //         return (
        //           <a
        //             href={"https://explorer.zksync.io/address/" + record.address}
        //             target={"_blank"}
        //             style={{ color: textColor }}
        //           >
        //             {text}
        //           </a>
        //         );
        //       },
        //     width: 60
        // },
        {
            title: "zkSyncEra 排名 [数据截止 2024-03-23 总地址数 6126417]",
            // 数据来源 https://app.zettablock.com/community/dashboards/da-9e4e6128-b1be-4947-9605-efe93216a359
            key: "zks_era_group",
            className: "zks_era",
            children: [
                {
                    title: "Tx排名",
                    dataIndex: "txRank",
                    key: "txRank",
                    align: "center",
                    sorter: (a, b) => a.txRank - b.txRank,
                    render: (text, record) => (
                        <span>
                           {text === null ? <Spin /> : <Progress steps={20} percent={text} size="small" status="active" strokeColor={text > 50 ? '#f5222d' : '#00a854'} />}
                        </span>
                        
                    ),
                    width: 60
                },
                {
                    title: "交易额排名",
                    dataIndex: "totalExchangeAmountRank",
                    key: "totalExchangeAmountRank",
                    align: "center",
                    sorter: (a, b) => a.totalExchangeAmountRank - b.totalExchangeAmountRank,
                    render: (text, record) => (
                        <span>
                           {text === null ? <Spin /> : <Progress steps={20} percent={text} size="small" status="active" strokeColor={text > 50 ? '#f5222d' : '#00a854'} />}
                        </span>
                        
                    ),
                    width: 60
                },
                {
                    title: "余额排名",
                    dataIndex: "balanceRank",
                    key: "balanceRank",
                    align: "center",
                    sorter: (a, b) => a.balanceRank - b.balanceRank,
                    render: (text, record) => (
                        <span>
                        {text === null ? <Spin /> : <Progress steps={20} percent={text} size="small" status="active" strokeColor={text > 50 ? '#f5222d' : '#00a854'} />}
                        </span>
                        
                    ),
                    width: 60
                },
                {
                    title: "日活跃排名",
                    dataIndex: "dayActivityRank",
                    key: "dayActivityRank",
                    align: "center",
                    sorter: (a, b) => a.dayActivityRank - b.dayActivityRank,
                    render: (text, record) => (
                        <span>
                           {text === null ? <Spin /> : <Progress steps={20} percent={text} size="small" status="active" strokeColor={text > 50 ? '#f5222d' : '#00a854'} />}
                        </span>
                        
                    ),
                    width: 60
                },
                {
                    title: "交互合约数排名",
                    dataIndex: "contractRank",
                    key: "contractRank",
                    align: "center",
                    sorter: (a, b) => a.contractRank - b.contractRank,
                    render: (text, record) => (
                        <span>
                           {text === null ? <Spin /> : <Progress steps={20} percent={text} size="small" status="active" strokeColor={text > 50 ? '#f5222d' : '#00a854'} />}
                        </span>
                        
                    ),
                    width: 60
                },
                {
                    title: '综合排名',
                    dataIndex: 'rank',
                    key: 'rank',
                    align: 'center',
                    sorter: (a, b) => a.rank - b.rank,
                    render: (text, record) => {
                      const txRank = parseFloat(record.txRank);
                      const totalExchangeAmountRank = parseFloat(record.totalExchangeAmountRank);
                      const balanceRank = parseFloat(record.balanceRank);
                      const dayActivityRank = parseFloat(record.dayActivityRank);
                      const contractRank = parseFloat(record.contractRank);
                      
                      const rank = parseFloat(txRank + totalExchangeAmountRank + balanceRank + dayActivityRank + contractRank) / 5;
                      record.rank = rank.toFixed(2);
                
                      return {
                        children: <span><Progress steps={20} percent={rank.toFixed(2)} size="small" status="active" strokeColor={text > 50 ? '#f5222d' : '#00a854'} /></span>,
                      };
                    },
                    width: 60,
                  },
            ],
        }
    ];
    // const isRowSatisfyCondition = (record) => {
    //     const conditionKeyMapping = {
    //         "ETHTx": "eth_tx_amount",
    //         "zkSyncLiteMinTx": "zks1_tx_amount",
    //         "zkSyncEraMinTx": "zks2_tx_amount",
    //         "L1ToL2Tx": "l1Tol2Times",
    //         "L2ToL1Tx": "l2Tol1Times",
    //         "L1ToL2ETH": "l1Tol2Amount",
    //         "L2ToL1ETH": "l2Tol1Amount",
    //         "contractMin": "contractActivity",
    //         "dayMin": "dayActivity",
    //         "weekMin": "weekActivity",
    //         "monthMin": "monthActivity",
    //         "gasFee": "totalFee",
    //         "totalAmount": "totalExchangeAmount",
    //     };
    //     return Object.keys(conditionKeyMapping).every((conditionKey) => {
    //         if (!(conditionKey in zkSyncConfigStore) || zkSyncConfigStore[conditionKey] === null || zkSyncConfigStore[conditionKey] === undefined) {
    //             return true;
    //         }
    //         const recordKey = conditionKeyMapping[conditionKey];
    //         return Number(record[recordKey]) >= Number(zkSyncConfigStore[conditionKey])
    //     });
    // };

    return (
        <div>
            <Content>
                <Spin spinning={tableLoading}>
                    <Table
                        rowSelection={rowSelection}
                        dataSource={taskData}
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
                            let totalFees = 0;
                            pageData.forEach(({
                                                  eth_balance,
                                                  zks1_balance,
                                                  zks2_balance,
                                                  zks2_usdcBalance,
                                                  totalFee
                                              }) => {
                                ethBalance += Number(eth_balance);
                                zks1Balance += Number(zks1_balance);
                                zks2Balance += Number(zks2_balance);
                                zks2UsdcBalance += Number(zks2_usdcBalance);
                                totalFees += Number(totalFee);
                            })

                            const emptyCells = Array(10).fill().map((_, index) => <Table.Summary.Cell
                                index={index + 6}/>);

                        }}
                        footer={() => (
                            <Card>
                                <div style={{
                                    width: '100%',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    gap: '10px'
                                }}>
                                    <Button type="primary" onClick={handleRefresh} loading={isLoading}
                                            size={"large"}
                                            style={{width: "20%"}} icon={<SyncOutlined/>}>
                                        {isLoading ? "正在刷新" : "刷新选中地址"}
                                    </Button>
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

export default ZkRank;

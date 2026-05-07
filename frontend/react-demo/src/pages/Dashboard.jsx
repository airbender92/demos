import { useEffect, useState } from 'react'
import { Card, Typography, Row, Col, Statistic, Table, Tag } from 'antd'
import Mock from 'mockjs'

const { Title } = Typography

const Dashboard = () => {
  const [data, setData] = useState([])
  const [statistics, setStatistics] = useState({
    users: 0,
    orders: 0,
    revenue: 0,
    conversion: 0
  })

  useEffect(() => {
    // 模拟数据
    const mockData = Mock.mock({
      'list|10': [{
        'id|+1': 1,
        'name': '@cname',
        'age|18-60': 1,
        'gender|1': ['男', '女'],
        'status|1': ['active', 'inactive', 'pending'],
        'score|0-100': 1
      }]
    })

    setData(mockData.list)
    
    // 模拟统计数据
    setStatistics({
      users: Mock.Random.integer(1000, 5000),
      orders: Mock.Random.integer(500, 2000),
      revenue: Mock.Random.float(10000, 50000, 2, 2),
      conversion: Mock.Random.float(1, 10, 2, 2)
    })
  }, [])

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = ''
        switch (status) {
          case 'active':
            color = 'green'
            break
          case 'inactive':
            color = 'red'
            break
          case 'pending':
            color = 'blue'
            break
          default:
            color = 'default'
        }
        return <Tag color={color}>{status}</Tag>
      },
    },
    {
      title: '分数',
      dataIndex: 'score',
      key: 'score',
    },
  ]

  return (
    <div>
      <Title level={2}>仪表盘</Title>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="用户数" value={statistics.users} prefix="👥" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="订单数" value={statistics.orders} prefix="📋" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="营收" value={statistics.revenue} prefix="¥" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="转化率" value={statistics.conversion} suffix="%" />
          </Card>
        </Col>
      </Row>
      
      <Card title="用户列表">
        <Table columns={columns} dataSource={data} rowKey="id" />
      </Card>
    </div>
  )
}

export default Dashboard
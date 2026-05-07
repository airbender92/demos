import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, Typography, Button, Space } from 'antd'
import { increment, decrement } from '../features/counter/counterSlice'
import logo from '../assets/react.svg'

const { Title, Text } = Typography

const Home = () => {
  const dispatch = useDispatch()
  const { value } = useSelector((state) => state.counter)

  return (
    <div style={{ textAlign: 'center' }}>
      <div>
        <img src={logo} className="logo react" alt="React logo" />
      </div>
      <Card style={{ maxWidth: 600, margin: '0 auto' }}>
        <Title level={2}>React Demo</Title>
        <Text>这是一个基于React、React Router、Redux、Ant Design和@antv/x6的演示项目</Text>
        
        <div style={{ margin: '24px 0' }}>
          <Title level={4}>计数器示例</Title>
          <Text>当前计数: {value}</Text>
          <Space style={{ marginTop: 16 }}>
            <Button type="primary" onClick={() => dispatch(decrement())}>-</Button>
            <Button type="primary" onClick={() => dispatch(increment())}>+</Button>
          </Space>
        </div>
        
        <div style={{ marginTop: 32 }}>
          <Title level={4}>项目功能</Title>
          <ul style={{ textAlign: 'left' }}>
            <li>React 18+</li>
            <li>React Router 6</li>
            <li>Redux Toolkit</li>
            <li>Ant Design 5</li>
            <li>@antv/x6 流程图</li>
            <li>Mock数据</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}

export default Home
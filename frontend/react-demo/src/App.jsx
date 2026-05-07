import { Routes, Route, Link } from 'react-router-dom'
import { Layout, Menu, Button } from 'antd'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import FlowChart from './pages/FlowChart'
import './App.css'

const { Header, Content, Sider } = Layout

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="logo" />
        <h1 style={{ color: 'white', margin: 0 }}>React Demo</h1>
        <Button type="primary" ghost>
          登录
        </Button>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            style={{ height: '100%', borderRight: 0 }}
            items={[
              {
                key: '1',
                label: <Link to="/">首页</Link>,
              },
              {
                key: '2',
                label: <Link to="/dashboard">仪表盘</Link>,
              },
              {
                key: '3',
                label: <Link to="/flowchart">流程图</Link>,
              },
            ]}
          />
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content style={{ padding: 24, margin: 0, minHeight: 280, background: '#fff' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/flowchart" element={<FlowChart />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default App
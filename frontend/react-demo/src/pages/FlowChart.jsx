import { useEffect, useRef } from 'react'
import { Card, Typography, Button, Space } from 'antd'
import { Graph, Addon } from '@antv/x6'
import { Snapline } from '@antv/x6-plugin-snapline'
import { Dnd } from '@antv/x6-plugin-dnd'

const { Title } = Typography
const { Stencil } = Addon

const FlowChart = () => {
  const containerRef = useRef(null)
  const graphRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // 创建画布
    const graph = new Graph({
      container: containerRef.current,
      width: 800,
      height: 600,
      background: {
        color: '#f5f5f5',
      },
      grid: {
        size: 10,
        visible: true,
      },
      snapline: {
        enabled: true,
      },
      connecting: {
        snap: true,
        allowBlank: false,
        allowLoop: true,
        allowMulti: true,
        allowSelfLoop: true,
        highlight: true,
        router: { 
          name: 'manhattan' 
        },
        connector: { 
          name: 'rounded' 
        },
        anchor: {
          name: 'center',
        },
      },
    })

    // 注册插件
    graph.use(new Snapline())
    
    // 创建节点
    const rect1 = graph.addNode({
      x: 100,
      y: 100,
      width: 120,
      height: 60,
      label: '开始',
      shape: 'rect',
      style: {
        fill: '#f9f0ff',
        stroke: '#722ed1',
      },
    })

    const rect2 = graph.addNode({
      x: 300,
      y: 100,
      width: 120,
      height: 60,
      label: '处理',
      shape: 'rect',
      style: {
        fill: '#e6f7ff',
        stroke: '#1890ff',
      },
    })

    const rect3 = graph.addNode({
      x: 500,
      y: 100,
      width: 120,
      height: 60,
      label: '结束',
      shape: 'rect',
      style: {
        fill: '#f6ffed',
        stroke: '#52c41a',
      },
    })

    // 创建边
    graph.addEdge({
      source: rect1,
      target: rect2,
    })

    graph.addEdge({
      source: rect2,
      target: rect3,
    })

    graphRef.current = graph

    return () => {
      graph.dispose()
    }
  }, [])

  const handleSave = () => {
    if (graphRef.current) {
      const data = graphRef.current.toJSON()
      console.log('保存流程图数据:', data)
      alert('流程图已保存到控制台')
    }
  }

  const handleClear = () => {
    if (graphRef.current) {
      graphRef.current.clearCells()
    }
  }

  return (
    <div>
      <Title level={2}>流程图编辑器</Title>
      
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleSave}>保存</Button>
        <Button danger onClick={handleClear}>清空</Button>
      </Space>
      
      <Card>
        <div ref={containerRef} style={{ border: '1px solid #e8e8e8' }} />
      </Card>
      
      <div style={{ marginTop: 24 }}>
        <Title level={4}>使用说明</Title>
        <ul>
          <li>拖拽节点可以移动位置</li>
          <li>点击节点边缘的锚点可以创建连接</li>
          <li>双击节点可以编辑标签</li>
          <li>点击保存按钮可以将流程图数据保存到控制台</li>
        </ul>
      </div>
    </div>
  )
}

export default FlowChart
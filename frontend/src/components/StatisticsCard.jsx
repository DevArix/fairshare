import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { money } from '../utils/format.js'
import Avatar from './Avatar.jsx'

const colors = ['#6139A5', '#8058C5', '#9E79D9', '#B99BE5', '#D1B9EE', '#E6D9F7']

export default function StatisticsCard({ data, currency }) {
  const chartData = data.filter(item => item.total > 0).map(item => ({ name: item.user.name, value: item.total }))
  return (
    <div className="statistics-card">
      <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={chartData.length ? chartData : [{ name: 'بدون هزینه', value: 1 }]} dataKey="value" innerRadius="58%" outerRadius="88%" paddingAngle={chartData.length > 1 ? 3 : 0} stroke="none">{(chartData.length ? chartData : [{ value: 1 }]).map((item, index) => <Cell key={index} fill={chartData.length ? colors[index % colors.length] : '#e8ece7'} />)}</Pie><Tooltip formatter={value => money(value, currency)} /></PieChart></ResponsiveContainer><div className="chart-center"><strong>{data.length}</strong><span>عضو</span></div></div>
      <div className="chart-legend">{data.map((item, index) => <div key={item.user.id}><span className="legend-color" style={{ background: colors[index % colors.length] }} /><Avatar user={item.user} size="small" /><div><strong>{item.user.name}</strong><small>{item.percentage.toFixed(1)}٪ از هزینه گروه</small></div><b>{money(item.total, currency)}</b></div>)}</div>
    </div>
  )
}

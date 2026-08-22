'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { money } from '../lib/api';

const COLORS = ['#5068e6', '#28a476', '#d28d2b', '#d96a77', '#8e71eb', '#23b5d3', '#f59e0b'];

export interface AreaChartDataPoint {
  label: string;
  [key: string]: string | number;
}

export function AppAreaChart({
  data,
  dataKey = 'revenue',
  strokeColor = '#5068e6',
  fillColor = '#5068e6',
  height = 265,
  isCurrency = true,
}: {
  data: AreaChartDataPoint[];
  dataKey?: string;
  strokeColor?: string;
  fillColor?: string;
  height?: number;
  isCurrency?: boolean;
}) {
  const gradientId = `gradient-${dataKey}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity={0.35} />
            <stop offset="100%" stopColor={fillColor} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#edf0f7" strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#8b92a5' }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#8b92a5' }}
          tickFormatter={(v) => (isCurrency ? `${Number(v) / 1000}k` : String(v))}
        />
        <Tooltip
          formatter={(v: any) => [isCurrency ? money(Number(v)) : v, dataKey.replace(/([A-Z])/g, ' $1')]}
          contentStyle={{
            background: '#fff',
            borderRadius: 8,
            border: '1px solid #e2e6f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={strokeColor}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function AppBarChart({
  data,
  dataKeys = [{ key: 'sales', color: '#5068e6', label: 'Sales' }],
  xAxisKey = 'name',
  height = 265,
  isCurrency = true,
}: {
  data: any[];
  dataKeys?: { key: string; color: string; label: string }[];
  xAxisKey?: string;
  height?: number;
  isCurrency?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#edf0f7" strokeDasharray="3 3" />
        <XAxis
          dataKey={xAxisKey}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#8b92a5' }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#8b92a5' }}
          tickFormatter={(v) => (isCurrency ? `${Number(v) / 1000}k` : String(v))}
        />
        <Tooltip
          formatter={(v: any, name: any) => [
            isCurrency ? money(Number(v)) : v,
            String(name),
          ]}
          contentStyle={{
            background: '#fff',
            borderRadius: 8,
            border: '1px solid #e2e6f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        {dataKeys.map((dk) => (
          <Bar key={dk.key} dataKey={dk.key} fill={dk.color} name={dk.label} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AppPieChart({
  data,
  dataKey = 'value',
  nameKey = 'name',
  height = 265,
  isCurrency = true,
}: {
  data: any[];
  dataKey?: string;
  nameKey?: string;
  height?: number;
  isCurrency?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Tooltip
          formatter={(v: any) => [isCurrency ? money(Number(v)) : v, '']}
          contentStyle={{
            background: '#fff',
            borderRadius: 8,
            border: '1px solid #e2e6f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={45}
          paddingAngle={3}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

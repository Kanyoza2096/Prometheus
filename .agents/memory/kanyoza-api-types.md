---
name: Kanyoza API type contracts
description: Actual shapes of key api.ts types that differ from naive assumptions
---

## ConnectorInfo (`GET /system/connectors`)
```ts
{ supported_connectors: string[]; count: number }
```
NOT an array of objects. Map to display objects: `supported_connectors.map(name => ({ name, status: 'connected' }))`.

## MetricsPayload (`GET /metrics`)
```ts
{ cpu: MetricPoint[]; memory: MetricPoint[]; rps: MetricPoint[]; error_rate: MetricPoint[] }
// MetricPoint = { t: number (unix ms); v: number }
```
Get latest value with `.slice(-1)[0]?.v`. Does NOT have a `.metrics` array property.

## IntegrationEntry (`GET /integrations`)
```ts
{ id: string; name: string; category: string; connected: boolean; status: 'active'|'disconnected'; description: string }
```
Use `.connected` (not `.enabled`) and `.category` (not `.type`).

**Why:** These mismatches cause TypeScript errors and runtime rendering bugs if you assume a different shape.

import { describe, expect, it } from 'vitest'
import {
  compatibleSets, conflicts, drawDaily, netBalances, pairwiseDebts, simplifyDebts, splitAmount,
} from '../docs/reference/algorithms'

describe('splitAmount', () => {
  it('equal split hands remainder cents deterministically', () => {
    expect(splitAmount(1000, { kind: 'equal', participants: ['c', 'a', 'b'] })).toEqual({ a: 334, b: 333, c: 333 })
  })
  it('shares and percent always sum to total', () => {
    const s = splitAmount(999, { kind: 'shares', weights: { a: 1, b: 2, c: 1 } })
    expect(Object.values(s).reduce((x, y) => x + y)).toBe(999)
    expect(splitAmount(1000, { kind: 'percent', percents: { a: 70, b: 30 } })).toEqual({ a: 700, b: 300 })
  })
  it('rejects inconsistent exact splits', () => {
    expect(() => splitAmount(100, { kind: 'exact', amounts: { a: 50, b: 40 } })).toThrow()
  })
})

describe('debts', () => {
  it('the brief: I owe A 5, A owes B 5 → I owe B 5', () => {
    const expenses = [
      { paidBy: 'A', total: 500, shares: { me: 500 } },
      { paidBy: 'B', total: 500, shares: { A: 500 } },
    ]
    expect(pairwiseDebts(expenses)).toEqual([{ from: 'A', to: 'B', amount: 500 }, { from: 'me', to: 'A', amount: 500 }])
    expect(simplifyDebts(netBalances(expenses))).toEqual([{ from: 'me', to: 'B', amount: 500 }])
  })
  it('settlements reduce balances; never more than n-1 transfers', () => {
    const expenses = [
      { paidBy: 'a', total: 9000, shares: splitAmount(9000, { kind: 'equal', participants: ['a', 'b', 'c'] }) },
      { paidBy: 'b', total: 3000, shares: splitAmount(3000, { kind: 'equal', participants: ['a', 'b', 'c', 'd'] }) },
    ]
    const net = netBalances(expenses, [{ from: 'c', to: 'a', amount: 1000 }])
    expect(Object.values(net).reduce((x, y) => x + y)).toBe(0)
    const plan = simplifyDebts(net)
    expect(plan.length).toBeLessThanOrEqual(3)
    const after = netBalances(expenses, [{ from: 'c', to: 'a', amount: 1000 }, ...plan])
    expect(Object.values(after).every(v => v === 0)).toBe(true)
  })
})

describe('drawDaily', () => {
  const items = ['tidy desk', 'sweep room', 'cut hair', 'water plants', 'clean fridge'].map((id, i) => ({
    id, priority: i % 3, lastDoneDaysAgo: i === 2 ? 3 : null, cooldownDays: i === 2 ? 28 : 0,
  }))
  it('is stable for the same day and respects cooldown', () => {
    const a = drawDaily(items, 2, 'user1', '2026-11-02')
    expect(a).toEqual(drawDaily(items, 2, 'user1', '2026-11-02'))
    expect(a).toHaveLength(2)
    expect(new Set(a).size).toBe(2)
    expect(a).not.toContain('cut hair')
  })
  it('varies across days', () => {
    const days = new Set(Array.from({ length: 10 }, (_, d) => drawDaily(items, 1, 'u', `2026-11-${10 + d}`)[0]))
    expect(days.size).toBeGreaterThan(1)
  })
})

describe('time blocks', () => {
  const g = {
    Metafisica: [{ id: 'm', weekday: 3, start: '13:30', end: '16:30' }],
    PortugalXX: [{ id: 'p1', weekday: 3, start: '13:30', end: '15:00' }, { id: 'p2', weekday: 4, start: '11:30', end: '13:00' }],
    LogLin: [{ id: 'l1', weekday: 3, start: '08:30', end: '10:00' }],
    Barroca: [{ id: 'b1', weekday: 4, start: '11:30', end: '13:00' }],
  }
  it('detects overlaps but not touching blocks', () => {
    expect(conflicts([...g.Metafisica, ...g.PortugalXX])).toEqual([['m', 'p1']])
    expect(conflicts([{ id: 'a', weekday: 1, start: '10:00', end: '11:00' }, { id: 'b', weekday: 1, start: '11:00', end: '12:00' }])).toEqual([])
  })
  it('finds compatible course sets', () => {
    const sets = compatibleSets(g, 2)
    expect(sets).toContainEqual(['LogLin', 'Metafisica'])
    expect(sets).not.toContainEqual(['Metafisica', 'PortugalXX'])
    expect(sets).not.toContainEqual(['Barroca', 'PortugalXX'])
  })
})

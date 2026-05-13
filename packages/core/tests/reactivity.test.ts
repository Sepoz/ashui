import { describe, it, expect, vi } from 'vitest'

import { createSignal, createEffect } from '../src'

describe('createSignal', () => {
	it('returns the initial value', () => {
		const [count] = createSignal(0)
		expect(count()).toBe(0)
	})

	it('updates the value via the setter', () => {
		const [count, setCount] = createSignal(0)
		setCount(5)
		expect(count()).toBe(5)
	})
})

describe('createEffect', () => {
	it('runs the effect immediately on creation', () => {
		const fn = vi.fn()
		createEffect(fn)
		expect(fn).toHaveBeenCalledTimes(1)
	})

	it('re-runs when a tracked signal changes', () => {
		const [count, setCount] = createSignal(0)
		const fn = vi.fn(() => count())
		createEffect(fn)

		setCount(1)
		setCount(2)
		expect(fn).toHaveBeenCalledTimes(3)
	})

	it('does not re-run when the new value equals the previous one', () => {
		const [count, setCount] = createSignal(1)
		const fn = vi.fn(() => count())
		createEffect(fn)

		setCount(1)
		expect(fn).toHaveBeenCalledTimes(1)
	})

	it('only tracks signals read during the effect', () => {
		const [a, setA] = createSignal('a')
		const [, setB] = createSignal('b')
		const fn = vi.fn(() => a())
		createEffect(fn)

		setB('b2')
		expect(fn).toHaveBeenCalledTimes(1)
		setA('a2')
		expect(fn).toHaveBeenCalledTimes(2)
	})

	it('drops dependencies that are no longer read after a re-run', () => {
		const [useA, setUseA] = createSignal(true)
		const [a, setA] = createSignal(1)
		const [b, setB] = createSignal(10)
		const fn = vi.fn(() => (useA() ? a() : b()))
		createEffect(fn)

		// initial run reads useA + a
		expect(fn).toHaveBeenCalledTimes(1)

		// switch the branch: effect now reads useA + b, drops a
		setUseA(false)
		expect(fn).toHaveBeenCalledTimes(2)

		// writing to a should no longer trigger the effect
		setA(2)
		expect(fn).toHaveBeenCalledTimes(2)

		// writing to b should now trigger the effect
		setB(20)
		expect(fn).toHaveBeenCalledTimes(3)
	})

	it('picks up dependencies first read on a re-run', () => {
		const [gate, setGate] = createSignal(false)
		const [value, setValue] = createSignal('hello')
		const seen: string[] = []
		createEffect(() => {
			seen.push(gate() ? value() : 'closed')
		})

		// value was never read on the initial run
		setValue('ignored')
		expect(seen).toEqual(['closed'])

		// open the gate — now value gets tracked
		setGate(true)
		expect(seen).toEqual(['closed', 'ignored'])

		setValue('world')
		expect(seen).toEqual(['closed', 'ignored', 'world'])
	})

	it('cleans up subscriptions across multiple branch flips', () => {
		const [flag, setFlag] = createSignal(true)
		const [x, setX] = createSignal(0)
		const [y, setY] = createSignal(0)
		const fn = vi.fn(() => (flag() ? x() : y()))
		createEffect(fn)

		setFlag(false) // now tracks y
		setFlag(true) // back to x
		setFlag(false) // back to y
		expect(fn).toHaveBeenCalledTimes(4)

		const callsBefore = fn.mock.calls.length
		setX(99) // x is not tracked right now
		expect(fn).toHaveBeenCalledTimes(callsBefore)

		setY(99)
		expect(fn).toHaveBeenCalledTimes(callsBefore + 1)
	})
})

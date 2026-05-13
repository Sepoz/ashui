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
})

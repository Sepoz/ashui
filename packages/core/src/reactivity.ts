type Subscriber = () => void

let currentSubscriber: Subscriber | null = null

export function createSignal<T>(initialValue: T) {
	let value = initialValue
	const subscribers = new Set<Subscriber>()

	function getter() {
		if (currentSubscriber !== null) {
			subscribers.add(currentSubscriber)
		}
		return value
	}

	function setter(newValue: T) {
		if (Object.is(value, newValue)) return

		value = newValue
		for (const subscriber of subscribers) {
			subscriber()
		}
	}

	return [getter, setter] as const
}

export function createEffect(fn: Subscriber) {
	const previousSubscriber = currentSubscriber
	currentSubscriber = fn
	fn()
	currentSubscriber = previousSubscriber
}

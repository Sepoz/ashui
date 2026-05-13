interface Subscriber {
	execute: () => void
	deps: Set<Set<Subscriber>>
}

let currentSubscriber: Subscriber | null = null

export function createSignal<T>(initialValue: T) {
	let value = initialValue
	const subscribers = new Set<Subscriber>()

	function getter() {
		if (currentSubscriber !== null) {
			subscribers.add(currentSubscriber)
			currentSubscriber.deps.add(subscribers)
		}
		return value
	}

	function setter(newValue: T) {
		if (Object.is(value, newValue)) return

		value = newValue

		for (const subscriber of [...subscribers]) {
			subscriber.execute()
		}
	}

	return [getter, setter] as const
}

export function createEffect(fn: () => void) {
	const subscriber: Subscriber = {
		deps: new Set(),
		execute() {
			for (const dep of subscriber.deps) dep.delete(subscriber)
			subscriber.deps.clear()

			const prev = currentSubscriber
			currentSubscriber = subscriber
			try {
				fn()
			} finally {
				currentSubscriber = prev
			}
		},
	}
	subscriber.execute()
}

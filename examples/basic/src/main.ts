import { createSignal, createEffect } from '@ashui/core'

const app = document.getElementById('app')
if (!app) throw new Error('#app not found')

app.innerHTML = `
  <main style="font-family: system-ui; padding: 2rem;">
    <h1>ashui — reactivity demo</h1>
    <p>count: <span id="count"></span></p>
    <p>doubled: <span id="doubled"></span></p>
    <button id="inc">increment</button>
    <button id="dec">decrement</button>
  </main>
`

const countEl = app.querySelector<HTMLSpanElement>('#count')!
const doubledEl = app.querySelector<HTMLSpanElement>('#doubled')!
const incBtn = app.querySelector<HTMLButtonElement>('#inc')!
const decBtn = app.querySelector<HTMLButtonElement>('#dec')!

const [count, setCount] = createSignal(0)

createEffect(() => {
	countEl.textContent = String(count())
})

createEffect(() => {
	doubledEl.textContent = String(count() * 2)
})

incBtn.addEventListener('click', () => setCount(count() + 1))
decBtn.addEventListener('click', () => setCount(count() - 1))

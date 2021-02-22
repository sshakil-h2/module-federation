import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { loadRemoteModule } from './loadModule'

// const Counter = React.lazy(() => import('app2/Counter'));
const Counter = React.lazy(async () => { 
  // return (await loadRemoteModule({ remoteEntry: 'http://localhost:3001/', exposedModule: './Counter', remoteName: 'app2' }))
  return (await loadRemoteModule({ exposedModule: './Counter', remoteName: 'app2' }))
})

function App() {
  const [count, setCount] = useState(0)
  return (
    <>
      <h1>Hello from React component</h1>
      <React.Suspense fallback="Loading Counter...">
        <Counter count={count} onIncrement={() => setCount(count + 1)} onDecrement={() => setCount(count - 1)} />
      </React.Suspense>
    </>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))

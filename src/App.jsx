import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ImageDragDropToJSX from './components/ImageDragDropToJSX'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div style={{ padding: 18, fontFamily: 'system-ui, -apple-system, Roboto, "Helvetica Neue", Arial' }}>
      <h1 className='heading'>Image Drag & Drop → Export (JSX / HTML / CSS / ZIP)</h1>
      <ImageDragDropToJSX />
    </div>
    </>
  )
}

export default App

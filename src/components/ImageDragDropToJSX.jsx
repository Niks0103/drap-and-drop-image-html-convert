import React, { useState, useRef  } from 'react'

function ImageDragDropToJSX() {
    const [images, setImages] = useState([]) // { id, name, src }
    const fileInputRef = useRef(null)
    const dragSrcIndex = useRef(null)
    const [generatedJSX, setGeneratedJSX] = useState('')
    const [generatedHTML, setGeneratedHTML] = useState('')
    const [generatedCSS, setGeneratedCSS] = useState('')
    function readFileAsDataURL(file) {
    return new Promise((res, rej) => {
      const fr = new FileReader()
      fr.onload = () => res(fr.result)
      fr.onerror = () => rej(new Error('File read error'))
      fr.readAsDataURL(file)
    })
  }
  async function handleFiles(fileList) {
    const arr = Array.from(fileList || [])
    if (!arr.length) return
    const urls = await Promise.all(arr.map((f) => readFileAsDataURL(f)))
    const newItems = urls.map((src, i) => ({ id: Date.now() + Math.random() + i, name: arr[i].name, src }))
    setImages((prev) => [...prev, ...newItems])
  }

  function onDropAreaDrop(e) {
    e.preventDefault()
    if (e.dataTransfer && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }
  function onDropAreaDragOver(e) { e.preventDefault() }

  function onDragStart(e, index) {
    dragSrcIndex.current = index
    e.dataTransfer.effectAllowed = 'move'
    try { e.dataTransfer.setData('text/plain', String(index)) } catch {}
  }

  function onDropItem(e, dropIndex) {
    e.preventDefault()
    const dragIndex = dragSrcIndex.current ?? Number(e.dataTransfer.getData('text/plain'))
    if (dragIndex == null || dragIndex === dropIndex) return
    setImages((prev) => {
      const copy = [...prev]
      const [moved] = copy.splice(dragIndex, 1)
      copy.splice(dropIndex, 0, moved)
      return copy
    })
    dragSrcIndex.current = null
  }

  function onDragOverItem(e) { e.preventDefault() }
  function removeImage(id) { setImages((prev) => prev.filter((p) => p.id !== id)) }

  function escapeForAttr(s) {
    return String(s).replace(/"/g, '\\"').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  function generateFiles() {
    const cssContent = `.image-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;padding:0;margin:0}.image-item img{width:100%;height:auto;display:block;border-radius:6px;object-fit:cover}`
    setGeneratedCSS(cssContent)

  
    const htmlItems = images
      .map((it) => `  <div class=\"image-item\">\n    <img src=\"${it.src}\" alt=\"${escapeForAttr(it.name)}\" />\n  </div>`)
      .join('\n')

    const htmlFile = `<!doctype html>\n<html>\n<head>\n<meta charset=\"utf-8\" />\n<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\" />\n<title>Exported Gallery</title>\n<link rel=\"stylesheet\" href=\"gallery.css\" />\n</head>\n<body>\n  <div class=\"image-grid\">\n${htmlItems}\n  </div>\n</body>\n</html>`
    setGeneratedHTML(htmlFile)
  }

  function downloadFile(content, filename) {
    if (!content) return
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ maxWidth: 980 }}>
      <div
        onDrop={onDropAreaDrop}
        onDragOver={onDropAreaDragOver}
        style={{ border: '2px dashed #bbb', padding: 18, borderRadius: 8, textAlign: 'center', background: '#fafafa' }}
      >
        <p style={{ margin: 0 }}>Drop images here, or</p>
        <div style={{ height: 8 }} />
        <button onClick={() => fileInputRef.current && fileInputRef.current.click()} style={{ padding: '8px 12px' }}>Select images</button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} style={{ display: 'none' }} />
      </div>

      <div style={{ height: 12 }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {images.length === 0 ? (
          <div style={{ color: '#666' }}>No images yet — add some above.</div>
        ) : (
          images.map((img, idx) => (
            <div key={img.id} draggable onDragStart={(e) => onDragStart(e, idx)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDropItem(e, idx)} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', minHeight: 100 }} title={img.name}>
              <img src={img.src} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <button onClick={() => removeImage(img.id)} style={{ position: 'absolute', top: 6, right: 6 }}>✕</button>
            </div>
          ))
        )}
      </div>

      <div style={{ height: 12 }} />

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button onClick={generateFiles} style={{ padding: '8px 12px', background: '#0b74de', color: '#fff' }}>Generate Files</button>
        <div style={{ flex: 1 }} />
        <div style={{ color: '#666' }}>Images: {images.length}</div>
      </div>


      
      {generatedHTML && (
        <div>
          <h4>gallery.html</h4>
          <textarea readOnly value={generatedHTML} style={{ width: '100%', minHeight: 120, fontFamily: 'monospace' }} />
        </div>
      )}
      {generatedCSS && (
        <div>
          <h4>gallery.css</h4>
          <textarea readOnly value={generatedCSS} style={{ width: '100%', minHeight: 120, fontFamily: 'monospace' }} />
        </div>
      )}
    </div>
  )
}

export default ImageDragDropToJSX

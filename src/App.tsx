// Punto de entrada de la app. Boot y ruteo de pantalla se implementan en el paso 9.
// Por ahora exporta un placeholder para que el build pase limpio.

function App() {
  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)', fontSize: '2.5rem' }}>
        Elss
      </h1>
      <p style={{ color: 'var(--muted)', marginTop: '0.5rem' }}>
        vamos anotando tus días
      </p>
    </main>
  )
}

export default App

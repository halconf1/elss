interface Props {
  onTerminar: () => void
}

export default function Onboarding({ onTerminar }: Props) {
  return (
    <main className="screen onboarding">
      <section className="onboarding-copy">
        <h1>Elss</h1>
        <p>Registremos cómo amaneces.</p>
        <p>Vamos anotando tus días.</p>
      </section>
      <button className="primary-button" type="button" onClick={onTerminar}>
        Empezar
      </button>
      <p className="small-muted">Puedes agregar Elss a tu pantalla de inicio para tenerla a la mano.</p>
    </main>
  )
}

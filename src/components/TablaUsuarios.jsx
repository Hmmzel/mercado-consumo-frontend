function TablaUsuarios({ usuarios }) {
  return (
    <table>
      <thead>
        <tr><th>ID</th><th>Nombre</th></tr>
      </thead>
      <tbody>
        {usuarios.map(user => (
          <tr key={user.id}><td>{user.id}</td><td>{user.nombre}</td></tr>
        ))}
      </tbody>
    </table>
  );
}

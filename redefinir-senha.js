(() => {
  const client = window.PRIDEWORK_SUPABASE_CLIENT || null;
  const form = document.getElementById('resetForm');
  const message = document.getElementById('resetMessage');
  const submit = document.getElementById('resetSubmit');

  function showMessage(text, type = 'info') {
    message.textContent = text;
    message.className = `form-message ${type}`;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!client) {
      showMessage('Não foi possível conectar ao Supabase.','error');
      return;
    }
    if (!form.reportValidity()) return;
    const password = document.getElementById('newPassword').value;
    const confirmation = document.getElementById('confirmPassword').value;
    if (password.length < 8) {
      showMessage('A senha precisa ter pelo menos 8 caracteres.','error');
      return;
    }
    if (password !== confirmation) {
      showMessage('As senhas não coincidem.','error');
      return;
    }

    submit.disabled = true;
    submit.textContent = 'Salvando...';
    const { error } = await client.auth.updateUser({ password });
    if (error) {
      showMessage(error.message,'error');
      submit.disabled = false;
      submit.textContent = 'Salvar nova senha';
      return;
    }
    showMessage('Senha atualizada! Redirecionando para o login...','success');
    setTimeout(() => { window.location.href = 'login.html'; }, 1400);
  });
})();

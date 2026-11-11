/* Login e cadastro PrideWork via Supabase Auth. */
(() => {
  const supabaseClient = window.PRIDEWORK_SUPABASE_CLIENT || null;
  const tabs = document.querySelectorAll('.auth-tab');
  const form = document.getElementById('authForm');
  const nameField = document.getElementById('nameField');
  const accountTypeField = document.getElementById('accountTypeField');
  const confirmField = document.getElementById('confirmField');
  const loginOptions = document.getElementById('loginOptions');
  const password = document.getElementById('password');
  const message = document.getElementById('formMessage');
  const submit = document.getElementById('submitButton');
  let mode = 'login';

  function say(text, type = 'info') {
    message.textContent = text;
    message.className = `form-message ${type}`;
  }

  function setMode(nextMode) {
    mode = nextMode;
    tabs.forEach((tab) => {
      const active = tab.dataset.mode === mode;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    nameField.classList.toggle('hidden', mode !== 'register');
    accountTypeField.classList.toggle('hidden', mode !== 'register');
    confirmField.classList.toggle('hidden', mode !== 'register');
    loginOptions.classList.toggle('hidden', mode !== 'login');
    document.getElementById('formTitle').textContent = mode === 'login' ? 'Acesse sua conta' : 'Crie sua conta';
    document.getElementById('formSubtitle').textContent = mode === 'login'
      ? 'Informe seus dados para continuar.'
      : 'Escolha o tipo de conta e preencha seus dados.';
    submit.textContent = mode === 'login' ? 'Entrar' : 'Criar conta';
    password.autocomplete = mode === 'login' ? 'current-password' : 'new-password';
    say('');
  }

  async function getAccountRole(userId) {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    return data?.role || 'candidate';
  }

  async function redirectAfterLogin(user) {
    const role = await getAccountRole(user.id);
    if (role === 'company') {
      window.location.href = 'cadastro-empresa.html';
      return;
    }
    // Administradores também entram na área principal até existir um painel próprio.
    window.location.href = 'principal2.html';
  }

  tabs.forEach((tab) => tab.addEventListener('click', () => setMode(tab.dataset.mode)));

  document.getElementById('togglePassword').addEventListener('click', () => {
    const visible = password.type === 'password';
    password.type = visible ? 'text' : 'password';
    document.getElementById('togglePassword').textContent = visible ? 'Ocultar' : 'Mostrar';
  });

  document.getElementById('forgotButton').addEventListener('click', async () => {
    if (!supabaseClient) {
      say('Não foi possível iniciar o Supabase. Confira supabase-config.js e a biblioteca.','error');
      return;
    }
    const email = document.getElementById('email').value.trim();
    if (!email) {
      say('Informe seu e-mail para receber o link de recuperação.','error');
      return;
    }
    const redirectTo = `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, '')}redefinir-senha.html`;
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) say(error.message, 'error');
    else say('Se esse e-mail estiver cadastrado, você receberá um link para redefinir a senha.','success');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!supabaseClient) {
      say('A biblioteca ou a configuração do Supabase não foi carregada. Confira supabase-config.js.','error');
      return;
    }

    const email = document.getElementById('email').value.trim();
    const pass = password.value;
    submit.disabled = true;
    submit.textContent = 'Aguarde...';

    try {
      if (mode === 'register') {
        const fullName = document.getElementById('fullName').value.trim();
        const confirm = document.getElementById('confirmPassword').value;
        const accountType = document.getElementById('accountType').value;
        if (fullName.length < 2) throw new Error('Informe seu nome completo.');
        if (pass.length < 8) throw new Error('A senha precisa ter pelo menos 8 caracteres.');
        if (pass !== confirm) throw new Error('As senhas não coincidem.');
        if (!['candidate', 'company'].includes(accountType)) throw new Error('Selecione o tipo de conta.');

        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password: pass,
          options: { data: { full_name: fullName, account_type: accountType } }
        });
        if (error) throw error;

        if (data.session && data.user) {
          say('Conta criada! Vamos continuar a configuração.','success');
          if (accountType === 'company') {
            window.location.href = 'cadastro-empresa.html';
          } else {
            window.location.href = 'principal2.html';
          }
        } else {
          setMode('login');
          say('Cadastro iniciado! Confirme seu e-mail. Depois, entre com sua conta: se for empresa, o PrideWork abrirá a etapa de cadastro da empresa.','success');
        }
      } else {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        say('Login realizado! Redirecionando...','success');
        await redirectAfterLogin(data.user);
      }
    } catch (error) {
      console.error('Erro de autenticação PrideWork:', error);
      say(error.message || 'Não foi possível concluir. Tente novamente.','error');
    } finally {
      submit.disabled = false;
      submit.textContent = mode === 'login' ? 'Entrar' : 'Criar conta';
    }
  });

  if (supabaseClient) {
    supabaseClient.auth.getSession().then(({ data, error }) => {
      if (error) console.error('Erro ao verificar sessão:', error.message);
      if (data?.session) say('Você já está conectado. Selecione continuar entrando ou acesse as vagas.','success');
    });
  } else {
    say('Não foi possível iniciar o Supabase. Confira a configuração e a conexão com a internet.','error');
  }
})();

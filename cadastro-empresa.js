(() => {
  const client = window.PRIDEWORK_SUPABASE_CLIENT || null;
  const form = document.getElementById('companyForm');
  const statusBox = document.getElementById('companyStatus');
  const submit = document.getElementById('companySubmit');

  function showStatus(text, type = 'info') {
    statusBox.textContent = text;
    statusBox.className = `form-message ${type}`;
  }

  async function initialize() {
    if (!client) {
      showStatus('Não foi possível conectar ao Supabase. Confira a configuração.','error');
      form.hidden = true;
      return;
    }
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;
    const user = sessionData?.session?.user;
    if (!user) {
      showStatus('Entre na sua conta empresarial para continuar.','error');
      form.hidden = true;
      setTimeout(() => { window.location.href = 'login.html'; }, 1600);
      return;
    }

    const { data: profile, error: profileError } = await client
      .from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (profileError) throw profileError;
    if (profile?.role !== 'company') {
      showStatus('Esta etapa é exclusiva para contas empresariais.','error');
      form.hidden = true;
      return;
    }

    const { data: company, error: companyError } = await client
      .from('companies').select('id,name,status').eq('owner_id', user.id).maybeSingle();
    if (companyError) throw companyError;
    if (company) {
      form.hidden = true;
      const messages = {
        pending: 'Cadastro enviado! Sua empresa está aguardando aprovação administrativa.',
        approved: 'Sua empresa foi aprovada. Em breve, as ferramentas empresariais estarão disponíveis.',
        rejected: 'O cadastro da sua empresa foi recusado. Entre em contato com a equipe PrideWork para orientação.',
        suspended: 'O cadastro da sua empresa está suspenso. Entre em contato com a equipe PrideWork.'
      };
      showStatus(messages[company.status] || `Status atual: ${company.status}.`, company.status === 'approved' ? 'success' : 'info');
    }
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!client || !form.reportValidity()) return;
    submit.disabled = true;
    submit.textContent = 'Enviando...';
    try {
      const { data, error } = await client.rpc('create_company_profile', {
        p_name: document.getElementById('companyName').value.trim(),
        p_description: document.getElementById('companyDescription').value.trim() || null,
        p_email: document.getElementById('companyEmail').value.trim() || null,
        p_website: document.getElementById('companyWebsite').value.trim() || null,
        p_city: document.getElementById('companyCity').value.trim() || null,
        p_state: document.getElementById('companyState').value.trim().toUpperCase() || null
      });
      if (error) throw error;
      form.hidden = true;
      showStatus('Cadastro enviado com sucesso! Sua empresa está pendente de aprovação administrativa. Você poderá acompanhar o status nesta página.','success');
      console.info('Empresa cadastrada. Identificador retornado:', data);
    } catch (error) {
      console.error('Erro ao cadastrar empresa:', error);
      showStatus(error.message || 'Não foi possível enviar o cadastro. Tente novamente.','error');
    } finally {
      submit.disabled = false;
      submit.textContent = 'Enviar para aprovação';
    }
  });

  initialize().catch((error) => {
    console.error('Erro ao carregar cadastro empresarial:', error);
    showStatus(error.message || 'Não foi possível carregar os dados da conta.','error');
  });
})();

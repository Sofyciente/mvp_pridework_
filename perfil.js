/* Perfil do candidato — leitura e gravação no Supabase. */
(() => {
  const client = window.PRIDEWORK_SUPABASE_CLIENT || null;
  const form = document.getElementById('profileForm');
  const message = document.getElementById('profileMessage');
  const saveButton = document.getElementById('saveProfile');
  const fields = {
    fullName: document.getElementById('fullName'),
    phone: document.getElementById('phone'),
    city: document.getElementById('city'),
    state: document.getElementById('state'),
    professionalSummary: document.getElementById('professionalSummary'),
    education: document.getElementById('education'),
    experience: document.getElementById('experience'),
    skills: document.getElementById('skills')
  };
  let currentUser = null;

  function showMessage(text, type = 'info') {
    message.textContent = text;
    message.className = `form-message profile-message ${type}`;
  }

  function initials(name) {
    return (name || 'PrideWork').trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  }

  async function loadProfile() {
    if (!client) throw new Error('Não foi possível iniciar o Supabase. Confira a configuração.');
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;
    currentUser = sessionData?.session?.user || null;
    if (!currentUser) {
      showMessage('Entre na sua conta para acessar seu perfil. Você será redirecionado para o login.', 'error');
      form.hidden = true;
      setTimeout(() => { window.location.href = 'login.html'; }, 1200);
      return;
    }

    const [{ data: profile, error: profileError }, { data: candidate, error: candidateError }] = await Promise.all([
      client.from('profiles').select('full_name, role').eq('id', currentUser.id).maybeSingle(),
      client.from('candidate_profiles').select('phone, city, state, professional_summary, education, experience, skills').eq('user_id', currentUser.id).maybeSingle()
    ]);
    if (profileError) throw profileError;
    if (candidateError) throw candidateError;

    if (profile?.role !== 'candidate') {
      form.hidden = true;
      if (profile?.role === 'company') {
        showMessage('Esta conta é empresarial. Acesse a área de cadastro da empresa.', 'info');
        setTimeout(() => { window.location.href = 'cadastro-empresa.html'; }, 1800);
      } else {
        showMessage('Esta página é destinada a perfis de candidatos.', 'info');
      }
      return;
    }

    fields.fullName.value = profile?.full_name || currentUser.user_metadata?.full_name || '';
    fields.phone.value = candidate?.phone || '';
    fields.city.value = candidate?.city || '';
    fields.state.value = candidate?.state || '';
    fields.professionalSummary.value = candidate?.professional_summary || '';
    fields.education.value = candidate?.education || '';
    fields.experience.value = candidate?.experience || '';
    fields.skills.value = Array.isArray(candidate?.skills) ? candidate.skills.join(', ') : '';
    document.getElementById('profileEmail').textContent = currentUser.email || 'E-mail não disponível';
    document.getElementById('profileAvatar').textContent = initials(fields.fullName.value);
    fields.state.addEventListener('input', () => { fields.state.value = fields.state.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2); });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!currentUser || !form.reportValidity()) return;
    saveButton.disabled = true;
    saveButton.textContent = 'Salvando...';
    showMessage('Salvando suas informações...', 'info');
    try {
      const fullName = fields.fullName.value.trim();
      const { error: nameError } = await client.from('profiles').update({ full_name: fullName }).eq('id', currentUser.id);
      if (nameError) throw nameError;

      const skills = fields.skills.value.split(',').map(skill => skill.trim()).filter(Boolean);
      const { error: saveError } = await client.rpc('save_candidate_profile', {
        p_phone: fields.phone.value.trim() || null,
        p_city: fields.city.value.trim() || null,
        p_state: fields.state.value.trim().toUpperCase() || null,
        p_professional_summary: fields.professionalSummary.value.trim() || null,
        p_education: fields.education.value.trim() || null,
        p_experience: fields.experience.value.trim() || null,
        p_skills: skills.length ? skills : null
      });
      if (saveError) throw saveError;
      document.getElementById('profileAvatar').textContent = initials(fullName);
      showMessage('Perfil atualizado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao salvar perfil PrideWork:', error);
      showMessage(error.message || 'Não foi possível salvar seu perfil. Tente novamente.', 'error');
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = 'Salvar alterações';
    }
  });

  loadProfile().catch((error) => {
    console.error('Erro ao carregar perfil PrideWork:', error);
    showMessage(error.message || 'Não foi possível carregar seu perfil.', 'error');
  });
})();

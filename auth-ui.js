// Mantém os atalhos de conta consistentes nas páginas do PrideWork.
(async () => {
  const client = window.PRIDEWORK_SUPABASE_CLIENT;
  if (!client) return;

  const menus = [...document.querySelectorAll('.navbar .menu, .navbar .nav-links')];
  const loginLinks = [...document.querySelectorAll('a[href="login.html"]')];

  async function updateNavigation(session) {
    let role = null;
    if (session?.user) {
      const { data, error } = await client
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();
      if (error) console.error('Não foi possível consultar o tipo de conta:', error.message);
      role = data?.role || null;
    }

    menus.forEach((menu) => {
      let accountLink = menu.querySelector('[data-pridework-account-link]');
      if (session?.user) {
        if (!accountLink) {
          accountLink = document.createElement('a');
          accountLink.dataset.prideworkAccountLink = 'true';
          const loginLink = menu.querySelector('a[href="login.html"]');
          menu.insertBefore(accountLink, loginLink || null);
        }
        accountLink.href = role === 'company' ? 'cadastro-empresa.html' : 'perfil.html';
        accountLink.textContent = role === 'company' ? 'Área da empresa' : 'Meu perfil';
        accountLink.classList.toggle('menu-ativo', location.pathname.endsWith('/perfil.html'));
      } else if (accountLink) {
        accountLink.remove();
      }
    });

    loginLinks.forEach((link) => {
      if (session?.user) {
        link.textContent = 'Sair';
        link.href = '#sair';
        link.onclick = async (event) => {
          event.preventDefault();
          link.textContent = 'Saindo...';
          const { error } = await client.auth.signOut();
          if (error) {
            console.error('Não foi possível sair:', error.message);
            link.textContent = 'Tentar sair novamente';
            return;
          }
          window.location.href = 'index.html';
        };
      } else {
        link.textContent = 'Entrar';
        link.href = 'login.html';
        link.onclick = null;
      }
    });
  }

  const { data, error } = await client.auth.getSession();
  if (error) console.error('Erro ao consultar sessão:', error.message);
  await updateNavigation(data?.session ?? null);

  client.auth.onAuthStateChange((_event, session) => {
    // Não aguardamos consultas dentro do callback de autenticação.
    setTimeout(() => updateNavigation(session), 0);
  });
})();

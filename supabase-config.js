/* Configuração pública do Supabase para o frontend PrideWork.
   Use somente a Publishable Key (sb_publishable_...). Nunca use Secret/service_role.
*/
(() => {
  const config = {
    url: 'https://vpopbcpugfkmywamdoiv.supabase.co',
    anonKey: 'sb_publishable_cT7q0Tr0BQQI_yCrwcFylg_UssTGl0-'
  };

  window.PRIDEWORK_SUPABASE = Object.freeze(config);

  // Cria apenas uma instância e compartilha com todos os scripts da página.
  if (!window.PRIDEWORK_SUPABASE_CLIENT && window.supabase?.createClient) {
    window.PRIDEWORK_SUPABASE_CLIENT = window.supabase.createClient(
      config.url,
      config.anonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );
  }
})();

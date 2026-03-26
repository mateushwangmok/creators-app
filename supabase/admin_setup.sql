-- ============================================================
--  ADMIN SETUP
--  Execute APÓS criar sua conta pelo cadastro normal
--  Substitua SEU_EMAIL pelo seu e-mail de admin
-- ============================================================

-- Promover usuário a admin
update public.profiles
set role = 'admin'
where email = 'SEU_EMAIL@exemplo.com';

-- Verificar
select id, full_name, email, role from public.profiles where role = 'admin';

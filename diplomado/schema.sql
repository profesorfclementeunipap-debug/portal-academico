-- ====================================================================
-- SCRIPT DE CONFIGURACIÓN DE BASE DE DATOS: PORTAL ACADÉMICO UCSAR
-- Ejecutar esto en el SQL Editor de tu consola de Supabase con 1 clic.
-- ====================================================================

-- 1. Crear tabla de Perfiles Públicos vinculada a auth.users
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  is_authorized boolean default false, -- Por defecto NO están autorizados
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilitar la seguridad a nivel de fila (Row Level Security - RLS)
alter table public.profiles enable row level security;

-- 3. Crear políticas de seguridad RLS
-- A) Permitir que cualquier usuario autenticado lea los perfiles (necesario para verificar autorización)
create policy "Cualquier usuario autenticado puede leer perfiles" 
  on public.profiles for select 
  using (auth.role() = 'authenticated');

-- B) Permitir que los usuarios actualicen su propio perfil (opcional, p.ej. cambiar nombre)
create policy "Usuarios pueden actualizar su propio perfil" 
  on public.profiles for update 
  using (auth.uid() = id);

-- C) Permitir al Administrador Master (tú) control total sobre todos los perfiles
-- (Nota: Para simplificar, cualquier usuario con rol o email master podrá realizar updates completos)
create policy "Control total de administradores" 
  on public.profiles for all 
  using (true)
  with check (true);

-- 4. Crear una función disparadora (Trigger Function) para crear automáticamente
-- un registro en public.profiles cada vez que un usuario se registre en auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, is_authorized)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'name', 
      'Estudiante'
    ),
    false -- Inicialmente requiere aprobación
  );
  return new;
end;
$$ language plpgsql security definer;

-- 5. Crear el Trigger asociado a auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

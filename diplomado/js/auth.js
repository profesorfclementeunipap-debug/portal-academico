// ====================================================================
// NÚCLEO DE AUTENTICACIÓN Y SEGURIDAD: PORTAL ACADÉMICO UCSAR
// Incluye este script en todas tus páginas protegidas.
// ====================================================================

// 1. CONFIGURACIÓN: Ingresa tus credenciales de Supabase aquí
const SUPABASE_URL = "https://orurkfacxrvxlrkdrqer.supabase.co"; // URL de tu proyecto Supabase
const SUPABASE_ANON_KEY = "tu-anon-key-aqui"; // REEMPLAZAR con tu Anon Key de Supabase

// Inicializar el cliente de Supabase desde la CDN cargada
let supabase = null;
if (typeof supabasejs !== "undefined") {
    supabase = supabasejs.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// 2. PROTEGER RUTA: Función ejecutada al cargar la página
async function protegerRuta() {
    if (!supabase) {
        console.error("El cliente de Supabase no se cargó correctamente.");
        return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    const pathActual = window.location.pathname;

    // A) Si el usuario NO ha iniciado sesión
    if (!session) {
        if (!pathActual.includes("login.html")) {
            window.location.href = "login.html";
        }
        return;
    }

    // B) Si el usuario SÍ inició sesión, verificar su autorización en 'profiles'
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_authorized, email')
        .eq('id', session.user.id)
        .single();

    if (error || !profile) {
        console.error("Error obteniendo el perfil del alumno:", error);
        if (!pathActual.includes("login.html")) {
            // Si el perfil no existe por retraso del trigger, forzar salida a login
            await supabase.auth.signOut();
            window.location.href = "login.html?pending=true";
        }
        return;
    }

    // C) Verificar si el alumno está autorizado
    if (!profile.is_authorized) {
        if (!pathActual.includes("login.html")) {
            // Si intenta entrar a otra página, lo expulsamos a login con aviso de espera
            window.location.href = "login.html?pending=true";
        } else {
            // Si ya está en login, le mostramos el aviso visual de espera
            mostrarMensajeEspera(profile.email);
        }
    } else {
        // D) Si está autorizado e intenta entrar a login, lo enviamos al Dashboard
        if (pathActual.includes("login.html")) {
            window.location.href = "index.html";
        }
    }
}

// 3. CERRAR SESIÓN
async function logout() {
    if (supabase) {
        await supabase.auth.signOut();
        window.location.href = "login.html";
    }
}

// 4. MOSTRAR MENSAJE DE ESPERA DE AUTORIZACIÓN (Se ejecuta en login.html)
function mostrarMensajeEspera(email) {
    const container = document.getElementById("auth-container");
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 4rem; color: #f59e0b; margin-bottom: 20px;">
                    <i class="fa-solid fa-clock-rotate-left"></i>
                </div>
                <h2 style="font-family: 'Outfit', sans-serif; font-size: 1.8rem; color: #0f172a; margin-bottom: 15px;">
                    Acceso en Revisión
                </h2>
                <p style="color: #64748b; font-size: 1.05rem; line-height: 1.6; margin-bottom: 30px; max-width: 400px; margin-left: auto; margin-right: auto;">
                    Hola, <strong>${email}</strong>. Tu cuenta ha sido creada exitosamente, pero requiere la autorización manual del <strong>Prof. Frank Clemente</strong> para poder ingresar.
                </p>
                <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 15px; font-size: 0.9rem; color: #b45309; margin-bottom: 30px; max-width: 400px; margin-left: auto; margin-right: auto; text-align: left;">
                    <i class="fa-solid fa-circle-info"></i> El facilitador revisará las solicitudes de registro y activará los accesos en el transcurso del día.
                </div>
                <button onclick="logout()" style="background: #e2e8f0; color: #334155; border: none; padding: 10px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 0.95rem; transition: all 0.2s;" onmouseover="this.style.background='#cbd5e1';" onmouseout="this.style.background='#e2e8f0';">
                    <i class="fa-solid fa-right-from-bracket"></i> Volver a Iniciar Sesión
                </button>
            </div>
        `;
    }
}

// Ejecutar protección automática en la carga del script
document.addEventListener("DOMContentLoaded", () => {
    protegerRuta();
});

// ====================================================================
// NÚCLEO DE AUTENTICACIÓN Y SEGURIDAD: PORTAL ACADÉMICO UCSAR
// Incluye este script en todas tus páginas protegidas.
// ====================================================================

const SUPABASE_URL = "https://orurkfacxrvxlrkdrqer.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_xRwAgFEbR1ryIePectj_FA_0ZQEs8Vw";

const ADMIN_EMAILS = [
    "profesorfclementeunipap@gmail.com",
    "fclem@gmail.com"
];

let supabaseClient = null;

// Inicialización segura esperando al CDN
function initSupabaseAuth() {
    if (typeof window.supabase === "undefined") {
        // Reintentar en 50ms si el CDN no ha cargado
        setTimeout(initSupabaseAuth, 50);
        return;
    }
    
    // Crear el cliente una vez que el CDN está listo
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Proteger la ruta inmediatamente
    protegerRuta();
}

async function protegerRuta() {
    if (window.location.pathname.includes("admin.html")) return;

    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    const pathActual = window.location.pathname;

    // A) Si no hay sesión, ir a login
    if (!session) {
        if (!pathActual.includes("login.html")) {
            window.location.href = "login.html";
        }
        return;
    }

    const userEmail = session.user.email;

    // B) Si es Admin
    if (ADMIN_EMAILS.includes(userEmail)) {
        if (pathActual.includes("login.html")) {
            window.location.href = "admin.html";
        }
        return;
    }

    // C) Estudiante regular
    const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('is_authorized, email')
        .eq('id', session.user.id)
        .single();

    if (error || !profile) {
        if (!pathActual.includes("login.html")) {
            await supabaseClient.auth.signOut();
            window.location.href = "login.html?pending=true";
        }
        return;
    }

    if (!profile.is_authorized) {
        if (!pathActual.includes("login.html")) {
            window.location.href = "login.html?pending=true";
        } else {
            mostrarMensajeEspera(profile.email);
        }
    } else {
        if (pathActual.includes("login.html")) {
            window.location.href = "index.html";
        }
    }
}

async function logout() {
    if (supabaseClient) {
        await supabaseClient.auth.signOut();
        window.location.href = "login.html";
    }
}

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

// Iniciar el proceso
initSupabaseAuth();

// ====================================================================
// BOTÓN GLOBAL DE CERRAR SESIÓN (Flotante para páginas secundarias)
// ====================================================================
function inyectarBotonCerrarSesion() {
    const pathActual = window.location.pathname;
    
    // No inyectar en login, admin, ni en el index (ya tiene su propio botón en el navbar)
    if (pathActual.includes("login.html") || pathActual.includes("admin.html") || pathActual.includes("index.html") || pathActual.endsWith("/")) {
        return;
    }
    
    // Crear el botón flotante
    const btn = document.createElement("button");
    btn.onclick = logout;
    btn.title = "Cerrar Sesión";
    // Clases de Tailwind CSS para un diseño hermoso, responsivo y fijo en la esquina inferior derecha
    btn.className = "fixed bottom-6 right-6 z-[9999] text-sm font-semibold bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-4 py-3 rounded-full transition-all flex items-center shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer";
    btn.innerHTML = '<i class="fas fa-sign-out-alt sm:mr-2"></i> <span class="hidden sm:inline">Cerrar Sesión</span>';
    
    // Insertar en el body
    document.body.appendChild(btn);
}

// Ejecutar inyección al cargar el DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inyectarBotonCerrarSesion);
} else {
    inyectarBotonCerrarSesion();
}

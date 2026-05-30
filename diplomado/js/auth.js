// ====================================================================
// NÚCLEO DE AUTENTICACIÓN Y SEGURIDAD: PORTAL ACADÉMICO UCSAR
// Incluye este script en todas tus páginas protegidas.
// ====================================================================

// 1. CONFIGURACIÓN: Credenciales de Supabase
const SUPABASE_URL = "https://orurkfacxrvxlrkdrqer.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_xRwAgFEbR1ryIePectj_FA_0ZQEs8Vw";

// Lista de correos con acceso de Administrador Master
const ADMIN_EMAILS = [
    "profesorfclementeunipap@gmail.com",
    "fclem@gmail.com"
];

// Inicializar el cliente con el namespace correcto del CDN (@supabase/supabase-js@2)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. PROTEGER RUTA: Función ejecutada al cargar la página
async function protegerRuta() {
    // admin.html tiene su propio sistema de verificación de rol
    if (window.location.pathname.includes("admin.html")) return;

    const { data: { session } } = await supabaseClient.auth.getSession();
    const pathActual = window.location.pathname;

    // A) Si el usuario NO ha iniciado sesión
    if (!session) {
        if (!pathActual.includes("login.html")) {
            window.location.href = "login.html";
        }
        return;
    }

    const userEmail = session.user.email;

    // B) Si es Administrador → llevarlo directamente al panel de control
    if (ADMIN_EMAILS.includes(userEmail)) {
        if (pathActual.includes("login.html")) {
            window.location.href = "admin.html";
        }
        return;
    }

    // C) Si es estudiante → verificar su autorización en 'profiles'
    const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('is_authorized, email')
        .eq('id', session.user.id)
        .single();

    if (error || !profile) {
        console.error("Error obteniendo el perfil del alumno:", error);
        if (!pathActual.includes("login.html")) {
            await supabaseClient.auth.signOut();
            window.location.href = "login.html?pending=true";
        }
        return;
    }

    if (!profile.is_authorized) {
        // Estudiante sin autorización
        if (!pathActual.includes("login.html")) {
            window.location.href = "login.html?pending=true";
        } else {
            mostrarMensajeEspera(profile.email);
        }
    } else {
        // Estudiante autorizado en login → enviar al Dashboard
        if (pathActual.includes("login.html")) {
            window.location.href = "index.html";
        }
    }
}

// 3. CERRAR SESIÓN
async function logout() {
    if (supabaseClient) {
        await supabaseClient.auth.signOut();
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

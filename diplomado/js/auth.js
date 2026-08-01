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
    
    // Crear el cliente usando sessionStorage para que la sesión muera al cerrar el navegador
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            storage: window.sessionStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    });
    
    // Proteger la ruta inmediatamente
    protegerRuta();
}

function esRutaRestringida(path) {
    const p = decodeURIComponent(path).toUpperCase();
    if (p.includes("MODULO_VII") || p.includes("MODULO VII")) return true;
    if (p.includes("MODULO_VIII") || p.includes("MODULO VIII")) return true;
    if (p.includes("MODULO_XI") || p.includes("MODULO XI")) return true;
    if (p.includes("MODULO_XII") || p.includes("MODULO XII")) return true;
    if (p.includes("MODULO_X.HTML") || p.includes("MODULO X/") || p.includes("MODULO_X/")) return true;
    return false;
}

function actualizarVistaModulosIndex(isAdmin) {
    const runUpdate = () => {
        const path = window.location.pathname;
        if (!path.includes("index.html") && !path.endsWith("/") && !path.endsWith("index.html")) return;

        const modulos = [
            { id: "modulo7", num: "VII", url: "MODULO VII/MODULO_VII.html" },
            { id: "modulo8", num: "VIII", url: "MODULO VIII/MODULO_VIII.html" },
            { id: "modulo10", num: "X", url: "MODULO X/MODULO_X.html" },
            { id: "modulo11", num: "XI", url: "MODULO XI/MODULO_XI.html" },
            { id: "modulo12", num: "XII", url: "MODULO XII/MODULO_XII.html" }
        ];

        modulos.forEach(mod => {
            const container = document.getElementById(mod.id);
            if (!container) return;

            const badgeContainer = container.querySelector(".flex.justify-between.items-start.mb-4");
            const btnContainer = container.querySelector(".flex.flex-col.mt-auto");

            if (isAdmin) {
                if (badgeContainer) {
                    badgeContainer.innerHTML = `
                        <div>
                            <span class="bg-indigo-600 text-white text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wider"><i class="fas fa-user-shield mr-1"></i> MODO ADMIN</span>
                            <span class="text-slate-400 text-xs font-semibold ml-2">MÓDULO ${mod.num}</span>
                        </div>
                    `;
                }
                if (btnContainer) {
                    btnContainer.innerHTML = `
                        <a href="${mod.url}" class="bg-indigo-600 hover:bg-indigo-700 text-white text-center py-3 rounded-lg font-semibold transition flex items-center justify-center shadow-md">
                            <i class="fas fa-unlock mr-2"></i> Ingresar (Admin) <i class="fas fa-arrow-right ml-2 text-sm"></i>
                        </a>
                    `;
                }
            } else {
                if (badgeContainer) {
                    badgeContainer.innerHTML = `
                        <div>
                            <span class="bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wider"><i class="fas fa-lock mr-1 text-amber-600"></i> DESHABILITADO</span>
                            <span class="text-slate-400 text-xs font-semibold ml-2">MÓDULO ${mod.num}</span>
                        </div>
                    `;
                }
                if (btnContainer) {
                    btnContainer.innerHTML = `
                        <button onclick="alert('🔒 El Módulo ${mod.num} se encuentra deshabilitado para estudiantes y reservado exclusivamente para el Administrador.');" class="w-full bg-slate-100 border border-slate-300 text-slate-400 py-3 rounded-lg font-bold cursor-not-allowed flex items-center justify-center transition-all">
                            <i class="fas fa-lock mr-2 text-amber-500"></i> Reservado Administrador
                        </button>
                    `;
                }
            }
        });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runUpdate);
    } else {
        runUpdate();
    }
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
    const esAdmin = ADMIN_EMAILS.includes(userEmail);

    // B) Si es Admin
    if (esAdmin) {
        if (pathActual.includes("login.html")) {
            window.location.href = "index.html";
            return;
        }
        actualizarVistaModulosIndex(true);
        return;
    }

    // C) Si es estudiante y la ruta actual es un módulo restringido (VII, VIII, X, XI, XII)
    if (esRutaRestringida(pathActual)) {
        alert("🔒 Acceso Restringido: Este módulo está deshabilitado para estudiantes y reservado exclusivamente para el Administrador.");
        window.location.href = "index.html?blocked=true";
        return;
    }

    // D) Estudiante regular
    const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('is_authorized, email, phone')
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
            return;
        }
        
        actualizarVistaModulosIndex(false);

        // Si el usuario está autorizado y ya en una página protegida, verificamos el teléfono
        if (!profile.phone) {
            mostrarModalTelefono(session.user.id);
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

// ====================================================================
// MODAL PARA RECOPILAR NÚMERO DE TELÉFONO
// ====================================================================
function mostrarModalTelefono(userId) {
    // Evitar duplicados
    if (document.getElementById("modal-telefono")) return;

    const modal = document.createElement("div");
    modal.id = "modal-telefono";
    modal.className = "fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm";
    
    // Solo mostramos un diseño minimalista si Tailwind no carga, pero usamos clases de Tailwind que ya existen en el proyecto
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 max-w-md w-[90%] shadow-2xl relative animate-fadeIn" style="border-top: 4px solid #10b981;">
            <div class="text-center mb-6">
                <i class="fa-solid fa-mobile-screen-button text-4xl text-emerald-500 mb-3"></i>
                <h2 class="text-2xl font-bold text-slate-800" style="font-family: 'Outfit', sans-serif;">Actualiza tus datos</h2>
                <p class="text-sm text-slate-500 mt-2">Para continuar accediendo al contenido del diplomado, necesitamos un número telefónico de contacto.</p>
            </div>
            
            <div class="mb-4">
                <label class="block text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wider">Número de WhatsApp / Teléfono</label>
                <div class="relative">
                    <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <i class="fa-solid fa-phone"></i>
                    </span>
                    <input type="tel" id="input-telefono" class="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-slate-700" placeholder="+58 414 1234567" required>
                </div>
                <p id="error-telefono" class="text-red-500 text-xs mt-2 hidden">Por favor, ingresa un número válido.</p>
            </div>
            
            <button onclick="guardarTelefono('${userId}')" id="btn-guardar-telefono" class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition-all flex justify-center items-center gap-2">
                <i class="fa-solid fa-floppy-disk"></i> Guardar y Continuar
            </button>
        </div>
    `;

    document.body.appendChild(modal);
}

async function guardarTelefono(userId) {
    const input = document.getElementById("input-telefono");
    const errorMsg = document.getElementById("error-telefono");
    const btn = document.getElementById("btn-guardar-telefono");
    const phone = input.value.trim();

    if (phone.length < 10) {
        errorMsg.classList.remove("hidden");
        return;
    }
    errorMsg.classList.add("hidden");

    // UX: Estado de carga
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Guardando...';
    btn.disabled = true;
    btn.classList.add("opacity-70");

    try {
        const { error } = await supabaseClient
            .from('profiles')
            .update({ phone: phone })
            .eq('id', userId);

        if (error) throw error;

        // Éxito: Cerrar modal y continuar
        const modal = document.getElementById("modal-telefono");
        if (modal) modal.remove();
        
    } catch (err) {
        console.error("Error al guardar teléfono:", err);
        errorMsg.innerText = "Error al guardar. Inténtelo de nuevo.";
        errorMsg.classList.remove("hidden");
        
        btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar y Continuar';
        btn.disabled = false;
        btn.classList.remove("opacity-70");
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

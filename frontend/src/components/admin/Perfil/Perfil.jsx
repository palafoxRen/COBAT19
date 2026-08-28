import { useState } from "react";
import { User, Mail, Lock, Save, Loader2, CheckCircle2, AlertTriangle, Shield } from "lucide-react";
import { useAuth } from "../../../contexts/useAuth";
import { actualizarPerfil, cambiarContrasena } from "../../../api/auth";

export default function Perfil() {
    const { user } = useAuth();

    const [nombre, setNombre] = useState(() => user?.nombre || "");
    const [correo, setCorreo] = useState(() => user?.correo || "");
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileMsg, setProfileMsg] = useState(null);

    const [contrasenaActual, setContrasenaActual] = useState("");
    const [contrasenaNueva, setContrasenaNueva] = useState("");
    const [confirmarContrasena, setConfirmarContrasena] = useState("");
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordMsg, setPasswordMsg] = useState(null);

    const [showPassword, setShowPassword] = useState(false);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setProfileMsg(null);
        if (!nombre.trim() || !correo.trim()) {
            setProfileMsg({ type: "error", text: "Nombre y correo son obligatorios." });
            return;
        }
        setSavingProfile(true);
        try {
            const res = await actualizarPerfil({ nombre: nombre.trim(), correo: correo.trim() });
            localStorage.setItem("user", JSON.stringify(res.usuario));
            window.location.reload();
        } catch (err) {
            setProfileMsg({ type: "error", text: err.response?.data?.message || "Error al actualizar el perfil." });
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordMsg(null);
        if (!contrasenaActual || !contrasenaNueva) {
            setPasswordMsg({ type: "error", text: "Debes completar ambos campos." });
            return;
        }
        if (contrasenaNueva.length < 8) {
            setPasswordMsg({ type: "error", text: "La nueva contraseña debe tener al menos 8 caracteres." });
            return;
        }
        if (contrasenaNueva !== confirmarContrasena) {
            setPasswordMsg({ type: "error", text: "Las contraseñas no coinciden." });
            return;
        }
        setSavingPassword(true);
        try {
            await cambiarContrasena({ contrasena_actual: contrasenaActual, contrasena_nueva: contrasenaNueva });
            setPasswordMsg({ type: "success", text: "Contraseña actualizada correctamente." });
            setContrasenaActual("");
            setContrasenaNueva("");
            setConfirmarContrasena("");
        } catch (err) {
            setPasswordMsg({ type: "error", text: err.response?.data?.message || "Error al cambiar la contraseña." });
        } finally {
            setSavingPassword(false);
        }
    };

    const inputBase = {
        width: "100%",
        boxSizing: "border-box",
        padding: "11px 12px 11px 38px",
        borderRadius: 10,
        border: "1px solid #e0e0e0",
        fontSize: 14,
        outline: "none",
        color: "#171717",
        background: "#fff",
    };

    const iniciales = user?.nombre ? user.nombre.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "?";
    const esAdmin = user?.rol === "Administrador";

    return (
        <>
            {/* Header del perfil */}
            <div style={{
                background: "#fff",
                border: "1px solid #ececec",
                borderRadius: 14,
                padding: "32px 36px",
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 28,
            }}>
                {/* Avatar */}
                <div style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: esAdmin
                        ? "linear-gradient(135deg, #7a2333, #a85a68)"
                        : "linear-gradient(135deg, #404040, #737373)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 28,
                    flexShrink: 0,
                    boxShadow: "0 4px 12px rgba(122,35,51,0.2)",
                }}>
                    {iniciales}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px", color: "#171717" }}>
                        {user?.nombre || "Sin nombre"}
                    </h1>
                    <p style={{ margin: "0 0 10px", fontSize: 14, color: "#737373" }}>
                        {user?.correo || "Sin correo"}
                    </p>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <span style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            fontSize: 12.5, fontWeight: 600,
                            padding: "4px 12px", borderRadius: 999,
                            background: esAdmin ? "#f5e0e3" : "#f0f0f0",
                            color: esAdmin ? "#7a2333" : "#525252",
                        }}>
                            <Shield size={12} />
                            {user?.rol || "Sin rol"}
                        </span>
                        <span style={{
                            display: "inline-flex", alignItems: "center", gap: 5,
                            fontSize: 12.5, fontWeight: 600,
                            padding: "4px 12px", borderRadius: 999,
                            background: "#f0fdf4", color: "#15803d",
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
                            Activa
                        </span>
                    </div>
                </div>
            </div>

            {/* Info de cuenta */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 16,
                marginBottom: 24,
            }}>
                <div style={{
                    background: "#fff",
                    border: "1px solid #ececec",
                    borderRadius: 12,
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: "#f5f5f5",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                    }}>
                        <Shield size={17} color="#7a2333" />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: "#a3a3a3" }}>ROL</p>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#171717" }}>{user?.rol || "Bibliotecario"}</p>
                    </div>
                </div>
            </div>

            {/* Formularios */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
                {/* Datos personales */}
                <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: 14, padding: 28 }}>
                    <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>Datos personales</h3>
                    <p style={{ margin: "0 0 20px", fontSize: 13, color: "#737373" }}>Actualiza tu nombre y correo electrónico.</p>

                    <form onSubmit={handleUpdateProfile}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Nombre</label>
                        <div style={{ position: "relative", marginBottom: 16 }}>
                            <User size={15} color="#a3a3a3" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                            <input
                                type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                                placeholder="Tu nombre"
                                style={inputBase}
                                onFocus={(e) => (e.target.style.borderColor = "#7a2333")}
                                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                            />
                        </div>

                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Correo electrónico</label>
                        <div style={{ position: "relative", marginBottom: 20 }}>
                            <Mail size={15} color="#a3a3a3" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                            <input
                                type="email" value={correo} onChange={(e) => setCorreo(e.target.value)}
                                placeholder="correo@ejemplo.com"
                                style={inputBase}
                                onFocus={(e) => (e.target.style.borderColor = "#7a2333")}
                                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                            />
                        </div>

                        {profileMsg && (
                            <div style={{
                                display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
                                padding: "10px 14px", borderRadius: 8, fontSize: 13,
                                background: profileMsg.type === "error" ? "#fdeceb" : "#f0fdf4",
                                border: `1px solid ${profileMsg.type === "error" ? "#f6c2bd" : "#bbf7d0"}`,
                                color: profileMsg.type === "error" ? "#dc2626" : "#15803d",
                            }}>
                                {profileMsg.type === "error" ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
                                {profileMsg.text}
                            </div>
                        )}

                        <button
                            type="submit" disabled={savingProfile}
                            style={{
                                width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
                                background: savingProfile ? "#a85a68" : "#7a2333", color: "#fff",
                                fontSize: 14, fontWeight: 700, cursor: savingProfile ? "default" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                transition: "background 0.2s",
                            }}
                        >
                            {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {savingProfile ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </form>
                </div>

                {/* Cambiar contraseña */}
                <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: 14, padding: 28 }}>
                    <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>Cambiar contraseña</h3>
                    <p style={{ margin: "0 0 20px", fontSize: 13, color: "#737373" }}>Mínimo 8 caracteres. Se recomienda usar mayúsculas, números y símbolos.</p>

                    <form onSubmit={handleChangePassword}>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Contraseña actual</label>
                        <div style={{ position: "relative", marginBottom: 16 }}>
                            <Lock size={15} color="#a3a3a3" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={contrasenaActual} onChange={(e) => setContrasenaActual(e.target.value)}
                                placeholder="••••••••"
                                style={inputBase}
                                onFocus={(e) => (e.target.style.borderColor = "#7a2333")}
                                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                            />
                        </div>

                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Nueva contraseña</label>
                        <div style={{ position: "relative", marginBottom: 16 }}>
                            <Lock size={15} color="#a3a3a3" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={contrasenaNueva} onChange={(e) => setContrasenaNueva(e.target.value)}
                                placeholder="Mínimo 8 caracteres"
                                style={inputBase}
                                onFocus={(e) => (e.target.style.borderColor = "#7a2333")}
                                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                            />
                        </div>

                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Confirmar nueva contraseña</label>
                        <div style={{ position: "relative", marginBottom: 12 }}>
                            <Lock size={15} color="#a3a3a3" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmarContrasena} onChange={(e) => setConfirmarContrasena(e.target.value)}
                                placeholder="Repite la contraseña"
                                style={inputBase}
                                onFocus={(e) => (e.target.style.borderColor = "#7a2333")}
                                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                            />
                        </div>

                        {/* Mostrar contraseña */}
                        <label style={{
                            display: "flex", alignItems: "center", gap: 8,
                            fontSize: 13, color: "#737373", cursor: "pointer",
                            marginBottom: 20, userSelect: "none",
                        }}>
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={(e) => setShowPassword(e.target.checked)}
                                style={{ accentColor: "#7a2333", width: 14, height: 14, cursor: "pointer" }}
                            />
                            Mostrar contraseñas
                        </label>

                        {passwordMsg && (
                            <div style={{
                                display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
                                padding: "10px 14px", borderRadius: 8, fontSize: 13,
                                background: passwordMsg.type === "error" ? "#fdeceb" : "#f0fdf4",
                                border: `1px solid ${passwordMsg.type === "error" ? "#f6c2bd" : "#bbf7d0"}`,
                                color: passwordMsg.type === "error" ? "#dc2626" : "#15803d",
                            }}>
                                {passwordMsg.type === "error" ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}
                                {passwordMsg.text}
                            </div>
                        )}

                        <button
                            type="submit" disabled={savingPassword}
                            style={{
                                width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
                                background: savingPassword ? "#a85a68" : "#7a2333", color: "#fff",
                                fontSize: 14, fontWeight: 700, cursor: savingPassword ? "default" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                transition: "background 0.2s",
                            }}
                        >
                            {savingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                            {savingPassword ? "Cambiando..." : "Cambiar contraseña"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

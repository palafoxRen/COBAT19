import { useState, useEffect, useMemo } from "react";
import {
    Search,
    Plus,
    Users,
    Shield,
    UserCheck,
    UserX,
    Pencil,
    Key,
    X,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    Eye,
    EyeOff,
} from "lucide-react";
import api from "../../../api/axios";
import { useAuth } from "../../../contexts/useAuth";
import ConfirmDialog from "../../ConfirmDialog";

const EMPTY_FORM = { nombre: "", correo: "", contrasena: "", rol: "Bibliotecario" };

export default function GestionUsuarios() {
    const { user } = useAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editando, setEditando] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const [confirmToggle, setConfirmToggle] = useState(null);
    const [resetPass, setResetPass] = useState(null);
    const [newPass, setNewPass] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [resetting, setResetting] = useState(false);

    const fetchUsuarios = async () => {
        try {
            const res = await api.get("/usuarios");
            setUsuarios(res.data.data || []);
        } catch (e) {
            setError(e.response?.data?.message || "Error al cargar usuarios.");
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { fetchUsuarios(); }, []);

    const filtrados = useMemo(() => {
        if (!search.trim()) return usuarios;
        const q = search.toLowerCase();
        return usuarios.filter(
            (u) =>
                u.nombre?.toLowerCase().includes(q) ||
                u.correo?.toLowerCase().includes(q)
        );
    }, [usuarios, search]);

    const openCrear = () => {
        setEditando(null);
        setForm(EMPTY_FORM);
        setShowForm(true);
    };

    const openEditar = (u) => {
        setEditando(u);
        setForm({ nombre: u.nombre, correo: u.correo, contrasena: "", rol: u.rol || "Bibliotecario" });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditando(null);
        setForm(EMPTY_FORM);
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            if (editando) {
                await api.put(`/usuarios/${editando.id_usuario}`, {
                    nombre: form.nombre,
                    correo: form.correo,
                    rol: form.rol,
                });
                setSuccess("Usuario actualizado correctamente.");
            } else {
                await api.post("/usuarios", {
                    nombre: form.nombre,
                    correo: form.correo,
                    contrasena: form.contrasena,
                    rol: form.rol,
                });
                setSuccess("Usuario creado correctamente.");
            }
            await fetchUsuarios();
            closeForm();
        } catch (e) {
            setError(e.response?.data?.message || "Error al guardar el usuario.");
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async () => {
        const u = confirmToggle;
        setConfirmToggle(null);
        try {
            await api.put(`/usuarios/${u.id_usuario}/activo`, { activo: !u.activo });
            await fetchUsuarios();
            setSuccess(u.activo ? `${u.nombre} desactivado.` : `${u.nombre} activado.`);
        } catch (e) {
            setError(e.response?.data?.message || "Error al cambiar estado.");
        }
    };

    const handleResetPass = async () => {
        setResetting(true);
        setError("");
        setSuccess("");
        try {
            await api.put(`/usuarios/${resetPass.id_usuario}/contrasena`, { contrasena: newPass });
            setSuccess(`Contraseña de ${resetPass.nombre} actualizada.`);
            setResetPass(null);
            setNewPass("");
        } catch (e) {
            setError(e.response?.data?.message || "Error al resetear contraseña.");
        } finally {
            setResetting(false);
        }
    };

    const inputBase = {
        width: "100%",
        boxSizing: "border-box",
        padding: "10px 12px",
        borderRadius: 9,
        border: "1px solid #e0e0e0",
        fontSize: 14,
        outline: "none",
        color: "#171717",
        background: "#fff",
    };

    return (
        <>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 4px" }}>Usuarios</h1>
                    <p style={{ margin: 0, fontSize: 14, color: "#737373" }}>Administra las cuentas de la biblioteca.</p>
                </div>
                <button
                    onClick={openCrear}
                    style={{
                        display: "flex", alignItems: "center", gap: 8,
                        background: "#7a2333", color: "#fff", border: "none",
                        borderRadius: 10, padding: "11px 18px", fontSize: 14,
                        fontWeight: 700, cursor: "pointer",
                    }}
                >
                    <Plus size={16} />
                    Nuevo usuario
                </button>
            </div>

            {/* Messages */}
            {error && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "12px 14px", borderRadius: 8, fontSize: 13, background: "#fdeceb", border: "1px solid #f6c2bd", color: "#dc2626" }}>
                    <AlertTriangle size={15} />
                    {error}
                </div>
            )}
            {success && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "12px 14px", borderRadius: 8, fontSize: 13, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d" }}>
                    <CheckCircle2 size={15} />
                    {success}
                </div>
            )}

            {/* Table */}
            <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: 14, padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #e0e0e0", borderRadius: 9, padding: "9px 14px", maxWidth: 360, marginBottom: 20 }}>
                    <Search size={15} color="#a3a3a3" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o correo..."
                        style={{ border: "none", outline: "none", fontSize: 13.5, width: "100%" }}
                    />
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 580 }}>
                        <thead>
                            <tr style={{ textAlign: "left", color: "#737373" }}>
                                <th style={{ padding: "8px 10px", fontWeight: 600 }}>Nombre</th>
                                <th style={{ padding: "8px 10px", fontWeight: 600 }}>Correo</th>
                                <th style={{ padding: "8px 10px", fontWeight: 600 }}>Rol</th>
                                <th style={{ padding: "8px 10px", fontWeight: 600 }}>Estado</th>
                                <th style={{ padding: "8px 10px", fontWeight: 600 }}>Último acceso</th>
                                <th style={{ padding: "8px 10px", fontWeight: 600 }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cargando && (
                                <tr>
                                    <td colSpan={6} style={{ padding: "24px 10px", textAlign: "center", color: "#a3a3a3" }}>
                                        Cargando usuarios...
                                    </td>
                                </tr>
                            )}
                            {!cargando && filtrados.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: "24px 10px", textAlign: "center", color: "#a3a3a3" }}>
                                        No hay usuarios que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            )}
                            {!cargando && filtrados.map((u) => {
                                const esYo = u.id_usuario === user?.id_usuario;
                                return (
                                    <tr key={u.id_usuario} style={{ borderTop: "1px solid #f2f2f2" }}>
                                        <td style={{ padding: "14px 10px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: "50%",
                                                    background: u.rol === "Administrador" ? "#7a2333" : "#525252",
                                                    color: "#fff", display: "flex", alignItems: "center",
                                                    justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0,
                                                }}>
                                                    {u.nombre ? u.nombre.charAt(0).toUpperCase() : "?"}
                                                </div>
                                                <p style={{ margin: 0, fontWeight: 600 }}>{u.nombre}</p>
                                            </div>
                                        </td>
                                        <td style={{ padding: "14px 10px", color: "#525252" }}>{u.correo}</td>
                                        <td style={{ padding: "14px 10px" }}>
                                            <span style={{
                                                display: "inline-flex", alignItems: "center", gap: 5,
                                                fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999,
                                                background: u.rol === "Administrador" ? "#f5e0e3" : "#f0f0f0",
                                                color: u.rol === "Administrador" ? "#7a2333" : "#525252",
                                            }}>
                                                <Shield size={11} />
                                                {u.rol || "Bibliotecario"}
                                            </span>
                                        </td>
                                        <td style={{ padding: "14px 10px" }}>
                                            <span style={{
                                                display: "inline-flex", alignItems: "center", gap: 5,
                                                fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999,
                                                background: u.activo !== false ? "#f0fdf4" : "#fdeceb",
                                                color: u.activo !== false ? "#15803d" : "#dc2626",
                                            }}>
                                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: u.activo !== false ? "#22c55e" : "#dc2626" }} />
                                                {u.activo !== false ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td style={{ padding: "14px 10px", color: "#737373", fontSize: 12.5 }}>
                                            {u.ultimo_acceso
                                                ? new Date(u.ultimo_acceso).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
                                                : "—"}
                                        </td>
                                        <td style={{ padding: "14px 10px" }}>
                                            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                                                <button
                                                    onClick={() => openEditar(u)}
                                                    style={{
                                                        display: "inline-flex", alignItems: "center", gap: 5,
                                                        border: "1px solid #7a2333", color: "#7a2333", background: "#fff",
                                                        borderRadius: 7, padding: "6px 12px", fontSize: 12, fontWeight: 600,
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <Pencil size={12} />
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => { setResetPass(u); setNewPass(""); setShowPass(false); }}
                                                    style={{
                                                        display: "inline-flex", alignItems: "center", gap: 5,
                                                        border: "1px solid #e0e0e0", color: "#525252", background: "#fff",
                                                        borderRadius: 7, padding: "6px 12px", fontSize: 12, fontWeight: 600,
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    <Key size={12} />
                                                    Contraseña
                                                </button>
                                                {!esYo && (
                                                    <button
                                                        onClick={() => setConfirmToggle(u)}
                                                        style={{
                                                            display: "inline-flex", alignItems: "center", gap: 5,
                                                            border: `1px solid ${u.activo !== false ? "#fca5a5" : "#bbf7d0"}`,
                                                            color: u.activo !== false ? "#dc2626" : "#15803d",
                                                            background: "#fff", borderRadius: 7, padding: "6px 12px",
                                                            fontSize: 12, fontWeight: 600, cursor: "pointer",
                                                        }}
                                                    >
                                                        {u.activo !== false ? <UserX size={12} /> : <UserCheck size={12} />}
                                                        {u.activo !== false ? "Desactivar" : "Activar"}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <p style={{ margin: "16px 0 0", fontSize: 13, color: "#737373" }}>
                    Mostrando {filtrados.length} de {usuarios.length} usuario(s)
                </p>
            </div>

            {/* Modal crear/editar */}
            {showForm && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }} onClick={closeForm}>
                    <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, padding: 28, width: 400, maxWidth: "90%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{editando ? "Editar usuario" : "Nuevo usuario"}</h3>
                            <button onClick={closeForm} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color="#737373" /></button>
                        </div>

                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Nombre</label>
                        <input
                            type="text" value={form.nombre}
                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                            placeholder="Nombre completo"
                            style={{ ...inputBase, marginBottom: 14 }}
                        />

                        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Correo electrónico</label>
                        <input
                            type="email" value={form.correo}
                            onChange={(e) => setForm({ ...form, correo: e.target.value })}
                            placeholder="correo@ejemplo.com"
                            style={{ ...inputBase, marginBottom: 14 }}
                        />

                        {!editando && (
                            <>
                                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Contraseña</label>
                                <input
                                    type="password" value={form.contrasena}
                                    onChange={(e) => setForm({ ...form, contrasena: e.target.value })}
                                    placeholder="Mínimo 8 caracteres"
                                    style={{ ...inputBase, marginBottom: 14 }}
                                />
                            </>
                        )}

                        <button
                            onClick={handleSave}
                            disabled={saving || !form.nombre.trim() || !form.correo.trim() || (!editando && !form.contrasena)}
                            style={{
                                width: "100%", padding: "11px 0", borderRadius: 10, border: "none",
                                background: saving || !form.nombre.trim() || !form.correo.trim() || (!editando && !form.contrasena) ? "#e0e0e0" : "#7a2333",
                                color: saving || !form.nombre.trim() || !form.correo.trim() || (!editando && !form.contrasena) ? "#a3a3a3" : "#fff",
                                fontSize: 14, fontWeight: 700,
                                cursor: saving || !form.nombre.trim() || !form.correo.trim() || (!editando && !form.contrasena) ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            }}
                        >
                            {saving && <Loader2 size={15} className="animate-spin" />}
                            {saving ? "Guardando..." : editando ? "Guardar cambios" : "Crear usuario"}
                        </button>
                    </div>
                </div>
            )}

            {/* Modal resetear contraseña */}
            {resetPass && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }} onClick={() => { setResetPass(null); setNewPass(""); }}>
                    <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, padding: 28, width: 380, maxWidth: "90%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Resetear contraseña</h3>
                            <button onClick={() => { setResetPass(null); setNewPass(""); }} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={18} color="#737373" /></button>
                        </div>
                        <p style={{ margin: "0 0 14px", fontSize: 13.5, color: "#525252" }}>
                            Nueva contraseña para <strong>{resetPass.nombre}</strong>:
                        </p>
                        <div style={{ position: "relative", marginBottom: 18 }}>
                            <input
                                type={showPass ? "text" : "password"}
                                value={newPass}
                                onChange={(e) => setNewPass(e.target.value)}
                                placeholder="Mínimo 8 caracteres"
                                onKeyDown={(e) => { if (e.key === "Enter" && newPass.length >= 8) handleResetPass(); }}
                                autoFocus
                                style={{ ...inputBase, paddingRight: 38 }}
                            />
                            <button
                                onClick={() => setShowPass(!showPass)}
                                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}
                            >
                                {showPass ? <EyeOff size={16} color="#a3a3a3" /> : <Eye size={16} color="#a3a3a3" />}
                            </button>
                        </div>
                        <button
                            onClick={handleResetPass}
                            disabled={newPass.length < 8 || resetting}
                            style={{
                                width: "100%", padding: "11px 0", borderRadius: 10, border: "none",
                                background: newPass.length >= 8 && !resetting ? "#7a2333" : "#e0e0e0",
                                color: newPass.length >= 8 && !resetting ? "#fff" : "#a3a3a3",
                                fontSize: 14, fontWeight: 700,
                                cursor: newPass.length >= 8 && !resetting ? "pointer" : "not-allowed",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            }}
                        >
                            {resetting && <Loader2 size={15} className="animate-spin" />}
                            {resetting ? "Actualizando..." : "Actualizar contraseña"}
                        </button>
                    </div>
                </div>
            )}

            {/* Confirm toggle */}
            {confirmToggle && (
                <ConfirmDialog
                    titulo={confirmToggle.activo !== false ? "Desactivar usuario" : "Activar usuario"}
                    mensaje={confirmToggle.activo !== false
                        ? `¿Desactivar a "${confirmToggle.nombre}"? No podrá iniciar sesión hasta que se reactive.`
                        : `¿Reactivar a "${confirmToggle.nombre}"? Volverá a poder iniciar sesión.`
                    }
                    textoConfirmar={confirmToggle.activo !== false ? "Desactivar" : "Activar"}
                    colorConfirmar={confirmToggle.activo !== false ? "#dc2626" : "#15803d"}
                    onConfirmar={handleToggle}
                    onCancelar={() => setConfirmToggle(null)}
                />
            )}
        </>
    );
}

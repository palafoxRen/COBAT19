import { useState } from "react";
import { User, Lock, Info, ArrowLeft, BookOpen } from "lucide-react";
import { useAuth } from "../contexts/useAuth";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginResult, setLoginResult] = useState(null); // null | "success" | "error"
  const [errorMessage, setErrorMessage] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!correo.trim()) {
      newErrors.correo = "Ingresa tu usuario de bibliotecario.";
    }
    if (!contrasena) {
      newErrors.contrasena = "Ingresa tu contraseña.";
    } else if (contrasena.length < 8) {
      newErrors.contrasena = "La contraseña debe tener al menos 8 caracteres.";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    setLoginResult(null);
    setErrorMessage("");

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      const result = await login(correo, contrasena);
      if (result.success) {
        setLoginResult("success");
        setTimeout(() => navigate("/admin"), 1200);
      } else {
        setLoginResult("error");
        setErrorMessage(result.message || "Usuario o contraseña incorrectos.");
      }
    } catch {
      setLoginResult("error");
      setErrorMessage("Error al conectar con el servidor. Intenta mas tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background:
          "radial-gradient(circle at 15% 20%, rgba(107,33,168,0.06), transparent 40%), radial-gradient(circle at 85% 80%, rgba(107,33,168,0.05), transparent 40%), #fafafa",
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          width: "100%",
          padding: "32px 24px 0",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: 460 }}>
          {/* Regresar al portal */}
          <button
            type="button"
            onClick={() => window.history.back()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "none",
              border: "none",
              color: "#525252",
              fontSize: 14,
              cursor: "pointer",
              padding: "8px 0 24px",
              margin: "0 auto",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <ArrowLeft size={16} />
            Regresar al portal de alumnos
          </button>

          {/* Tarjeta principal */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 16,
              border: "1px solid #ececec",
              boxShadow:
                "0 1px 2px rgba(0,0,0,0.03), 0 8px 24px rgba(0,0,0,0.04)",
              padding: "40px 40px 32px",
            }}
          >
            {/* Icono */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "#7a2333",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BookOpen size={26} color="#ffffff" strokeWidth={2} />
              </div>
            </div>

            {/* Encabezado */}
            <h1
              style={{
                textAlign: "center",
                fontSize: 24,
                fontWeight: 700,
                color: "#171717",
                margin: "0 0 6px",
              }}
            >
              Acceso para bibliotecarios
            </h1>
            <p
              style={{
                textAlign: "center",
                fontSize: 14,
                color: "#737373",
                margin: "0 0 24px",
              }}
            >
              Bienvenido de nuevo a{" "}
              <span style={{ color: "#7a2333", fontWeight: 600 }}>
                Biblioteca COBAT 19
              </span>
            </p>

            <form onSubmit={handleSubmit} noValidate>
              {/* Usuario */}
              <label
                htmlFor="correo"
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: 0.3,
                  color: "#404040",
                  marginBottom: 6,
                  textTransform: "uppercase",
                }}
              >
                Usuario de bibliotecario
              </label>
              <div style={{ position: "relative", marginBottom: errors.correo ? 6 : 18 }}>
                <User
                  size={16}
                  color="#a3a3a3"
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
                <input
                  id="correo"
                  type="text"
                  value={correo}
                  onChange={(e) =>setCorreo(e.target.value)}
                  placeholder="Ingresa tu usuario"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px 12px 11px 38px",
                    borderRadius: 10,
                    border: `1px solid ${errors.correo ? "#dc2626" : "#e0e0e0"}`,
                    fontSize: 14,
                    color: "#171717",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#7a2333")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.correo ? "#dc2626" : "#e0e0e0")
                  }
                />
              </div>
              {errors.correo && (
                <p style={{ color: "#dc2626", fontSize: 12.5, margin: "0 0 14px" }}>
                  {errors.correo}
                </p>
              )}

              {/* Contraseña */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <label
                  htmlFor="contrasena"
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 0.3,
                    color: "#404040",
                    textTransform: "uppercase",
                  }}
                >
                  Contraseña
                </label>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  style={{ fontSize: 12.5, color: "#7a2333", textDecoration: "none" }}
                >
                  ¿Olvidó su contraseña?
                </a>
              </div>
              <div style={{ position: "relative", marginBottom: errors.contrasena ? 6 : 16 }}>
                <Lock
                  size={16}
                  color="#a3a3a3"
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
                <input
                  id="contrasena"
                  type="password"
                  autoComplete="new-password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="***********"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "11px 12px 11px 38px",
                    borderRadius: 10,
                    border: `1px solid ${errors.contrasena ? "#dc2626" : "#e0e0e0"}`,
                    fontSize: 14,
                    color: "#171717",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#7a2333")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.contrasena ? "#dc2626" : "#e0e0e0")
                  }
                />
              </div>
              {errors.contrasena && (
                <p style={{ color: "#dc2626", fontSize: 12.5, margin: "0 0 12px" }}>
                  {errors.contrasena}
                </p>
              )}

              {/* Mensaje de resultado */}
              {loginResult === "success" && (
                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    color: "#15803d",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
                Acceso concedido. Redirigiendo al panel...
                </div>
              )}
              {loginResult === "error" && (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: "#b91c1c",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
                  {errorMessage || "Usuario o contraseña incorrectos. Inténtalo de nuevo."}
                </div>
              )}

              {/* Botón Ingresar */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "13px 0",
                  borderRadius: 10,
                  border: "none",
                  background: loading ? "#a85a68" : "#6e1c28",
                  color: "#ffffff",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: loading ? "default" : "pointer",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.background = "#591620";
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.background = "#6e1c28";
                }}
              >
                {loading ? "Verificando..." : "Ingresar"}
              </button>
            </form>

            <div
              style={{
                borderTop: "1px solid #ececec",
                marginTop: 24,
                paddingTop: 18,
                display: "flex",
                gap: 8,
              }}
            >
              <Info size={16} color="#a3a3a3" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ margin: 0, fontSize: 12.5, color: "#737373", lineHeight: 1.5 }}>
                ¿Problemas para ingresar? Contacta al bibliotecario para posibles
                soluciones
              </p>
            </div>
          </div>

          <p
            style={{
              textAlign: "center",
              fontSize: 11,
              letterSpacing: 0.8,
              color: "#a3a3a3",
              fontWeight: 600,
              margin: "20px 0 32px",
              textTransform: "uppercase",
            }}
          >
            Propiedad del COBAT plantel 19
          </p>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid #ececec",
          padding: "18px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
            fontSize: 12.5,
            color: "#a3a3a3",
          }}
        >
          <span>© 2026 Biblioteca COBAT 19. Sistema de Gestión Bibliotecaria.</span>
          <span style={{ display: "flex", gap: 20 }}>
            <a href="/privacidad" style={{ color: "#a3a3a3", textDecoration: "none" }}>
              Política de privacidad
            </a>
            <a href="/terminos" style={{ color: "#a3a3a3", textDecoration: "none" }}>
              Términos y condiciones
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
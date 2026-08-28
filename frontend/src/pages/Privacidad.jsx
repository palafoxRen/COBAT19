import { Link } from "react-router-dom";
import { BookOpen, ArrowLeft } from "lucide-react";

export default function Privacidad() {
    return (
        <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", color: "#171717", background: "#ffffff", minHeight: "100vh" }}>
            <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: "1px solid #eee", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
                    <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#7a2333", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <BookOpen size={18} color="#fff" />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: 17, color: "#171717" }}>Biblioteca COBAT 19</span>
                    </Link>
                </div>
                <Link to="/" style={{ border: "1px solid #e3b7bd", color: "#7a2333", background: "#fff", borderRadius: 8, padding: "8px 18px", fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "none" }}>
                    Volver al inicio
                </Link>
            </header>

            <main style={{ maxWidth: 800, margin: "0 auto", padding: "32px 32px 64px" }}>
                <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#7a2333", fontWeight: 600, fontSize: 14, textDecoration: "none", marginBottom: 28 }}>
                    <ArrowLeft size={16} />
                    Volver
                </Link>

                <h1 style={{ fontSize: 30, fontWeight: 800, color: "#7a2333", margin: "0 0 8px" }}>Política de Privacidad</h1>
                <p style={{ fontSize: 13.5, color: "#a3a3a3", margin: "0 0 32px" }}>Última actualización: 24 de agosto de 2026</p>

                <div style={{ fontSize: 15, lineHeight: 1.8, color: "#404040" }}>
                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#171717", margin: "0 0 14px" }}>1. Información del responsable</h2>
                        <p style={{ margin: "0 0 10px" }}>
                            El Sistema de Gestión Bibliotecaria del <strong>Consejo de Bachillerato Plantel 19</strong> (en adelante, "el Sistema"), con domicilio en Xaloztoc, Tlaxcala, México, es responsable del tratamiento de los datos personales que se recaban a través de esta plataforma.
                        </p>
                        <p style={{ margin: 0 }}>
                            Contacto: <a href="mailto:plantel19@cobatlaxcala.edu.mx" style={{ color: "#7a2333" }}>plantel19@cobatlaxcala.edu.mx</a>
                        </p>
                    </section>

                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#171717", margin: "0 0 14px" }}>2. Datos personales recabados</h2>
                        <p style={{ margin: "0 0 10px" }}>El Sistema recaba únicamente los datos necesarios para su funcionamiento:</p>
                        <ul style={{ margin: "0 0 10px", paddingLeft: 24 }}>
                            <li><strong>Nombre completo</strong> del usuario bibliotecario.</li>
                            <li><strong>Correo electrónico</strong> institucional.</li>
                            <li><strong>Contraseña</strong> (almacenada de forma encriptada mediante bcrypt, no se almacena en texto plano).</li>
                            <li><strong>Rol</strong> dentro del Sistema (Administrador o Bibliotecario).</li>
                        </ul>
                        <p style={{ margin: 0 }}>
                            El Sistema <strong>no recaba</strong> datos biométricos, geolocalización, historial de navegación, ni datos financieros.
                        </p>
                    </section>

                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#171717", margin: "0 0 14px" }}>3. Finalidad del tratamiento</h2>
                        <p style={{ margin: "0 0 10px" }}>Los datos personales se utilizan exclusivamente para:</p>
                        <ul style={{ margin: 0, paddingLeft: 24 }}>
                            <li>Autenticar y autorizar el acceso al panel de administración del Sistema.</li>
                            <li>Gestionar el inventario bibliográfico (libros físicos y digitales).</li>
                            <li>Registrar y dar seguimiento a préstamos de material bibliográfico.</li>
                            <li>Generar reportes mensuales de actividad bibliotecaria.</li>
                            <li>Mantener un registro de acceso para fines de auditoría interna.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#171717", margin: "0 0 14px" }}>4. Consentimiento</h2>
                        <p style={{ margin: 0 }}>
                            Al iniciar sesión en el Sistema, el usuario acepta el tratamiento de sus datos personales conforme a esta Política de Privacidad. El consentimiento es otorgado de manera libre, informada y específica.
                        </p>
                    </section>

                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#171717", margin: "0 0 14px" }}>5. Conservación de datos</h2>
                        <p style={{ margin: 0 }}>
                            Los datos personales se conservarán mientras la cuenta del usuario se encuentre activa. Una vez que la cuenta sea desactivada, los datos serán eliminados o anonimizados en un plazo máximo de 30 días.
                        </p>
                    </section>

                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#171717", margin: "0 0 14px" }}>6. Medidas de seguridad</h2>
                        <p style={{ margin: "0 0 10px" }}>El Sistema implementa las siguientes medidas de protección:</p>
                        <ul style={{ margin: 0, paddingLeft: 24 }}>
                            <li>Contraseñas encriptadas con bcrypt (10 rondas de salt).</li>
                            <li>Autenticación basada en tokens JWT con expiración de 8 horas.</li>
                            <li>Comunicación cifrada mediante HTTPS en producción.</li>
                            <li>Consultas parametrizadas a la base de datos para prevenir inyección SQL.</li>
                            <li>Control de acceso basado en roles (RBAC) para operaciones privilegiadas.</li>
                            <li>Límite de intentos de acceso (rate limiting) para prevenir fuerza bruta.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#171717", margin: "0 0 14px" }}>7. Derechos ARCO</h2>
                        <p style={{ margin: "0 0 10px" }}>
                            Conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, los usuarios tienen derecho a:
                        </p>
                        <ul style={{ margin: "0 0 10px", paddingLeft: 24 }}>
                            <li><strong>Acceder</strong> a sus datos personales en posesión del Sistema.</li>
                            <li><strong>Rectificar</strong> datos inexactos o incompletos.</li>
                            <li><strong>Cancelar</strong> sus datos cuando considere que no están siendo tratados conforme a los principios y deberes establecidos.</li>
                            <li><strong>Oponerse</strong> al tratamiento de sus datos para finalidades específicas.</li>
                        </ul>
                        <p style={{ margin: 0 }}>
                            Para ejercer estos derechos, el usuario deberá enviar una solicitud al correo <a href="mailto:plantel19@cobatlaxcala.edu.mx" style={{ color: "#7a2333" }}>plantel19@cobatlaxcala.edu.mx</a> con su identificación vigente.
                        </p>
                    </section>

                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#171717", margin: "0 0 14px" }}>8. Transferencias de datos</h2>
                        <p style={{ margin: 0 }}>
                            El Sistema <strong>no realiza transferencias</strong> de datos personales a terceros, salvo en los casos previstos por la ley o cuando exista orden judicial. Los datos se almacenan en servidores localizados en la República Mexicana.
                        </p>
                    </section>

                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#171717", margin: "0 0 14px" }}>9. Uso de cookies</h2>
                        <p style={{ margin: 0 }}>
                            El Sistema <strong>no utiliza cookies</strong> de rastreo ni cookies de terceros. La sesión se mantiene únicamente mediante tokens almacenados localmente en el navegador del usuario (localStorage), los cuales se eliminan automáticamente al cerrar sesión.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#171717", margin: "0 0 14px" }}>10. Cambios en esta política</h2>
                        <p style={{ margin: 0 }}>
                            El COBAT 19 se reserva el derecho de modificar esta Política de Privacidad en cualquier momento. Los cambios serán publicados en esta misma página y serán efectivos a partir de su publicación. Se recomienda revisar esta página periódicamente.
                        </p>
                    </section>
                </div>
            </main>

            <footer style={{ borderTop: "1px solid #f0f0f0", padding: "20px 32px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, fontSize: 12.5, color: "#a3a3a3" }}>
                <span>2026 Biblioteca COBAT 19. Todos los derechos reservados.</span>
            </footer>
        </div>
    );
}

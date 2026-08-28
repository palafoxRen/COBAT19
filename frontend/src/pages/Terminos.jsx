import { Link } from "react-router-dom";
import { BookOpen, ArrowLeft } from "lucide-react";

export default function Terminos() {
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

                <h1 style={{ fontSize: 30, fontWeight: 800, color: "#7a2333", margin: "0 0 8px" }}>Términos y Condiciones de Uso</h1>
                <p style={{ fontSize: 13.5, color: "#a3a3a3", margin: "0 0 32px" }}>Última actualización: 24 de agosto de 2026</p>

                <div style={{ fontSize: 15, lineHeight: 1.8, color: "#404040" }}>
                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#171717", margin: "0 0 14px" }}>1. Aceptación de los términos</h2>
                        <p style={{ margin: 0 }}>
                            El acceso y uso del Sistema de Gestión Bibliotecaria del <strong>Consejo de Bachillerato Plantel 19</strong> (en adelante, "el Sistema") implica la aceptación plena de los presentes Términos y Condiciones. Si el usuario no está de acuerdo con alguno de estos términos, deberá abstenerse de utilizar el Sistema.
                        </p>
                    </section>

                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#171717", margin: "0 0 14px" }}>2. Descripción del servicio</h2>
                        <p style={{ margin: "0 0 10px" }}>El Sistema proporciona las siguientes funcionalidades:</p>
                        <ul style={{ margin: 0, paddingLeft: 24 }}>
                            <li><strong>Catálogo público:</strong> consulta del inventario bibliográfico (libros físicos y digitales) disponible para cualquier visitante.</li>
                            <li><strong>Panel de administración:</strong> gestión del inventario, registro de préstamos, generación de reportes y administración de usuarios, restringido a personal bibliotecario autenticado.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#171717", margin: "0 0 14px" }}>3. Uso permitido</h2>
                        <p style={{ margin: "0 0 10px" }}>El usuario se compromete a:</p>
                        <ul style={{ margin: 0, paddingLeft: 24 }}>
                            <li>Utilizar el Sistema únicamente para los fines académicos y administrativos para los que fue diseñado.</li>
                            <li>Mantener la confidencialidad de sus credenciales de acceso (correo y contraseña).</li>
                            <li>Notificar de manera inmediata al administrador sobre cualquier uso no autorizado de su cuenta.</li>
                            <li>No intentar acceder a áreas del Sistema para las que no tiene autorización.</li>
                            <li>No realizar acciones que puedan dañar, sobrecargar o comprometer la funcionalidad del Sistema.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#171717", margin: "0 0 14px" }}>4. Uso prohibido</h2>
                        <p style={{ margin: "0 0 10px" }}>Queda expresamente prohibido:</p>
                        <ul style={{ margin: 0, paddingLeft: 24 }}>
                            <li>Compartir credenciales de acceso con terceros.</li>
                            <li>Intentar vulnerar las medidas de seguridad del Sistema (inyección SQL, fuerza bruta, etc.).</li>
                            <li>Reproducir, distribuir o comercializar el contenido digital alojado en el Sistema sin autorización.</li>
                            <li>Utilizar robots, scrapers o automatizaciones para extraer datos del Sistema sin autorización expresa.</li>
                            <li>Suplantar la identidad de otro usuario o manipular registros de préstamo.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#171717", margin: "0 0 14px" }}>5. Préstamos de material</h2>
                        <p style={{ margin: "0 0 10px" }}>El registro de préstamos a través del Sistema se rige por las siguientes condiciones:</p>
                        <ul style={{ margin: 0, paddingLeft: 24 }}>
                            <li>El préstamo queda sujeto a la disponibilidad del material.</li>
                            <li>El usuario es responsable del material prestado y debe devolverlo en las condiciones en que lo recibió.</li>
                            <li>El incumplimiento en la devolución dentro del plazo establecido podrá resultar en la restricción temporal del acceso al Sistema.</li>
                            <li>El Sistema registrará automáticamente las fechas de préstamo y devolución.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#171717", margin: "0 0 14px" }}>6. Contenido digital</h2>
                        <p style={{ margin: "0 0 10px" }}>Los materiales digitales (PDFs) disponibles en el Sistema son exclusivamente para consulta académica interna. El usuario se compromete a:</p>
                        <ul style={{ margin: 0, paddingLeft: 24 }}>
                            <li>No redistribuir, revender o compartir los materiales digitales con personas ajenas al plantel.</li>
                            <li>No utilizar los materiales para fines comerciales.</li>
                            <li>Respetar los derechos de autor de los contenidos alojados.</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#171717", margin: "0 0 14px" }}>7. Aviso legal — Contenido subido por el usuario</h2>
                        <p style={{ margin: "0 0 10px" }}>
                            El Sistema permite a los bibliotecarios autorizados subir, modificar y eliminar materiales digitales (archivos PDF, imágenes de portada y metadatos asociados). Sobre este particular, se establece lo siguiente:
                        </p>
                        <ul style={{ margin: "0 0 10px", paddingLeft: 24 }}>
                            <li>
                                <strong>Responsabilidad exclusiva del bibliotecario:</strong> quien realice la subida de un título digital es el único responsable de que el material cumpla con las normas de derechos de autor, licencias de uso y legislación aplicable en materia de propiedad intelectual.
                            </li>
                            <li>
                                <strong>Veracidad de la información:</strong> el bibliotecario es responsable de la exactitud de los datos ingresados (título, autor, sinopsis, categoría) y de que estos correspondan fielmente al material registrado.
                            </li>
                            <li>
                                <strong>Contenido prohibido:</strong> queda estrictamente prohibido subir material que infrinja derechos de autor, contenido obsceno, difamatorio, o que viole la normatividad vigente. El bibliotecario que incursa en estas conductas asumirá las consecuencias legales correspondientes de manera personal.
                            </li>
                        </ul>
                        <p style={{ margin: "0 0 10px" }}>
                            <strong>Descargo de responsabilidad del Sistema y del COBAT 19:</strong> el Consejo de Bachillerato Plantel 19, el Sistema y sus desarrolladores <strong>no asumen ninguna responsabilidad</strong> por el contenido digital subido por los bibliotecarios. La publicación de materiales a través del Sistema no implica endoso, garantía ni aval por parte del plantel sobre la legalidad, originalidad o idoneidad del contenido alojado.
                        </p>
                        <p style={{ margin: 0 }}>
                            El COBAT 19 se reserva el derecho de retirar, sin previo aviso, cualquier material que considere que viola estos términos o la legislación aplicable, sin que ello genere derecho a compensación alguna para el usuario que lo publicó.
                        </p>
                    </section>

                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#171717", margin: "0 0 14px" }}>8. Disponibilidad del servicio</h2>
                        <p style={{ margin: 0 }}>
                            El COBAT 19 se esforzará por mantener el Sistema disponible de manera continua. No obstante, se reserva el derecho de realizar mantenimiento programadas, suspender temporalmente el servicio por razones técnicas o de seguridad, sin que ello genere derecho a compensación alguna para los usuarios.
                        </p>
                    </section>

                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#171717", margin: "0 0 14px" }}>9. Limitación de responsabilidad</h2>
                        <p style={{ margin: 0 }}>
                            El COBAT 19 no será responsable por daños directos o indirectos derivados del uso del Sistema, incluyendo pero no limitado a: pérdida de datos, interrupciones del servicio, errores en el contenido del catálogo o acceso no autorizado a cuenta de usuarios por descuido en el manejo de credenciales.
                        </p>
                    </section>

                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#171717", margin: "0 0 14px" }}>10. Propiedad intelectual</h2>
                        <p style={{ margin: 0 }}>
                            El diseño, código fuente y estructura del Sistema son propiedad del COBAT 19. Queda prohibida su reproducción total o parcial sin autorización expresa. Los contenidos bibliográficos (títulos, autores, portadas) son propiedad de sus respectivos autores y editores.
                        </p>
                    </section>

                    <section style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#171717", margin: "0 0 14px" }}>11. Modificaciones</h2>
                        <p style={{ margin: 0 }}>
                            El COBAT 19 se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones serán publicadas en esta página y entrarán en vigor a partir de su publicación. El uso continuado del Sistema después de dichas modificaciones constituirá la aceptación de las mismas.
                        </p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#171717", margin: "0 0 14px" }}>12. Legislación aplicable</h2>
                        <p style={{ margin: 0 }}>
                            Para la interpretación y cumplimiento de estos Términos y Condiciones, las partes se someten a las leyes vigentes en los Estados Unidos Mexicanos y a la jurisdicción de los tribunales competentes en el estado de Tlaxcala, renunciando expresamente a cualquier otro fuero que pudiera corresponderles por razón de domicilio presente o futuro.
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

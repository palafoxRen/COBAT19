import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({ titulo, mensaje, onConfirmar, onCancelar, textoConfirmar = "Confirmar", colorConfirmar = "#7a2333" }) {
    return (
        <div
            onClick={onCancelar}
            style={{
                position: "fixed", inset: 0, zIndex: 999,
                background: "rgba(0,0,0,0.45)",
                display: "flex", alignItems: "center", justifyContent: "center",
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#fff", borderRadius: 14, padding: 28,
                    maxWidth: 380, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#fdeceb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <AlertTriangle size={18} color="#dc2626" />
                    </div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{titulo}</h3>
                </div>
                <p style={{ margin: "0 0 20px", fontSize: 13.5, color: "#525252", lineHeight: 1.5 }}>{mensaje}</p>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button
                        onClick={onCancelar}
                        style={{
                            padding: "9px 18px", borderRadius: 9, border: "1px solid #e0e0e0",
                            background: "#fff", color: "#525252", fontSize: 13, fontWeight: 600, cursor: "pointer",
                        }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirmar}
                        style={{
                            padding: "9px 18px", borderRadius: 9, border: "none",
                            background: colorConfirmar, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                        }}
                    >
                        {textoConfirmar}
                    </button>
                </div>
            </div>
        </div>
    );
}

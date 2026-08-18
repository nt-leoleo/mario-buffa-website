import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {

    // Solo aceptar POST
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Método no permitido"
        });
    }

    try {

        const { name, email, phone, message } = req.body;

        // Validaciones
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "El email es obligatorio"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "El email no es válido"
            });
        }

        // Enviar email
        const { error } = await resend.emails.send({
            from: "Mario Buffa <contacto@mariobuffa.com.ar>",
            to: [
                "pederneraleonardo.tec@gmail.com",
                "mariofbuffa@gmail.com"
            ],
            subject: `Nuevo contacto de ${name || "Visitante"}`,
            replyTo: email,

            html: `
                <h2>Nuevo mensaje desde la web</h2>

                <p>
                    <strong>Nombre:</strong>
                    ${name || "No especificado"}
                </p>

                <p>
                    <strong>Email:</strong>
                    ${email}
                </p>

                <p>
                    <strong>Teléfono:</strong>
                    ${phone || "No especificado"}
                </p>

                <p>
                    <strong>Mensaje:</strong>
                </p>

                <p>
                    ${message || "Sin mensaje"}
                </p>
            `
        });

        if (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message: "No se pudo enviar el email"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Email enviado correctamente"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
}
import React from 'react';


export default function OrderSuccess({ onNavigateHome}) {

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
            <div className="bg-green-100 p-4 rounded-full mb-6">
                <span className="text-6xl">🎉</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">
                ¡Pedido realizado con éxito!
            </h1>

            <p className="text-gray-600 max-w-md mb-8">
                Hemos recibido tu pago correctamente. Te hemos enviado un correo de confirmación (simulado).
                Ya puedes disfrutar de tu música.
            </p>

            <div className="space-x-4">
                <button
                    onClick={onNavigateHome}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                    Volver al inicio
                </button>

                {/* Más adelante aquí pondremos el botón de "Ver mis pedidos" o "Descargar Factura" */}
                <button
                    onClick={() => alert("Próximamente: Historial de pedidos")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Ver mis pedidos
                </button>
            </div>
        </div>
    );
}
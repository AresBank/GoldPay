import React, { useState } from 'react';
import { ShieldAlert, BookOpen, ArrowLeft, Mail, Info, Landmark, Check, Copy, FileText, CheckCircle2 } from 'lucide-react';

export default function UserAgreementPage() {
  const [copiedLink, setCopiedLink] = useState(false);
  const agreementUrl = typeof window !== 'undefined' ? `${window.location.origin}/agreement` : 'https://ais-pre-4ajxx26adfuicmj4f44uqc-58404444105.us-east1.run.app/agreement';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(agreementUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Agreement Top Banner */}
      <header className="border-b border-slate-900 bg-[#0c1220]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl font-bold border border-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <span className="font-sans font-bold text-white text-sm tracking-tight uppercase">Gold Payments Bank</span>
              <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold leading-none mt-0.5">Acuerdo de Usuario / User Agreement</p>
            </div>
          </div>

          <a
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-all hover:bg-slate-850 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al Portal STP
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-4 py-8 md:py-12 space-y-8 select-text">
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 via-indigo-500 to-amber-500" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 text-left">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight font-sans">
                Acuerdo de Usuario Términos de Servicio STP y PayPal
              </h1>
              <p className="text-xs text-slate-400 mt-1 font-mono uppercase tracking-wider">
                Última actualización: 20 de mayo de 2026
              </p>
            </div>
            
            {/* Shareable Link Helper for verification */}
            <div className="shrink-0">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Enlace Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copiar Enlace de Acuerdo
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="bg-amber-500/5 border border-amber-500/15 p-4 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed text-left">
              <p className="font-bold text-amber-400 mb-1">Requirements & Compliance Notice:</p>
              Este documento rige la relación de uso comercial, técnico y legal para la solución Express Checkout y el panel transaccional implementado en la aplicación corporativa registrada como <strong>Activation_App</strong>. Por favor, lea cuidadosamente antes de continuar con la rotación de claves en productivo.
            </div>
          </div>

          {/* Document Sections */}
          <div className="space-y-6 text-left">
            <section className="space-y-2 font-sans">
              <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                1. Aceptación del Acuerdo de Usuario
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed pl-3.5">
                Al utilizar el portal de pruebas habilitado de <strong>Gold Payments Bank</strong> y operar la integración de la API para la aplicación <strong>Activation_App</strong>, usted acepta y se compromete a cumplir de forma vinculante los términos de este Acuerdo de Usuario. Si no está de acuerdo con cualquiera de las condiciones estipuladas, le sugerimos suspender de inmediato el uso del sistema de pruebas bancario y desconectar sus credenciales SDK de Braintree.
              </p>
            </section>

            <section className="space-y-2 font-sans">
              <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                2. Uso Compartido del Sandbox STP y Procesamiento PayPal
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed pl-3.5">
                Este sistema provee un ambiente de simulación operacional de STP (Sistema de Transferencias y Pagos) y Express Checkout de PayPal para verificar la conciliación de órdenes. Usted se compromete a:
              </p>
              <ul className="list-disc list-inside text-xs text-slate-400 space-y-1.5 pl-7">
                <li>Utilizar únicamente cuentas de prueba de Sandbox facilitadas por el administrador o su desarrollador asignado.</li>
                <li>No procesar transacciones bancarias reales en canales destinados a pruebas tecnológicas.</li>
                <li>Hacer un correcto resguardo de las credenciales de ID de Cliente y Claves Secretas del portal.</li>
              </ul>
            </section>

            <section className="space-y-2 font-sans">
              <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                3. Responsabilidades de Seguridad en Activation_App
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed pl-3.5">
                La seguridad de las API Keys y tokens de acceso vinculados recae por entero sobre el administrador de la cuenta. El usuario reconoce que:
              </p>
              <ul className="list-disc list-inside text-xs text-slate-400 space-y-1.5 pl-7">
                <li>La rotación de los secrets de forma periódica disminuye vulnerabilidades de interceptación.</li>
                <li>El uso por parte de personal ajeno al área de sistemas corporativos de <strong>GoldPaymentsBank@goldpayments.mx</strong> no está recomendado.</li>
                <li>Cualquier movimiento fraudulento que surja por compartir indebidamente las claves será reportado ante el oficial de soporte tecnológico.</li>
              </ul>
            </section>

            <section className="space-y-2 font-sans">
              <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                4. Limitación de Responsabilidad y Garantías
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed pl-3.5">
                Al tratarse de operaciones bajo un simulador con cuentas SIPRES y STP de prueba, <strong>Gold Payments Bank</strong> no asume responsabilidad civil, mercantil o administrativa por fallos en las pasarelas externas de PayPal. La disponibilidad del SDK de Braintree se sujeta a las condiciones generales de servicio publicadas por el grupo PayPal en su sitio oficial.
              </p>
            </section>

            <section className="space-y-2 font-sans">
              <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                5. Contacto Legal y Soporte
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed pl-3.5">
                Para cualquier aclaración, interpretación legal de este acuerdo o revocación del acceso transaccional, puede redactar una solicitud formal a la cuenta designada del holding tecnológico: <a href="mailto:buenooscar619@gmail.com" className="text-indigo-400 hover:underline font-mono font-bold">buenooscar619@gmail.com</a>. Las respuestas se emiten con un plazo máximo de 72 horas hábiles.
              </p>
            </section>
          </div>

          {/* Institutional Trust Seal */}
          <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-amber-500" />
              <span>Entidad de Pruebas Tecnológicas Licenciada</span>
            </div>
            <span>ID de Control: STP-GOLD-APP-2026-AGREEMENT</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#090d16] py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; 2026 Gold Payments Bank S.A. de C.V. Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <a href="/" className="hover:text-slate-300 transition-colors">Portal Principal</a>
            <span className="text-slate-800">|</span>
            <a href="/privacy" className="hover:text-slate-300 transition-colors">Aviso de Privacidad</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

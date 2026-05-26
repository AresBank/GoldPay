import React, { useState } from 'react';
import { ShieldCheck, FileText, ArrowLeft, Mail, Info, Landmark, Check, Copy } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const [copiedLink, setCopiedLink] = useState(false);
  const privacyUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-4ajxx26adfuicmj4f44uqc-58404444105.us-east1.run.app/privacy';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(privacyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Policy Top Banner */}
      <header className="border-b border-slate-900 bg-[#0c1220]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-amber-500/10 text-amber-500 rounded-xl font-bold border border-amber-500/20">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <span className="font-sans font-bold text-white text-sm tracking-tight uppercase">Gold Payments Bank</span>
              <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold leading-none mt-0.5">Control de Privacidad Oficial</p>
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
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-amber-500 to-indigo-500" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 text-left">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight font-sans">
                Política de Privacidad Integral
              </h1>
              <p className="text-xs text-slate-405 mt-1 font-mono uppercase tracking-wider">
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
                    Copiar Enlace de Privacidad
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="bg-indigo-500/5 border border-indigo-500/15 p-4 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-350 leading-relaxed text-left">
              <p className="font-bold text-slate-200 mb-1">Nota de Cumplimiento de Integración (PayPal Developer App Audit):</p>
              Esta política ha sido estructurada de conformidad con los lineamientos de privacidad exigidos para el uso de credenciales de API en modo Productivo del SDK de Braintree y PayPal Checkout dentro de la aplicación autorizada <strong>Activation_App</strong>.
            </div>
          </div>

          {/* Document Sections */}
          <div className="space-y-6 text-left">
            <section className="space-y-2">
              <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                1. Identidad del responsable del tratamiento de los datos
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed pl-3.5">
                La plataforma <strong>Gold Payments Bank</strong>, en colaboración con el agregador configurado bajo el nombre de registro de aplicación <strong>Activation_App</strong>, actúa como el Responsable legal del tratamiento de sus datos personales. Para cualquier aclaración o solicitud relacionada con este aviso, puede ponerse en contacto con nuestro oficial de protección de datos vía correo electrónico a <a href="mailto:buenooscar619@gmail.com" className="text-indigo-400 hover:underline font-mono font-bold">buenooscar619@gmail.com</a>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                2. Datos de carácter personal recabados
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed pl-3.5">
                Para habilitar las funciones bancarias de dispersión SPEI en modo Sandbox y simulaciones de Express Checkout automatizadas, recopilamos y procesamos de forma estrictamente confidencial los siguientes datos:
              </p>
              <ul className="list-disc list-inside text-xs text-slate-400 space-y-1.5 pl-7">
                <li>Información de contacto nominativa de titulares (Nombre completo, firma o iniciales).</li>
                <li>Dirección de correo electrónico configurada por el desarrollador u operador corporativo (<code className="bg-[#090d16] text-[#ffbe1a] px-1 py-0.5 rounded text-[11px] font-mono font-bold">GoldPaymentsBank@goldpayments.mx</code> o su análogo de contacto).</li>
                <li>Identificadores de transacciones bancarias, CLABEs STP de 18 dígitos y registros de transacciones ledger asociadas a los saldos vinculados de cuentas de Plaid Sandbox.</li>
                <li>Credenciales de integración y tokens temporales como el <strong>Braintree Access Token</strong> (<code className="bg-[#090d16] text-slate-200 px-1 py-0.5 rounded text-[11px] font-mono break-all">access_token$production$hb5cwb75y9rf5f82$...</code>) y credenciales de cliente del SDK.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                3. Finalidades principales de uso de los datos
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed pl-3.5">
                Utilizamos los datos suministrados única y exclusivamente para los siguientes propósitos operativos:
              </p>
              <ul className="list-disc list-inside text-xs text-slate-400 space-y-1.5 pl-7">
                <li>Establecer conexiones seguras cliente-servidor con los endpoints de la API de PayPal para el procesamiento de pagos transaccionales de facturas.</li>
                <li>Verificar los flujos automáticos de confirmación por Webhooks e iniciar la dispersión correspondiente en el ledger STP homologado corporativo tras recibir un retorno de transacción exitoso de PayPal.</li>
                <li>Proveer una consola de auditoría para que los oficiales de cumplimiento verifiquen, roten y actualicen firmemente los secrets y Client IDs sin exponerlos a clientes públicos.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                4. Seguridad y resguardo de la información
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed pl-3.5">
                Todo el tráfico que maneja nuestra plataforma viaja encriptado vía protocolos seguros SSL/TLS (HTTPS). Las credenciales críticas, como secrets de API y access tokens del SDK de Braintree, se resguardan en variables de entorno del servidor o estructuras de almacenamiento interno cifrado con nula exposición a interfaces de navegador de terceros. No compartimos, vendemos, ni alquilamos su información bajo ninguna circunstancia a redes de publicidad o anunciantes.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                5. Ejercicio de Derechos ARCO y revocación del consentimiento
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed pl-3.5">
                Usted posee el derecho inalienable de acceder, rectificar, cancelar u oponerse (Derechos ARCO) al procesamiento de cualquiera de los datos personales almacenados en la plataforma. De igual manera, puede revocar en cualquier momento el consentimiento otorgado previamente para la vinculación bancaria. Para iniciar una solicitud, por favor envíe un correo detallado a <a href="mailto:buenooscar619@gmail.com" className="text-indigo-400 hover:underline font-mono font-bold">buenooscar619@gmail.com</a> y nuestro equipo procesará la solicitud en un término menor a 48 horas hábiles.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xs font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                6. Cambios a este Aviso de Privacidad
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed pl-3.5">
                Este aviso de privacidad podrá ser modificado periódicamente para adaptarlo a nuevas reglamentaciones financieras de la CNBV, adiciones en el entorno del Sandbox de STP o normativas internacionales de protección de datos de PayPal. Cualquier modificación será publicada directamente en este espacio y se notificará colocando una advertencia en el banner informativo de la aplicación.
              </p>
            </section>
          </div>

          {/* Institutional Trust Seal */}
          <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-amber-500" />
              <span>Entidad de Pruebas Tecnológicas Licenciada</span>
            </div>
            <span>ID de Control: STP-GOLD-APP-2026-PRIV</span>
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
            <span className="text-slate-405">Términos del STP Sandbox</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

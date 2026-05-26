import React, { useState, useEffect, useRef } from 'react';
import { BankAccount, User } from '../types';
import { Send, CheckCircle2, ShieldAlert, ArrowRight, ArrowLeftRight, CreditCard, Landmark, Copy, Check, ExternalLink, Settings, RefreshCw, AlertCircle, Key, Plus, Trash2, Eye, EyeOff, Lock, Edit3, Mail, BookOpen, FileText } from 'lucide-react';

interface TransferTabProps {
  accounts: BankAccount[];
  token: string;
  user: User;
  onRefreshBalances: () => void;
}

export default function TransferTab({ accounts, token, user, onRefreshBalances }: TransferTabProps) {
  const [senderClabe, setSenderClabe] = useState(accounts[0]?.clabe || '');
  const [receiverClabe, setReceiverClabe] = useState('');
  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [reference, setReference] = useState(() => String(Math.floor(100000 + Math.random() * 899999)));
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successReceipt, setSuccessReceipt] = useState<any | null>(null);

  // PayPal Resolver States
  const [activeSubTab, setActiveSubTab] = useState<'spei' | 'paypal'>('spei');
  const [paypalUrl, setPaypalUrl] = useState('https://www.paypal.com/invoice/p/#RVTG3GWV6BHHQRE3');
  const [isResolving, setIsResolving] = useState(false);
  const [payloadInvoice, setPayloadInvoice] = useState<any | null>(null);
  const [paypalError, setPaypalError] = useState('');
  const [showDesktopAlert, setShowDesktopAlert] = useState(true);

  // PayPal Developer / App Profile Configuration State
  const [paypalAppName, setPaypalAppName] = useState('Activation_App');
  const [isEditingAppName, setIsEditingAppName] = useState(false);
  const [tempAppName, setTempAppName] = useState('Activation_App');

  const [paypalKeys, setPaypalKeys] = useState<{ id: string; label: string; clientId: string; secretKey: string; isSecretVisible: boolean; }[]>(() => [
    {
      id: 'key-1',
      label: 'Secret key 1',
      clientId: 'Ad07maJ_rBoBWRn1zpJwGje-BXY5rjUxwcoLr6LB4FN4al_0y7tzTVhs3YHgSiJ_R7rnC3t05CTmCSiR',
      secretKey: 'EJYq6O_9mOjCmf8jrGWnUZb_uSTgQzCIxpbArG_eNuNJWRHdSRiEGfZZCSe16mBBoOXkpWxANzA57dtJ',
      isSecretVisible: false
    },
    {
      id: 'key-2',
      label: 'Secret key 2',
      clientId: 'Ad07maJ_rBoBWRn1zpJwGje-BXY5rjUxwcoLr6LB4FN4al_0y7tzTVhs3YHgSiJ_R7rnC3t05CTmCSiR',
      secretKey: 'EPeD-75SPzNsH-U5eJnxVCjFWnm4qR1oUpo0syv1hdFn3Bj4kCQNnaJqY9rbC26bjoidpTV0GYK2HX1d',
      isSecretVisible: false
    }
  ]);
  
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [newKeyLabel, setNewKeyLabel] = useState('Secret key 3');
  const [newClientId, setNewClientId] = useState('');
  const [newSecretKey, setNewSecretKey] = useState('');
  const [keyCopiedId, setKeyCopiedId] = useState<string | null>(null);

  // PayPal Classic API Signature Credentials State
  const [credentialsType, setCredentialsType] = useState<'rest' | 'classic'>('rest');
  const [apiUsername, setApiUsername] = useState('buenooscar619_api1.gmail.com');
  const [apiPassword, setApiPassword] = useState('KA9QQDV5784CSPSK');
  const [apiSignature, setApiSignature] = useState('ARPQu2A.OrjatTBUhCPx1H0-wCK2AUkEZ55b-iurL0FJxYmhmEnw0Tfp');
  const [apiSignatureRequestDate, setApiSignatureRequestDate] = useState('25 de agosto de 2022, 10:43:45 p.m. GMT-5');
  
  const [isApiPasswordVisible, setIsApiPasswordVisible] = useState(false);
  const [isApiSignatureVisible, setIsApiSignatureVisible] = useState(false);
  const [isEditingClassicCredentials, setIsEditingClassicCredentials] = useState(false);
  
  const [tempApiUsername, setTempApiUsername] = useState('buenooscar619_api1.gmail.com');
  const [tempApiPassword, setTempApiPassword] = useState('KA9QQDV5784CSPSK');
  const [tempApiSignature, setTempApiSignature] = useState('ARPQu2A.OrjatTBUhCPx1H0-wCK2AUkEZ55b-iurL0FJxYmhmEnw0Tfp');
  const [tempApiRequestDate, setTempApiRequestDate] = useState('25 de agosto de 2022, 10:43:45 p.m. GMT-5');

  // Braintree SDK & Integration Guide states
  const [braintreeAccessToken, setBraintreeAccessToken] = useState('access_token$production$hb5cwb75y9rf5f82$badbb64ccea7725de13d7d55f5efaff0');
  const [isBraintreeTokenVisible, setIsBraintreeTokenVisible] = useState(false);
  const [isEditingBraintree, setIsEditingBraintree] = useState(false);
  const [tempBraintreeToken, setTempBraintreeToken] = useState('access_token$production$hb5cwb75y9rf5f82$badbb64ccea7725de13d7d55f5efaff0');
  const [developerEmail, setDeveloperEmail] = useState('GoldPaymentsBank@goldpayments.mx');
  const [isSendingGuide, setIsSendingGuide] = useState(false);
  const [guideSentMessage, setGuideSentMessage] = useState<string | null>(null);

  // PayPal SDK Checkout States
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutAmount, setCheckoutAmount] = useState('85.00');
  const [checkoutConcept, setCheckoutConcept] = useState('Licencias de Seguridad Web & STP API Integration');
  const [selectedKeyForCheckout, setSelectedKeyForCheckout] = useState('key-1');
  const [checkoutStatusBanner, setCheckoutStatusBanner] = useState<{ type: 'success' | 'cancel' | 'error'; message: string } | null>(null);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutBuyerEmail, setCheckoutBuyerEmail] = useState('buenooscar619@gmail.com');
  const [checkoutBuyerPassword, setCheckoutBuyerPassword] = useState('••••••••••••');

  // Handler to initiate PayPal Express Checkout process
  const handleInitiateCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStatusBanner(null);
    setIsCheckoutModalOpen(true);
  };

  // Callback on successful checkout approval (onApprove)
  const handleCheckoutApprove = async () => {
    setIsProcessingCheckout(true);
    try {
      const amtUSD = parseFloat(checkoutAmount) || 85.00;
      const txId = 'PAY' + String(Math.floor(100000 + Math.random() * 899999));
      
      // Hit the real backend webhook to log payment and credit bank accounts
      const response = await fetch('/api/webhooks/paypal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amountUSD: amtUSD,
          tx: txId,
          invoiceId: 'RVTG3GWV6BHHQRE3'
        })
      });

      await response.json();
      onRefreshBalances(); // reload accounts

      // Display approved state, then trigger redirect URL
      setTimeout(() => {
        setIsProcessingCheckout(false);
        setIsCheckoutModalOpen(false);

        // Notify client side of successful onApprove execution
        setCheckoutStatusBanner({
          type: 'success',
          message: `✓ onApprove Callback Ejecutado con Éxito. ID de Transacción PayPal: ${txId}.`
        });

        // Safe redirection to return URL with queries
        try {
          const urlObj = new URL(customReturnUrl);
          urlObj.searchParams.set('payment', 'success');
          urlObj.searchParams.set('tx', txId);
          urlObj.searchParams.set('amt', String(amtUSD));
          urlObj.searchParams.set('merchant_id', 'STP_GOLD');
          
          if (typeof window !== 'undefined') {
            // Auto redirect after a brief 2 seconds notice so the user can see the callback state
            setTimeout(() => {
              window.location.href = urlObj.toString();
            }, 2000);
          }
        } catch (err) {
          if (typeof window !== 'undefined') {
            setTimeout(() => {
              window.location.href = `${customReturnUrl}&payment=success&tx=${txId}&amt=${amtUSD}`;
            }, 2000);
          }
        }
      }, 1500);

    } catch (err: any) {
      setIsProcessingCheckout(false);
      setCheckoutStatusBanner({
        type: 'error',
        message: `❌ Error durante el onApprove: ${err.message}`
      });
    }
  };

  // Callback on cancel during checkout (onCancel)
  const handleCheckoutCancel = () => {
    setIsCheckoutModalOpen(false);
    setCheckoutStatusBanner({
      type: 'cancel',
      message: '⚠️ onCancel Callback Ejecutado. El proceso de pago Express Checkout fue suspendido por el usuario.'
    });
  };

  // Callback on backend or SDK communication failures (onError)
  const handleCheckoutError = () => {
    setIsCheckoutModalOpen(false);
    setCheckoutStatusBanner({
      type: 'error',
      message: '❌ onError Callback Ejecutado. Fallo de autenticación de credenciales de PayPal SDK.'
    });
  };

  const handleSendIntegrationGuide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!developerEmail.trim()) return;
    setIsSendingGuide(true);
    setGuideSentMessage(null);
    setTimeout(() => {
      setIsSendingGuide(false);
      setGuideSentMessage(`¡Guía de integración de Express Checkout enviada exitosamente a ${developerEmail.trim()}! Se han adjuntado los fragmentos de configuración del SDK de Braintree.`);
    }, 1200);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setKeyCopiedId(id);
    setTimeout(() => {
      setKeyCopiedId(null);
    }, 2000);
  };

  const handleToggleSecretVisible = (id: string) => {
    setPaypalKeys(prev => prev.map(k => k.id === id ? { ...k, isSecretVisible: !k.isSecretVisible } : k));
  };

  const handleDeleteKey = (id: string) => {
    setPaypalKeys(prev => prev.filter(k => k.id !== id));
  };

  const handleAddKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientId.trim() || !newSecretKey.trim()) return;
    const newKeyObj = {
      id: 'key-' + Date.now(),
      label: newKeyLabel || `Key ${paypalKeys.length + 1}`,
      clientId: newClientId.trim(),
      secretKey: newSecretKey.trim(),
      isSecretVisible: false
    };
    setPaypalKeys(prev => [...prev, newKeyObj]);
    setIsAddingKey(false);
    // Reset inputs
    setNewKeyLabel(`Secret key ${paypalKeys.length + 2}`);
    setNewClientId('');
    setNewSecretKey('');
  };

  // Dynamic App Environment URL loaded from backend configuration (.env)
  const [appUrl, setAppUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://ais-pre-4ajxx26adfuicmj4f44uqc-58404444105.us-east1.run.app';
  });

  // Auto-Redirect System Configuration State
  const [isAutoRedirectOn, setIsAutoRedirectOn] = useState(true);
  const [customReturnUrl, setCustomReturnUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/?payment=success&merchant_id=STP_GOLD`;
    }
    return 'https://ais-pre-4ajxx26adfuicmj4f44uqc-58404444105.us-east1.run.app/?payment=success&merchant_id=STP_GOLD';
  });

  // Load configuration from .env via backend API
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/config');
        const data = await response.json();
        if (data.appUrl) {
          setAppUrl(data.appUrl);
          setCustomReturnUrl(`${data.appUrl}/?payment=success&merchant_id=STP_GOLD`);
        }
      } catch (err) {
        console.warn('Could not load environment configuration via API:', err);
      }
    };
    loadConfig();
  }, []);

  const [copied, setCopied] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const countdownTimerRef = useRef<any | null>(null);

  // Countdown controller effect
  useEffect(() => {
    if (redirectCountdown !== null) {
      if (redirectCountdown > 0) {
        countdownTimerRef.current = setTimeout(() => {
          setRedirectCountdown(prev => (prev !== null ? prev - 1 : null));
        }, 1000);
      } else {
        // Run final redirection
        triggerRedirect();
      }
    }
    return () => {
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current);
      }
    };
  }, [redirectCountdown]);

  const triggerRedirect = () => {
    const rc = successReceipt;
    if (!rc) return;
    try {
      const urlObj = new URL(customReturnUrl);
      urlObj.searchParams.set('payment', 'success');
      urlObj.searchParams.set('tx', rc.claveRastreo || rc.id || 'TX_STP_GOLD');
      urlObj.searchParams.set('amt', String(rc.amount || '0.00'));
      urlObj.searchParams.set('concept', rc.concept || 'SPEI STP Transfer');
      urlObj.searchParams.set('ref', rc.reference || '');
      urlObj.searchParams.set('merchant_id', 'STP_GOLD');
      
      if (typeof window !== 'undefined') {
        window.location.href = urlObj.toString();
      }
    } catch (e) {
      // Direct routing if URL object parsing failed (e.g. malformed link input)
      if (typeof window !== 'undefined') {
        window.location.href = customReturnUrl;
      }
    }
  };

  const getRedirectUrl = () => {
    return customReturnUrl;
  };

  const [copiedWebhookType, setCopiedWebhookType] = useState<'paypal' | 'stp' | null>(null);

  const getWebhookUrl = (type: 'paypal' | 'stp') => {
    return `${appUrl}/api/webhooks/${type}`;
  };

  const handleCopyWebhook = (type: 'paypal' | 'stp') => {
    navigator.clipboard.writeText(getWebhookUrl(type));
    setCopiedWebhookType(type);
    setTimeout(() => setCopiedWebhookType(null), 2000);
  };

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(customReturnUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateReturn = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      try {
        const urlObj = new URL(customReturnUrl);
        urlObj.searchParams.set('payment', 'success');
        urlObj.searchParams.set('tx', 'PAY' + String(Math.floor(100000 + Math.random() * 900000)));
        urlObj.searchParams.set('amt', '85.00');
        urlObj.searchParams.set('merchant_id', 'STP_GOLD');
        window.location.href = urlObj.toString();
      } catch (err) {
        window.location.href = `${window.location.origin}/?payment=success&tx=PAY881023&amt=85.00`;
      }
    }
  };

  // Quick select STP Mother account (646180308561442581) as target
  const handleQuickSTPMother = () => {
    setReceiverClabe('646180308561442581');
    setConcept('Depósito STP Cuenta Madre');
  };

  const handleResolvePaypal = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaypalError('');
    setIsResolving(true);
    setPayloadInvoice(null);
    try {
      const res = await fetch('/api/paypal/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: paypalUrl })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo resolver el enlace de PayPal');
      }
      setPayloadInvoice(data);
    } catch (err: any) {
      setPaypalError(err.message);
    } finally {
      setIsResolving(false);
    }
  };

  const handlePayPaypal = async () => {
    if (!payloadInvoice) return;
    setIsLoading(true);
    setErrorMsg('');

    // Validate that senderClabe is owned by user or is Mother account if admin
    const isUserAccount = accounts.some(a => a.clabe === senderClabe);
    const isAdminMother = user.role === 'ADMIN' && senderClabe === '646180308561442581';

    if (!isUserAccount && !isAdminMother) {
      setErrorMsg('La cuenta de origen elegida no es válida o no está autorizada para este usuario');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          senderClabe,
          receiverClabe: '646180309999999993', // Gen PayPal generic CLABE
          amount: payloadInvoice.amountMXN,
          concept: `Liquidación Factura PayPal ${payloadInvoice.invoiceId}`,
          reference: reference
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al liquidar balance de PayPal');
      }

      const receiptObj = {
        ...data.transaction,
        claveRastreo: 'PAY' + String(Math.floor(100000000000 + Math.random() * 899999999999)),
        bankName: 'PayPal de México S. de R.L.'
      };
      setSuccessReceipt(receiptObj);

      setPayloadInvoice((prev: any) => ({ ...prev, status: 'PAGADO' }));
      onRefreshBalances();

      if (isAutoRedirectOn) {
        setRedirectCountdown(5);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessReceipt(null);

    const amtNum = parseFloat(amount);
    if (!amtNum || amtNum <= 0) {
      setErrorMsg('El monto debe ser un número superior a 0');
      return;
    }

    // Validate target CLABE: exactly 18 numeric digits
    const numericClabePattern = /^\d{18}$/;
    if (!numericClabePattern.test(receiverClabe)) {
      setErrorMsg('La CLABE de destino ingresada debe tener exactamente 18 dígitos numéricos');
      return;
    }

    // Validate selected sender CLABE: must belong to the user's accounts, or be the STP mother account if admin
    const isUserAccount = accounts.some(a => a.clabe === senderClabe);
    const isAdminMother = user.role === 'ADMIN' && senderClabe === '646180308561442581';

    if (!isUserAccount && !isAdminMother) {
      setErrorMsg('La cuenta de origen elegida no es válida o no está autorizada para este usuario');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          senderClabe,
          receiverClabe,
          amount: amtNum,
          concept: concept.trim() || 'SPEI STP Transfer',
          reference: reference
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Fallo en la liquidación SPEI');
      }

      // Success! Set receipt
      const receiptObj = {
        ...data.transaction,
        claveRastreo: 'STP' + String(Math.floor(100000000000 + Math.random() * 899999999999)),
        bankName: receiverClabe.startsWith('646') ? 'Sistema de Transferencias y Pagos STP (646)' : 'Banco Receptor Homologado'
      };
      setSuccessReceipt(receiptObj);

      // Refresh parent balances
      onRefreshBalances();

      // Clear input fields (except sender)
      setAmount('');
      setConcept('');
      setReceiverClabe('');
      setReference(String(Math.floor(100000 + Math.random() * 899999)));

      if (isAutoRedirectOn) {
        setRedirectCountdown(5);
      }

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Safe variables
  const activeSender = accounts.find(a => a.clabe === senderClabe);

  return (
    <div id="transfer-tab" className="space-y-6">

      {/* Mobile-to-Desktop Suggestion Alert */}
      {showDesktopAlert && (
        <div id="desktop-warning-alert" className="bg-[#1e1b4b]/40 border border-indigo-500/30 p-4 rounded-xl flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 shrink-0">
              <Settings className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                ¡Integraciones Activas! <span className="px-1.5 py-0.5 bg-emerald-500/10 text-[8px] text-emerald-400 tracking-wide uppercase font-extrabold rounded">Get Started vailable!</span>
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                <strong>Our dashboard works best on desktop:</strong> If something isn’t working on mobile, try switching to a desktop computer.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowDesktopAlert(false)}
            className="text-[10px] font-bold text-slate-400 hover:text-white px-2.5 py-1.5 bg-[#090d16] hover:bg-[#131d35] border border-slate-800 rounded-lg cursor-pointer transition-colors shrink-0"
          >
            close alert
          </button>
        </div>
      )}
      
      {/* Sub-Tabs Selector Header */}
      <div className="flex bg-[#0f172a] border border-slate-800 p-1 rounded-xl w-full sm:w-max">
        <button
          onClick={() => { setActiveSubTab('spei'); setSuccessReceipt(null); }}
          className={`flex-1 sm:flex-initial px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeSubTab === 'spei' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'text-slate-400 hover:text-white'}`}
        >
          Dispersión SPEI Estándar
        </button>
        <button
          onClick={() => { setActiveSubTab('paypal'); setSuccessReceipt(null); }}
          className={`flex-1 sm:flex-initial px-5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeSubTab === 'paypal' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
        >
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Cobros & Enlaces PayPal
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Form Module */}
        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl shadow-lg space-y-5">
          {activeSubTab === 'spei' ? (
            <>
              <div>
                <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-amber-500" /> Nueva Dispersión SPEI STP
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Liquidación atómica inmediata. Red única de cuentas CLABE STP.</p>
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-950/40 border border-red-500/40 text-red-200 text-xs rounded-xl flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleTransfer} className="space-y-4">
                
                {/* Sender Account */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">Cuenta Emisora (Origen)</label>
                  <select
                    value={senderClabe}
                    onChange={(e) => setSenderClabe(e.target.value)}
                    className="w-full bg-[#131d35] border border-slate-755 rounded-xl px-4 py-2.5 text-sm text-slate-200"
                  >
                    {/* Standard Accounts belonging to the user */}
                    {accounts.map(a => (
                      <option key={a.id} value={a.clabe}>
                        {a.name} - Bal: ${a.balance.toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN ({a.bankName.split(' ')[0]})
                      </option>
                    ))}
                    {/* Admin Mode allows choosing STP Mother Account directly as Emisor */}
                    {user.role === 'ADMIN' && (
                      <option value="646180308561442581">
                        [ADMIN] STP Cuenta Madre Activa - Bal: $2,450,750+ MXN
                      </option>
                    )}
                  </select>
                  {activeSender && (
                    <div className="mt-1.5 text-[10px] text-slate-505 font-mono">
                      CLABE: {activeSender.clabe} • Banco: {activeSender.bankName}
                    </div>
                  )}
                </div>

                {/* Target CLABE */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">CLABE Interbancaria (18 dígitos)</label>
                    <button
                      type="button"
                      onClick={handleQuickSTPMother}
                      className="text-[10px] text-amber-500 hover:underline hover:text-amber-400"
                    >
                      Conectar con Cuenta Madre STP
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={18}
                    value={receiverClabe}
                    onChange={(e) => setReceiverClabe(e.target.value.replace(/\D/g, ''))}
                    placeholder="ej. 646180308561442581"
                    className="w-full bg-[#131d35] border border-slate-755 rounded-xl px-4 py-2.5 text-sm text-slate-200 font-mono tracking-widest placeholder-slate-600"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5 font-sans">Monto a Transferir (MXN)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">$</span>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#131d35] border border-slate-755 rounded-xl pl-8 pr-12 py-2.5 text-sm text-slate-100 font-mono"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">MXN</span>
                  </div>
                </div>

                {/* Concept & Reference */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">Concepto</label>
                    <input
                      type="text"
                      required
                      maxLength={30}
                      value={concept}
                      onChange={(e) => setConcept(e.target.value)}
                      placeholder="ej. Pago Factura"
                      className="w-full bg-[#131d35] border border-slate-755 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">Referencia Numérica</label>
                    <input
                      type="text"
                      required
                      maxLength={7}
                      value={reference}
                      onChange={(e) => setReference(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-[#131d35] border border-slate-755 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#090d16] font-bold rounded-xl shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50 text-sm mt-3"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Autorizar Envío SPEI
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            // PayPal Mode
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Resolutor & Liquidador PayPal
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Ingresa cualquier enlace o URL de cobro PayPal para obtener balances interbancarios precisos y liquidarlos al instante con tu saldo STP.</p>
              </div>

              {/* URL de Redireccionamiento Automático Card (Configurable for all transactions) */}
              <div id="paypal-redirect-info-card" className="bg-[#131d35]/30 border border-indigo-500/15 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Configuración de Retorno del Cliente</span>
                  </div>
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-[9px] text-indigo-400 font-bold border border-indigo-500/20 rounded uppercase">
                    Multitransacción
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-normal">
                  Define la URL para redirigir automáticamente a tus clientes de manera exitosa tras concretar cualquier tipo de abono o liquidación interbancaria.
                </p>

                {/* Automation Toggler Switch */}
                <div className="flex justify-between items-center bg-[#090d16]/75 p-3 rounded-xl border border-slate-800/60">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-200">Redirección Automática Externa</span>
                    <span className="text-[10px] text-slate-400">Redirige en 5 segundos con parámetros de pago</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAutoRedirectOn(!isAutoRedirectOn);
                      setRedirectCountdown(null);
                    }}
                    className={`relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isAutoRedirectOn ? 'bg-indigo-600' : 'bg-slate-800'}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isAutoRedirectOn ? 'translate-x-4.5' : 'translate-x-0'}`}
                    />
                  </button>
                </div>

                {/* Return URL Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Dirección de Retorno o Callback (URL de tu tienda)</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customReturnUrl}
                      onChange={(e) => {
                        setCustomReturnUrl(e.target.value);
                        setRedirectCountdown(null);
                      }}
                      className="flex-1 bg-[#090d16] border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handleCopyUrl}
                      className="px-3 py-2 bg-[#131d35] hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 border border-slate-800"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-amber-400/90 leading-tight">
                    * Users are redirected to this URL after live transactions. Allow up to three hours for the change to take effect.
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-slate-800/50">
                  <span className="text-[10px] text-slate-500">¿Deseas probar el flujo de redirección?</span>
                  <button
                    onClick={handleSimulateReturn}
                    style={{ cursor: 'pointer' }}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 underline transition-colors"
                  >
                    Probar regreso de cliente &rarr;
                  </button>
                </div>
              </div>

              {/* PayPal API Credentials Card */}
              <div id="paypal-api-credentials-card" className="bg-[#131d35]/30 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Credenciales de API PayPal</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-[9px] text-emerald-400 font-bold border border-emerald-500/20 rounded uppercase">
                    Conectado
                  </span>
                </div>

                {/* Account eligibility live transactions notice */}
                <div className="bg-amber-500/10 border border-amber-500/25 p-3 rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-amber-300 leading-normal">
                    <p className="text-slate-300 text-xs font-bold mb-0.5">Eligibility Notice</p>
                    Note that not all features are available for live transactions. Features available for live transactions are listed in your account eligibility.
                  </div>
                </div>

                {/* Rotating secrets advice */}
                <div className="bg-[#090d16]/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                    <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>API credentials</span>
                  </div>
                  <div className="text-[11px] text-slate-400 leading-normal">
                    <strong>Important:</strong> Keep your app secure! Rotate client secrets regularly, store credentials safely, and never share client IDs or secrets publicly.
                  </div>
                </div>

                {/* Display App Name (Editable) */}
                <div className="bg-[#090d16]/50 p-3 rounded-xl border border-slate-800/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Nombre de la Aplicación (Display Name)</span>
                    {!isEditingAppName && (
                      <button
                        type="button"
                        onClick={() => {
                          setTempAppName(paypalAppName);
                          setIsEditingAppName(true);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" /> Editar
                      </button>
                    )}
                  </div>
                  {isEditingAppName ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempAppName}
                        onChange={(e) => setTempAppName(e.target.value)}
                        className="flex-1 bg-[#090d16] border border-indigo-500/50 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tempAppName.trim()) {
                            setPaypalAppName(tempAppName.trim());
                          }
                          setIsEditingAppName(false);
                        }}
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingAppName(false)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm font-bold text-white tracking-wide font-sans">
                      {paypalAppName}
                    </div>
                  )}
                </div>

                {/* Sub-Tabs Selector */}
                <div className="flex border-b border-slate-800/80 my-1">
                  <button
                    type="button"
                    onClick={() => setCredentialsType('rest')}
                    className={`flex-1 pb-2 text-[11px] font-bold transition-all border-b-2 text-center cursor-pointer ${
                      credentialsType === 'rest' 
                        ? 'border-indigo-500 text-indigo-300 font-extrabold' 
                        : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-800'
                    }`}
                  >
                    API REST (Client ID)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCredentialsType('classic')}
                    className={`flex-1 pb-2 text-[11px] font-bold transition-all border-b-2 text-center cursor-pointer ${
                      credentialsType === 'classic' 
                        ? 'border-indigo-500 text-indigo-300 font-extrabold' 
                        : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-800'
                    }`}
                  >
                    Firma de API (Clásica)
                  </button>
                </div>

                {credentialsType === 'classic' ? (
                  <div className="space-y-3.5 pt-1">
                    <div className="bg-[#090d16]/75 p-3.5 rounded-xl border border-slate-800/80 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-indigo-400" /> Credencial de Firma de API
                        </span>
                        {!isEditingClassicCredentials ? (
                          <button
                            type="button"
                            onClick={() => {
                              setTempApiUsername(apiUsername);
                              setTempApiPassword(apiPassword);
                              setTempApiSignature(apiSignature);
                              setTempApiRequestDate(apiSignatureRequestDate);
                              setIsEditingClassicCredentials(true);
                            }}
                            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" /> Editar
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setApiUsername(tempApiUsername);
                                setApiPassword(tempApiPassword);
                                setApiSignature(tempApiSignature);
                                setApiSignatureRequestDate(tempApiRequestDate);
                                setIsEditingClassicCredentials(false);
                              }}
                              className="text-emerald-400 hover:text-emerald-355 text-[10px] font-bold cursor-pointer"
                            >
                              Guardar
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsEditingClassicCredentials(false)}
                              className="text-slate-400 hover:text-slate-300 text-[10px] cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Request Date Field */}
                      <div className="space-y-1">
                        <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Fecha de solicitud</span>
                        {isEditingClassicCredentials ? (
                          <input
                            type="text"
                            value={tempApiRequestDate}
                            onChange={(e) => setTempApiRequestDate(e.target.value)}
                            className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-mono focus:outline-none"
                          />
                        ) : (
                          <div className="text-[11px] text-slate-300 font-mono pl-0.5">
                            {apiSignatureRequestDate}
                          </div>
                        )}
                      </div>

                      {/* API Username Field */}
                      <div className="space-y-1">
                        <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Nombre de usuario de API</span>
                        {isEditingClassicCredentials ? (
                          <input
                            type="text"
                            value={tempApiUsername}
                            onChange={(e) => setTempApiUsername(e.target.value)}
                            className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-mono focus:outline-none"
                          />
                        ) : (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              readOnly
                              value={apiUsername}
                              className="flex-1 bg-[#0b0f19] border border-slate-850 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-300 font-mono focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => copyToClipboard(apiUsername, 'classic-username')}
                              className="p-1.5 bg-slate-850 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-755 cursor-pointer shrink-0"
                            >
                              {keyCopiedId === 'classic-username' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* API Password Field */}
                      <div className="space-y-1">
                        <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Contraseña de API</span>
                        {isEditingClassicCredentials ? (
                          <input
                            type="text"
                            value={tempApiPassword}
                            onChange={(e) => setTempApiPassword(e.target.value)}
                            className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 font-mono focus:outline-none"
                          />
                        ) : (
                          <div className="flex gap-2">
                            <input
                              type={isApiPasswordVisible ? "text" : "password"}
                              readOnly
                              value={apiPassword}
                              className="flex-1 bg-[#0b0f19] border border-slate-850 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-300 font-mono tracking-wider focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setIsApiPasswordVisible(!isApiPasswordVisible)}
                              className="p-1.5 bg-slate-850 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-755 cursor-pointer shrink-0"
                            >
                              {isApiPasswordVisible ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(apiPassword, 'classic-password')}
                              className="p-1.5 bg-[#131d35] hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-800 cursor-pointer shrink-0"
                            >
                              {keyCopiedId === 'classic-password' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* API Signature Field */}
                      <div className="space-y-1">
                        <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Firma de API / Signature</span>
                        {isEditingClassicCredentials ? (
                          <textarea
                            rows={2}
                            value={tempApiSignature}
                            onChange={(e) => setTempApiSignature(e.target.value)}
                            className="w-full bg-[#0b0f19] border border-slate-805 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none resize-none"
                          />
                        ) : (
                          <div className="flex gap-2">
                            <input
                              type={isApiSignatureVisible ? "text" : "password"}
                              readOnly
                              value={apiSignature}
                              className="flex-1 bg-[#0b0f19] border border-slate-850 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-300 font-mono tracking-wide focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setIsApiSignatureVisible(!isApiSignatureVisible)}
                              className="p-1.5 bg-slate-850 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-755 cursor-pointer shrink-0"
                            >
                              {isApiSignatureVisible ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(apiSignature, 'classic-signature')}
                              className="p-1.5 bg-[#131d35] hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-800 cursor-pointer shrink-0"
                            >
                              {keyCopiedId === 'classic-signature' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#101726]/40 p-3 rounded-xl border border-indigo-500/10 text-[10px] text-indigo-300 leading-relaxed text-left flex gap-2">
                      <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div>
                        <strong>Carritos preconfigurados:</strong> Copie y pegue el nombre de usuario, la contraseña y la firma de API en la configuración del carrito de compras (ej. WooCommerce, WHMCS) o en la pantalla de administración de sus integraciones personalizadas.
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Keys List */}
                    <div className="space-y-3">
                      {paypalKeys.map((k) => (
                        <div key={k.id} className="bg-[#090d16]/75 p-3.5 rounded-xl border border-slate-800/80 space-y-2.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 text-indigo-400" /> {k.label}
                            </span>
                            {paypalKeys.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteKey(k.id)}
                                className="text-red-400 hover:text-red-300 text-[10px] font-semibold flex items-center gap-0.5 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" /> Eliminar
                              </button>
                            )}
                          </div>

                          {/* Client ID field */}
                          <div className="space-y-1">
                            <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Client ID</span>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                readOnly
                                value={k.clientId}
                                className="flex-1 bg-[#0b0f19] border border-slate-850 rounded-lg px-2 py-1 text-[10px] text-slate-300 font-mono focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => copyToClipboard(k.clientId, `${k.id}-client`)}
                                className="p-1.5 bg-slate-850 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-755 cursor-pointer"
                                title="Copiar Client ID"
                              >
                                {keyCopiedId === `${k.id}-client` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* Secret Key field */}
                          <div className="space-y-1">
                            <span className="block text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Secret Key</span>
                            <div className="flex gap-2 font-mono">
                              <input
                                type={k.isSecretVisible ? "text" : "password"}
                                readOnly
                                value={k.secretKey}
                                className="flex-1 bg-[#0b0f19] border border-slate-850 rounded-lg px-2 py-1 text-[10px] text-slate-300 font-mono tracking-wider focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleToggleSecretVisible(k.id)}
                                className="p-1.5 bg-slate-850 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-755 cursor-pointer"
                                title={k.isSecretVisible ? "Ocultar Secret" : "Mostrar Secret"}
                              >
                                {k.isSecretVisible ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(k.secretKey, `${k.id}-secret`)}
                                className="p-1.5 bg-[#131d35] hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-800 cursor-pointer"
                                title="Copiar Secret Key"
                              >
                                {keyCopiedId === `${k.id}-secret` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Second Key Inline Form */}
                    {isAddingKey ? (
                      <form onSubmit={handleAddKeySubmit} className="bg-[#090d16]/45 p-4 border border-indigo-500/20 rounded-xl space-y-3 animate-fade-in text-left">
                        <h5 className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5" /> Agregar Nueva Clave
                        </h5>

                        <div className="space-y-1">
                          <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider text-left">Etiqueta Key</label>
                          <input
                            type="text"
                            required
                            placeholder="ej. Secret key 2"
                            value={newKeyLabel}
                            onChange={(e) => setNewKeyLabel(e.target.value)}
                            className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider text-left">Client ID</label>
                          <input
                            type="text"
                            required
                            placeholder="Ingresa Client ID de PayPal"
                            value={newClientId}
                            onChange={(e) => setNewClientId(e.target.value)}
                            className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider text-left">Secret Key</label>
                          <input
                            type="password"
                            required
                            placeholder="Ingresa Secret Key de PayPal"
                            value={newSecretKey}
                            onChange={(e) => setNewSecretKey(e.target.value)}
                            className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                          />
                        </div>

                        <div className="flex gap-2 pt-1.5">
                          <button
                            type="submit"
                            className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            Guardar Clave
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsAddingKey(false)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsAddingKey(true)}
                        className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Second Key
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Webhook URLs Configuration Card */}
              <div id="paypal-webhooks-card" className="bg-[#131d35]/30 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-emerald-400 rotate-animation" />
                    <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">Servidor de Webhooks en Tiempo Real</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-[9px] text-emerald-400 font-bold border border-emerald-500/20 rounded uppercase">
                    Escuchando
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-normal">
                  Copia y pega estas direcciones en la sección de Webhooks de tu panel de desarrollador de PayPal o STP para que nuestro servidor reciba y acredite de manera instantánea los fondos a tu balance.
                </p>

                <div className="space-y-3">
                  {/* PayPal Webhook Entry */}
                  <div className="bg-[#090d16]/75 p-3 rounded-xl border border-slate-800/60 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Webhook de PayPal (Abonos)</span>
                      <span className="text-[9px] text-[#818cf8]/80 font-mono bg-[#818cf8]/10 px-1.5 py-0.5 rounded">POST</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={getWebhookUrl('paypal')}
                        className="flex-1 bg-[#0b0f19] border border-slate-850 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 font-mono focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopyWebhook('paypal')}
                        className="px-3 py-1.5 bg-[#131d35] hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center transition-all cursor-pointer border border-slate-800 shrink-0"
                      >
                        {copiedWebhookType === 'paypal' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* STP Webhook Entry */}
                  <div className="bg-[#090d16]/75 p-3 rounded-xl border border-slate-800/60 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Webhook de STP (Créditos / Abonos SPEI)</span>
                      <span className="text-[9px] text-[#f59e0b]/80 font-mono bg-[#f59e0b]/10 px-1.5 py-0.5 rounded">POST</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={getWebhookUrl('stp')}
                        className="flex-1 bg-[#0b0f19] border border-slate-850 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 font-mono focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopyWebhook('stp')}
                        className="px-3 py-1.5 bg-[#131d35] hover:bg-slate-700 text-white rounded-lg text-xs font-bold flex items-center transition-all cursor-pointer border border-slate-800 shrink-0"
                      >
                        {copiedWebhookType === 'stp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 bg-[#101726]/40 p-2.5 rounded-xl border border-indigo-500/10 text-[10px] text-indigo-300 leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span>
                    <strong>Sugerencia de Simulación:</strong> Puedes enviar peticiones <code>POST</code> con payloads JSON de cobro a estas de manera externa para ver cómo se liquidan automáticamente tus saldos en tiempo real sin salir de tu panel.
                  </span>
                </div>
              </div>

              {/* Braintree SDK Credentials Card */}
              <div id="braintree-sdk-credentials-card" className="bg-[#131d35]/30 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider font-sans">Credenciales del SDK de Braintree</span>
                  </div>
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-[9px] text-indigo-400 font-bold border border-indigo-500/20 rounded uppercase">
                    Checkout SDK
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-normal text-left">
                  Necesitará las credenciales del SDK cuando sea el momento de lanzar la funcionalidad <strong>Express Checkout</strong> en su sitio web.
                </p>

                {/* Braintree Token Display */}
                <div className="bg-[#090d16]/75 p-3.5 rounded-xl border border-slate-800/85 space-y-2 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                      <Lock className="w-3 h-3 text-indigo-400" /> token de acceso (Access Token)
                    </span>
                    {!isEditingBraintree ? (
                      <button
                        type="button"
                        onClick={() => {
                          setTempBraintreeToken(braintreeAccessToken);
                          setIsEditingBraintree(true);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" /> Editar
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setBraintreeAccessToken(tempBraintreeToken);
                            setIsEditingBraintree(false);
                          }}
                          className="text-emerald-400 hover:text-emerald-355 text-[10px] font-bold cursor-pointer"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingBraintree(false)}
                          className="text-slate-400 hover:text-slate-300 text-[10px] cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditingBraintree ? (
                    <textarea
                      rows={2}
                      value={tempBraintreeToken}
                      onChange={(e) => setTempBraintreeToken(e.target.value)}
                      className="w-full bg-[#0b0f19] border border-indigo-500/50 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none resize-none"
                    />
                  ) : (
                    <div className="flex gap-1.5">
                      <input
                        type={isBraintreeTokenVisible ? "text" : "password"}
                        readOnly
                        value={braintreeAccessToken}
                        className="flex-1 bg-[#0b0f19] border border-slate-850 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-300 font-mono tracking-wider focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setIsBraintreeTokenVisible(!isBraintreeTokenVisible)}
                        className="p-1.5 bg-slate-850 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-755 cursor-pointer shrink-0"
                        title={isBraintreeTokenVisible ? "Ocultar" : "Mostrar"}
                      >
                        {isBraintreeTokenVisible ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(braintreeAccessToken, 'braintree-token')}
                        className="p-1.5 bg-[#131d35] hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-800 cursor-pointer shrink-0"
                        title="Copiar SDK Access Token"
                      >
                        {keyCopiedId === 'braintree-token' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Email Integration Guide Form */}
                <div className="border-t border-slate-800/80 pt-4 space-y-3 text-left">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-200 uppercase tracking-wide">¿Cómo se integra Express Checkout?</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-normal">
                    Siga los pasos que se indican en la guía de integración para agregar PayPal a su sitio web. Envíe la guía de integración por correo electrónico a su desarrollador o a usted mismo.
                  </p>

                  <form onSubmit={handleSendIntegrationGuide} className="space-y-2">
                    <label className="block text-[9px] text-slate-500 uppercase tracking-widest font-semibold">
                      Ingresar dirección de correo electrónico
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-2 w-3.5 h-3.5 text-slate-500" />
                        <input
                          type="email"
                          required
                          value={developerEmail}
                          onChange={(e) => setDeveloperEmail(e.target.value)}
                          placeholder="desarrollador@tuempresa.mx"
                          className="w-full bg-[#0b0f19] border border-slate-800 rounded-xl pl-8.5 pr-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-sans"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSendingGuide}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10 cursor-pointer disabled:opacity-55 transition-all shrink-0"
                      >
                        {isSendingGuide ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            Enviar Guía
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {guideSentMessage && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] rounded-xl leading-relaxed flex items-start gap-2 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{guideSentMessage}</span>
                    </div>
                  )}

                  {/* Interfaz de Pruebas de Express Checkout */}
                  <div className="border-t border-slate-800/80 pt-4 mt-2 space-y-4 text-left">
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-bold text-amber-500 uppercase tracking-wide">Prueba de Integración: PayPal Express Checkout</span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      Utilice este simulador para verificar las credenciales del SDK de Braintree y el Client ID configurados. Al hacer clic en el botón de pago con PayPal, se desplegará el portal seguro de Sandbox para liquidar la orden de manera simulada y probar callbacks del SDK.
                    </p>

                    {checkoutStatusBanner && (
                      <div className={`p-3 text-xs rounded-xl flex items-start gap-2 animate-fade-in ${
                        checkoutStatusBanner.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                        checkoutStatusBanner.type === 'cancel' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                        'bg-red-500/10 border border-red-500/20 text-red-100'
                      }`}>
                        {checkoutStatusBanner.type === 'success' ? <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-emerald-400" /> : <AlertCircle className={`w-4.5 h-4.5 shrink-0 ${checkoutStatusBanner.type === 'cancel' ? 'text-amber-400' : 'text-red-400'}`} />}
                        <span>{checkoutStatusBanner.message}</span>
                      </div>
                    )}

                    <div className="bg-[#090d16]/45 p-4 rounded-xl border border-slate-800/80 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {/* Selector de Clave API a Probar */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                            API Client ID en uso:
                          </label>
                          <select
                            value={selectedKeyForCheckout}
                            onChange={(e) => setSelectedKeyForCheckout(e.target.value)}
                            className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                          >
                            {paypalKeys.map((k) => (
                              <option key={k.id} value={k.id}>
                                {k.label} (...{k.clientId.substring(k.clientId.length - 12)})
                              </option>
                            ))}
                            <option value="braintree">
                              Token Braintree (...{braintreeAccessToken.substring(braintreeAccessToken.length - 12)})
                            </option>
                          </select>
                        </div>

                        {/* Monto de Prueba */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                            Monto a Cobrar (USD):
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-slate-500 text-xs">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={checkoutAmount}
                              onChange={(e) => setCheckoutAmount(e.target.value)}
                              className="w-full bg-[#0b0f19] border border-slate-800 rounded-lg pl-6 pr-14 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                            />
                            <span className="absolute right-3 top-2 text-slate-500 text-[10px] font-bold font-mono">USD</span>
                          </div>
                        </div>
                      </div>

                      {/* Botón Core PayPal Button - Pill Style Oficial */}
                      <div className="pt-2 flex flex-col items-center">
                        <button
                          type="button"
                          onClick={handleInitiateCheckout}
                          className="w-full max-w-[280px] py-2 px-6 bg-[#ffc439] hover:bg-[#f2ba36] text-slate-900 font-sans font-black rounded-full text-xs shadow-lg shadow-[#ffc439]/10 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1 border-none outline-none tracking-tight"
                        >
                          {/* Símbolo de PayPal imitando logo oficial */}
                          <svg className="w-4 h-4 mr-0.5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 5.5C19 3.01 17 1 14.5 1H6c-.55 0-1 .45-1 1v17c0 .55.45 1 1 1h3.5c.55 0 1-.45 1-1v-4.5h4c2.49 0 4.5-2.01 4.5-4.5V5.5zm-5.5 8h-4v-4.5h4c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5z" />
                          </svg>
                          <span style={{ fontWeight: 900 }}>PayPal</span>
                          <span className="font-normal italic text-[11px] text-indigo-900 ml-1">Checkout</span>
                        </button>
                        <span className="text-[9px] text-slate-500 font-sans tracking-wide mt-2">
                          Tecnología Express Checkout certificada Sandbox
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Privacy & User Agreement Links Referral */}
                  <div className="border-t border-slate-800/40 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 font-sans">
                    <span>Cumplimiento Legal y Enlaces del Portal</span>
                    <div className="flex flex-wrap items-center gap-3.5">
                      <a
                        href="/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        Aviso de Privacidad
                      </a>
                      <span className="text-slate-800 hidden sm:inline">|</span>
                      <a
                        href="/agreement"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        Acuerdo de Usuario
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {paypalError && (
                <div className="p-4 bg-red-950/40 border border-red-500/40 text-red-200 text-xs rounded-xl">
                  {paypalError}
                </div>
              )}

              {errorMsg && (
                <div className="p-4 bg-red-950/40 border border-red-500/40 text-red-200 text-xs rounded-xl">
                  {errorMsg}
                </div>
              )}

              {/* URL Parser Form */}
              <form onSubmit={handleResolvePaypal} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide mb-1.5">Enlace de Cobro / Factura PayPal</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      required
                      value={paypalUrl}
                      onChange={(e) => setPaypalUrl(e.target.value)}
                      placeholder="https://www.paypal.com/invoice/p/#..."
                      className="flex-1 bg-[#131d35] border border-slate-755 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono"
                    />
                    <button
                      type="submit"
                      disabled={isResolving}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {isResolving ? 'Buscando...' : 'Buscar'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Presiona "Buscar" para simular la descarga directa del ledger de liquidación de PayPal.</p>
                </div>
              </form>

              {/* Resolved Invoice Box */}
              {payloadInvoice && (
                <div className="border border-slate-800 bg-[#131d35]/40 rounded-xl p-4 space-y-4 animate-fade-in">
                  
                  {/* Merchant header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-0.5 bg-indigo-500/25 border border-indigo-500/30 text-[9px] font-bold text-indigo-400 rounded-full uppercase">
                        PayPal Secure Merchant
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1.5">{payloadInvoice.merchant}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-505 font-mono">Factura ID</p>
                      <p className="text-xs font-bold font-mono text-slate-300">{payloadInvoice.invoiceId}</p>
                    </div>
                  </div>

                  {/* Pricing table representation */}
                  <div className="bg-[#0b0f19] rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Concepto de pago:</span>
                      <span className="text-white font-semibold text-right max-w-[200px] truncate">{payloadInvoice.concept}</span>
                    </div>
                    <div className="flex justify-between text-xs border-t border-slate-800/60 pt-1.5">
                      <span className="text-slate-400">Importe Original USD:</span>
                      <span className="text-white font-mono font-semibold">${payloadInvoice.amountUSD.toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between text-xs border-t border-slate-800/60 pt-1.5">
                      <span className="text-slate-400">Tasa de Conversión STP:</span>
                      <span className="text-white font-mono text-[11px]">${payloadInvoice.exchangeRate.toFixed(2)} MXN/USD</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t border-indigo-500/10 pt-2 text-indigo-400">
                      <span>Total Adeudado en Pesos:</span>
                      <span className="font-mono text-white">${payloadInvoice.amountMXN.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 leading-relaxed italic bg-indigo-950/20 p-2.5 rounded border border-indigo-950/40">
                    "{payloadInvoice.notes}"
                  </div>

                  {/* STP Sender select inside the box */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Debitar de mi Cuenta STP:</label>
                    <select
                      value={senderClabe}
                      onChange={(e) => setSenderClabe(e.target.value)}
                      className="w-full bg-[#0b0f19] border border-slate-755 rounded-lg px-3 py-2 text-xs text-slate-300"
                    >
                      {accounts.map(a => (
                        <option key={a.id} value={a.clabe}>
                          {a.name} - ${a.balance.toLocaleString('es-MX', { maximumFractionDigits: 2 })} MXN
                        </option>
                      ))}
                    </select>
                  </div>

                  {payloadInvoice.status === 'PAGADO' ? (
                    <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-center text-xs font-bold text-emerald-400">
                      ✓ FACTURA LIQUIDADA TOTALMENTE
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePayPaypal}
                      disabled={isLoading}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-emerald-950/30 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Landmark className="w-3.5 h-3.5" /> Pagar Factura
                        </>
                      )}
                    </button>
                  )}

                </div>
              )}
            </div>
          )}
        </div>

        {/* Dynamic SPEI / CEPROBAN Receipt viewer */}
        <div className="bg-[#0f172a] border border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-lg relative min-h-[360px]">
          {successReceipt ? (
            <div className="space-y-4 animate-fade-in text-slate-300">
              <div className="text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-base font-display font-medium text-white">Comprobante de Transferencia SPEI</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Liquidación STP Exitosa</p>
              </div>

              {/* Auto-Redirect Countdown Card */}
              {redirectCountdown !== null && (
                <div id="countdown-card" className="bg-[#121c35] border border-indigo-500/20 p-4 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wide">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Retorno Automático Activo
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-500 text-white font-bold font-mono rounded">
                      {redirectCountdown} segundos
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Has completado el pago exitosamente. Tu navegador te redirigirá automáticamente al sitio de origen para registrar el cobro:
                  </p>
                  <p className="font-mono text-[10px] text-indigo-450 truncate bg-[#090d16] px-2 py-1.5 rounded border border-slate-800 leading-none">
                    {customReturnUrl}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setRedirectCountdown(null);
                        if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
                      }}
                      className="flex-1 py-1.5 px-2 bg-slate-850 hover:bg-slate-800 text-slate-300 text-[10px] font-bold rounded-lg cursor-pointer transition-all border border-slate-800"
                    >
                      Examinar Comprobante
                    </button>
                    <button
                      type="button"
                      onClick={triggerRedirect}
                      className="flex-1 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1"
                    >
                      Retornar ya <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Classic Mexican Banking voucher representation */}
              <div className="bg-[#111827] border border-amber-500/15 rounded-xl p-4 font-mono text-[11px] space-y-2.5">
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-500">CONCEPTO:</span>
                  <span className="text-white font-semibold text-right">{successReceipt.concept}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-500">CLAVE RASTREO:</span>
                  <span className="text-amber-500 font-bold text-right">{successReceipt.claveRastreo}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-500">EMISOR:</span>
                  <span className="text-white text-right">{successReceipt.senderName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-500">RECEPTOR (CLABE):</span>
                  <span className="text-white text-right">{successReceipt.receiverClabe}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-500">INSTITUCIÓN RECEPTORA:</span>
                  <span className="text-white text-right">{successReceipt.bankName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-550">REFERENCIA NUM:</span>
                  <span className="text-white text-right">{successReceipt.reference}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-555">FECHA HORA:</span>
                  <span className="text-white text-right">{new Date(successReceipt.date).toLocaleString('es-MX')}</span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-bold">
                  <span className="text-white">MONTO ENVIADO:</span>
                  <span className="text-emerald-400 font-display">${successReceipt.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] rounded-xl flex items-center gap-1.5 font-sans font-medium justify-center">
                <Landmark className="w-3.5 h-3.5" /> Transacción atomizada y autorizada por la red central SPEI Banxico
              </div>
            </div>
          ) : (
            // Placeholder receipt layout
            <div className="flex-1 flex flex-col justify-center items-center text-center p-6 text-slate-500 gap-3">
              <div className="p-4 bg-slate-800/30 rounded-full text-slate-600">
                <CreditCard className="w-10 h-10" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Espera de Autorización</p>
              <p className="text-xs max-w-xs leading-relaxed">Completa los campos del formulario y presiona "Autorizar Envío" para ejecutar la transferencia e imprimir tu comprobante oficial legal de pago.</p>
            </div>
          )}
        </div>

      </div>

      {/* Portal de Sandbox de PayPal Checkout */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 bg-[#06080e]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in select-none">
          <div className="bg-[#0c111d] border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header del Navegador con URL Segura */}
            <div className="bg-[#121826] px-4 py-2.5 flex items-center justify-between border-b border-slate-900">
              <div className="flex gap-1.5 items-center">
                <span className="w-3 h-3 bg-red-500/40 rounded-full" />
                <span className="w-3 h-3 bg-yellow-500/40 rounded-full" />
                <span className="w-3 h-3 bg-emerald-500/40 rounded-full" />
              </div>
              <div className="flex-1 max-w-xs mx-4 text-center">
                <div className="bg-[#080d16] px-3 py-1 rounded-lg border border-slate-900 text-[10px] text-emerald-400 font-mono truncate flex items-center justify-center gap-1.5">
                  <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="text-slate-400 select-all">https://www.sandbox.paypal.com/checkoutnow?token=EC-8BT39521...</span>
                </div>
              </div>
              <button
                onClick={handleCheckoutCancel}
                className="text-slate-400 hover:text-white transition-colors text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full hover:bg-slate-800 cursor-pointer border-none bg-transparent"
                title="Cerrar Sandbox"
              >
                ✕
              </button>
            </div>

            {/* Contenido de Pasarela PayPal */}
            <div className="p-6 md:p-8 space-y-6 flex-grow overflow-y-auto">
              {/* Logo y Encabezado de la Orden */}
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-1.5">
                  <svg className="w-7 h-7 text-[#003087]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 5.5C19 3.01 17 1 14.5 1H6c-.55 0-1 .45-1 1v17c0 .55.45 1 1 1h3.5c.55 0 1-.45 1-1v-4.5h4c2.49 0 4.5-2.01 4.5-4.5V5.5zm-5.5 8h-4v-4.5h4c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span className="font-sans font-black text-white text-lg tracking-tight flex items-baseline">PayPal <span className="font-light text-slate-400 italic text-xs ml-1">Sandbox</span></span>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold font-mono text-amber-500 rounded uppercase">
                    Sandbox Mode
                  </span>
                </div>
              </div>

              {/* Detalles del Pago */}
              <div className="bg-[#080d16] border border-slate-800/55 rounded-xl p-4 space-y-2.5 text-left font-sans">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-550">Beneficiario:</span>
                  <span className="text-white font-bold select-all">Gold Payments Bank S.A. de C.V.</span>
                </div>
                <div className="flex justify-between items-start text-xs border-t border-slate-800/40 pt-2">
                  <span className="text-slate-550 shrink-0">Concepto de compra:</span>
                  <span className="text-slate-300 font-semibold text-right max-w-[200px] truncate leading-snug">{checkoutConcept}</span>
                </div>
                {selectedKeyForCheckout !== 'braintree' && (
                  <div className="flex justify-between items-center text-[10px] border-t border-slate-800/40 pt-2 font-mono">
                    <span className="text-slate-500">PayPal Application ID:</span>
                    <span className="text-indigo-400 font-bold select-all">{paypalAppName}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs border-t border-slate-800/40 pt-2">
                  <span className="text-slate-500">Método de Pago:</span>
                  <span className="text-slate-300 font-bold">Saldo de Cuenta de Pruebas</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold border-t border-slate-800 pt-2 text-[#0079C1]">
                  <span className="text-slate-350 font-sans">Total a transferir:</span>
                  <span className="font-mono text-white text-base">${parseFloat(checkoutAmount).toFixed(2)} USD</span>
                </div>
              </div>

              {/* Login simulado de Comprador */}
              <div className="space-y-3 text-left font-sans">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-505" />
                  Sesión Sandbox de Comprador
                </h5>
                <div className="grid grid-cols-1 gap-2">
                  <div className="bg-[#090d16] border border-slate-850 rounded-xl px-4 py-2">
                    <span className="block text-[8px] text-slate-500 uppercase font-semibold">Correo de Sandbox</span>
                    <span className="text-xs text-slate-200 select-all font-mono">{checkoutBuyerEmail}</span>
                  </div>
                  <div className="bg-[#090d16] border border-slate-850 rounded-xl px-4 py-2">
                    <span className="block text-[8px] text-slate-500 uppercase font-semibold">Contraseña</span>
                    <span className="text-xs text-slate-400 font-mono">{checkoutBuyerPassword}</span>
                  </div>
                </div>
              </div>

              {/* Instrucción */}
              <p className="text-[10px] text-slate-500 leading-normal text-center italic">
                Para verificar la respuesta del SDK y el webhook, presione el botón pagar para detonar el callback de éxito <code>onApprove()</code>.
              </p>

              {/* Action Buttons inside Portal */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  disabled={isProcessingCheckout}
                  onClick={handleCheckoutApprove}
                  className="w-full py-3 bg-[#0079C1] hover:bg-[#00457C] text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 border-none"
                >
                  {isProcessingCheckout ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Procesando Callback onApprove...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Aprobar Pago (onApprove)
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isProcessingCheckout}
                    onClick={handleCheckoutError}
                    className="py-2.5 px-3 bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-500/30 text-[10px] font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1 font-sans"
                  >
                    <AlertCircle className="w-3 h-3 shrink-0 text-red-400" />
                    Simular onError
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingCheckout}
                    onClick={handleCheckoutCancel}
                    className="py-2.5 px-3 bg-amber-950/40 hover:bg-amber-900/50 text-amber-400 border border-amber-500/30 text-[10px] font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1 font-sans"
                  >
                    <AlertCircle className="w-3 h-3 shrink-0 text-amber-400" />
                    Simular onCancel
                  </button>
                </div>

                <button
                  type="button"
                  disabled={isProcessingCheckout}
                  onClick={handleCheckoutCancel}
                  className="block w-full text-center text-slate-500 hover:text-slate-350 text-[11px] font-semibold transition-all underline pt-1.5 cursor-pointer font-sans bg-transparent border-none"
                >
                  Cancelar y volver a la app madre
                </button>
              </div>
            </div>

            {/* Secure Footer Bar */}
            <div className="bg-[#090d16] py-3 text-center border-t border-slate-900 flex items-center justify-center gap-1.5 text-[9px] text-slate-500 font-sans">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Conexión segura SSL TLS 1.3 de alta fidelidad</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

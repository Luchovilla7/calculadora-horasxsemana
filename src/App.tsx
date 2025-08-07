import React, { useState } from 'react';
import { Calculator, Clock, DollarSign, TrendingUp, Mail, Sparkles } from 'lucide-react';

interface FormData {
  email: string;
  profession: string;
  hourlyRate: number;
  socialMedia: number;
  copywriting: number;
  comments: number;
  customerSupport: number;
  newsletters: number;
  contentAudit: number;
  salesEmails: number;
}

function App() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    profession: '',
    hourlyRate: 0,
    socialMedia: 0,
    copywriting: 0,
    comments: 0,
    customerSupport: 0,
    newsletters: 0,
    contentAudit: 0,
    salesEmails: 0
  });
  
  const [showResults, setShowResults] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // Nuevo estado para el indicador de descarga

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === 'email' || field === 'profession') {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      const parsedValue = parseInt(value);
      setFormData(prev => ({
        ...prev,
        [field]: isNaN(parsedValue) ? 0 : Math.max(0, parsedValue)
      }));
    }
  };

  const calculateResults = () => {
    const automationRates = {
      socialMedia: 0.5,
      copywriting: 0.7,
      comments: 0.6,
      customerSupport: 0.6,
      newsletters: 0.8,
      contentAudit: 0.4,
      salesEmails: 0.6
    };

    const totalWeeklyHours = 
      formData.socialMedia +
      formData.copywriting +
      formData.comments +
      formData.customerSupport +
      formData.newsletters +
      formData.contentAudit +
      formData.salesEmails;
    
    const automatedHours = 
      formData.socialMedia * automationRates.socialMedia +
      formData.copywriting * automationRates.copywriting +
      formData.comments * automationRates.comments +
      formData.customerSupport * automationRates.customerSupport +
      formData.newsletters * automationRates.newsletters +
      formData.contentAudit * automationRates.contentAudit +
      formData.salesEmails * automationRates.salesEmails;

    const monthlyAutomatedHours = automatedHours * 4;
    const hourlyValue = formData.hourlyRate || 20;
    const monthlySavings = monthlyAutomatedHours * hourlyValue;

    return {
      totalWeeklyHours,
      weeklyAutomatedHours: automatedHours,
      monthlyAutomatedHours,
      monthlySavings,
      hourlyValue
    };
  };

  const results = calculateResults();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
    setIsDownloading(true); // Activar indicador de descarga

    // Construir el contenido HTML del reporte para enviar a Make
    // Es CRÍTICO que este HTML sea bien formado y contenga los estilos inline
    // o que Google Docs pueda interpretarlos correctamente.
    const reportHtmlContent = `
      <div style="font-family: 'Inter', sans-serif; padding: 20px; color: #333;">
        <h1 style="text-align: center; color: #E54C8A;">Tu Reporte DIVIA</h1>
        <p style="text-align: center; color: #666;">Descubre tu potencial de automatización</p>
        
        <h2 style="color: #E54C8A;">Resumen Personal</h2>
        <p>Como <strong>${formData.profession || 'emprendedora digital'}</strong>, estás dedicando actualmente <strong>${results.totalWeeklyHours} horas por semana</strong> a tareas operativas. 
        Con automatización estratégica podrías liberar hasta <strong>${results.weeklyAutomatedHours.toFixed(1)} horas semanales</strong>, 
        es decir, <strong>${results.monthlyAutomatedHours.toFixed(1)} horas al mes</strong>.</p>

        <h2 style="color: #28A745;">Valor del Tiempo</h2>
        <p>Con tu valor de <strong>$${results.hourlyValue}/hora</strong>, esto equivale a un ahorro aproximado de <strong>$${results.monthlySavings.toFixed(0)} USD al mes</strong>, 
        que podrías reinvertir en tu creatividad, descanso o expansión.</p>

        <h2 style="color: #6F42C1;">Potencial de Ventas</h2>
        <p>Si activás un funnel automatizado y agentes GPT personalizados, podrías aumentar tus ventas 
        entre un <strong>30% y 60% en tan solo 4 semanas</strong>, como lo hacen las clientas de DIVIA.</p>

        <p style="text-align: center; margin-top: 30px;">
          <a href="https://divia.com/asesoria" style="display: inline-block; padding: 15px 30px; background: linear-gradient(to right, #E54C8A, #FF69B4); color: white; text-decoration: none; border-radius: 50px; font-weight: bold;">
            Reservá tu asesoría gratuita DIVIA
          </a>
        </p>
        <p style="text-align: center; font-size: 0.9em; color: #999;">Agenda tu sesión estratégica personalizada</p>
      </div>
    `;

    try {
      const response = await fetch("https://hook.eu2.make.com/dfyvzc7zojqoywco28813yzvd89alr8u", { // URL del webhook de Make
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre: formData.profession || "Emprendedora digital",
          email: formData.email,
          total_horas_semanales: results.totalWeeklyHours,
          horas_liberadas: results.weeklyAutomatedHours.toFixed(1),
          horas_liberadas_mensuales: results.monthlyAutomatedHours.toFixed(1),
          ahorro_usd: results.monthlySavings.toFixed(0),
          porcentaje_ventas: "30-60",
          link_asesoria: "https://divia.com/asesoria",
          reportContent: reportHtmlContent // Envía el HTML del reporte
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error en el servidor: ${response.status} - ${errorText}`);
      }

      // Manejar la respuesta como un Blob (archivo binario)
      const blob = await response.blob();

      // Obtener el nombre del archivo del encabezado Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'reporte_divia.pdf'; // Nombre por defecto
      if (contentDisposition && contentDisposition.includes('filename=')) {
          const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
          if (filenameMatch && filenameMatch[1]) {
              filename = filenameMatch[1];
          }
      }

      // Crear una URL de objeto para el blob
      const url = window.URL.createObjectURL(blob);

      // Crear un enlace temporal y simular un clic para descargar
      const a = document.createElement('a');
      a.href = url;
      a.download = filename; // Nombre del archivo para la descarga
      document.body.appendChild(a);
      a.click();
      a.remove();

      // Liberar la URL del objeto cuando ya no sea necesaria
      window.URL.revokeObjectURL(url);
      console.log("✅ PDF descargado exitosamente.");

    } catch (error) {
      console.error("❌ Error al generar o descargar el PDF:", error);
      alert('Hubo un error al generar el reporte. Por favor, inténtalo de nuevo.');
    } finally {
      setIsDownloading(false); // Desactivar indicador de descarga
    }
  };

  const resetCalculator = () => {
    setFormData({
      email: '',
      profession: '',
      hourlyRate: 0,
      socialMedia: 0,
      copywriting: 0,
      comments: 0,
      customerSupport: 0,
      newsletters: 0,
      contentAudit: 0,
      salesEmails: 0
    });
    setShowResults(false);
  };

  const questions = [
    { key: 'socialMedia' as keyof FormData, label: '¿Cuántas horas dedicás a crear tu plan de contenido para redes sociales?', icon: '📱' },
    { key: 'copywriting' as keyof FormData, label: '¿Cuántas horas te lleva crear páginas de venta o textos persuasivos?', icon: '✍️' },
    { key: 'comments' as keyof FormData, label: '¿Cuánto tiempo invertís revisando y respondiendo comentarios diarios?', icon: '💬' },
    { key: 'customerSupport' as keyof FormData, label: '¿Cuánto tiempo usás para responder dudas personalizadas de clientas?', icon: '🤝' },
    { key: 'newsletters' as keyof FormData, label: '¿Cuántas horas dedicás al envío de newsletters?', icon: '📧' },
    { key: 'contentAudit' as keyof FormData, label: '¿Cuánto tiempo te toma auditar propuestas o contenidos?', icon: '🔍' },
    { key: 'salesEmails' as keyof FormData, label: '¿Cuántas horas dedicás a responder emails de potenciales clientes?', icon: '💼' }
  ];

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-orange-50 font-inter">
        {/* El id="report-content" ahora es solo para referencia visual si lo necesitas, ya no se usa para html2pdf */}
        <div id="report-content" className="container mx-auto px-4 py-2 max-w-4xl"> 
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-rose-400 to-pink-500 p-3 rounded-full">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Tu Reporte DIVIA
            </h1>
            <p className="text-gray-600 text-lg">Descubre tu potencial de automatización</p>
          </div>

          {/* Results Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-rose-100">
              <div className="flex items-center mb-4">
                <Clock className="h-8 w-8 text-rose-500 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-800">Tiempo Liberado</h3>
                  <p className="text-2xl font-bold text-rose-600">{results.weeklyAutomatedHours.toFixed(1)}h</p>
                  <p className="text-sm text-gray-500">por semana</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
              <div className="flex items-center mb-4">
                <DollarSign className="h-8 w-8 text-green-500 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-800">Ahorro Mensual</h3>
                  <p className="text-2xl font-bold text-green-600">${results.monthlySavings.toFixed(0)}</p>
                  <p className="text-sm text-gray-500">USD al mes</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-800">Aumento de Ventas</h3>
                  <p className="text-2xl font-bold text-purple-600">30-60%</p>
                  <p className="text-sm text-gray-500">en 4 semanas</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Report */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-rose-100 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Tu Informe Personalizado</h2>
            
            {/* Resumen Personal */}
            <div className="mb-8 p-6 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border-l-4 border-rose-400">
              <h3 className="text-xl font-semibold text-rose-700 mb-3">✨ Resumen Personal</h3>
              <p className="text-gray-700 leading-relaxed">
                Como <strong>{formData.profession || 'emprendedora digital'}</strong>, estás dedicando actualmente <strong>{results.totalWeeklyHours} horas por semana</strong> a tareas operativas. 
                Con automatización estratégica podrías liberar hasta <strong>{results.weeklyAutomatedHours.toFixed(1)} horas semanales</strong>, 
                es decir, <strong>{results.monthlyAutomatedHours.toFixed(1)} horas al mes</strong>.
              </p>
            </div>

            {/* Valor del Tiempo */}
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-l-4 border-green-400">
              <h3 className="text-xl font-semibold text-green-700 mb-3">💰 Valor del Tiempo</h3>
              <p className="text-gray-700 leading-relaxed">
                Con tu valor de <strong>${results.hourlyValue}/hora</strong>, esto equivale a un ahorro aproximado de <strong>${results.monthlySavings.toFixed(0)} USD al mes</strong>, 
                que podrías reinvertir en tu creatividad, descanso o expansión.
              </p>
            </div>

            {/* Potencial de Ventas */}
            <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-l-4 border-purple-400">
              <h3 className="text-xl font-semibold text-purple-700 mb-3">📈 Potencial de Ventas</h3>
              <p className="text-gray-700 leading-relaxed">
                Si activás un funnel automatizado y agentes GPT personalizados, podrías aumentar tus ventas 
                entre un <strong>30% y 60% en tan solo 4 semanas</strong>, como lo hacen las clientas de DIVIA.
              </p>
            </div>

            {/* Cierre Emocional */}
            <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border-l-4 border-amber-400">
              <h3 className="text-xl font-semibold text-amber-700 mb-3">💎 El Próximo Paso</h3>
              <p className="text-gray-700 leading-relaxed">
                La automatización no tiene por qué ser fría. Con DIVIA podés escalar sin sacrificar tu estilo ni tu esencia. 
                <strong> Esto es solo el comienzo.</strong>
              </p>
            </div>

            {/* CTA - Se agregó un enlace real para el PDF */}
            <div className="text-center">
              <a 
                href="https://divia.com/asesoria" // Reemplaza con el enlace real de tu asesoría
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg mb-4"
              >
                Reservá tu asesoría gratuita DIVIA
              </a>
              <p className="text-sm text-gray-500">Agenda tu sesión estratégica personalizada</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button 
            onClick={handleSubmit} // Llama a handleSubmit para generar y descargar el PDF
            disabled={isDownloading} // Deshabilita el botón durante la descarga
            className="flex items-center bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generando PDF...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download h-5 w-5 mr-2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>
                </svg>
                Descargar Reporte PDF
              </>
            )}
          </button>
          <button className="flex items-center bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-full border border-gray-200 transition-all duration-300 shadow-md hover:shadow-lg">
            <Mail className="h-5 w-5 mr-2" />
            Enviar por Email
          </button>
          <button 
            onClick={resetCalculator}
            className="flex items-center bg-rose-100 hover:bg-rose-200 text-rose-700 font-medium py-3 px-6 rounded-full border border-rose-200 transition-all duration-300"
          >
            <Calculator className="h-5 w-5 mr-2" />
            Nueva Calculación
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-orange-50 font-inter">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-rose-400 to-pink-500 p-4 rounded-full shadow-lg">
              <Calculator className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Calculadora DIVIA
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Descubre cuánto tiempo y dinero podrías ahorrar automatizando tu negocio digital
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-rose-100">
            <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
              Contanos sobre tu tiempo semanal
            </h2>
            
            <div className="space-y-6">
              {/* Campo de Email */}
              <div className="group">
                <label className="block text-gray-700 font-medium mb-3 text-lg">
                  <span className="mr-3 text-2xl">📧</span>
                  ¿Cuál es tu email?
                </label>
                <input
                  type="email"
                  key="email-input" 
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all duration-300 group-hover:border-rose-300"
                  placeholder="tu.email@ejemplo.com"
                  required
                />
              </div>

              {/* Personal Information Fields */}
              <div className="group">
                <label className="block text-gray-700 font-medium mb-3 text-lg">
                  <span className="mr-3 text-2xl">👩‍💼</span>
                  ¿Contanos a qué te dedicas?
                </label>
                <input
                  type="text"
                  value={formData.profession}
                  onChange={(e) => handleInputChange('profession', e.target.value)}
                  className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all duration-300 group-hover:border-rose-300"
                  placeholder="Ej: Coach de vida, Consultora de marketing, Diseñadora gráfica..."
                />
              </div>

              <div className="group">
                <label className="block text-gray-700 font-medium mb-3 text-lg">
                  <span className="mr-3 text-2xl">💎</span>
                  ¿Cuánto es tu valor por hora de trabajo?
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={formData.hourlyRate}
                    onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                    className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all duration-300 group-hover:border-rose-300"
                    placeholder="20"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
                    USD/hora
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">Si no estás segura, dejá el valor por defecto de $20 USD</p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                  Ahora contanos sobre tu tiempo semanal
                </h3>
              </div>

              {questions.map((question, index) => (
                <div key={question.key} className="group">
                  <label className="block text-gray-700 font-medium mb-3 text-lg">
                    <span className="mr-3 text-2xl">{question.icon}</span>
                    {question.label}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="168"
                      value={formData[question.key]}
                      onChange={(e) => handleInputChange(question.key, e.target.value)}
                      className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-rose-400 focus:ring-4 focus:ring-rose-100 transition-all duration-300 group-hover:border-rose-300"
                      placeholder="0"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
                      horas/semana
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Current Total */}
            <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-700">Total de horas semanales:</span>
                <span className="text-2xl font-bold text-rose-600">{results.totalWeeklyHours} horas</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-10 text-center">
              <button
                type="submit"
                disabled={results.totalWeeklyHours === 0 || !formData.profession.trim() || !formData.email.trim()}
                className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-12 rounded-full text-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg disabled:shadow-none"
              >
                Calcular mi Potencial de Ahorro ✨
              </button>
              {(results.totalWeeklyHours === 0 || !formData.profession.trim() || !formData.email.trim()) && (
                <p className="text-gray-500 mt-3">
                  {!formData.email.trim() ? 'Ingresa tu email para continuar' : !formData.profession.trim() ? 'Contanos a qué te dedicas para continuar' : 'Ingresa al menos una hora para continuar'}
                </p>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500">
            Powered by <span className="font-semibold text-rose-600">DIVIA</span> - Automatización inteligente para emprendedoras
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;

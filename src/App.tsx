import React, { useState } from 'react';
import { Calculator, Clock, DollarSign, TrendingUp, Download, Mail, Sparkles } from 'lucide-react';

interface FormData {
  email: string; // Nuevo campo para el email
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
    email: '', // Inicializar el campo de email
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

  const handleInputChange = (field: keyof FormData, value: string) => {
    // CAMBIO CLAVE AQUÍ: Manejo explícito para campos de texto y numéricos
    if (field === 'email' || field === 'profession') {
      setFormData(prev => ({
        ...prev,
        [field]: value // Para email y profesión, guardar el valor directamente como string
      }));
    } else {
      // Para los campos numéricos, parsear a entero y asegurar que no sea negativo
      const parsedValue = parseInt(value);
      setFormData(prev => ({
        ...prev,
        [field]: isNaN(parsedValue) ? 0 : Math.max(0, parsedValue) // Si es NaN, se establece en 0
      }));
    }
  };

  const calculateResults = () => {
    const automationRates = {
      socialMedia: 0.5,     // 50%
      copywriting: 0.7,     // 70%
      comments: 0.6,        // 60%
      customerSupport: 0.6, // 60%
      newsletters: 0.8,     // 80%
      contentAudit: 0.4,    // 40%
      salesEmails: 0.6      // 60%
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
    const hourlyValue = formData.hourlyRate || 20; // Use user's rate or default to $20
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);

    // Enviar datos al webhook de Make
    // Asegúrate de reemplazar la URL del webhook con la tuya si es diferente
    fetch("https://hook.eu2.make.com/vyny56jwlve6q8zunz1sxz9mnqo8uflp", { // URL del webhook de Make
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nombre: formData.profession || "Emprendedora digital",
        email: formData.email, // Ahora el email se envía correctamente
        total_horas_semanales: results.totalWeeklyHours,
        horas_liberadas: results.weeklyAutomatedHours.toFixed(1), // Formateado para Make
        horas_liberadas_mensuales: results.monthlyAutomatedHours.toFixed(1), // Formateado para Make
        ahorro_usd: results.monthlySavings.toFixed(0), // Formateado para Make
        porcentaje_ventas: "30-60",
        link_asesoria: "https://divia.com/asesoria" // Asegúrate de que este sea el enlace correcto
      })
    })
    .then(res => res.ok ? console.log("📤 Datos enviados al webhook de Make") : console.error("❌ Error al enviar datos al webhook de Make"))
    .catch(err => console.error("❌ Error de red al enviar datos al webhook de Make:", err));
  };

  const resetCalculator = () => {
    setFormData({
      email: '', // Resetear el campo de email
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

  // Función para descargar el PDF
  const handleDownloadPdf = () => {
    // Asegúrate de que html2pdf esté cargado globalmente (ver nota en la conclusión)
    if (window.html2pdf) {
      // El ID del div que contiene tu reporte completo
      const element = document.getElementById('report-content'); 
      if (element) {
        // Opciones de configuración para el PDF
        const opt = {
          margin: 0, // Margen establecido a 0 para eliminar espacio blanco inicial
          filename: `Reporte_DIVIA_${formData.profession || 'anonimo'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 3, logging: true, dpi: 192, letterRendering: true, useCORS: true }, 
          jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } // Configuración de salto de página
        };
        window.html2pdf().set(opt).from(element).save();
      } else {
        console.error("No se encontró el elemento 'report-content' para generar el PDF.");
      }
    } else {
      console.error("html2pdf.js no está cargado. Asegúrate de incluirlo en tu index.html.");
    }
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
        {/* Se movió el id="report-content" a este div para incluir todo el contenido del reporte en el PDF */}
        {/* Se ha añadido un padding-top menor para reducir el espacio en blanco superior en el PDF */}
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

          {/* Salto de página forzado */}
          <div className="html2pdf__page-break"></div>

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

        {/* Action Buttons (estos botones no se incluyen en el PDF) */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button 
            onClick={handleDownloadPdf} 
            className="flex items-center bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-full border border-gray-200 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <Download className="h-5 w-5 mr-2" />
            Descargar PDF
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
              {/* Nuevo campo de Email */}
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
                  required // Hace el campo obligatorio
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
                disabled={results.totalWeeklyHours === 0 || !formData.profession.trim() || !formData.email.trim()} // Validación para el email
                className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-12 rounded-full text-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg disabled:shadow-none"
              >
                Calcular mi Potencial de Ahorro ✨
              </button>
              {(results.totalWeeklyHours === 0 || !formData.profession.trim() || !formData.email.trim()) && ( // Mensaje de validación
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

// ─── OCR HELPER ──────────────────────────────────────────────────────────────
export async function runOCR(file) {
  const apiKey = import.meta.env.VITE_OCR_API_KEY || 'helloworld'
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('apikey', apiKey)
    formData.append('language', 'eng')
    formData.append('isOverlayRequired', 'false')

    const res = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    if (data.ParsedResults && data.ParsedResults.length > 0) {
      return data.ParsedResults[0].ParsedText || ''
    }
  } catch (e) {
    console.warn('OCR API failed, using simulation', e)
  }
  // Simulate OCR output
  return simulateOCR(file)
}

function simulateOCR(file) {
  const name = file?.name || 'document'
  return `Simulated OCR Output\nDocument: ${name}\nAadhaar: 1234 5678 9012\nLand: 2.5 acres, Survey No. 101\nCrop: Wheat\nScheme: PM-KISAN`
}

// ─── VERIFY DOCUMENT ─────────────────────────────────────────────────────────
export function verifyDocument(ocrText, formData) {
  const text = ocrText.toLowerCase()
  const name = (formData.name || '').toLowerCase()
  const aadhaar = (formData.aadhaar || '').replace(/\s/g, '')
  const crop = (formData.cropType || '').toLowerCase()

  let mismatches = 0
  let riskScore = 0
  const flags = []

  // Check name
  const nameParts = name.split(' ')
  const nameFound = nameParts.some(part => part.length > 2 && text.includes(part))
  if (!nameFound) { mismatches++; riskScore += 25; flags.push('Name not found in document') }

  // Check aadhaar (look for any 12-digit sequence)
  const aadhaarPattern = /\d{4}\s?\d{4}\s?\d{4}/
  const aadhaarFromOCR = ocrText.match(aadhaarPattern)
  if (aadhaarFromOCR) {
    const ocrAadhaar = aadhaarFromOCR[0].replace(/\s/g, '')
    if (ocrAadhaar !== aadhaar) { mismatches++; riskScore += 35; flags.push('Aadhaar mismatch') }
  } else { riskScore += 10 }

  // Check crop type
  if (crop && !text.includes(crop)) { mismatches++; riskScore += 15; flags.push('Crop type not in document') }

  const aiFlag = mismatches >= 2 || riskScore >= 50 ? 'Suspicious' : 'Valid'
  return { aiFlag, riskScore: Math.min(riskScore, 100), flags }
}

// ─── OPENAI GRIEVANCE CLASSIFICATION ────────────────────────────────────────
export async function classifyGrievance(text) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (apiKey && apiKey !== 'your-openai-api-key-here') {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a grievance classification assistant for a government agriculture department. 
              Classify the given complaint into:
              - category: one of ["Subsidy", "Insurance", "Delay", "Corruption", "Technical", "Other"]
              - priority: one of ["High", "Medium", "Low"]
              Respond ONLY with valid JSON: {"category": "...", "priority": "..."}`,
            },
            { role: 'user', content: text },
          ],
          temperature: 0.3,
          max_tokens: 100,
        }),
      })
      const data = await res.json()
      const content = data.choices?.[0]?.message?.content || '{}'
      return JSON.parse(content)
    } catch (e) {
      console.warn('OpenAI API failed, using simulation', e)
    }
  }
  // Simulate classification
  return simulateClassification(text)
}

function simulateClassification(text) {
  const lower = text.toLowerCase()
  let category = 'Other'
  let priority = 'Low'

  if (lower.includes('subsidy') || lower.includes('money') || lower.includes('payment') || lower.includes('fund')) category = 'Subsidy'
  else if (lower.includes('insurance') || lower.includes('claim') || lower.includes('damage') || lower.includes('flood')) category = 'Insurance'
  else if (lower.includes('delay') || lower.includes('late') || lower.includes('waiting') || lower.includes('pending')) category = 'Delay'
  else if (lower.includes('corrupt') || lower.includes('bribe') || lower.includes('fraud')) category = 'Corruption'
  else if (lower.includes('login') || lower.includes('error') || lower.includes('website') || lower.includes('portal')) category = 'Technical'

  if (lower.includes('urgent') || lower.includes('emergency') || lower.includes('critical') || lower.includes('immediate') || category === 'Corruption') priority = 'High'
  else if (lower.includes('soon') || lower.includes('important') || lower.includes('serious')) priority = 'Medium'

  return { category, priority }
}

// ─── DUPLICATE AADHAAR ──────────────────────────────────────────────────────
export async function checkDuplicateAadhaar(aadhaar, supabase) {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('id')
      .eq('aadhaar', aadhaar)
    if (error) return false
    return data && data.length > 0
  } catch {
    return false
  }
}

// ─── EXPORT CSV ─────────────────────────────────────────────────────────────
export function exportToCSV(data, filename = 'applications.csv') {
  if (!data || data.length === 0) return
  const headers = Object.keys(data[0]).join(',')
  const rows = data.map(row =>
    Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
  )
  const csv = [headers, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─── AI CROP DOCTOR ─────────────────────────────────────────────────────────
export async function diagnoseCrop(description) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (apiKey && apiKey !== 'your-openai-api-key-here') {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an expert Agricultural Pathologist and Crop Doctor. 
              The farmer will describe a plant health problem. You must:
              1. Identify the likely disease/pest.
              2. Suggest 2-3 specific organic or chemical remedies.
              3. Provide a 'Confidence' score (0-100%).
              Respond ONLY with valid JSON: {"diagnosis": "...", "remedies": ["...", "..."], "confidence": 85}`,
            },
            { role: 'user', content: description },
          ],
          temperature: 0.3,
        }),
      })
      const data = await res.json()
      const content = data.choices?.[0]?.message?.content || '{}'
      return JSON.parse(content)
    } catch (e) {
      console.warn('OpenAI API failed, using simulation', e)
    }
  }

  // Simulate Crop Diagnosis
  const lower = description.toLowerCase()
  let diagnosis = 'Nutritional Deficiency'
  let remedies = ['Apply micronutrient spray', 'Improve irrigation frequency', 'Check soil pH levels']
  let confidence = 45

  if (lower.includes('yellow') && lower.includes('leaf')) {
    diagnosis = 'Nitrogen Deficiency / Leaf Rust'
    remedies = ['Apply Urea or Neem Cake', 'Use Azotobacter bio-fertilizer', 'Spray Copper Oxychloride if spots are present']
    confidence = 82
  } else if (lower.includes('hole') || lower.includes('eaten')) {
    diagnosis = 'Fall Armyworm / Pest Attack'
    remedies = ['Spray Neem Oil (1500ppm)', 'Use pheromone traps', 'Apply Bacillus thuringiensis (Bt) if severe']
    confidence = 90
  } else if (lower.includes('spot') || lower.includes('brown')) {
    diagnosis = 'Early Blight / Fungal Spot'
    remedies = ['Remove infected leaves', 'Maintain proper spacing for aeration', 'Apply Trichoderma Viride bio-fungicide']
    confidence = 75
  }

  return { diagnosis, remedies, confidence }
}

// @deps pdf-parse@1.1.1, mammoth@1.8.0, buffer@6.0.3
onRecordAfterCreateSuccess(async (e) => {
  const fileName = e.record.getString('source_file')
  if (!fileName) return e.next()

  const colId = e.record.collectionId
  const recId = e.record.id

  const instanceUrl = $secrets.get('PB_INSTANCE_URL') || 'http://127.0.0.1:8090'
  const fileUrl = `${instanceUrl}/api/files/${colId}/${recId}/${fileName}`

  try {
    const res = $http.send({ url: fileUrl, method: 'GET', timeout: 30 })
    if (res.statusCode !== 200) return e.next()

    const { Buffer } = require('buffer')
    const buffer = Buffer.from(res.body)

    let text = ''
    if (fileName.toLowerCase().endsWith('.pdf')) {
      const pdfParse = require('pdf-parse')
      const data = await pdfParse(buffer)
      text = data.text
    } else if (
      fileName.toLowerCase().endsWith('.docx') ||
      fileName.toLowerCase().endsWith('.doc')
    ) {
      const mammoth = require('mammoth')
      const data = await mammoth.extractRawText({ buffer: buffer })
      text = data.value
    }

    if (!text || text.trim().length === 0) return e.next()

    const apiKey = $secrets.get('OPENAI_API_KEY')
    if (apiKey) {
      const aiRes = $http.send({
        url: 'https://api.openai.com/v1/chat/completions',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert legal assistant. Clean up the following extracted text from a legal document. Remove technical artifacts, correct broken words, but strictly preserve the legal structure, clauses, spacing and numbering exactly as plain text. Return ONLY the cleaned text.',
            },
            { role: 'user', content: text },
          ],
        }),
        timeout: 60,
      })
      if (
        aiRes.statusCode === 200 &&
        aiRes.json &&
        aiRes.json.choices &&
        aiRes.json.choices.length > 0
      ) {
        text = aiRes.json.choices[0].message.content.trim()
      }
    }

    const record = $app.findRecordById('legal_knowledge', recId)
    record.set('content', text)
    $app.save(record)
  } catch (err) {
    $app.logger().error('File extraction create error', 'record', recId, 'error', err.message)
  }

  return e.next()
}, 'legal_knowledge')

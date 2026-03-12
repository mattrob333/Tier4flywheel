import './index.css'

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']

const setFormStatus = (element, state, message) => {
  if (!element) {
    return
  }

  element.dataset.state = state
  element.textContent = message
}

const normalizePayload = (formData) => {
  const payload = {}

  for (const [key, value] of formData.entries()) {
    payload[key] = typeof value === 'string' ? value.trim() : value
  }

  return payload
}

const captureUtmParams = () => {
  const params = new URLSearchParams(window.location.search)

  UTM_KEYS.forEach((key) => {
    const value = params.get(key)

    if (value) {
      window.sessionStorage.setItem(key, value)
    }
  })
}

const hydrateTrackingFields = (form) => {
  UTM_KEYS.forEach((key) => {
    const field = form.querySelector(`[name="${key}"]`)

    if (field) {
      field.value = window.sessionStorage.getItem(key) || ''
    }
  })

  const pageField = form.querySelector('[name="sourcePage"]')

  if (pageField) {
    pageField.value = window.location.pathname
  }
}

const wireLeadForms = () => {
  document.querySelectorAll('[data-lead-form]').forEach((form) => {
    const statusElement = form.querySelector('[data-form-status]')

    hydrateTrackingFields(form)

    form.addEventListener('submit', async (event) => {
      event.preventDefault()

      const payload = normalizePayload(new FormData(form))
      setFormStatus(statusElement, 'loading', 'Submitting your request...')

      try {
        const response = await fetch(form.action || '/api/lead', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          throw new Error('Lead request failed')
        }

        form.reset()
        setFormStatus(
          statusElement,
          'success',
          'Request received. Tier 4 Intelligence will follow up shortly.',
        )
      } catch (error) {
        setFormStatus(
          statusElement,
          'error',
          'Something went wrong while submitting your request. Please email matt@tier4intelligence.com directly.',
        )
      }
    })
  })
}

const normalizeDomainInput = (value) => {
  const trimmed = value.trim()

  if (!trimmed) {
    return ''
  }

  const withoutProtocol = trimmed.replace(/^https?:\/\//i, '')
  const withoutWww = withoutProtocol.replace(/^www\./i, '')
  const [domain] = withoutWww.split(/[/?#]/)

  return domain.trim().replace(/\/$/, '')
}

const wireReportForms = () => {
  document.querySelectorAll('[data-report-form]').forEach((form) => {
    const input = form.querySelector('input[name="domain"]')
    const statusElement = form.parentElement?.querySelector('[data-report-status]')

    if (!input) {
      return
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault()

      const cleanedDomain = normalizeDomainInput(input.value)

      if (!cleanedDomain) {
        setFormStatus(statusElement, 'error', 'Enter your domain to continue')
        input.focus()
        return
      }

      input.value = cleanedDomain
      setFormStatus(statusElement, 'idle', '')
      window.location.assign(`https://tier4intelligence.com/api/report?domain=${encodeURIComponent(cleanedDomain)}`)
    })

    input.addEventListener('input', () => {
      if (statusElement?.dataset.state === 'error') {
        setFormStatus(statusElement, 'idle', '')
      }
    })
  })
}

const hydrateFooterYear = () => {
  const currentYear = new Date().getFullYear()

  document.querySelectorAll('[data-current-year]').forEach((element) => {
    element.textContent = String(currentYear)
  })
}

captureUtmParams()
wireLeadForms()
wireReportForms()
hydrateFooterYear()

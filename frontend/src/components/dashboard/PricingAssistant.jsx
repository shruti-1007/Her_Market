import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  calculatePricing,
  detectMaterials,
  estimateMaterialCost,
  getPricingConfig,
} from '../../api/pricing.js'
import { errorMessage } from '../../api/errors.js'
import { formatPrice } from '../../constants.js'

const timeOptions = [
  ['under-hour', 'Less than 1 hour', 30],
  ['one-two', '1–2 hours', 90],
  ['two-four', '2–4 hours', 180],
  ['half-day', 'Half a day', 240],
  ['one-day', '1 day', 480],
  ['custom', 'More than a day / my own time', null],
]

const expenseOptions = ['Packaging', 'Electricity', 'Transportation of materials', 'Other supplies']
const buttonClass =
  'min-h-[48px] rounded-lg border border-outline-variant px-4 font-label text-label-md text-primary hover:bg-primary-container'
const fieldClass =
  'min-h-[48px] w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body text-body-md text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20'

const money = (amount) => formatPrice(Number(amount || 0), { maximumFractionDigits: 2 })
const makeId = () => `${Date.now()}-${Math.random()}`

function StepTitle({ step, title, description }) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-1">
      <p className="font-label text-label-md text-primary">{t('Step {{step}} of 5', { step })}</p>
      <div
        role="progressbar"
        aria-label={t('Pricing helper progress: step {{step}} of 5', { step })}
        aria-valuemin={1}
        aria-valuemax={5}
        aria-valuenow={step}
        className="h-2 overflow-hidden rounded-full bg-surface-container-lowest"
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${step * 20}%` }} />
      </div>
      <h3 className="font-headline text-title-lg text-on-surface">{title}</h3>
      {description && <p className="font-body text-body-md text-on-surface-variant">{description}</p>}
    </div>
  )
}

function MaterialConfirmation({ material, onChange, onDecision, onRemove }) {
  const { t } = useTranslation()
  return (
    <article className="flex flex-col gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
      <label className="flex flex-col gap-2">
        <span className="font-label text-label-md text-on-surface">
          {material.aiSuggested ? t('Suggested material (you can change the name)') : t('Material name')}
        </span>
        <input
          value={material.name}
          onChange={(event) => onChange(event.target.value)}
          maxLength={100}
          className={fieldClass}
          aria-label={t('Material name')}
        />
      </label>
      {material.reason && (
        <p className="font-body text-sm text-on-surface-variant">
          {t('Photo suggestion ({{confidence}} confidence): {{reason}}', { confidence: material.confidence, reason: material.reason })}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={material.decision === 'yes'}
          onClick={() => onDecision('yes')}
          className={`${buttonClass} ${material.decision === 'yes' ? 'border-primary bg-primary-container' : ''}`}
        >
          {t('Yes, I used this')}
        </button>
        <button
          type="button"
          aria-pressed={material.decision === 'no'}
          onClick={() => onDecision('no')}
          className={`${buttonClass} ${material.decision === 'no' ? 'border-primary bg-primary-container' : ''}`}
        >
          {t("No, I didn't")}
        </button>
        <button type="button" onClick={onRemove} className={buttonClass}>
          {t('Remove')}
        </button>
      </div>
    </article>
  )
}

function MaterialCostQuestion({ material, answer, onChange }) {
  const { t } = useTranslation()
  const [estimating, setEstimating] = useState(false)
  const [estimateError, setEstimateError] = useState('')
  const method = answer?.method || ''
  const set = (key, value, updates = {}) => onChange({ ...answer, [key]: value, ...updates })

  async function askForEstimate() {
    setEstimateError('')
    setEstimating(true)
    try {
      const result = await estimateMaterialCost({
        materialName: material.name,
        usageMethod: method,
        usedQuantityDescription: answer?.usedQuantityDescription || '',
        totalQuantity: answer?.totalQuantity,
        quantityUsed: answer?.quantityUsed,
        unit: answer?.unit || '',
      })
      set('estimatedCostNpr', String(result.estimate.suggestedNpr), {
        costSource: 'ai',
        aiEstimate: result.estimate,
      })
    } catch (error) {
      setEstimateError(errorMessage(error))
    } finally {
      setEstimating(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
      <h4 className="font-headline text-title-md text-on-surface">{t('How much {{material}} did you use?', { material: material.name })}</h4>
      {!['estimated', 'used'].includes(method) && (
        <label className="flex flex-col gap-2">
          <span className="font-label text-label-md text-on-surface">
            {t('How much did you pay for it all? (NPR)')}
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={answer?.purchaseCostNpr ?? ''}
            onChange={(event) => set('purchaseCostNpr', event.target.value)}
            className={fieldClass}
            aria-label={t('Amount paid for all {{material}}', { material: material.name })}
          />
        </label>
      )}
      <fieldset className="flex flex-col gap-2">
        <legend className="font-label text-label-md text-on-surface">{t('Choose the closest answer')}</legend>
        {[
          ['all', 'All of it'],
          ['half', 'About half'],
          ['used', 'I know what the amount I used cost'],
          ['estimated', 'I do not know; help me estimate'],
          ['exact', 'I know the exact quantity'],
        ].map(([value, label]) => (
          <label key={value} className="flex min-h-11 items-center gap-3 font-body text-body-md text-on-surface">
            <input
              type="radio"
              name={`method-${material.id}`}
              checked={method === value}
              onChange={() => set('method', value)}
            />
            {t(label)}
          </label>
        ))}
      </fieldset>

      {method === 'estimated' && (
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-2">
            <span className="font-label text-label-md text-on-surface">
              {t('About how much did the part you used cost? (NPR)')}
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={answer?.estimatedCostNpr ?? ''}
              onChange={(event) => set('estimatedCostNpr', event.target.value, {
                costSource: 'seller',
                aiEstimate: null,
              })}
              className={fieldClass}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-label text-label-md text-on-surface">
              {t('About how much did you use? (optional)')}
            </span>
            <input
              value={answer?.usedQuantityDescription ?? ''}
              maxLength={100}
              onChange={(event) => set('usedQuantityDescription', event.target.value)}
              placeholder={t('For example, one handful or half a metre')}
              className={fieldClass}
            />
          </label>
          <button type="button" disabled={estimating} onClick={askForEstimate} className={`${buttonClass} self-start disabled:opacity-60`}>
            {estimating ? t('Estimating...') : t('Ask AI for an approximate price')}
          </button>
          <p className="font-body text-sm text-on-surface-variant">
            {t('AI can only give a rough suggestion. It is not a verified current Nepal price. You can edit the amount.')}
          </p>
          {answer?.costSource === 'ai' && answer.aiEstimate && (
            <p className="rounded-lg bg-primary-container p-3 font-body text-sm text-on-primary-container">
              {t('AI estimate range: {{low}}–{{high}}.', { low: money(answer.aiEstimate.lowNpr), high: money(answer.aiEstimate.highNpr) })}
              {' '}{answer.aiEstimate.explanation}
            </p>
          )}
          {estimateError && <p role="alert" className="font-body text-sm text-error">{estimateError}</p>}
        </div>
      )}

      {method === 'used' && (
        <label className="flex flex-col gap-2">
          <span className="font-label text-label-md text-on-surface">
            {t('What did the amount used for this product cost? (NPR)')}
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            value={answer?.usedCostNpr ?? ''}
            onChange={(event) => set('usedCostNpr', event.target.value)}
            className={fieldClass}
          />
        </label>
      )}

      {method === 'exact' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="font-label text-label-md text-on-surface">{t('Total amount you bought')}</span>
            <input
              type="number"
              min="0.01"
              step="any"
              inputMode="decimal"
              value={answer?.totalQuantity ?? ''}
              onChange={(event) => set('totalQuantity', event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="font-label text-label-md text-on-surface">{t('Amount you used')}</span>
            <input
              type="number"
              min="0.01"
              step="any"
              inputMode="decimal"
              value={answer?.quantityUsed ?? ''}
              onChange={(event) => set('quantityUsed', event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="font-label text-label-md text-on-surface">{t('Unit (optional, e.g. grams)')}</span>
            <input
              value={answer?.unit ?? ''}
              maxLength={30}
              onChange={(event) => set('unit', event.target.value)}
              className={fieldClass}
            />
          </label>
        </div>
      )}
    </div>
  )
}

export default function PricingAssistant({ image, onComplete, onCancel }) {
  const { t } = useTranslation()
  const [phase, setPhase] = useState('detecting')
  const [attempt, setAttempt] = useState(0)
  const [error, setError] = useState('')
  const [materials, setMaterials] = useState([])
  const [costAnswers, setCostAnswers] = useState({})
  const [costIndex, setCostIndex] = useState(0)
  const [config, setConfig] = useState(null)
  const [timeChoice, setTimeChoice] = useState('')
  const [customHours, setCustomHours] = useState('')
  const [customMinutes, setCustomMinutes] = useState('')
  const [minutesSpent, setMinutesSpent] = useState(null)
  const [timeEstimated, setTimeEstimated] = useState(false)
  const [hourlyRateNpr, setHourlyRateNpr] = useState('')
  const [profitMarginPercent, setProfitMarginPercent] = useState('')
  const [expenses, setExpenses] = useState([])
  const [customExpenseName, setCustomExpenseName] = useState('')
  const [pricing, setPricing] = useState(null)
  const [working, setWorking] = useState(false)
  const [skippedExpensesCount, setSkippedExpensesCount] = useState(0)

  useEffect(() => {
    let active = true
    Promise.all([getPricingConfig(), detectMaterials(image)])
      .then(([settings, result]) => {
        if (!active) return
        setConfig(settings.defaults)
        setHourlyRateNpr(String(settings.defaults.hourlyRateNpr))
        setProfitMarginPercent(String(settings.defaults.profitMarginPercent))
        setMaterials(
          result.materials.map((material) => ({
            ...material,
            id: makeId(),
            decision: '',
            aiSuggested: true,
          })),
        )
        setPhase('materials')
      })
      .catch((err) => {
        if (active) {
          setError(errorMessage(err))
          setPhase('failed')
        }
      })
    return () => { active = false }
  }, [image, attempt])

  const confirmedMaterials = useMemo(
    () => materials.filter((material) => material.decision === 'yes'),
    [materials],
  )

  function updateMaterial(id, updates) {
    setMaterials((current) =>
      current.map((material) => material.id === id ? { ...material, ...updates } : material),
    )
  }

  function updateCost(materialId, answer) {
    setCostAnswers((current) => ({ ...current, [materialId]: answer }))
  }

  function updateExpense(index, updates) {
    setExpenses((current) =>
      current.map((expense, i) => i === index ? { ...expense, ...updates } : expense),
    )
  }

  function toggleExpense(name) {
    setExpenses((current) =>
      current.some((expense) => expense.name === name)
        ? current.filter((expense) => expense.name !== name)
        : [...current, { name, amountNpr: '' }],
    )
  }

  function saveMaterialCost() {
    const material = confirmedMaterials[costIndex]
    const answer = costAnswers[material.id] || {}
    if (!answer.method) {
      setError(t('Choose how much of this material you used.'))
      return
    }
    const required = answer.method === 'estimated'
      ? answer.estimatedCostNpr
      : answer.method === 'used'
        ? answer.usedCostNpr
        : answer.purchaseCostNpr
    if (required === undefined || required === '' || !Number.isFinite(Number(required)) || Number(required) < 0) {
      setError(t('Enter a cost of zero or more, or choose another way to estimate it.'))
      return
    }
    if (answer.method === 'exact') {
      const total = Number(answer.totalQuantity)
      const used = Number(answer.quantityUsed)
      if (!Number.isFinite(total) || !Number.isFinite(used) || total <= 0 || used <= 0 || used > total) {
        setError(t('Enter an amount used that is more than zero and no more than the amount you bought.'))
        return
      }
    }
    setError('')
    if (costIndex < confirmedMaterials.length - 1) setCostIndex((current) => current + 1)
    else setPhase('time')
  }

  function continueFromTime(skip = false) {
    if (!skip) {
      let nextMinutes
      let estimated = false
      if (timeChoice === 'custom') {
        const hours = Number(customHours || 0)
        const minutes = Number(customMinutes || 0)
        nextMinutes = hours * 60 + minutes
        if (
          !Number.isFinite(nextMinutes) ||
          nextMinutes <= 0 ||
          nextMinutes > 10080 ||
          minutes < 0 ||
          minutes > 59
        ) {
          setError(t('Enter a time greater than zero and up to 7 days.'))
          return
        }
      } else {
        const selected = timeOptions.find(([value]) => value === timeChoice)
        if (!selected) {
          setError(t('Choose how long it took, or skip this step.'))
          return
        }
        nextMinutes = selected[2]
        estimated = true
      }
      const rate = Number(hourlyRateNpr)
      if (!Number.isFinite(rate) || rate < 0 || rate > 100000) {
        setError(t('Enter an hourly amount between NPR 0 and NPR 100,000.'))
        return
      }
      setMinutesSpent(nextMinutes)
      setTimeEstimated(estimated)
    } else {
      setMinutesSpent(null)
      setTimeEstimated(false)
    }
    setError('')
    setPhase('expenses')
  }

  function calculate(expensesToUse = expenses) {
    const expenseEntries = Array.isArray(expensesToUse) ? expensesToUse : expenses
    const margin = Number(profitMarginPercent)
    const rate = Number(hourlyRateNpr)
    if (!Number.isFinite(margin) || margin < 0 || margin > 200) {
      setError(t('Enter a profit amount from 0% to 200%.'))
      return
    }
    if (!Number.isFinite(rate) || rate < 0 || rate > 100000) {
      setError(t('Enter an hourly amount between NPR 0 and NPR 100,000.'))
      return
    }
    let omittedExpenses = 0
    const includedExpenses = []
    for (const [index, expense] of expenseEntries.entries()) {
      if (expense === null || expense === undefined) {
        omittedExpenses += 1
        continue
      }
      if (typeof expense !== 'object' || Array.isArray(expense)) {
        setError(t('Other cost {{index}} is invalid.', { index: index + 1 }))
        return
      }
      const amountMissing =
        expense.amountNpr === undefined ||
        expense.amountNpr === null ||
        (typeof expense.amountNpr === 'string' && expense.amountNpr.trim() === '')
      if (amountMissing) {
        omittedExpenses += 1
        continue
      }
      if (
        typeof expense.name !== 'string' ||
        !expense.name.trim() ||
        expense.name.trim().length > 100 ||
        (typeof expense.amountNpr !== 'number' && typeof expense.amountNpr !== 'string') ||
        !Number.isFinite(Number(expense.amountNpr)) ||
        Number(expense.amountNpr) < 0
      ) {
        setError(t('Add a valid name and amount for each other cost, or remove that cost.'))
        return
      }
      includedExpenses.push({
        name: expense.name.trim(),
        amountNpr: Number(expense.amountNpr),
      })
    }
    const materialsToPrice = []
    for (const material of confirmedMaterials) {
      const answer = costAnswers[material.id]
      if (!answer?.method) {
        setError(t('Choose how much of {{material}} you used.', { material: material.name }))
        return
      }
      materialsToPrice.push({
        name: material.name.trim(),
        method: answer.method,
        purchaseCostNpr: answer.purchaseCostNpr,
        usedCostNpr: answer.usedCostNpr,
        estimatedCostNpr: answer.estimatedCostNpr,
        costSource: answer.costSource,
        usedQuantityDescription: answer.usedQuantityDescription,
        totalQuantity: answer.totalQuantity,
        quantityUsed: answer.quantityUsed,
        unit: answer.unit,
      })
    }

    setWorking(true)
    setError('')
    calculatePricing({
      materialsConfirmed: true,
      materials: materialsToPrice,
      expenses: includedExpenses,
      expensesConfirmed: true,
      minutesSpent,
      timeEstimated,
      hourlyRateNpr: rate,
      profitMarginPercent: margin,
    })
      .then((result) => {
        setPricing(result.pricing)
        setSkippedExpensesCount(omittedExpenses)
        setPhase('result')
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setWorking(false))
  }

  function back() {
    setError('')
    if (phase === 'materials') return onCancel()
    if (phase === 'costs') {
      if (costIndex > 0) setCostIndex((current) => current - 1)
      else setPhase('materials')
    } else if (phase === 'time') {
      if (confirmedMaterials.length) {
        setCostIndex(confirmedMaterials.length - 1)
        setPhase('costs')
      } else setPhase('materials')
    } else if (phase === 'expenses') setPhase('time')
    else if (phase === 'result') setPhase('expenses')
  }

  function finish(decision) {
    onComplete({
      price: pricing.suggestedPriceNpr,
      pricing: {
        materials: pricing.materials,
        expenses: pricing.expenses,
        materialsConfirmed: pricing.materialsConfirmed,
        expensesConfirmed: pricing.expensesConfirmed,
        totalCostNpr: pricing.totalCostNpr,
        minutesSpent: pricing.minutesSpent,
        timeEstimated: pricing.timeEstimated,
        hourlyRateNpr: pricing.hourlyRateNpr,
        profitMarginPercent: pricing.profitMarginPercent,
        finalDecision: decision,
      },
    })
  }

  if (phase === 'detecting') {
    return (
      <section className="flex flex-col gap-3 rounded-lg border border-outline-variant bg-primary-container p-5">
        <p className="font-headline text-title-md text-on-primary-container">
          {t('Looking closely at your photo...')}
        </p>
        <p className="font-body text-body-md text-on-primary-container">
          {t('I’ll suggest materials I can see. You can correct anything I get wrong.')}
        </p>
        <div className="h-2 overflow-hidden rounded-full bg-white/70">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
        </div>
        <button type="button" onClick={onCancel} className="self-start rounded-lg px-4 py-2 font-label text-label-md text-primary">
          {t('Skip AI and set my own price')}
        </button>
      </section>
    )
  }

  if (phase === 'failed') {
    return (
      <section className="flex flex-col gap-4 rounded-lg border border-outline-variant bg-surface-container-low p-5">
        <p role="alert" className="font-body text-body-md text-error">{error}</p>
        <button
          type="button"
          onClick={() => {
            setError('')
            setPhase('detecting')
            setAttempt((current) => current + 1)
          }}
          className={buttonClass}
        >
          {t('Try AI again')}
        </button>
        <button type="button" onClick={onCancel} className={buttonClass}>
          {t("I'll set my own price")}
        </button>
      </section>
    )
  }

  const progressStep = {
    materials: 1,
    costs: 2,
    time: 3,
    expenses: 4,
    result: 5,
  }[phase]

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-outline-variant bg-primary-container p-4 sm:p-5">
      <StepTitle
        step={progressStep}
        title={
          phase === 'materials' ? t('Are these materials right?')
            : phase === 'costs' ? t('Material {{current}} of {{total}}', { current: costIndex + 1, total: confirmedMaterials.length })
              : phase === 'time' ? t('How long did it take?')
                : phase === 'expenses' ? t('Any other costs?')
                  : t('Here is your price estimate')
        }
        description={
          phase === 'materials' ? t('The photo can only give clues. You know best what you used.')
            : phase === 'costs' ? t('We’ll count only the part you used for this product.')
              : phase === 'time' ? t('Your time matters too. A middle estimate is used for time ranges.')
                : phase === 'expenses' ? t('You can skip this if you had no other costs.')
                  : t('This is an estimate from the details you shared, not an exact market price.')
        }
      />

      {phase === 'materials' && (
        <div className="flex flex-col gap-3">
          <p className="font-label text-label-md text-on-surface">
            {t('I think these materials may have been used. Is this right?')}
          </p>
          {materials.length === 0 && (
            <p className="rounded-lg bg-surface-container-lowest p-4 font-body text-body-md text-on-surface-variant">
              {t('I couldn’t clearly spot materials in the photo. You can add them yourself or continue without materials.')}
            </p>
          )}
          {materials.map((material) => (
            <MaterialConfirmation
              key={material.id}
              material={material}
              onChange={(name) => updateMaterial(material.id, { name })}
              onDecision={(decision) => updateMaterial(material.id, { decision })}
              onRemove={() => setMaterials((current) => current.filter((item) => item.id !== material.id))}
            />
          ))}
          {materials.length < 20 && (
            <button
              type="button"
              onClick={() => setMaterials((current) => [
                ...current,
                { id: makeId(), name: '', decision: 'yes', aiSuggested: false, confidence: '', reason: '' },
              ])}
              className={`${buttonClass} self-start`}
            >
              {t('+ Add another material')}
            </button>
          )}
        </div>
      )}

      {phase === 'costs' && confirmedMaterials[costIndex] && (
        <MaterialCostQuestion
          material={confirmedMaterials[costIndex]}
          answer={costAnswers[confirmedMaterials[costIndex].id]}
          onChange={(answer) => updateCost(confirmedMaterials[costIndex].id, answer)}
        />
      )}

      {phase === 'time' && (
        <div className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-2">
            <legend className="font-label text-label-md text-on-surface">
              {t('Choose the closest answer')}
            </legend>
            {timeOptions.map(([value, label]) => (
              <label key={value} className="flex min-h-11 items-center gap-3 font-body text-body-md text-on-surface">
                <input
                  type="radio"
                  name="timeSpent"
                  checked={timeChoice === value}
                  onChange={() => setTimeChoice(value)}
                />
                {t(label)}
              </label>
            ))}
          </fieldset>
          {timeChoice === 'custom' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="font-label text-label-md text-on-surface">{t('Hours')}</span>
                <input type="number" min="0" max="168" step="1" value={customHours} onChange={(e) => setCustomHours(e.target.value)} className={fieldClass} />
              </label>
              <label className="flex flex-col gap-2">
                <span className="font-label text-label-md text-on-surface">{t('Extra minutes')}</span>
                <input type="number" min="0" max="59" step="1" value={customMinutes} onChange={(e) => setCustomMinutes(e.target.value)} className={fieldClass} />
              </label>
            </div>
          )}
          <label className="flex flex-col gap-2">
            <span className="font-label text-label-md text-on-surface">
              {t('Starting pay for your time (NPR per hour)')}
            </span>
            <input
              type="number"
              min="0"
              max="100000"
              step="1"
              inputMode="decimal"
              value={hourlyRateNpr}
              onChange={(event) => setHourlyRateNpr(event.target.value)}
              className={fieldClass}
            />
            {config && (
              <span className="font-body text-sm text-on-surface-variant">
                {t('This starting amount can be changed. It is not a fixed rule.')}
              </span>
            )}
          </label>
        </div>
      )}

      {phase === 'expenses' && (
        <div className="flex flex-col gap-4">
          <p className="font-label text-label-md text-on-surface">
            {t('Did you spend money on anything else to make it?')}
          </p>
          <div className="flex flex-col gap-3">
            {expenseOptions.map((name) => (
              <label key={name} className="flex min-h-11 items-center gap-3 font-body text-body-md text-on-surface">
                <input
                  type="checkbox"
                  checked={expenses.some((expense) => expense.name === name)}
                  onChange={() => toggleExpense(name)}
                />
                {t(name)}
              </label>
            ))}
          </div>
          {expenses.map((expense, index) => (
            <div key={`${expense.name}-${index}`} className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
              <label className="grid gap-2 sm:grid-cols-2 sm:items-center">
                <span className="font-label text-label-md text-on-surface">{t('{{name}} (NPR)', { name: expense.name })}</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={expense.amountNpr}
                  onChange={(event) => updateExpense(index, { amountNpr: event.target.value })}
                  className={fieldClass}
                  aria-label={t('{{name}} cost in NPR', { name: expense.name })}
                />
              </label>
              <button
                type="button"
                onClick={() => setExpenses((current) => current.filter((_, i) => i !== index))}
                className="min-h-11 self-start rounded-lg px-3 font-label text-label-md text-error sm:self-center"
                aria-label={t('Remove {{name}}', { name: expense.name })}
              >
                {t('Remove')}
              </button>
            </div>
          ))}
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={customExpenseName}
              onChange={(event) => setCustomExpenseName(event.target.value)}
              maxLength={100}
              placeholder={t('Another cost (optional)')}
              className={fieldClass}
            />
            <button
              type="button"
              disabled={expenses.length >= 10}
              onClick={() => {
                if (!customExpenseName.trim()) return
                setExpenses((current) => [...current, { name: customExpenseName.trim(), amountNpr: '' }])
                setCustomExpenseName('')
              }}
              className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {t('+ Add cost')}
            </button>
          </div>
          <label className="flex flex-col gap-2">
            <span className="font-label text-label-md text-on-surface">
              {t('Extra amount to add on top (%)')}
            </span>
            <input
              type="number"
              min="0"
              max="200"
              step="1"
              inputMode="decimal"
              value={profitMarginPercent}
              onChange={(event) => setProfitMarginPercent(event.target.value)}
              className={fieldClass}
            />
            {config && (
              <span className="font-body text-sm text-on-surface-variant">
                {t('Starting suggestion: {{percent}}%. You can change it or choose 0%.', { percent: config.profitMarginPercent })}
              </span>
            )}
          </label>
        </div>
      )}

      {phase === 'result' && pricing && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 rounded-lg bg-surface-container-lowest p-4">
            <div className="flex flex-col gap-2">
              <h4 className="font-label text-label-md text-on-surface">{t('Material costs')}</h4>
              {pricing.materials.length === 0 && (
                <p className="font-body text-body-md text-on-surface-variant">{t('No material costs included.')}</p>
              )}
              {pricing.materials.map((material, index) => {
                const source = material.costSource === 'ai'
                  ? t('AI estimate (approx.)')
                  : material.method === 'estimated'
                    ? t('your estimate')
                    : material.method === 'used'
                      ? t('your cost for amount used')
                      : material.method === 'half'
                        ? t('your price, about half used')
                        : material.method === 'exact'
                          ? t('your price, {{quantity}} {{unit}} used', { quantity: material.quantityUsed, unit: material.unit || t('units') })
                          : t('your price, all used')
                return (
                  <div key={`${material.name}-${index}`} className="flex justify-between gap-3 font-body text-body-md text-on-surface">
                    <span>{material.name}{material.usedQuantityDescription ? ` (${material.usedQuantityDescription})` : ''} <span className="text-sm text-on-surface-variant">({source})</span></span>
                    <span className="shrink-0">{money(material.costNpr)}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex flex-col gap-2 border-t border-outline-variant pt-3">
              <h4 className="font-label text-label-md text-on-surface">{t('Other costs')}</h4>
              {pricing.expenses.length === 0 && (
                <p className="font-body text-body-md text-on-surface-variant">{t('No additional costs included.')}</p>
              )}
              {pricing.expenses.map((expense, index) => (
                <div key={`${expense.name}-${index}`} className="flex justify-between gap-3 font-body text-body-md text-on-surface">
                  <span>{expense.name}</span><span>{money(expense.amountNpr)}</span>
                </div>
              ))}
              {skippedExpensesCount > 0 && (
                <p className="font-body text-sm text-on-surface-variant">
                  {skippedExpensesCount === 1
                    ? t('{{count}} cost with no amount entered was not included.', { count: skippedExpensesCount })
                    : t('{{count}} costs with no amount entered were not included.', { count: skippedExpensesCount })}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 border-t border-outline-variant pt-3">
              <h4 className="font-label text-label-md text-on-surface">{t('Your time')}</h4>
            {pricing.minutesSpent !== null && (
                <div className="flex justify-between gap-3 font-body text-body-md text-on-surface">
                  <span>
                    {t('{{hours}} hours × {{rate}}/hour', { hours: pricing.minutesSpent / 60, rate: money(pricing.hourlyRateNpr) })}
                    {pricing.timeEstimated ? ` (${t('estimated time')})` : ''}
                  </span>
                  <span className="shrink-0">{money(pricing.labourCostNpr)}</span>
                </div>
            )}
            {pricing.minutesSpent === null && (
              <p className="font-body text-body-md text-on-surface-variant">{t('Your time was not included.')}</p>
            )}
            </div>
            <div className="mt-2 flex justify-between gap-3 border-t border-outline-variant pt-2 font-label text-label-md text-on-surface">
              <span>{t('Estimated cost to make')}</span><span>{money(pricing.totalCostNpr)}</span>
            </div>
            <div className="flex justify-between gap-3 font-body text-body-md text-on-surface-variant">
              <span>{t('Suggested profit ({{percent}}%)', { percent: pricing.profitMarginPercent })}</span>
              <span>{money(pricing.profitAmountNpr)}</span>
            </div>
            <div className="flex justify-between gap-3 border-t border-outline-variant pt-2 font-label text-title-md text-primary">
              <span>{t('Suggested selling price')}</span>
              <span>{money(pricing.suggestedPriceNpr)}</span>
            </div>
          </div>
          {!pricing.complete && (
            <p className="rounded-lg bg-amber-50 p-3 font-body text-body-md text-amber-900">
              {t('Your time was not included, so this estimate is incomplete.')}
            </p>
          )}
          {(pricing.timeEstimated || pricing.materials.some((item) => item.method === 'estimated' || item.method === 'half')) && (
            <p className="font-body text-sm text-on-surface-variant">
              {t('Some amounts are estimates. Check them and change anything that does not look right.')}
            </p>
          )}
          <p className="font-body text-body-md text-on-surface-variant">
            {t('You shared costs of about {{cost}}. At this suggested price, about {{profit}} remains before other costs we did not include.', { cost: money(pricing.totalCostNpr), profit: money(pricing.profitAmountNpr) })}
          </p>
          <p className="font-label text-label-md text-on-surface">
            {t('Would you like to sell your product at this price?')}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button type="button" onClick={() => finish('accepted')} className="min-h-[48px] rounded-lg bg-primary px-4 font-label text-label-md text-on-primary">
              {t('Accept suggested price')}
            </button>
            <button type="button" onClick={() => finish('changed')} className={buttonClass}>
              {t('Change the price myself')}
            </button>
            <button type="button" onClick={() => { setError(''); setPhase('materials') }} className={buttonClass}>
              {t('Calculate again')}
            </button>
          </div>
        </div>
      )}

      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 font-body text-body-md text-error">{error}</p>}

      {phase !== 'result' && (
        <div className="sticky bottom-0 z-10 -mx-4 -mb-4 mt-2 flex flex-wrap gap-3 border-t border-outline-variant bg-primary-container/95 px-4 py-3 shadow-[0_-8px_12px_rgba(0,0,0,0.08)] backdrop-blur sm:-mx-5 sm:-mb-5 sm:px-5">
          <button type="button" onClick={back} className={buttonClass}>
            {phase === 'materials' ? t('Use my own price') : t('Back')}
          </button>
          {phase === 'materials' && (
            <button
              type="button"
              disabled={materials.some((material) => !material.decision)}
              onClick={() => {
                if (materials.some((material) => !material.name.trim())) {
                  setError(t('Please add a name for each material, or remove it.'))
                  return
                }
                setError('')
                setCostIndex(0)
                setPhase(confirmedMaterials.length ? 'costs' : 'time')
              }}
              className="min-h-[48px] rounded-lg bg-primary px-5 font-label text-label-md text-on-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('Continue')}
            </button>
          )}
          {phase === 'costs' && (
            <button type="button" onClick={saveMaterialCost} className="min-h-[48px] rounded-lg bg-primary px-5 font-label text-label-md text-on-primary">
              {costIndex < confirmedMaterials.length - 1 ? t('Next material') : t('Continue')}
            </button>
          )}
          {phase === 'time' && (
            <>
              <button type="button" onClick={() => continueFromTime(true)} className={buttonClass}>
                {t('Skip time')}
              </button>
              <button type="button" onClick={() => continueFromTime()} className="min-h-[48px] rounded-lg bg-primary px-5 font-label text-label-md text-on-primary">
                {t('Continue')}
              </button>
            </>
          )}
          {phase === 'expenses' && (
            <>
              <button type="button" onClick={() => { setExpenses([]); calculate([]) }} className={buttonClass}>
                {t('Skip other costs')}
              </button>
              <button type="button" disabled={working} onClick={() => calculate()} className="min-h-[48px] rounded-lg bg-primary px-5 font-label text-label-md text-on-primary disabled:opacity-60">
                {working ? t('Working it out...') : expenses.length ? t('See my estimate') : t('No other costs — see my estimate')}
              </button>
            </>
          )}
        </div>
      )}
    </section>
  )
}

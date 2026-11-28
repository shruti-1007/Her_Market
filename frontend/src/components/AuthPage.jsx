import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/useAuth.js'
import { inputClass, ORG_TYPES } from '../constants.js'

function Icon({ children, className = '' }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      aria-hidden="true"
    >
      {children}
    </span>
  )
}

function BrandMark() {
  return (
    <Link to="/" className="flex items-center gap-3 rounded-lg">
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-on-primary shadow-sm">
        <Icon className="text-headline-sm">storefront</Icon>
      </span>
      <span className="font-headline text-title-lg text-primary">HerMarket</span>
    </Link>
  )
}

function Field({ label, type = 'text', autoComplete, ...inputProps }) {
  const id = inputProps.id

  return (
    <label htmlFor={id} className="flex flex-col gap-2">
      <span className="font-label text-label-md text-on-surface">{label}</span>
      <input
        {...inputProps}
        id={id}
        type={type}
        autoComplete={autoComplete}
        className="min-h-[52px] rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body text-body-md text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  )
}

function AccountTypeSelector({ role, onChange }) {
  const { t } = useTranslation()
  const options = [
    {
      value: 'customer',
      title: 'I want to shop',
      description: 'Discover handmade goods from local makers.',
      icon: 'shopping_bag',
    },
    {
      value: 'seller',
      title: 'I want to sell',
      description: 'Open a shop for your handmade products.',
      icon: 'storefront',
    },
    {
      value: 'organization',
      title: 'I represent an organization',
      description: 'Publish events and programs for the community.',
      icon: 'apartment',
    },
  ]

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="font-label text-label-md text-on-surface">
        {t('How will you use HerMarket?')}
      </legend>
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
              role === option.value
                ? 'border-primary bg-primary-container text-on-primary-container'
                : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <input
              type="radio"
              name="role"
              value={option.value}
              checked={role === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            <Icon className="mt-0.5 text-title-md">{option.icon}</Icon>
            <span className="flex flex-col gap-1">
              <span className="font-label text-label-md">{t(option.title)}</span>
              <span className="font-body text-sm leading-5">
                {t(option.description)}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function AuthPage({ mode }) {
  const { t } = useTranslation()
  const isRegister = mode === 'register'
  const { login, register } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [role, setRole] = useState('customer')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    setFeedback(null)
    setIsSubmitting(true)

    const formData = new FormData(event.currentTarget)
    const payload = {
      email: formData.get('email'),
      password: formData.get('password'),
    }

    if (isRegister) {
      payload.name = formData.get('name')
      payload.role = role
      if (role !== 'customer') {
        payload.location = formData.get('location')
        payload.contact = formData.get('contact')
      }
      if (role === 'organization') {
        payload.organizationType = formData.get('organizationType')
        payload.description = formData.get('description')
        payload.website = formData.get('website') || undefined
      } else if (role === 'seller') {
        payload.description = formData.get('description')
      }
    }

    try {
      if (isRegister) {
        await register(payload)
        setFeedback({
          type: 'success',
          message: 'Your account is ready. Sign in to continue.',
        })
      } else {
        await login(payload)
        const destination = location.state?.from?.pathname
        navigate(
          destination?.startsWith('/') && !destination.startsWith('//')
            ? destination
            : '/dashboard',
          { replace: true },
        )
      }
    } catch (error) {
      const responseData = error.response?.data
      const details = Array.isArray(responseData?.errors)
        ? responseData.errors.join('. ')
        : ''
      setFeedback({
        type: 'error',
        message:
          details && responseData?.message
            ? `${responseData.message}: ${details}`
            : responseData?.message ||
              error.message ||
              'Could not complete the request. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-surface px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <BrandMark />
        <Link
          to="/"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 font-label text-label-md text-primary transition-colors hover:bg-primary-container"
        >
          <Icon>arrow_back</Icon>
          <span className="hidden sm:inline">{t('Back to marketplace')}</span>
          <span className="sm:hidden">{t('Back')}</span>
        </Link>
      </div>

      <div className="mx-auto mt-6 max-w-5xl overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-lg sm:mt-10 lg:grid lg:grid-cols-2">
        <aside className="relative hidden min-h-[680px] overflow-hidden bg-primary text-on-primary lg:flex">
          <img
            src="/images/hero_makers.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-primary/80" />
          <div className="relative z-10 flex flex-col justify-between p-12">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/15">
                <Icon className="text-headline-sm">storefront</Icon>
              </span>
              <span className="font-headline text-title-lg">{t('Made by women,')}</span>
            </div>
            <div className="flex flex-col gap-5">
              <p className="font-label text-label-lg text-primary-container">
                {t('A community marketplace')}
              </p>
              <h1 className="text-balance font-display text-display-lg">
                {isRegister
                  ? t('Your next chapter starts here.')
                  : t('Welcome back to your community.')}
              </h1>
              <p className="max-w-md text-pretty font-body text-body-lg text-primary-container">
                {t('Shop handmade goods, grow a small business, and connect with women makers in your neighborhood.')}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
                  <Icon>favorite</Icon>
                </span>
                <span className="font-label text-label-md">
                  {t('Helping local skills thrive')}
                </span>
              </div>
            </div>
            <p className="font-body text-body-md text-primary-container">
              {t('HerMarket · Shop local. Grow together.')}
            </p>
          </div>
        </aside>

        <section className="p-6 sm:p-10 lg:p-12">
          <div className="mb-8 flex flex-col gap-2">
            <p className="font-label text-label-md text-primary">
              {t(isRegister ? 'JOIN HERMARKET' : 'WELCOME BACK')}
            </p>
            <h2 className="font-headline text-headline-lg-mobile text-on-surface lg:text-headline-lg">
              {t(isRegister ? 'Create your account' : 'Sign in')}
            </h2>
            <p className="font-body text-body-md text-on-surface-variant">
              {isRegister
                ? t('Start shopping or share your handmade work with your community.')
                : t('Sign in to pick up where you left off.')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {isRegister && (
              <>
                <Field
                  id="name"
                  name="name"
                  label={t(role === 'organization' ? 'Organization name' : 'Full name')}
                  autoComplete="name"
                  placeholder={t('Your name')}
                  required
                />
                <AccountTypeSelector role={role} onChange={setRole} />
              </>
            )}

            <Field
              id="email"
              name="email"
              type="email"
              label={t('Email address')}
              autoComplete="email"
              placeholder={t('you@example.com')}
              required
            />

            <div className="flex flex-col gap-2">
              <Field
                id="password"
                name="password"
                type="password"
                label={t('Password')}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                placeholder={t(isRegister ? 'At least 8 characters' : 'Your password')}
                minLength={isRegister ? 8 : undefined}
                required
              />
              {isRegister && (
                <p className="font-body text-sm leading-5 text-on-surface-variant">
                  {t('Use at least 8 characters.')}
                </p>
              )}
            </div>

            {isRegister && (role === 'seller' || role === 'organization') && (
              <>
                <Field
                  id="location"
                  name="location"
                  label={t(role === 'organization' ? 'Organization location' : 'Shop location')}
                  autoComplete="address-level2"
                  placeholder={t('City, town, or neighborhood')}
                  required
                />
                <Field
                  id="contact"
                  name="contact"
                  type="tel"
                  label={t('Phone number')}
                  autoComplete="tel"
                  placeholder={t('Your phone number')}
                  required
                />
                {role === 'organization' && (
                  <>
                    <label htmlFor="organizationType" className="flex flex-col gap-2">
                      <span className="font-label text-label-md text-on-surface">
                        {t('Organization type')}
                      </span>
                      <select
                        id="organizationType"
                        name="organizationType"
                        defaultValue=""
                        required
                        className={inputClass}
                      >
                        <option value="" disabled>{t('Select organization type')}</option>
                        {ORG_TYPES.map(([value, label]) => (
                          <option key={value} value={value}>{t(label)}</option>
                        ))}
                      </select>
                    </label>
                    <label htmlFor="description" className="flex flex-col gap-2">
                      <span className="font-label text-label-md text-on-surface">
                        {t('About your organization')}
                      </span>
                      <textarea
                        id="description"
                        name="description"
                        rows={4}
                        minLength={10}
                        maxLength={1000}
                        required
                        placeholder={t('Describe your organization and its work (at least 10 characters)')}
                        className="min-h-[120px] rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body text-body-md text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </label>
                    <Field
                      id="website"
                      name="website"
                      type="url"
                      label={t('Website (optional)')}
                      placeholder="https://example.org"
                    />
                  </>
                )}
                {role === 'seller' && (
                  <label htmlFor="description" className="flex flex-col gap-2">
                    <span className="font-label text-label-md text-on-surface">
                      {t('About your shop')}
                    </span>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      maxLength={1000}
                      placeholder={t('Tell customers about your craft and the products you make (optional)')}
                      className="min-h-[120px] rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body text-body-md text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </label>
                )}
              </>
            )}

            {feedback && (
              <p
                role={feedback.type === 'error' ? 'alert' : 'status'}
                className={`rounded-lg px-4 py-3 font-body text-body-md ${
                  feedback.type === 'error'
                    ? 'bg-red-50 text-error'
                    : 'bg-tertiary-container text-on-tertiary-container'
                }`}
              >
                {t(feedback.message)}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-[52px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-label text-label-lg text-on-primary shadow-md transition-opacity hover:opacity-95 disabled:cursor-wait disabled:opacity-70"
            >
              <Icon>{isRegister ? 'person_add' : 'login'}</Icon>
              {isSubmitting
                ? isRegister
                  ? t('Creating account...')
                  : t('Signing in...')
                : isRegister
                  ? t('Create account')
                  : t('Sign in')}
            </button>
          </form>

          <p className="mt-7 text-center font-body text-body-md text-on-surface-variant">
            {t(isRegister ? 'Already have an account?' : 'New to HerMarket?')}{' '}
            <Link
              to={isRegister ? '/login' : '/register'}
              className="font-label text-primary underline-offset-4 hover:underline"
            >
              {t(isRegister ? 'Sign in' : 'Create an account')}
            </Link>
          </p>
        </section>
      </div>

      <p className="mx-auto mt-6 max-w-5xl text-center font-body text-sm leading-5 text-on-surface-variant">
        {t('By continuing, you agree to help keep HerMarket a kind and supportive community.')}
      </p>
    </main>
  )
}

export default AuthPage

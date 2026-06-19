import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex flex-col">
      <Helmet>
        <title>About ReachRipple | Verified Premium Classifieds</title>
        <meta
          name="description"
          content="ReachRipple is a UK-focused premium classifieds marketplace. Learn how we verify listings, protect privacy, and keep contact safe."
        />
        <link rel="canonical" href="https://reachripple-live-web.onrender.com/about" />
        <meta property="og:title" content="About ReachRipple | Verified Premium Classifieds" />
        <meta
          property="og:description"
          content="ReachRipple is a UK-focused premium classifieds marketplace. Learn how we verify listings, protect privacy, and keep contact safe."
        />
        <meta property="og:url" content="https://reachripple-live-web.onrender.com/about" />
      </Helmet>

      <Navbar />

      <main className="flex-grow">
        <section className="bg-gradient-to-b from-purple-50 to-white dark:from-zinc-900 dark:to-zinc-900 py-14 px-4">
          <div className="max-w-3xl mx-auto">
            <nav aria-label="Breadcrumb" className="text-sm text-zinc-500 mb-3">
              <Link to="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">Home</Link>
              <span className="mx-2">›</span>
              <span aria-current="page">About</span>
            </nav>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
              About ReachRipple
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              A premium classifieds marketplace built around verified listings, transparent moderation, and privacy-first contact.
            </p>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 py-10 space-y-10">
          <article>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">What we do</h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
              ReachRipple connects people across the UK with trusted local services and listings. We focus on signal over noise:
              verified providers, clear categories, and direct, privacy-first contact. Whether you’re looking for a tradesperson,
              a flatmate, a vehicle, or browsing the age-gated 18+ adult directory, the experience is built to be fast, mobile-first,
              and safe.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">Our principles</h2>
            <ul className="grid sm:grid-cols-2 gap-3 text-zinc-700 dark:text-zinc-300">
              <li className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-950">
                <strong className="block text-zinc-900 dark:text-white">Verification before promotion</strong>
                Providers can complete identity verification to earn a clearly labelled badge.
              </li>
              <li className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-950">
                <strong className="block text-zinc-900 dark:text-white">Moderation before publication</strong>
                Listings are reviewed against our content rules before going live.
              </li>
              <li className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-950">
                <strong className="block text-zinc-900 dark:text-white">Privacy by default</strong>
                Contact happens through privacy-first channels — you choose what to share.
              </li>
              <li className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-950">
                <strong className="block text-zinc-900 dark:text-white">Transparent reporting and takedown</strong>
                Anyone can report; we publish what we moderate and why.
              </li>
            </ul>
          </article>

          <article>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">Where we operate</h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
              UK-focused, mobile-first. Listings cover services, jobs, property, vehicles, buy &amp; sell, and an age-gated 18+ adult
              directory where applicable. We follow UK-specific guidance including the Online Safety Act and Modern Slavery rules —
              see the links in the footer for our published policies.
            </p>
          </article>

          <article>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">Get in touch</h2>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
              Questions, feedback, or abuse reports? Visit our <Link to="/contact" className="text-purple-600 underline">contact page</Link>,
              read the <Link to="/safety" className="text-purple-600 underline">safety guide</Link>, or review our{' '}
              <Link to="/privacy" className="text-purple-600 underline">privacy policy</Link> and{' '}
              <Link to="/terms" className="text-purple-600 underline">terms of service</Link>.
            </p>
          </article>
        </section>
      </main>

      <Footer />
    </div>
  );
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
}

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-10">
      
      {/* Banner */}
      <section className="w-full h-64 sm:h-80 lg:h-[450px] relative overflow-hidden border border-nhw-cyan/30">
        <img
          src="/about-header.png"
          alt="The Cast of News Hub World"
          className="absolute inset-0 w-full h-full object-cover object-top opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-nhw-bg via-transparent to-transparent pointer-events-none" />
      </section>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <h1 className="text-nhw-cyan uppercase tracking-widest drop-shadow-md mb-8">About Ernest of Gaia</h1>

        <p className="text-white/80">
          Ernest is a tradesperson on the Oregon coast who also teaches people how to use AI tools — Claude, Google AI, and ChatGPT — in their actual workflows. This publication is where he shares build logs from his software projects and observations on working with AI. Written for people who want to see how things get built, not just hear that they were.
        </p>

        <h2 className="text-nhw-cyan uppercase tracking-widest drop-shadow-md mt-10 mb-6">The hidden purpose</h2>
        <p className="text-white/80">
          The hardest thing to hold when you build with AI tools is a steady signal. Models drift. Characters drift. The thread you started with slips into noise.
        </p>
        <p className="text-white/80">
          So this is a command center on a cliff, where the waves never stop crashing — and the crew has one mission: <strong className="text-nhw-amber">keep the signal from drifting</strong>. Every character rendered here, every strip merged into canon, is that experiment run in the open. News Hub World isn&apos;t really about the news. It&apos;s proof that drift can be held.
        </p>

        <h2 className="text-nhw-cyan uppercase tracking-widest drop-shadow-md mt-10 mb-6">Contact</h2>
        <ul className="text-white/80 space-y-2">
          <li>Email: <a href="mailto:eog@ernestofgaia.xyz" className="text-nhw-cyan hover:opacity-70 transition-opacity">eog@ernestofgaia.xyz</a></li>
          <li>Text: <a href="tel:5036640546" className="text-nhw-cyan hover:opacity-70 transition-opacity">503-664-0546</a></li>
          <li>Main site: <a href="https://ernestofgaia.xyz" target="_blank" rel="noopener noreferrer" className="text-nhw-cyan hover:opacity-70 transition-opacity">https://ernestofgaia.xyz</a></li>
        </ul>
      </div>
    </main>
  )
}

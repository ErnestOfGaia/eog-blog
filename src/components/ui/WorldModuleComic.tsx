import Link from 'next/link'

// The home "comic book" module: opens the comic-strip repository (the list of
// comic-only publications). Individual comics open in the page-flip viewer from
// there. (Previously opened an empty ComicStripViewer with no panels wired.)
export default function WorldModuleComic() {
  return (
    <div className="flex flex-col h-full justify-end items-end">
      <Link
        href="/dispatch/comics"
        className="text-label-sm text-nhw-cyan/80 uppercase tracking-widest border border-nhw-cyan/40 bg-nhw-surface/60 backdrop-blur-sm px-4 py-2 hover:border-nhw-cyan hover:bg-nhw-surface/80 hover:text-nhw-cyan transition-all"
        aria-label="Open the comic book — browse comic strips"
      >
        MODULE: CLICK TO OPEN COMIC BOOK
      </Link>
    </div>
  )
}

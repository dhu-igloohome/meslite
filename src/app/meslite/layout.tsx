import MesliteShell from "./_components/meslite-shell";

export default function MesliteLayout({ children }: { children: React.ReactNode }) {
  return <MesliteShell>{children}</MesliteShell>;
}

import { ChefHat, Sparkles, Users, UtensilsCrossed } from "lucide-react";
import Logo from "./Logo";

const highlights = [
  { icon: Sparkles, text: "AI turns your ingredients into a full recipe in seconds" },
  { icon: ChefHat, text: "Real chefs publish recipes you can actually cook" },
  { icon: Users, text: "Share your food story with a community that gets it" },
];

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary px-10 py-10 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-10 h-80 w-80 rounded-full bg-secondary/30 blur-3xl" />

        <Logo className="relative z-10 [&_span:last-child]:text-white" />

        <div className="relative z-10 max-w-md">
          <p className="font-display text-4xl font-semibold leading-tight">
            Cook. Create. Share.
          </p>
          <p className="mt-3 text-white/70">
            Turn your ingredients into something amazing — FoodAI blends AI recipe creation, chef expertise, and a food-loving community.
          </p>

          <ul className="mt-8 space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Icon size={15} />
                </span>
                <span className="text-sm text-white/85">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 flex items-center gap-2 text-xs text-white/50">
          <UtensilsCrossed size={13} /> An AI-powered food & recipe community
        </p>
      </div>

      <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

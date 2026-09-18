import { Flame, Users2, Clock, Leaf, ShieldAlert } from "lucide-react";

export default function RecipeResult({
  eyebrow = "AI Generated Recipe",
  name,
  description,
  badges = [],
  nutrition = [],
  ingredients = [],
  proteinSources = [],
  medicalConsiderations = [],
  instructions = [],
  context,
  children,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-br from-primary/5 to-accent/5 px-6 py-6 rounded-t-2xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">{eyebrow}</p>
        <h1 className="mt-1.5 font-display text-2xl font-semibold text-ink sm:text-3xl">{name}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>}

        {context && <div className="mt-4">{context}</div>}

        {badges.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {badges.map((b) => (
              <span
                key={b}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-ink/80"
              >
                {b}
              </span>
            ))}
          </div>
        )}
      </div>

      {nutrition.length > 0 && (
        <div className="grid grid-cols-2 gap-3 px-6 py-5 sm:grid-cols-4">
          {nutrition.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-bg px-3 py-3 text-center">
              <Icon size={16} className="mx-auto text-secondary" />
              <p className="mt-1.5 text-sm font-semibold text-ink">{value ?? "—"}</p>
              <p className="text-xs text-muted">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 px-6 pb-6 sm:grid-cols-2">
        {ingredients.length > 0 && (
          <Section title="Ingredients">
            <ul className="space-y-1.5 text-sm text-ink/80">
              {ingredients.map((ing, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {ing}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {proteinSources.length > 0 && (
          <Section title="Protein Sources" icon={Leaf}>
            <div className="flex flex-wrap gap-2">
              {proteinSources.map((p, i) => (
                <span key={i} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {p}
                </span>
              ))}
            </div>
          </Section>
        )}

        {medicalConsiderations.length > 0 && (
          <Section title="Medical Considerations" icon={ShieldAlert}>
            <ul className="space-y-1.5 text-sm text-ink/80">
              {medicalConsiderations.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      {instructions.length > 0 && (
        <div className="border-t border-slate-100 px-6 py-6">
          <h3 className="mb-4 font-display text-lg font-semibold text-ink">Instructions</h3>
          <ol className="space-y-4">
            {instructions.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="pt-1 text-sm text-ink/80">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {children && <div className="border-t border-slate-100 px-6 py-5">{children}</div>}
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
        {Icon && <Icon size={15} className="text-secondary" />}
        {title}
      </h3>
      {children}
    </div>
  );
}

export const NutritionIcons = { Flame, Users2, Clock };

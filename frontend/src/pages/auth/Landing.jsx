import { Link } from "react-router-dom";
import { Sparkles, ChefHat, Users, Share2, ArrowRight } from "lucide-react";
import Logo from "../../components/Logo";

const features = [
  { icon: Sparkles, title: "AI Recipe Creation", text: "Give FoodAI your ingredients and it builds a full, protein-smart recipe around them." },
  { icon: ChefHat, title: "Chef Recipes", text: "Browse dishes uploaded by real chefs, complete with precautions and prep time." },
  { icon: Users, title: "Food Community", text: "Follow posts, hashtags and food stories from cooks just like you." },
  { icon: Share2, title: "Create & Share", text: "Publish your own creations, like, comment and save the ones you love." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-ink/80 hover:text-ink">
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-dark"
          >
            Get Started
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-16 pt-10 text-center sm:pt-20">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-secondary">
          <Sparkles size={13} /> AI-powered food & recipe platform
        </span>
        <h1 className="mt-6 font-display text-4xl font-semibold leading-tight text-ink sm:text-6xl">
          Food<span className="text-secondary">AI</span>
        </h1>
        <p className="mt-2 font-display text-lg text-muted sm:text-xl">Cook • Create • Share</p>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted">
          Turn your ingredients into something amazing — then share it with a community that loves food as much as you do.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/register"
            className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-dark hover:shadow-md"
          >
            Create Recipe with AI <ArrowRight size={15} />
          </Link>
          <Link
            to="/register"
            className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-ink transition-all duration-200 hover:shadow-md"
          >
            Explore Recipes
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon size={18} />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold text-ink">{title}</h3>
              <p className="mt-1.5 text-sm text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
            Ready to cook something amazing?
          </h2>
          <p className="mt-2 text-sm text-muted">Join FoodAI free — as a home cook or a chef.</p>
          <Link
            to="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-dark"
          >
            Get Started <ArrowRight size={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}

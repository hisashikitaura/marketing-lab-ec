import Link from "next/link";
import { formatJpy } from "@/lib/format";

type Props = {
  slug: string;
  name: string;
  description: string;
  priceJpy: number;
  imageEmoji: string;
  category: string;
};

export function ProductCard({
  slug,
  name,
  description,
  priceJpy,
  imageEmoji,
  category,
}: Props) {
  return (
    <Link
      href={`/products/${slug}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
    >
      <div className="mb-4 flex h-28 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 text-5xl">
        {imageEmoji}
      </div>
      <span className="mb-1 text-xs font-medium uppercase tracking-wide text-indigo-600">
        {category === "course" ? "コース" : "書籍"}
      </span>
      <h2 className="mb-2 text-lg font-semibold text-slate-900 group-hover:text-indigo-700">
        {name}
      </h2>
      <p className="mb-4 line-clamp-2 flex-1 text-sm text-slate-600">
        {description}
      </p>
      <p className="text-lg font-bold text-slate-900">{formatJpy(priceJpy)}</p>
    </Link>
  );
}

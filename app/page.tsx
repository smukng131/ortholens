"use client";

import { useState } from "react";
import ingredientsData from "../data/ingredients.json";
import productsData from "../data/products.json";

type Ingredient = {
  ingredient: string;
  aliases?: string[];
  category: string;
  purpose: string;
  orthoScore: number;
  irritationRisk: string;
  whiteningFlag: boolean;
  heavyMetalRisk: string;
  recommendation: string;
  reason: string;
};

type Product = {
  name: string;
  brand: string;
  ingredients: string[];
  bestFor: string[];
  score: number;
  reason: string;
};

export default function Home() {
  const [input, setInput] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [matched, setMatched] = useState<Ingredient[]>([]);
  const [unknown, setUnknown] = useState<string[]>([]);

  const findIngredient = (item: string) => {
    return (ingredientsData as Ingredient[]).find((dbItem) => {
      const aliases = dbItem.aliases || [dbItem.ingredient];

      return aliases.some((alias) =>
        item.toLowerCase().includes(alias.toLowerCase())
      );
    });
  };

  const analyzeIngredients = () => {
    const typedIngredients = input
      .split(/,|\n/)
      .map((item) => item.trim())
      .filter(Boolean);

    const found: Ingredient[] = [];
    const notFound: string[] = [];

    typedIngredients.forEach((item) => {
      const match = findIngredient(item);

      if (match) found.push(match);
      else notFound.push(item);
    });

    setMatched(found);
    setUnknown(notFound);
  };

  const selectProduct = (product: Product) => {
    const ingredientText = product.ingredients.join(", ");
    setInput(ingredientText);

    const found: Ingredient[] = [];
    const notFound: string[] = [];

    product.ingredients.forEach((item) => {
      const match = findIngredient(item);

      if (match) found.push(match);
      else notFound.push(item);
    });

    setMatched(found);
    setUnknown(notFound);
  };

  const averageScore =
    matched.length > 0
      ? Math.round(
          (matched.reduce((sum, item) => sum + item.orthoScore, 0) /
            matched.length) *
            20
        )
      : 0;

  const finalLabel =
    averageScore >= 80
      ? "Recommended"
      : averageScore >= 60
      ? "Acceptable"
      : averageScore >= 40
      ? "Caution"
      : matched.length > 0
      ? "Not Recommended"
      : "No result yet";
  const goodPoints = matched.filter(
    (item) => item.recommendation === "Recommended"
);
  const cautionPoints = matched.filter(
    (item) => item.recommendation === "Caution"
);

  const finalAdvice =
    averageScore >= 80
      ? "This toothpaste looks generally suitable for orthodontic care. Keep an eye on the caution ingredients, but the overall profile is strong."
      : averageScore >= 60
      ? "This toothpaste is acceptable, but there are some ingredients that may not be ideal for braces or sensitive mouths."
      : averageScore >= 40
      ? "This toothpaste should be used with caution during orthodontic treatment. Consider switching to a simpler fluoride-based option."
      : matched.length > 0
      ? "This toothpaste is not ideal for orthodontic care based on the current ingredient profile."
      : "";
  const cautionCount = matched.filter(
    (item) => item.recommendation === "Caution"
  ).length;

  const shouldShowAlternatives = matched.length > 0 && averageScore < 80;

  const recommendedProducts = shouldShowAlternatives
    ? (productsData as Product[])
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
    : [];

  const searchedProducts = (productsData as Product[]).filter((product) =>
    `${product.brand} ${product.name}`
      .toLowerCase()
      .includes(productSearch.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold">OrthoLens</h1>

        <p className="mt-3 text-gray-600">
          Paste toothpaste ingredients and get an orthodontic suitability score.
        </p>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow">
          <label className="font-semibold">Search by toothpaste name</label>

          <input
            className="mt-3 w-full rounded-xl border p-4 outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Example: Sensodyne, Colgate, Boka"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />

          {productSearch.length > 0 && (
            <div className="mt-4 grid gap-3">
              {searchedProducts.length > 0 ? (
                searchedProducts.map((product) => (
                  <button
                    key={product.name}
                    onClick={() => selectProduct(product)}
                    className="rounded-xl border p-4 text-left hover:bg-gray-50"
                  >
                    <div className="font-bold">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.brand}</div>
                  </button>
                ))
              ) : (
                <p className="text-gray-500">
                  No product found in current database.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow">
          <label className="font-semibold">Ingredient list</label>

          <textarea
            className="mt-3 h-40 w-full rounded-xl border p-4 outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Example: Sodium Fluoride, Hydrated Silica, Glycerin, Sodium Lauryl Sulfate"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button
            onClick={analyzeIngredients}
            className="mt-4 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Analyze
          </button>
        </div>

        {matched.length > 0 && (
          <div className="mt-8 rounded-2xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold">Overall Result</h2>
            <p className="mt-3 text-5xl font-bold">{averageScore}/100</p>
            <p className="mt-2 text-lg font-semibold">{finalLabel}</p>
          </div>
        )}
        {matched.length > 0 && (
  <div className="mt-8 rounded-2xl bg-white p-6 shadow">
    <h2 className="text-2xl font-bold">Why this score?</h2>

    <p className="mt-3 text-gray-700">{finalAdvice}</p>

    <div className="mt-5 grid gap-5 md:grid-cols-2">
      <div>
        <h3 className="font-bold text-green-700">Good points</h3>

        {goodPoints.length > 0 ? (
          <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-700">
            {goodPoints.map((item) => (
              <li key={item.ingredient}>
                <strong>{item.ingredient}</strong>: {item.purpose}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-gray-500">No strong positive ingredients found.</p>
        )}
      </div>

      <div>
        <h3 className="font-bold text-yellow-700">Caution points</h3>

        {cautionPoints.length > 0 ? (
          <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-700">
            {cautionPoints.map((item) => (
              <li key={item.ingredient}>
                <strong>{item.ingredient}</strong>: {item.reason}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-gray-500">No major caution ingredients found.</p>
        )}
      </div>
    </div>
  </div>
)}

        <div className="mt-8 grid gap-4">
          {matched.map((item) => (
            <div
              key={item.ingredient}
              className="rounded-2xl bg-white p-5 shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">{item.ingredient}</h3>
                  <p className="text-sm text-gray-500">{item.category}</p>
                </div>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold">
                  {item.orthoScore}/5
                </span>
              </div>

              <p className="mt-3">{item.purpose}</p>
              <p className="mt-2 text-gray-600">{item.reason}</p>

              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-green-100 px-3 py-1">
                  {item.recommendation}
                </span>

                <span className="rounded-full bg-yellow-100 px-3 py-1">
                  Irritation: {item.irritationRisk}
                </span>

                <span className="rounded-full bg-red-100 px-3 py-1">
                  Heavy metal risk: {item.heavyMetalRisk}
                </span>

                {item.whiteningFlag && (
                  <span className="rounded-full bg-blue-100 px-3 py-1">
                    Whitening ingredient
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {recommendedProducts.length > 0 && matched.length > 0 && (
          <div className="mt-8 rounded-2xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold">Recommended Alternatives</h2>

            <p className="mt-2 text-gray-600">
              Based on the ingredients you entered, these options may be more
              suitable for orthodontic care.
            </p>

            <div className="mt-5 grid gap-4">
              {recommendedProducts.map((product) => (
                <div key={product.name} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.brand}</p>
                    </div>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold">
                      {product.score}/100
                    </span>
                  </div>

                  <p className="mt-3 text-gray-700">{product.reason}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {product.bestFor.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-blue-100 px-3 py-1 text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {unknown.length > 0 && (
          <div className="mt-8 rounded-2xl bg-white p-6 shadow">
            <h2 className="text-xl font-bold">Unknown Ingredients</h2>

            <p className="mt-2 text-gray-600">
              These were not found in the current database:
            </p>

            <ul className="mt-3 list-disc pl-6">
              {unknown.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
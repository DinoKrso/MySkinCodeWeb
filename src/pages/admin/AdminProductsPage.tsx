import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import ProductImageUpload from "../../components/admin/ProductImageUpload";
import ProductSuccessModal from "../../components/admin/ProductSuccessModal";
import {
  buildProductPk,
  EMPTY_PRODUCT_FORM,
  parseListInput,
  PRODUCT_PRICE_RANGES,
  PRODUCT_SKIN_TYPES,
  PRODUCT_STEP_TYPES,
  type ProductFormInput,
} from "../../content/product-form";
import { createProduct } from "../../lib/admin-products";
import "../dashboard/dashboard-pages.css";
import "./AdminProductsPage.css";

function ListField({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="ui-field admin-products__field--full">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={hint}
      />
      <p className="admin-products__hint">{hint}</p>
    </div>
  );
}

export default function AdminProductsPage() {
  useEffect(() => {
    document.title = "Proizvodi | MySkin Code Admin";
  }, []);

  const [form, setForm] = useState<ProductFormInput>({ ...EMPTY_PRODUCT_FORM });
  const [listDraft, setListDraft] = useState({
    concerns: "",
    highlights: "",
    ingredients: "",
    key_ingredients: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successModal, setSuccessModal] = useState<{
    pk: string;
    brand: string;
    name: string;
  } | null>(null);
  const [imageResetKey, setImageResetKey] = useState(0);
  const [imageUploaded, setImageUploaded] = useState(false);

  const previewPk = useMemo(() => {
    if (!form.brand.trim() || !form.name.trim()) return "PRODUCT#…";
    return buildProductPk(form.brand, form.name);
  }, [form.brand, form.name]);

  function patch<K extends keyof ProductFormInput>(
    key: K,
    value: ProductFormInput[K],
  ) {
    if (key === "brand" || key === "name") {
      setImageUploaded(false);
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleImageUploaded(url: string) {
    patch("image", url);
    setImageUploaded(true);
  }

  function handleImageCleared() {
    patch("image", "");
    setImageUploaded(false);
  }

  function toggleSkinType(type: string) {
    setForm((prev) => {
      const has = prev.skin_types.includes(type);
      return {
        ...prev,
        skin_types: has
          ? prev.skin_types.filter((t) => t !== type)
          : [...prev.skin_types, type],
      };
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessModal(null);
    setLoading(true);

    if (!form.image.trim() || !imageUploaded) {
      setError(
        "Prvo uspješno uploadaj sliku na S3 (zelena poruka „Slika je na S3”), zatim spremi proizvod.",
      );
      setLoading(false);
      return;
    }

    const payload: ProductFormInput = {
      ...form,
      concerns: parseListInput(listDraft.concerns),
      highlights: parseListInput(listDraft.highlights),
      ingredients: parseListInput(listDraft.ingredients),
      key_ingredients: parseListInput(listDraft.key_ingredients),
    };

    try {
      const result = await createProduct(payload);
      setSuccessModal({
        pk: String(result.product.PK ?? previewPk),
        brand: payload.brand,
        name: payload.name,
      });
      setForm({ ...EMPTY_PRODUCT_FORM });
      setListDraft({
        concerns: "",
        highlights: "",
        ingredients: "",
        key_ingredients: "",
      });
      setImageResetKey((k) => k + 1);
      setImageUploaded(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Spremanje nije uspjelo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-products">
      <ProductSuccessModal
        open={successModal !== null}
        brand={successModal?.brand ?? ""}
        name={successModal?.name ?? ""}
        pk={successModal?.pk ?? ""}
        onClose={() => setSuccessModal(null)}
      />
      <header className="dashboard-view__header">
        <h1 className="dashboard-view__title">Proizvodi</h1>
        <p className="dashboard-view__subtitle">
          Dodaj novi proizvod u DynamoDB (PK <code>PRODUCT#…</code>, SK{" "}
          <code>META</code>).
        </p>
      </header>

      <div className="admin-products__warning" role="note">
        <span className="admin-products__warning-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div className="admin-products__warning-body">
          <p className="admin-products__warning-title">Pazljivo unesite podatke</p>
          <p className="admin-products__warning-text">
            Netočni ili neusklađeni podaci mogu spriječiti ispravnu dodjelu proizvoda u
            korisničkoj rutini. Pridržavajte se formata i vrijednosti kako je navedeno u
            formi.
          </p>
          <ul className="admin-products__warning-list">
            <li>
              <strong>step_type</strong> — samo vrijednosti iz padajućeg izbornika (npr. Čistač,
              Serum, SPF).
            </li>
            <li>
              <strong>category</strong> — točan naziv na engleskom (npr. moisturizer, serum,
              sunscreen).
            </li>
            <li>
              <strong>concerns / highlights / sastojci</strong> — mala slova, engleski, odvojeno
              zarezom ili novim redom.
            </li>
            <li>
              <strong>skin_types</strong> — odaberite sve tipove kože za koje je proizvod
              prikladan.
            </li>
          </ul>
        </div>
      </div>

      <form className="admin-products__form ui-card" onSubmit={handleSubmit}>
        <div className="admin-products__pk-preview">
          <span className="ui-eyebrow">Generirani PK</span>
          <code>{previewPk}</code>
        </div>

        <div className="admin-products__grid">
          <div className="ui-field">
            <label htmlFor="brand">Brand *</label>
            <input
              id="brand"
              value={form.brand}
              onChange={(e) => patch("brand", e.target.value)}
              required
              placeholder="CeraVe"
            />
          </div>

          <div className="ui-field">
            <label htmlFor="name">Naziv proizvoda *</label>
            <input
              id="name"
              value={form.name}
              onChange={(e) => patch("name", e.target.value)}
              required
              placeholder="Hidratantna Njega Za Lice SPF30"
            />
          </div>

          <div className="ui-field">
            <label htmlFor="line">Linija</label>
            <input
              id="line"
              value={form.line}
              onChange={(e) => patch("line", e.target.value)}
              placeholder="Hidracijske kreme za lice"
            />
          </div>

          <div className="ui-field">
            <label htmlFor="category">Kategorija *</label>
            <input
              id="category"
              value={form.category}
              onChange={(e) => patch("category", e.target.value)}
              required
              placeholder="npr. moisturizer, serum, sunscreen"
            />
          </div>

          <div className="ui-field">
            <label htmlFor="step_type">Tip koraka (step_type) *</label>
            <div className="ui-select-wrap">
              <select
                id="step_type"
                className="ui-select"
                value={form.step_type}
                onChange={(e) =>
                  patch(
                    "step_type",
                    e.target.value as ProductFormInput["step_type"],
                  )
                }
                required
              >
                {PRODUCT_STEP_TYPES.map((step) => (
                  <option key={step} value={step}>
                    {step}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="ui-field">
            <label htmlFor="price_range">Cjenovni rang *</label>
            <div className="ui-select-wrap">
              <select
                id="price_range"
                className="ui-select"
                value={form.price_range}
                onChange={(e) => patch("price_range", e.target.value)}
                required
              >
                {PRODUCT_PRICE_RANGES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="ui-field">
            <label htmlFor="country">Država</label>
            <input
              id="country"
              value={form.country}
              onChange={(e) => patch("country", e.target.value)}
              placeholder="USA"
            />
          </div>

          <ProductImageUpload
            key={imageResetKey}
            brand={form.brand}
            name={form.name}
            imageUrl={form.image}
            imageUploaded={imageUploaded}
            onImageUploaded={handleImageUploaded}
            onImageCleared={handleImageCleared}
          />

          <div className="ui-field admin-products__field--full">
            <label htmlFor="description">Opis *</label>
            <textarea
              id="description"
              rows={5}
              value={form.description}
              onChange={(e) => patch("description", e.target.value)}
              required
              placeholder="Kratak opis proizvoda..."
            />
          </div>

          <ListField
            id="concerns"
            label="Concerns"
            hint="Odvoji zarezom ili novim redom (npr. hydration, sun protection)"
            value={listDraft.concerns}
            onChange={(v) => setListDraft((d) => ({ ...d, concerns: v }))}
          />

          <ListField
            id="highlights"
            label="Highlights"
            hint="npr. SPF30, hydrating, barrier-restoring"
            value={listDraft.highlights}
            onChange={(v) => setListDraft((d) => ({ ...d, highlights: v }))}
          />

          <ListField
            id="ingredients"
            label="Sastojci (ingredients)"
            hint="Svi sastojci, malim slovima, odvojeni zarezom"
            value={listDraft.ingredients}
            onChange={(v) => setListDraft((d) => ({ ...d, ingredients: v }))}
          />

          <ListField
            id="key_ingredients"
            label="Ključni sastojci"
            hint="npr. ceramide np, niacinamide"
            value={listDraft.key_ingredients}
            onChange={(v) => setListDraft((d) => ({ ...d, key_ingredients: v }))}
          />

          <fieldset className="admin-products__fieldset admin-products__field--full">
            <legend>Tipovi kože (skin_types)</legend>
            <div className="admin-products__chips" role="group" aria-label="Tipovi kože">
              {PRODUCT_SKIN_TYPES.map((type) => {
                const selected = form.skin_types.includes(type);
                return (
                  <label
                    key={type}
                    className={
                      selected
                        ? "admin-products__chip admin-products__chip--selected"
                        : "admin-products__chip"
                    }
                  >
                    <input
                      type="checkbox"
                      className="admin-products__chip-input"
                      checked={selected}
                      onChange={() => toggleSkinType(type)}
                    />
                    {type}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="admin-products__sponsor-row">
            <label className="admin-products__sponsor-check">
              <span className="admin-products__sponsor-check-control">
                <input
                  type="checkbox"
                  className="admin-products__sponsor-check-input"
                  checked={form.isSponsored}
                  onChange={(e) => patch("isSponsored", e.target.checked)}
                />
                <span className="admin-products__sponsor-check-box" aria-hidden="true" />
              </span>
              Sponsorirano
            </label>

            <div className="admin-products__sponsor-weight">
              <label htmlFor="sponsorWeight">Težina</label>
              <input
                id="sponsorWeight"
                type="number"
                min={0}
                step={1}
                value={form.sponsorWeight}
                disabled={!form.isSponsored}
                onChange={(e) =>
                  patch("sponsorWeight", Number(e.target.value) || 0)
                }
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="ui-error admin-products__error" role="alert">
            {error}
          </p>
        )}

        <div className="admin-products__submit-footer">
          <button
            type="submit"
            className="ui-btn-primary admin-products__submit-btn"
            disabled={loading}
          >
            {loading ? "Spremanje..." : "Spremi proizvod u bazu"}
          </button>
        </div>
      </form>
    </div>
  );
}

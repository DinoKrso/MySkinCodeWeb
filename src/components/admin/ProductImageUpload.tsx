import { useRef, useState } from "react";
import { uploadProductImage } from "../../lib/admin-product-image";

type Props = {
  brand: string;
  name: string;
  imageUrl: string;
  imageUploaded: boolean;
  onImageUploaded: (url: string) => void;
  onImageCleared: () => void;
};

export default function ProductImageUpload({
  brand,
  name,
  imageUrl,
  imageUploaded,
  onImageUploaded,
  onImageCleared,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setSuccess(null);
    onImageCleared();

    if (!brand.trim() || !name.trim()) {
      setError("Unesi brand i naziv prije uploada slike.");
      return;
    }

    setUploading(true);
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    try {
      const result = await uploadProductImage(file, { brand, name });
      onImageUploaded(result.publicUrl);
      setPreview(result.publicUrl);
      setSuccess(`Slika je na S3 (${result.key || "upload OK"}).`);
    } catch (err) {
      setPreview(null);
      setError(err instanceof Error ? err.message : "Upload nije uspio.");
    } finally {
      URL.revokeObjectURL(objectUrl);
      setUploading(false);
    }
  }

  return (
    <div className="admin-products__image-upload admin-products__field--full">
      <label htmlFor="product-image-file">Slika proizvoda *</label>

      <div
        className={`admin-products__dropzone${uploading ? " admin-products__dropzone--busy" : ""}`}
      >
        {(preview || imageUrl) && (
          <img
            src={preview || imageUrl}
            alt=""
            className="admin-products__image-preview"
          />
        )}

        <div className="admin-products__dropzone-body">
          <p>Prevuci sliku ovdje ili</p>
          <button
            type="button"
            className="ui-btn-secondary admin-products__upload-btn"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Upload..." : "Odaberi i uploadaj na S3"}
          </button>
          <p className="admin-products__hint">
            Samo .jpg · max 4 MB · upload preko servera (S3 URL automatski)
          </p>
        </div>

        <input
          ref={inputRef}
          id="product-image-file"
          type="file"
          accept=".jpg"
          className="admin-products__file-input"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {imageUrl && (
        <div className="admin-products__image-url">
          <span className="ui-eyebrow">
            {imageUploaded ? "URL na S3 (upload potvrđen)" : "URL (upload nije potvrđen)"}
          </span>
          <code>{imageUrl}</code>
        </div>
      )}

      {success && (
        <p className="admin-products__upload-success" role="status">
          {success}
        </p>
      )}

      {error && (
        <p className="ui-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

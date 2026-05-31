import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getStoredToken } from "../lib/auth";
import PageShell from "../layouts/PageShell";
import {
  fetchUserProfile,
  formatPlanLabel,
  formatTreatment,
  mergeProfileWithAuthUser,
  updateProfile,
  uploadProfileImage,
  type ProfileQuestionnaire,
  type UserProfile,
} from "../lib/profile";
import "./ProfilePage.css";

function ProfileAvatar({
  name,
  imageUrl,
  onUpload,
  uploading,
}: {
  name: string;
  imageUrl: string | null | undefined;
  onUpload: (file: File) => void;
  uploading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="profile-page__avatar-block">
      <div className="profile-page__avatar">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="profile-page__avatar-img" />
        ) : (
          <span className="profile-page__avatar-fallback">{initials || "?"}</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="profile-page__file-input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        className="profile-page__secondary-btn"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? "Upload..." : "Promijeni sliku"}
      </button>
    </div>
  );
}

function ChipList({ items, empty }: { items: string[]; empty: string }) {
  if (!items.length) return <p className="profile-page__empty">{empty}</p>;
  return (
    <ul className="profile-page__chips">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function QuestionnaireSection({
  questionnaire,
}: {
  questionnaire: ProfileQuestionnaire | null | undefined;
}) {
  if (!questionnaire) {
    return (
      <p className="profile-page__empty">
        Upitnik nije popunjen.
      </p>
    );
  }

  const treatments = (questionnaire.professionalTreatments ?? []).map(
    formatTreatment,
  );

  return (
    <div className="profile-page__questionnaire">
      <dl className="profile-page__facts">
        {questionnaire.gender && (
          <>
            <dt>Spol</dt>
            <dd>{questionnaire.gender}</dd>
          </>
        )}
        {questionnaire.age && (
          <>
            <dt>Dob</dt>
            <dd>{questionnaire.age}</dd>
          </>
        )}
        {questionnaire.pregnancy && (
          <>
            <dt>Trudnoća</dt>
            <dd>{questionnaire.pregnancy}</dd>
          </>
        )}
        {questionnaire.skinType && (
          <>
            <dt>Tip kože</dt>
            <dd>{questionnaire.skinType}</dd>
          </>
        )}
      </dl>

      <div className="profile-page__group">
        <h3>Terapije</h3>
        <ChipList items={questionnaire.therapies ?? []} empty="Nema unosa" />
      </div>
      <div className="profile-page__group">
        <h3>Dijagnoze</h3>
        <ChipList items={questionnaire.diagnoses ?? []} empty="Nema unosa" />
      </div>
      <div className="profile-page__group">
        <h3>Alergije</h3>
        <ChipList items={questionnaire.allergies ?? []} empty="Nema unosa" />
      </div>
      <div className="profile-page__group">
        <h3>Glavni ciljevi</h3>
        <ChipList items={questionnaire.mainGoals ?? []} empty="Nema unosa" />
      </div>
      <div className="profile-page__group">
        <h3>Profesionalni tretmani</h3>
        <ChipList items={treatments} empty="Nema unosa" />
      </div>
      <div className="profile-page__group">
        <h3>Trenutna rutina</h3>
        <ChipList items={questionnaire.currentRoutine ?? []} empty="Nema unosa" />
      </div>
      <div className="profile-page__group">
        <h3>Učestalost</h3>
        <ChipList items={questionnaire.frequency ?? []} empty="Nema unosa" />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Profil | MySkin Code";
  }, []);

  useEffect(() => {
    if (!user) return;

    const token = getStoredToken();
    if (!token) {
      setError("Sesija nije valjana.");
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUserProfile(token!, user!.userId);
        if (cancelled) return;
        const merged = mergeProfileWithAuthUser(data, user!);
        setProfile(merged);
        setNameDraft(merged.name ?? "");
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Dohvat profila nije uspio.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.userId]);

  async function handleSaveName(e: FormEvent) {
    e.preventDefault();
    const token = getStoredToken();
    if (!token || !user || !nameDraft.trim()) return;

    setSavingName(true);
    setStatusMessage(null);
    try {
      const updated = await updateProfile(token, user.userId, {
        name: nameDraft.trim(),
      });
      const merged = mergeProfileWithAuthUser(updated, user);
      setProfile(merged);
      updateUser({ name: merged.name ?? nameDraft.trim() });
      setStatusMessage("Ime je ažurirano.");
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : "Spremanje imena nije uspjelo.",
      );
    } finally {
      setSavingName(false);
    }
  }

  async function handleImageUpload(file: File) {
    const token = getStoredToken();
    if (!token || !user) return;

    setUploadingImage(true);
    setStatusMessage(null);
    try {
      const updated = await uploadProfileImage(token, user.userId, file);
      const merged = mergeProfileWithAuthUser(updated, user);
      setProfile(merged);
      setStatusMessage("Profilna slika je ažurirana.");
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : "Upload slike nije uspio.",
      );
    } finally {
      setUploadingImage(false);
    }
  }

  const displayName =
    profile?.name?.trim() || user?.name?.trim() || user?.email || "Korisnik";

  return (
    <PageShell>
      <main className="profile-page">
        <div className="profile-page__container">
          <header className="profile-page__header">
            <div>
              <p className="profile-page__eyebrow">Profil</p>
              <h1 className="profile-page__title">{displayName}</h1>
            </div>
            <Link to="/" className="profile-page__back-link">
              ← Početna
            </Link>
          </header>

          {loading && <p className="profile-page__status">Učitavanje profila...</p>}
          {error && (
            <p className="profile-page__error" role="alert">
              {error}
            </p>
          )}
          {statusMessage && (
            <p className="profile-page__status profile-page__status--success">
              {statusMessage}
            </p>
          )}

          {!loading && !error && profile && user && (
            <>
              <section className="profile-page__card">
                <ProfileAvatar
                  name={displayName}
                  imageUrl={profile.imageUrl}
                  onUpload={handleImageUpload}
                  uploading={uploadingImage}
                />

                <form className="profile-page__name-form" onSubmit={handleSaveName}>
                  <label htmlFor="profile-name">Ime</label>
                  <div className="profile-page__name-row">
                    <input
                      id="profile-name"
                      type="text"
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      disabled={savingName}
                    />
                    <button
                      type="submit"
                      className="profile-page__primary-btn"
                      disabled={savingName || !nameDraft.trim()}
                    >
                      {savingName ? "Spremanje..." : "Spremi"}
                    </button>
                  </div>
                </form>

                <dl className="profile-page__facts profile-page__facts--compact">
                  <dt>E-mail</dt>
                  <dd>{profile.email ?? user.email}</dd>
                  <dt>Pretplata</dt>
                  <dd>{formatPlanLabel(profile.subscriptionPlan)}</dd>
                  {profile.subscriptionExpiresAt && (
                    <>
                      <dt>Istječe</dt>
                      <dd>{profile.subscriptionExpiresAt}</dd>
                    </>
                  )}
                </dl>
              </section>

              <section className="profile-page__card">
                <h2 className="profile-page__section-title">Upitnik</h2>
                <QuestionnaireSection questionnaire={profile.questionnaire} />
              </section>
            </>
          )}
        </div>
      </main>
    </PageShell>
  );
}

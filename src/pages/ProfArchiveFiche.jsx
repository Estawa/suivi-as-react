import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getArchive } from "../lib/archives";
import { MODES_PAIEMENT } from "../config";
import Header from "../components/Header";
import ArchiveBanner from "../components/ArchiveBanner";

export default function ProfArchiveFiche() {
  const { archiveId, studentId } = useParams();
  const [archive, setArchive] = useState(undefined);

  useEffect(() => {
    getArchive(archiveId).then(setArchive).catch(() => setArchive(null));
  }, [archiveId]);

  if (archive === undefined) return <div className="p-8 text-center text-gray-500">Chargement…</div>;

  const s = archive?.students?.find((x) => x.id === studentId);
  const retour = { to: `/prof/archives/${archiveId}`, label: "← Liste de l'année" };

  if (!s) {
    return (
      <div>
        <Header title="Fiche introuvable" prof links={[retour]} />
        <p className="p-8 text-center text-gray-500">Cette fiche n'existe pas dans l'archive.</p>
      </div>
    );
  }

  const reel = Number(s.montant_reel ?? s.montant_du ?? 0);
  const verse = Number(s.montant_verse || 0);

  return (
    <div>
      <ArchiveBanner annee={archive.annee} />
      <Header title={`${s.prenom} ${s.nom}`} subtitle={`Archive ${archive.annee} — lecture seule`} prof links={[retour]} />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 flex items-center gap-4 rounded-xl border bg-white p-4">
          {s.photo ? (
            <img src={s.photo} alt="" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-400">Pas de photo</div>
          )}
          <div>
            <div className="text-lg font-semibold">{s.prenom} {s.nom}</div>
            <div className="text-sm text-gray-500">{s.classe}</div>
          </div>
        </div>

        <div className="space-y-6 rounded-xl border bg-white p-4">
          <Section title="Identité">
            <Grid>
              <Info label="Date de naissance" value={s.date_naissance} />
              <Info label="Sexe" value={s.sexe} />
              <Info label="Adresse" value={s.adresse} />
              <Info label="E-mail" value={s.email} />
              <Info label="Téléphone élève" value={s.telephone_eleve} />
            </Grid>
          </Section>

          <Section title="Représentants légaux">
            <Grid>
              <Info label="Représentant 1" value={s.rep1_nom} />
              <Info label="Lien" value={s.rep1_lien} />
              <Info label="Téléphone" value={s.rep1_telephone} />
              <Info label="Représentant 2" value={s.rep2_nom} />
              <Info label="Lien" value={s.rep2_lien} />
              <Info label="Téléphone" value={s.rep2_telephone} />
            </Grid>
          </Section>

          <Section title="Activités AS">
            <Grid>
              <Info label="Activités" value={(s.activites_as || []).join(", ")} />
              <Info label="Disponibilités" value={s.disponibilites} />
            </Grid>
          </Section>

          <Section title="Club extérieur">
            <Grid>
              <Info label="Pratique en club" value={s.club_pratique} />
              <Info label="Activité" value={s.club_activite} />
              <Info label="Lieu" value={s.club_lieu} />
              <Info label="Catégorie" value={s.club_categorie} />
              <Info label="Niveau" value={s.club_niveau} />
            </Grid>
          </Section>

          <Section title="Dossier d'inscription">
            <Grid>
              <Info label="Fiche rendue" value={s.fiche_rendue} />
              <Info label="Montant dû par défaut" value={`${Number(s.montant_du || 0).toFixed(2)} €`} />
              <Info label="Cotisation réelle" value={`${reel.toFixed(2)} €`} />
              <Info label="Montant perçu" value={`${verse.toFixed(2)} €`} />
              <Info label="Reste dû" value={`${(reel - verse).toFixed(2)} €`} />
              <Info label="Mode de paiement" value={MODES_PAIEMENT[s.mode_paiement]} />
              <Info label="Dossier complet" value={s.dossier_complet} />
              <Info label="Complet le" value={s.horodatage_dossier_complet} />
              <Info label="Validé OPUS" value={s.opus_valide} />
            </Grid>
          </Section>

          <Section title="Observations">
            <p className="whitespace-pre-wrap text-sm">{s.observations || "—"}</p>
          </Section>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="mb-2 border-b pb-1 text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h3>
      {children}
    </div>
  );
}

function Grid({ children }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{children}</div>;
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className="text-sm">{value || "—"}</div>
    </div>
  );
}

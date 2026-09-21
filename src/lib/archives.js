import {
  collection, doc, getDocs, setDoc, writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";

const STUDENTS_COLLECTION = "students";
const ARCHIVES_COLLECTION = "archives";

export function computeSchoolYearLabel(d = new Date()) {
  // Bascule au 1er août, comme la version Flask.
  return d.getMonth() + 1 >= 8
    ? `${d.getFullYear()}-${d.getFullYear() + 1}`
    : `${d.getFullYear() - 1}-${d.getFullYear()}`;
}

export async function listArchives() {
  const snap = await getDocs(collection(db, ARCHIVES_COLLECTION));
  return snap.docs
    .map((d) => d.data())
    .sort((a, b) => (b.archive_le || "").localeCompare(a.archive_le || ""));
}

export async function archiveCurrentYear(students) {
  if (students.length === 0) return null;
  const annee = computeSchoolYearLabel();
  const archive = {
    id: crypto.randomUUID().replace(/-/g, ""),
    annee,
    archive_le: new Date().toISOString(),
    nb_eleves: students.length,
    students,
  };
  await setDoc(doc(db, ARCHIVES_COLLECTION, archive.id), archive);

  // Vide la collection des élèves en cours.
  const batch = writeBatch(db);
  for (const s of students) {
    batch.delete(doc(db, STUDENTS_COLLECTION, s.id));
  }
  await batch.commit();
  return archive;
}
